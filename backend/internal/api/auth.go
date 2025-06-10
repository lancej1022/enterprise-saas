package api

import (
	"backend/internal/auth"
	"backend/internal/database/sqlc"
	"backend/utils"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func (cfg *Api) HandleLogin(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	type returnVals struct {
		CreatedAt   time.Time `json:"created_at"`
		UpdatedAt   time.Time `json:"updated_at"`
		Email       string    `json:"email"`
		Id          uuid.UUID `json:"id"`
		IsChirpyRed bool      `json:"is_chirpy_red"`
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Something went wrong decoding the response", err)
		return
	}

	user, err := cfg.DbInstance.Queries.GetUserByEmail(r.Context(), params.Email)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Incorrect email or password.", err)
		return
	}

	if ok := auth.CheckPasswordHash(params.Password, user.HashedPassword); ok != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Incorrect email or password.", err)
		return
	}

	accessToken, err := auth.MakeJWT(user.ID, cfg.JwtSecret, time.Hour)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't create JWT", err)
		return
	}
	refreshToken, err := auth.MakeRefreshToken()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't create refresh token", err)
		return
	}

	now := time.Now()
	_, err = cfg.DbInstance.Queries.CreateRefreshToken(r.Context(), sqlc.CreateRefreshTokenParams{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: now.Add(time.Hour * 24 * 60), // 60 days
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't save refresh token", err)
		return
	}

	// Set HTTP-only cookies instead of returning tokens in response
	cfg.setAuthCookies(w, accessToken, refreshToken)

	utils.RespondWithJSON(w, http.StatusOK, returnVals{
		Id:          user.ID,
		IsChirpyRed: user.IsChirpyRed,
		Email:       user.Email,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	})
}

// TODO: this is basically a combination of adding a user and logging in -- create shared logic for that instead of duplicating it like Claude did
func (cfg *Api) HandleSignup(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	type returnVals struct {
		CreatedAt   time.Time `json:"created_at"`
		UpdatedAt   time.Time `json:"updated_at"`
		Email       string    `json:"email"`
		Id          uuid.UUID `json:"id"`
		IsChirpyRed bool      `json:"is_chirpy_red"`
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Something went wrong decoding the request", err)
		return
	}

	// Hash the password
	hashedPass, err := auth.HashPassword(params.Password)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to generate password", err)
		return
	}

	// Create the user
	user, err := cfg.DbInstance.Queries.CreateUser(r.Context(), sqlc.CreateUserParams{
		Email:          params.Email,
		HashedPassword: hashedPass,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusConflict, "User with this email already exists", err)
		return
	}

	// Generate access token
	accessToken, err := auth.MakeJWT(user.ID, cfg.JwtSecret, time.Hour)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't create JWT", err)
		return
	}

	// Generate refresh token
	refreshToken, err := auth.MakeRefreshToken()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't create refresh token", err)
		return
	}

	// Save refresh token to database
	now := time.Now()
	_, err = cfg.DbInstance.Queries.CreateRefreshToken(r.Context(), sqlc.CreateRefreshTokenParams{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: now.Add(time.Hour * 24 * 60), // 60 days
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't save refresh token", err)
		return
	}

	// Set HTTP-only cookies instead of returning tokens in response
	cfg.setAuthCookies(w, accessToken, refreshToken)

	utils.RespondWithJSON(w, http.StatusCreated, returnVals{
		Id:          user.ID,
		IsChirpyRed: user.IsChirpyRed,
		Email:       user.Email,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	})
}

// Helper function to set authentication cookies
func (cfg *Api) setAuthCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	// Set access token cookie (1 hour)
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		MaxAge:   5 * 60, // 5 minutes in seconds
		HttpOnly: true,
		Secure:   cfg.Platform == "production", // Only send over HTTPS in production
		SameSite: http.SameSiteLaxMode,
	})

	// Set refresh token cookie (60 days)
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   86400 * 60, // 60 days in seconds.
		HttpOnly: true,
		Secure:   cfg.Platform == "production", // Only send over HTTPS in production
		SameSite: http.SameSiteLaxMode,
	})
}

// Helper function to clear authentication cookies
func (cfg *Api) clearAuthCookies(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1, // -1 to immediately expire the cookie
		HttpOnly: true,
		Secure:   cfg.Platform == "production",
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.Platform == "production",
		SameSite: http.SameSiteLaxMode,
	})
}

// Add a logout endpoint to clear cookies
func (cfg *Api) HandleLogout(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from cookie to revoke it
	refreshCookie, err := r.Cookie("refresh_token")
	if err == nil && refreshCookie.Value != "" {
		// Revoke the refresh token in the database
		err = cfg.DbInstance.Queries.RevokeRefreshToken(r.Context(), refreshCookie.Value)
		if err != nil {
			// Log error but don't fail the logout
			utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't revoke refresh token", err)
			return
		}
	}

	// Clear authentication cookies
	cfg.clearAuthCookies(w)
	w.WriteHeader(http.StatusNoContent)
}
