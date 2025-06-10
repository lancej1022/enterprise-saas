package api

import (
	"backend/internal/auth"
	"backend/utils"
	"net/http"
	"time"
)

func (cfg *Api) HandleLoginRefresh(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from cookie instead of Authorization header
	refreshCookie, err := r.Cookie("refresh_token")
	if err != nil || refreshCookie.Value == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No refresh token provided", err)
		return
	}

	refreshToken := refreshCookie.Value

	user, err := cfg.DbInstance.Queries.GetUserFromRefreshToken(r.Context(), refreshToken)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Couldn't get user for refresh token", err)
		return
	}

	accessToken, err := auth.MakeJWT(user.ID, cfg.JwtSecret, time.Hour)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't create JWT", err)
		return
	}

	// Set new access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		// TODO: not sure this is actually the right way to specify an hour...
		MaxAge:   int(time.Hour), // 1 hour in seconds
		HttpOnly: true,
		Secure:   cfg.Platform == "production",
		SameSite: http.SameSiteLaxMode,
	})

	// Return success - no need to return the token in the response body
	w.WriteHeader(http.StatusOK)
}

func (cfg *Api) HandleRevokeRefreshToken(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from cookie instead of Authorization header
	refreshCookie, err := r.Cookie("refresh_token")
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid refresh token", err)
		return
	}
	if refreshCookie.Value == "" {
		utils.RespondWithError(w, http.StatusUnauthorized, "No refresh token provided", err)
		return
	}

	err = cfg.DbInstance.Queries.RevokeRefreshToken(r.Context(), refreshCookie.Value)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Couldn't revoke refresh token", err)
		return
	}

	// Clear authentication cookies
	cfg.clearAuthCookies(w)
	w.WriteHeader(http.StatusNoContent)
}
