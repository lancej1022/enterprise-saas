package main

import (
	"backend/internal/api"
	"backend/internal/database"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

func gracefulShutdown(apiServer *http.Server, done chan bool) {
	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Listen for the interrupt signal.
	<-ctx.Done()

	log.Println("shutting down gracefully, press Ctrl+C again to force")
	stop() // Allow Ctrl+C to force shutdown

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := apiServer.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown with error: %v", err)
	}

	log.Println("Server exiting")

	// Notify the main goroutine that the shutdown is complete
	done <- true
}

func main() {
	godotenv.Load()
	dbURL := os.Getenv("DB_URL")

	dbInstance, err := database.NewDbInstance(dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer dbInstance.Db.Close()

	filepathRoot := "."
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT not defined in env")
	}

	apiInstance := &api.Api{
		FileserverHits: atomic.Int32{},
		DbInstance:     dbInstance,
		Platform:       os.Getenv("PLATFORM"),
		JwtSecret:      os.Getenv("JWT_SECRET"),
		PolkaKey:       os.Getenv("POLKA_KEY"),
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		// TODO: disable this in production
		Debug: true,
	})
	router := chi.NewRouter()
	// router.Group(func(r chi.Router) {
	// 	r.Use(a.Middleware.Authenticate)
	// 	r.Get("/workouts/{id}", a.Middleware.RequireUser(a.WorkoutHandler.GetWorkoutByID))
	// 	r.Post("/workouts", a.Middleware.RequireUser(a.WorkoutHandler.CreateWorkout))
	// 	r.Put("/workouts/{id}", a.Middleware.RequireUser(a.WorkoutHandler.UpdateWorkoutById))
	// 	r.Delete("/workouts/{id}", a.Middleware.RequireUser(a.WorkoutHandler.DeleteWorkout))
	// })
	router.Use(c.Handler)

	router.Get("/api/healthz", handlerReadiness)
	router.Post("/api/polka/webhooks", apiInstance.HandleUpgradeToChirpyRed)
	router.Post("/api/users", apiInstance.HandleAddUser)
	router.Put("/api/users", apiInstance.HandleUpdateUser)
	router.Post("/api/signup", apiInstance.HandleSignup)
	router.Post("/api/login", apiInstance.HandleLogin)
	router.Post("/api/refresh", apiInstance.HandleLoginRefresh)
	router.Post("/api/revoke", apiInstance.HandleRevokeRefreshToken)
	router.Post("/api/chirps", apiInstance.HandleChirp)
	router.Delete("/api/chirps/{id}", apiInstance.HandleDeleteChirp)
	router.Get("/api/chirps", apiInstance.HandleGetChirps)
	router.Get("/api/chirps/{id}", apiInstance.HandleGetChirp)
	router.Post("/admin/reset", apiInstance.HandlerReset)

	srv := &http.Server{
		Addr:         ":" + port,
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		Handler:      router,
	}
	log.Printf("Serving files from %s on port: %s\n", filepathRoot, port)

	// Create a done channel to signal when the shutdown is complete
	done := make(chan bool, 1)
	// Run graceful shutdown in a separate goroutine
	go gracefulShutdown(srv, done)
	err = srv.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}
	// Wait for the graceful shutdown to complete
	<-done
	log.Println("Graceful shutdown complete.")
	// log.Fatal(srv.ListenAndServe())
}
