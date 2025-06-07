# Integration Tests

This directory contains integration tests for the chat app backend API.

## Setup

### Prerequisites

1. Docker and Docker Compose installed
2. Go 1.24.3 or later

### Running Tests

#### Quick Start

To run all tests with automatic setup and cleanup:

```bash
make test-clean
```

#### Step by Step

1. **Start the test database:**
   ```bash
   make test-db-up
   ```

2. **Run the integration tests:**
   ```bash
   make test-integration
   ```

3. **Clean up (optional):**
   ```bash
   make test-db-down
   ```

#### Manual Test Execution

If you prefer to run tests manually:

```bash
# Start test database
docker-compose up -d test_db

# Wait for database to be ready
until docker exec chat_app_db_test pg_isready -U postgres; do
  echo "Waiting for test database..."
  sleep 2
done

# Run tests
TEST_DB_URL=postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable go test -v ./internal/api/

# Clean up
docker-compose down test_db
```

## Test Coverage

### TestUserChirpFlow

This comprehensive integration test covers the complete user flow:

1. **User Creation** - Creates a new user via `POST /api/users`
2. **User Login** - Authenticates the user via `POST /api/login`
3. **Chirp Creation** - Posts a new chirp via `POST /api/chirps` (requires authentication)
4. **Chirp Retrieval** - Retrieves all chirps via `GET /api/chirps` and verifies the posted chirp

### Additional Test Cases

The test also includes:

- **Profanity Filtering** - Tests that banned words are replaced with asterisks
- **Authentication** - Verifies JWT token generation and usage
- **Data Validation** - Ensures all endpoints return expected data structures

## Database

The tests use a separate PostgreSQL database (`chat_app_db_test`) running on port 5433 to avoid interfering with development data.

### Test Database Configuration

- **Host:** localhost
- **Port:** 5433
- **Database:** postgres
- **Username:** postgres
- **Password:** postgres

## Environment Variables

The following environment variables can be set for testing:

- `TEST_DB_URL` - Test database connection string (default: `postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable`)

## Cleanup

The test automatically cleans up all test data before and after each test run to ensure test isolation.

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Ensure Docker is running
2. Check that the test database container is running: `docker ps`
3. Verify the database is accepting connections: `docker exec chat_app_db_test pg_isready -U postgres`

### Port Conflicts

If port 5433 is already in use, you can modify the `docker-compose.yml` file to use a different port for the test database.

### Migration Issues

The test automatically runs database migrations. If you encounter migration errors, ensure your migration files are up to date and valid. 