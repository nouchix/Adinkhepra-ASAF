package hub

import (
	"errors"
	"net/http"
	"sync"
)

// HITLGuard enforces the Human-In-The-Loop requirement for Hub Mode.
// TRL 10 Requirement: No outbound fleet calls can be made unless a human
// operator has cryptographically unsealed or explicitly approved the Hub.
type HITLGuard struct {
	mu         sync.RWMutex
	isApproved bool
	signature  string // In a real scenario, this holds the PQC signature.
}

// NewHITLGuard creates a new locked HITL guard.
func NewHITLGuard() *HITLGuard {
	return &HITLGuard{
		isApproved: false,
	}
}

// Approve records a human approval for Hub operations.
func (h *HITLGuard) Approve(signature string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.isApproved = true
	h.signature = signature
}

// Revoke removes the human approval, re-sealing the Hub.
func (h *HITLGuard) Revoke() {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.isApproved = false
	h.signature = ""
}

// IsApproved checks if the Hub has been unlocked by a human.
func (h *HITLGuard) IsApproved() bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.isApproved
}

// RequireApprovalMiddleware wraps an HTTP handler, enforcing HITL approval.
func (h *HITLGuard) RequireApprovalMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !h.IsApproved() {
			// Fail securely and loudly if unapproved outbound action is attempted.
			http.Error(w, `{"error": "TRL10_VIOLATION: Hub Mode outbound actions require explicit Human-In-The-Loop (HITL) cryptographic approval."}`, http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

// RequireApproval is a direct check returning an error if not approved.
func (h *HITLGuard) RequireApproval() error {
	if !h.IsApproved() {
		return errors.New("TRL10_VIOLATION: Hub Mode requires explicit HITL approval")
	}
	return nil
}
