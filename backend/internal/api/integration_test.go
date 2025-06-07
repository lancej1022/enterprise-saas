package api

import (
	"backend/internal/database"
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

// TestUserChirpFlow tests the complete user flow:
// 1. Create a user
// 2. Login with that user
// 3. Post a chirp
// 4. Retrieve chirps and assert the posted chirp is there
func TestUserChirpFlow(t *testing.T) {
	// Setup test environment
	testDBURL := os.Getenv("TEST_DB_URL")
	if testDBURL == "" {
		testDBURL = "postgres://postgres:postgres@localhost:5433/postgres?sslmode=disable"
	}

	// Create test database instance
	dbInstance, err := database.NewDbInstance(testDBURL)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}
	defer dbInstance.Db.Close()

	// Clean up database before test
	cleanupDatabase(t, dbInstance.Db)

	// Setup API instance with test configuration
	apiInstance := &Api{
		DbInstance: dbInstance,
		Platform:   "test",
		JwtSecret:  "test-jwt-secret-key-for-testing-purposes-only",
		PolkaKey:   "test-polka-key",
	}

	// Setup router with test routes
	router := chi.NewRouter()
	router.Post("/api/users", apiInstance.HandleAddUser)
	router.Post("/api/login", apiInstance.HandleLogin)
	router.Post("/api/chirps", apiInstance.HandleChirp)
	router.Get("/api/chirps", apiInstance.HandleGetChirps)

	// Test data
	testUser := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{
		Email:    "test@example.com",
		Password: "testpassword123",
	}

	testChirp := struct {
		Body string `json:"body"`
	}{
		Body: "This is my first test chirp!",
	}

	// Step 1: Create a user
	t.Run("Create User", func(t *testing.T) {
		userJSON, err := json.Marshal(testUser)
		if err != nil {
			t.Fatalf("Failed to marshal user data: %v", err)
		}

		req := httptest.NewRequest("POST", "/api/users", bytes.NewBuffer(userJSON))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("Expected status 201, got %d. Response: %s", w.Code, w.Body.String())
		}

		var userResponse struct {
			ID          uuid.UUID `json:"id"`
			Email       string    `json:"email"`
			IsChirpyRed bool      `json:"is_chirpy_red"`
			CreatedAt   time.Time `json:"created_at"`
			UpdatedAt   time.Time `json:"updated_at"`
		}

		err = json.Unmarshal(w.Body.Bytes(), &userResponse)
		if err != nil {
			t.Fatalf("Failed to unmarshal user response: %v", err)
		}

		if userResponse.Email != testUser.Email {
			t.Errorf("Expected email %s, got %s", testUser.Email, userResponse.Email)
		}

		if userResponse.IsChirpyRed != false {
			t.Errorf("Expected IsChirpyRed to be false, got %t", userResponse.IsChirpyRed)
		}
	})

	// Step 2: Login with the created user
	var accessToken string
	t.Run("Login User", func(t *testing.T) {
		loginJSON, err := json.Marshal(testUser)
		if err != nil {
			t.Fatalf("Failed to marshal login data: %v", err)
		}

		req := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(loginJSON))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d. Response: %s", w.Code, w.Body.String())
		}

		var loginResponse struct {
			ID           uuid.UUID `json:"id"`
			Email        string    `json:"email"`
			IsChirpyRed  bool      `json:"is_chirpy_red"`
			CreatedAt    time.Time `json:"created_at"`
			UpdatedAt    time.Time `json:"updated_at"`
			Token        string    `json:"token"`
			RefreshToken string    `json:"refresh_token"`
		}

		err = json.Unmarshal(w.Body.Bytes(), &loginResponse)
		if err != nil {
			t.Fatalf("Failed to unmarshal login response: %v", err)
		}

		if loginResponse.Email != testUser.Email {
			t.Errorf("Expected email %s, got %s", testUser.Email, loginResponse.Email)
		}

		if loginResponse.Token == "" {
			t.Error("Expected access token to be present")
		}

		if loginResponse.RefreshToken == "" {
			t.Error("Expected refresh token to be present")
		}

		accessToken = loginResponse.Token
	})

	// Step 3: Post a chirp using the access token
	var chirpID uuid.UUID
	t.Run("Post Chirp", func(t *testing.T) {
		chirpJSON, err := json.Marshal(testChirp)
		if err != nil {
			t.Fatalf("Failed to marshal chirp data: %v", err)
		}

		req := httptest.NewRequest("POST", "/api/chirps", bytes.NewBuffer(chirpJSON))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+accessToken)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("Expected status 201, got %d. Response: %s", w.Code, w.Body.String())
		}

		var chirpResponse struct {
			ID        uuid.UUID `json:"id"`
			Body      string    `json:"body"`
			UserID    uuid.UUID `json:"user_id"`
			CreatedAt time.Time `json:"created_at"`
			UpdatedAt time.Time `json:"updated_at"`
		}

		err = json.Unmarshal(w.Body.Bytes(), &chirpResponse)
		if err != nil {
			t.Fatalf("Failed to unmarshal chirp response: %v", err)
		}

		if chirpResponse.Body != testChirp.Body {
			t.Errorf("Expected chirp body %s, got %s", testChirp.Body, chirpResponse.Body)
		}

		if chirpResponse.UserID == uuid.Nil {
			t.Error("Expected user ID to be set")
		}

		chirpID = chirpResponse.ID
	})

	// Step 4: Retrieve chirps and assert the posted chirp is there
	t.Run("Get Chirps", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/chirps", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status 200, got %d. Response: %s", w.Code, w.Body.String())
		}

		var chirpsResponse []struct {
			ID        uuid.UUID `json:"id"`
			Body      string    `json:"body"`
			UserID    uuid.UUID `json:"user_id"`
			CreatedAt time.Time `json:"created_at"`
			UpdatedAt time.Time `json:"updated_at"`
		}

		err := json.Unmarshal(w.Body.Bytes(), &chirpsResponse)
		if err != nil {
			t.Fatalf("Failed to unmarshal chirps response: %v", err)
		}

		if len(chirpsResponse) != 1 {
			t.Fatalf("Expected 1 chirp, got %d", len(chirpsResponse))
		}

		foundChirp := chirpsResponse[0]
		if foundChirp.ID != chirpID {
			t.Errorf("Expected chirp ID %s, got %s", chirpID, foundChirp.ID)
		}

		if foundChirp.Body != testChirp.Body {
			t.Errorf("Expected chirp body %s, got %s", testChirp.Body, foundChirp.Body)
		}

		if foundChirp.UserID == uuid.Nil {
			t.Error("Expected user ID to be set")
		}
	})

	// Bonus: Test with profanity filtering
	t.Run("Post Chirp with Profanity", func(t *testing.T) {
		profanityChirp := struct {
			Body string `json:"body"`
		}{
			Body: "This contains kerfuffle and sharbert words",
		}

		chirpJSON, err := json.Marshal(profanityChirp)
		if err != nil {
			t.Fatalf("Failed to marshal chirp data: %v", err)
		}

		req := httptest.NewRequest("POST", "/api/chirps", bytes.NewBuffer(chirpJSON))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+accessToken)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("Expected status 201, got %d. Response: %s", w.Code, w.Body.String())
		}

		var chirpResponse struct {
			Body string `json:"body"`
		}

		err = json.Unmarshal(w.Body.Bytes(), &chirpResponse)
		if err != nil {
			t.Fatalf("Failed to unmarshal chirp response: %v", err)
		}

		expectedBody := "This contains **** and **** words"
		if chirpResponse.Body != expectedBody {
			t.Errorf("Expected chirp body %s, got %s", expectedBody, chirpResponse.Body)
		}
	})

	// Clean up database after test
	cleanupDatabase(t, dbInstance.Db)
}

// cleanupDatabase removes all test data from the database
func cleanupDatabase(t *testing.T, db *sql.DB) {
	// Delete in order of dependencies
	queries := []string{
		"DELETE FROM refresh_tokens",
		"DELETE FROM chirps",
		"DELETE FROM users",
	}

	for _, query := range queries {
		_, err := db.Exec(query)
		if err != nil {
			t.Logf("Warning: Failed to cleanup with query %s: %v", query, err)
		}
	}
}
