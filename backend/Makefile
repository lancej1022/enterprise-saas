.PHONY: test test-setup test-teardown test-db-up test-db-down

# Default test database URL
TEST_DB_URL ?= postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable

# Start the test database
test-db-up:
	@echo "Starting test database..."
	docker-compose up -d test_db
	@echo "Waiting for test database to be ready..."
	@until docker exec chat_app_db_test pg_isready -U postgres; do \
		echo "Waiting for test database..."; \
		sleep 2; \
	done
	@echo "Test database is ready!"

# Stop the test database
test-db-down:
	@echo "Stopping test database..."
	docker-compose down test_db

# Run tests with the test database
test: test-db-up
	@echo "Running integration tests..."
	TEST_DB_URL=$(TEST_DB_URL) go test -v ./internal/api/
	@echo "Tests completed!"

# Run tests and then cleanup
test-clean: test test-db-down

# Setup test environment (start test DB and run migrations)
test-setup: test-db-up
	@echo "Test environment is ready!"

# Teardown test environment
test-teardown: test-db-down
	@echo "Test environment cleaned up!"

# Run just the integration test
test-integration: test-db-up
	@echo "Running integration test..."
	TEST_DB_URL=$(TEST_DB_URL) go test -v ./internal/api/ -run TestUserChirpFlow 