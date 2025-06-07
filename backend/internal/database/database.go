package database

import (
	"backend/internal/database/sqlc"
	"backend/sql/migrations"
	"context"
	"database/sql"
	"fmt"
	"io/fs"
	"log"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"github.com/pressly/goose/v3"
)

// Service represents a service that interacts with a database.
// type Service interface {
// 	// Health returns a map of health status information.
// 	// The keys and values in the map are service-specific.
// 	Health() map[string]string

// 	// Close terminates the database connection.
// 	// It returns an error if the connection cannot be closed.
// 	Close() error
// }

type Service struct {
	Db      *sql.DB
	Queries *sqlc.Queries
}

// TODO: retrieve `database` env var from the `main` file on boot rather than having a package that reads environment variables
var (
	database   = os.Getenv("BLUEPRINT_DB_DATABASE")
	dbInstance *Service
)

func NewDbInstance(dbURL string) (*Service, error) {
	// TODO: idk if this "reuse connection" logic from go-blueprint is even needed? Seems like it would only happen if we call `NewDbInstance` multiple times somehow
	// Reuse Connection
	if dbInstance != nil {
		return dbInstance, nil
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}
	// TODO: might not want this auto-migrate logic in the long-term, but its convenient for now
	err = MigrateFs(db, migrations.FS, ".")
	if err != nil {
		return nil, fmt.Errorf("error migrating database: %w", err)
	}

	queries := sqlc.New(db)
	dbInstance = &Service{
		Db:      db,
		Queries: queries,
	}
	return dbInstance, nil
}

// Health checks the health of the database connection by pinging the database.
// It returns a map with keys indicating various health statistics.
func (s *Service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	// Ping the database
	err := s.Db.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		// TODO: return an error here so that the callee can decide how to handle it
		log.Fatalf("db down: %v", err) // Log the error and terminate the program
		return stats
	}

	// Database is up, add more statistics
	stats["status"] = "up"
	stats["message"] = "It's healthy"

	// Get database stats (like open connections, in use, idle, etc.)
	dbStats := s.Db.Stats()
	stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	stats["in_use"] = strconv.Itoa(dbStats.InUse)
	stats["idle"] = strconv.Itoa(dbStats.Idle)
	stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	stats["wait_duration"] = dbStats.WaitDuration.String()
	stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	// Evaluate stats to provide a health message
	if dbStats.OpenConnections > 40 { // Assuming 50 is the max for this example
		stats["message"] = "The database is experiencing heavy load."
	}

	if dbStats.WaitCount > 1000 {
		stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	}

	if dbStats.MaxIdleClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	}

	if dbStats.MaxLifetimeClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage pattern."
	}

	return stats
}

// Close closes the database connection.
// It logs a message indicating the disconnection from the specific database.
// If the connection is successfully closed, it returns nil.
// If an error occurs while closing the connection, it returns the error.
func (s *Service) Close() error {
	log.Printf("Disconnected from database: %s", database)
	return s.Db.Close()
}

func MigrateFs(db *sql.DB, migrationFS fs.FS, migrationsDir string) error {
	goose.SetBaseFS(migrationFS)
	defer func() {
		goose.SetBaseFS(nil)
	}()
	return Migrate(db, migrationsDir)
}

// Tell goose which database to use
func Migrate(db *sql.DB, migrationsDir string) error {
	err := goose.SetDialect("postgres")
	if err != nil {
		return fmt.Errorf("migrate:set-dialect %w", err)
	}

	err = goose.Up(db, migrationsDir)
	if err != nil {
		return fmt.Errorf("goose up: %w", err)
	}
	return nil
}
