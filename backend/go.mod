module backend

go 1.24.3

require (
	github.com/golang-jwt/jwt/v5 v5.2.2
	github.com/google/uuid v1.6.0
	github.com/joho/godotenv v1.5.1
	github.com/lib/pq v1.10.9
	github.com/pressly/goose/v3 v3.24.3
	golang.org/x/crypto v0.38.0
)

require github.com/rs/cors v1.11.1 // indirect

require (
	github.com/go-chi/chi/v5 v5.2.1
	github.com/mfridman/interpolate v0.0.2 // indirect
	github.com/sethvargo/go-retry v0.3.0 // indirect
	go.uber.org/multierr v1.11.0 // indirect
	golang.org/x/sync v0.14.0 // indirect
)
