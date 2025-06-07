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

type userResponse struct {
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Email       string    `json:"email"`
	IsChirpyRed bool      `json:"is_chirpy_red"`
	Id          uuid.UUID `json:"id"`
}

func (cfg *Api) HandleAddUser(w http.ResponseWriter, r *http.Request) {
	// TODO: should this be shared with `auth.go`?
	type parameters struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Something went wrong decoding the response", err)
		return
	}

	hashedPass, err := auth.HashPassword(params.Password)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to generate password", err)
		return
	}

	user, err := cfg.DbInstance.Queries.CreateUser(r.Context(), sqlc.CreateUserParams{
		Email:          params.Email,
		HashedPassword: hashedPass,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when creating the user", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, userResponse{
		Id:          user.ID,
		Email:       user.Email,
		IsChirpyRed: user.IsChirpyRed,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	})
}

func (cfg *Api) HandleUpdateUser(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	accessToken, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authentication token", err)
		return
	}

	userId, err := auth.ValidateJWT(accessToken, cfg.JwtSecret)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authentication token", err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err = decoder.Decode(&params)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Something went wrong when decoding request", err)
		return
	}

	hashedPass, err := auth.HashPassword(params.Password)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to generate password", err)
		return
	}
	user, err := cfg.DbInstance.Queries.UpdateUserEmailAndPassword(r.Context(), sqlc.UpdateUserEmailAndPasswordParams{
		Email:          params.Email,
		HashedPassword: hashedPass,
		ID:             userId,
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when updating the user", err)
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, userResponse{
		Id:          user.ID,
		Email:       user.Email,
		IsChirpyRed: user.IsChirpyRed,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	})
}

func (cfg *Api) HandleUpgradeToChirpyRed(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Event string `json:"event"`
		Data  struct {
			UserId string `json:"user_id"`
		} `json:"data"`
	}

	apiKey, err := auth.GetAPIKey(r.Header)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid API key", err)
		return
	}
	if apiKey != cfg.PolkaKey {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid API key", nil)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err = decoder.Decode(&params)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Something went wrong decoding the response", err)
		return
	}

	if params.Event != "user.upgraded" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	uid, err := uuid.Parse(params.Data.UserId)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Could not locate user to upgrade", err)
		return
	}

	err = cfg.DbInstance.Queries.UpgradeToChirpyRed(r.Context(), uid)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not upgrade user", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
