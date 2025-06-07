package auth

import (
	"crypto/rand"
	"encoding/hex"
	"log"
)

func MakeRefreshToken() (string, error) {
	key := make([]byte, 32)
	_, err := rand.Read(key)
	if err != nil {
		log.Printf("Error generating refresh token during `rand.Read`: %v", err)
		return "", err
	}
	encodedStr := hex.EncodeToString(key)

	return encodedStr, nil
}
