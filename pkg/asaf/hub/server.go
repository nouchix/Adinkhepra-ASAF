package hub

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/fleet"
)

// Server encapsulates the Hub API endpoints.
type Server struct {
	manager *fleet.Manager
	hitl    *HITLGuard
	mux     *http.ServeMux
}

// NewServer creates a new Hub API server.
func NewServer(manager *fleet.Manager, hitl *HITLGuard) *Server {
	s := &Server{
		manager: manager,
		hitl:    hitl,
		mux:     http.NewServeMux(),
	}
	s.registerRoutes()
	return s
}

// ServeHTTP implements the http.Handler interface.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Simple CORS for the local UI
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	s.mux.ServeHTTP(w, r)
}

func (s *Server) registerRoutes() {
	// TRL 10 Enforced Routes: Outbound or mutative actions must go through HITL middleware.
	s.mux.HandleFunc("/api/v1/fleet/enclaves", s.handleGetEnclaves)
	s.mux.HandleFunc("/api/v1/fleet/sprs", s.handleGetSPRS)
	s.mux.HandleFunc("/api/v1/fleet/scan/status", s.handleGetScanStatus)
	s.mux.HandleFunc("/api/v1/fleet/scan/last", s.handleGetLastScan)

	// Protected Endpoints
	s.mux.HandleFunc("/api/v1/fleet/scan", s.hitl.RequireApprovalMiddleware(s.handleStartScan))
	s.mux.HandleFunc("/api/v1/fleet/scan/stream", s.hitl.RequireApprovalMiddleware(s.handleScanStream))

	// HITL Approval endpoints for testing
	s.mux.HandleFunc("/api/v1/hub/approve", s.handleHITLApprove)
	s.mux.HandleFunc("/api/v1/hub/revoke", s.handleHITLRevoke)
}

func (s *Server) handleGetEnclaves(w http.ResponseWriter, r *http.Request) {
	enclaves := s.manager.GetEnclaves()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enclaves)
}

func (s *Server) handleGetSPRS(w http.ResponseWriter, r *http.Request) {
	summary := s.manager.GetSPRSSummary()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

func (s *Server) handleGetScanStatus(w http.ResponseWriter, r *http.Request) {
	// Simplified mock status
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "idle"}`))
}

func (s *Server) handleGetLastScan(w http.ResponseWriter, r *http.Request) {
	scan := s.manager.GetLastScan()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scan)
}

func (s *Server) handleStartScan(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "scan_started"}`))
}

func (s *Server) handleScanStream(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	results := make(chan interface{})
	go s.manager.StartScan(context.Background(), results)

	for res := range results {
		data, _ := json.Marshal(res)
		fmt.Fprintf(w, "data: %s\n\n", data)
		flusher.Flush()
	}
}

func (s *Server) handleHITLApprove(w http.ResponseWriter, r *http.Request) {
	// In production this would require validating a PQC signed payload.
	s.hitl.Approve("dummy-signature")
	w.Write([]byte(`{"status": "approved", "hitl": true}`))
}

func (s *Server) handleHITLRevoke(w http.ResponseWriter, r *http.Request) {
	s.hitl.Revoke()
	w.Write([]byte(`{"status": "revoked", "hitl": false}`))
}
