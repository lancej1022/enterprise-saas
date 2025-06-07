package api

import (
	"backend/internal/auth"
	"backend/internal/database/sqlc"
	"backend/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Chirp struct {
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Body      string    `json:"body"`
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
}

func (cfg *Api) HandleChirp(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Body string `json:"body"`
	}

	token, err := auth.GetBearerToken(r.Header)

	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authentication token", err)
		return
	}

	userId, err := auth.ValidateJWT(token, cfg.JwtSecret)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authentication token", err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err = decoder.Decode(&params)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when decoding request", err)
		return
	}

	const maxChirpLength = 140
	if len(params.Body) > maxChirpLength {
		utils.RespondWithError(w, http.StatusBadRequest, "Chirp is too long", nil)
		return
	}

	cleaned := removeProfanity(params.Body)
	chirp, err := cfg.DbInstance.Queries.CreateChirp(r.Context(), sqlc.CreateChirpParams{
		Body:   cleaned,
		UserID: userId, // Use the userId from the JWT
	})
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when creating chirp", err)
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, Chirp{
		ID:        chirp.ID,
		Body:      chirp.Body,
		CreatedAt: chirp.CreatedAt,
		UpdatedAt: chirp.UpdatedAt,
		UserID:    chirp.UserID,
	})
}

func removeProfanity(input string) string {
	bannedWords := map[string]bool{
		"kerfuffle": true,
		"sharbert":  true,
		"fornax":    true,
	}

	split := strings.Fields(input)
	for i, word := range split {
		if bannedWords[strings.ToLower(word)] {
			split[i] = "****"
		}
	}
	return strings.Join(split, " ")
}

func (cfg *Api) HandleGetChirps(w http.ResponseWriter, r *http.Request) {
	authorId := r.URL.Query().Get("author_id")
	// "asc" or "desc" -- empty = asc
	sortParam := r.URL.Query().Get("sort")

	var getChirpsErr error
	var chirps []sqlc.Chirp

	if authorId != "" {
		authorId, err := uuid.Parse(authorId)
		if err != nil {
			utils.RespondWithError(w, http.StatusBadRequest, "Invalid author ID", err)
		}

		chirps, getChirpsErr = cfg.DbInstance.Queries.GetChirpsByUserId(r.Context(), authorId)
	} else {
		chirps, getChirpsErr = cfg.DbInstance.Queries.GetChirps(r.Context())
	}

	if getChirpsErr != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when getting chirps", getChirpsErr)
		return
	}

	if len(chirps) == 0 {
		utils.RespondWithJSON(w, http.StatusOK, []Chirp{})
		return
	}

	// chirps are already sorted in ascending order by the DB do we only have to worry about `desc` sorting
	if sortParam == "desc" {
		// TODO: could potentially just reverse the chirps slice instead of sorting
		sort.Slice(chirps, func(i, j int) bool {
			return chirps[i].CreatedAt.After(chirps[j].CreatedAt)
		})
	}

	chirpsResponse := make([]Chirp, len(chirps))
	for i, chirp := range chirps {
		chirpsResponse[i] = Chirp{
			ID:        chirp.ID,
			CreatedAt: chirp.CreatedAt,
			UpdatedAt: chirp.UpdatedAt,
			UserID:    chirp.UserID,
			Body:      chirp.Body,
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, chirpsResponse)
}

func (cfg *Api) HandleGetChirp(w http.ResponseWriter, r *http.Request) {
	chirpId := r.PathValue("id")
	if chirpId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing chirp ID", nil)
		return
	}
	chirp, err := cfg.DbInstance.Queries.GetChirpById(r.Context(), uuid.MustParse(chirpId))
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Could not find chirp with id: %s", chirpId), err)
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, Chirp{
		ID:        chirp.ID,
		CreatedAt: chirp.CreatedAt,
		UpdatedAt: chirp.UpdatedAt,
		UserID:    chirp.UserID,
		Body:      chirp.Body,
	})
}
func (cfg *Api) HandleDeleteChirp(w http.ResponseWriter, r *http.Request) {
	chirpId := r.PathValue("id")
	if chirpId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Missing chirp ID", nil)
		return
	}

	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authentication token", err)
		return
	}
	userId, err := auth.ValidateJWT(token, cfg.JwtSecret)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "Invalid authentication token", err)
		return
	}

	chirp, err := cfg.DbInstance.Queries.GetChirpById(r.Context(), uuid.MustParse(chirpId))
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, fmt.Sprintf("Could not find chirp with id: %s", chirpId), err)
		return
	}
	if chirp.UserID != userId {
		utils.RespondWithError(w, http.StatusForbidden, "You are not allowed to delete this chirp", nil)
		return
	}

	err = cfg.DbInstance.Queries.DeleteChirp(r.Context(), chirp.ID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when deleting chirp", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
