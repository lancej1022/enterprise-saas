package api

import (
	"backend/utils"
	"net/http"
)

func (cfg *Api) HandlerReset(w http.ResponseWriter, r *http.Request) {
	if cfg.Platform != "dev" {
		utils.RespondWithError(w, http.StatusForbidden, "Reset is only allowed in dev mode", nil)
		return
	}

	cfg.FileserverHits.Store(0)
	err := cfg.DbInstance.Queries.ResetUsers(r.Context())
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong when trying to delete the users", err)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Hits reset to 0"))
}
