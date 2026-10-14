package hub

import (
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/nouchix/khepra-pqc/sign"
)

// HITLGuard enforces the Human-In-The-Loop requirement for Hub Mode.
//
// No outbound fleet call can be made unless a human operator has approved the
// Hub with an ML-DSA-87 (FIPS 204) signature from the operator key pinned at
// startup. An approval covers a timestamp and a single-use nonce, and lasts
// ApprovalWindow. Without an operator key, the Hub cannot be approved.
type HITLGuard struct {
	mu            sync.Mutex
	operator      *sign.PublicKey
	approvedUntil time.Time
	usedNonces    map[string]time.Time // nonce -> when it may be forgotten
	now           func() time.Time
}

// ApprovalWindow is how long one signed approval keeps the Hub unsealed.
const ApprovalWindow = 15 * time.Minute

// approvalMaxSkew bounds how far an approval's timestamp may be from now.
const approvalMaxSkew = 5 * time.Minute

// approvalContext is the FIPS 204 context for HITL approval signatures.
var approvalContext = func() sign.Context {
	c, err := sign.ContextAttest.WithLabel("hitl-approve")
	if err != nil {
		panic(err)
	}
	return c
}()

// ApprovalRequest is the body of POST /api/v1/hub/approve.
type ApprovalRequest struct {
	Timestamp int64  `json:"timestamp"` // Unix seconds
	Nonce     string `json:"nonce"`     // hex, at least 16 bytes
	Signature string `json:"signature"` // hex ML-DSA-87 signature over ApprovalMessage
}

// ApprovalMessage is the byte string an operator signs.
func ApprovalMessage(timestamp int64, nonce string) []byte {
	return []byte(fmt.Sprintf("asaf-hitl-approve\x00%d\x00%s", timestamp, nonce))
}

// SignApproval builds a signed approval with the operator's private key.
func SignApproval(key *sign.PrivateKey, now time.Time, nonce []byte) (ApprovalRequest, error) {
	req := ApprovalRequest{Timestamp: now.Unix(), Nonce: hex.EncodeToString(nonce)}
	sig, err := key.Sign(approvalContext, ApprovalMessage(req.Timestamp, req.Nonce))
	if err != nil {
		return ApprovalRequest{}, err
	}
	req.Signature = hex.EncodeToString(sig)
	return req, nil
}

// NewHITLGuard creates a sealed HITL guard that accepts approvals signed by
// operator. A nil operator key means approvals are always refused.
func NewHITLGuard(operator *sign.PublicKey) *HITLGuard {
	return &HITLGuard{
		operator:   operator,
		usedNonces: make(map[string]time.Time),
		now:        time.Now,
	}
}

// Approve unseals the Hub for ApprovalWindow if req carries a fresh, unused,
// valid operator signature.
func (h *HITLGuard) Approve(req ApprovalRequest) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.operator == nil {
		return errors.New("HITL: no operator key is configured; approvals are disabled")
	}
	now := h.now()
	ts := time.Unix(req.Timestamp, 0)
	if ts.Before(now.Add(-approvalMaxSkew)) || ts.After(now.Add(approvalMaxSkew)) {
		return errors.New("HITL: approval timestamp is outside the allowed window")
	}
	nonce, err := hex.DecodeString(req.Nonce)
	if err != nil || len(nonce) < 16 {
		return errors.New("HITL: approval nonce must be at least 16 hex-encoded bytes")
	}
	for n, expiry := range h.usedNonces {
		if now.After(expiry) {
			delete(h.usedNonces, n)
		}
	}
	if _, used := h.usedNonces[req.Nonce]; used {
		return errors.New("HITL: approval nonce already used")
	}
	sig, err := hex.DecodeString(req.Signature)
	if err != nil {
		return errors.New("HITL: approval signature is not hex")
	}
	if err := h.operator.Verify(approvalContext, ApprovalMessage(req.Timestamp, req.Nonce), sig); err != nil {
		return errors.New("HITL: approval signature is invalid")
	}

	h.usedNonces[req.Nonce] = ts.Add(2 * approvalMaxSkew)
	h.approvedUntil = now.Add(ApprovalWindow)
	return nil
}

// Revoke re-seals the Hub immediately.
func (h *HITLGuard) Revoke() {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.approvedUntil = time.Time{}
}

// IsApproved reports whether a valid approval is in effect.
func (h *HITLGuard) IsApproved() bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.now().Before(h.approvedUntil)
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
