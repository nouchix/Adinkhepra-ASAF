package main

import (
	"log"
	"net/http"
	"os"

	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/fleet"
	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/hub"
)

func main() {
	log.Println("Starting Khepra Stargate (Hub & Fleet) Backend...")
	
	// Enforce TRL 10 Architecture - Must initialize a guarded instance
	fleetManager := fleet.NewManager()
	hitlGuard := hub.NewHITLGuard()
	
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
