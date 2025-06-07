package api

import (
	"backend/internal/database"
	"sync/atomic"
)

type Api struct {
	DbInstance     *database.Service
	Platform       string
	JwtSecret      string
	PolkaKey       string
	FileserverHits atomic.Int32
}
