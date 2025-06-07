package migrations

import (
	"embed"
)

// This file contains logic to help with embedding the migrations into the binary

//go:embed *.sql

var FS embed.FS
