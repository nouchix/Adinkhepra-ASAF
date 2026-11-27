package main

import (
	"log"
	"net/http"
	"os"

	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/fleet"
	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/hub"
	"github.com/nouchix/khepra-pqc/keyfile"
	"github.com/nouchix/khepra-pqc/sign"
)

func main() {
	log.Println("Starting Khepra Stargate (Hub & Fleet) Backend...")
	
	// Enforce TRL 10 Architecture - Must initialize a guarded instance
	fleetManager, err := fleet.NewManager("hub.db")
	if err != nil {
		log.Fatalf("Failed to initialize fleet manager database: %v", err)
	}
	defer fleetManager.Close()
	// HITL approvals must be signed by the operator key in
	// ASAF_HITL_OPERATOR_KEY (an ML-DSA-87 public key file written by
	// `asaf-hitl-sign -keygen`). Without it the Hub stays sealed.
	operatorKey, err := loadOperatorKey(os.Getenv("ASAF_HITL_OPERATOR_KEY"))
	if err != nil {
		log.Fatalf("HITL operator key: %v", err)
	}
	if operatorKey == nil {
		log.Printf("HITL: ASAF_HITL_OPERATOR_KEY not set — Hub approvals are disabled")
	}
	hitlGuard := hub.NewHITLGuard(operatorKey)
	
	// Create the hub server wrapping the HITL enforcement
	hubServer := hub.NewServer(fleetManager, hitlGuard)

	port := os.Getenv("ASAF_HUB_PORT")
	if port == "" {
		port = "8443" // Default Hub port per architecture rules
	}

	addr := ":" + port
	log.Printf("Listening on %s", addr)
	log.Printf("TRL 10 HITL Enforcement: ACTIVE. Hub Mode Outbound calls are SEALED.")

	if err := http.ListenAndServe(addr, hubServer); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// loadOperatorKey reads the pinned HITL operator public key, or returns nil
// when path is empty.
func loadOperatorKey(path string) (*sign.PublicKey, error) {
	if path == "" {
		return nil, nil
	}
	return keyfile.ReadVerifyingKey(path)
}
