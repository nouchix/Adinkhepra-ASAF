package hub

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/nouchix/khepra-pqc/sign"
)

func newNonce(t *testing.T) []byte {
	t.Helper()
	n := make([]byte, 16)
	if _, err := rand.Read(n); err != nil {
		t.Fatal(err)
	}
	return n
}

func TestHITLApproval(t *testing.T) {
	operator, err := sign.GenerateKey()
	if err != nil {
		t.Fatal(err)
	}
	other, err := sign.GenerateKey()
	if err != nil {
		t.Fatal(err)
	}
	now := time.Unix(1_800_000_000, 0)
	g := NewHITLGuard(operator.PublicKey())
	g.now = func() time.Time { return now }

	if g.IsApproved() {
		t.Fatal("new guard is approved")
	}

	// Wrong key.
	forged, _ := SignApproval(other, now, newNonce(t))
	if err := g.Approve(forged); err == nil {
		t.Fatal("approval signed by a non-operator key accepted")
	}

	// Stale timestamp.
	stale, _ := SignApproval(operator, now.Add(-10*time.Minute), newNonce(t))
	if err := g.Approve(stale); err == nil {
		t.Fatal("stale approval accepted")
	}

	// Valid approval.
	good, _ := SignApproval(operator, now, newNonce(t))
	if err := g.Approve(good); err != nil {
		t.Fatalf("valid approval rejected: %v", err)
	}
	if !g.IsApproved() {
		t.Fatal("guard not approved after a valid approval")
	}

	// Replay of the same approval.
	g.Revoke()
	if err := g.Approve(good); err == nil {
		t.Fatal("replayed approval accepted")
	}

	// Tampered timestamp breaks the signature.
	tampered, _ := SignApproval(operator, now, newNonce(t))
	tampered.Timestamp++
	if err := g.Approve(tampered); err == nil {
		t.Fatal("approval with a modified timestamp accepted")
	}

	// Approvals expire.
	fresh, _ := SignApproval(operator, now, newNonce(t))
	if err := g.Approve(fresh); err != nil {
		t.Fatal(err)
	}
	now = now.Add(ApprovalWindow + time.Second)
	if g.IsApproved() {
		t.Fatal("approval did not expire")
	}

	// No operator key: never approvable.
	sealed := NewHITLGuard(nil)
	if err := sealed.Approve(good); err == nil {
		t.Fatal("guard without an operator key accepted an approval")
	}
}

func TestHITLApproveEndpoint(t *testing.T) {
	operator, err := sign.GenerateKey()
	if err != nil {
		t.Fatal(err)
	}
	g := NewHITLGuard(operator.PublicKey())
	s := &Server{hitl: g, mux: http.NewServeMux()}
	s.mux.HandleFunc("/api/v1/hub/approve", s.handleHITLApprove)

	get := httptest.NewRecorder()
	s.ServeHTTP(get, httptest.NewRequest(http.MethodGet, "/api/v1/hub/approve", nil))
	if get.Code == http.StatusOK || g.IsApproved() {
		t.Fatal("GET approved the Hub")
	}

	empty := httptest.NewRecorder()
	s.ServeHTTP(empty, httptest.NewRequest(http.MethodPost, "/api/v1/hub/approve", bytes.NewReader([]byte(`{}`))))
	if empty.Code == http.StatusOK || g.IsApproved() {
		t.Fatal("unsigned POST approved the Hub")
	}

	req, err := SignApproval(operator, time.Now(), newNonce(t))
	if err != nil {
		t.Fatal(err)
	}
	body, _ := json.Marshal(req)
	ok := httptest.NewRecorder()
	s.ServeHTTP(ok, httptest.NewRequest(http.MethodPost, "/api/v1/hub/approve", bytes.NewReader(body)))
	if ok.Code != http.StatusOK || !g.IsApproved() {
		t.Fatalf("signed approval rejected: %d %s", ok.Code, ok.Body.String())
	}
}
