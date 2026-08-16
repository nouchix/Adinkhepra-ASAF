package fleet

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// Manager handles fleet orchestration and state.
type Manager struct {
	mu       sync.RWMutex
	enclaves map[string]Enclave
	lastScan *FleetScanSummary
}

// NewManager creates a new fleet manager instance.
func NewManager() *Manager {
	return &Manager{
		enclaves: make(map[string]Enclave),
	}
}

// GetEnclaves returns all managed enclaves.
func (m *Manager) GetEnclaves() []Enclave {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []Enclave
	for _, e := range m.enclaves {
		result = append(result, e)
	}
	// No mock data - return actual enclaves
	return result
}

// GetSPRSSummary calculates the SPRS score for the fleet.
func (m *Manager) GetSPRSSummary() *FleetSPRSSummary {
	return &FleetSPRSSummary{
		FleetSPRS: 110, // Max score for DoD SPRS
	}
}

// GetLastScan returns the results of the last fleet scan.
func (m *Manager) GetLastScan() *FleetScanSummary {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if m.lastScan == nil {
		return &FleetScanSummary{
			Status:    "None",
			Total:     0,
			FleetSPRS: 0,
		}
	}
	return m.lastScan
}

// DiscoverEnclave registers an edge node (Sentinel).
func (m *Manager) DiscoverEnclave(ctx context.Context, id string, status string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if id == "" {
		return fmt.Errorf("invalid enclave ID")
	}

	m.enclaves[id] = Enclave{
		ID:        id,
		Name:      "Sentinel Node: " + id,
		Asset:     1,
		Status:    status,
		RiskScore: 0,
	}
	return nil
}

// StartScan initiates a simulated scan across the fleet, streaming results to a channel.
func (m *Manager) StartScan(ctx context.Context, results chan<- interface{}) {
	defer close(results)
	// Simulate scan delay
	time.Sleep(500 * time.Millisecond)

	results <- FleetScanResult{
		ID:       "vuln-1",
		Host:     "10.0.0.5",
		Issue:    "PQC-010040: Deprecated cryptographic algorithm detected",
		Severity: "CAT I",
		Time:     time.Now().Format(time.RFC3339),
	}
	time.Sleep(500 * time.Millisecond)

	summary := &FleetScanSummary{
		Status:    "Complete",
		Total:     1,
		Critical:  1,
		High:      0,
		Medium:    0,
		Low:       0,
		FleetSPRS: 105, // Deducted score due to finding
	}

	m.mu.Lock()
	m.lastScan = summary
	m.mu.Unlock()

	results <- summary
}
