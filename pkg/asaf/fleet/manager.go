package fleet

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"go.etcd.io/bbolt"
)

// Manager handles fleet orchestration and state.
type Manager struct {
	mu       sync.RWMutex
	db       *bbolt.DB
}

// NewManager creates a new fleet manager instance with BoltDB.
func NewManager(dbPath string) (*Manager, error) {
	db, err := bbolt.Open(dbPath, 0600, &bbolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}

	// Ensure buckets exist
	err = db.Update(func(tx *bbolt.Tx) error {
		b, err := tx.CreateBucketIfNotExists([]byte("enclaves"))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte("scans"))
		if err != nil {
			return err
		}

		if b.Stats().KeyN == 0 {
			defaults := []Enclave{
				{
					ID:        "alpha",
					Name:      "Alpha Zone",
					Asset:     5,
					Status:    "Compliant",
					RiskScore: 10,
					Assets: []Asset{
						{ID: "asset-1", Type: "server", Hostname: "web-01.alpha.internal", Compliance: "Compliant", LastSeen: time.Now().Format(time.RFC3339)},
						{ID: "asset-2", Type: "database", Hostname: "db-01.alpha.internal", Compliance: "Compliant", LastSeen: time.Now().Format(time.RFC3339)},
					},
				},
				{
					ID:        "bravo",
					Name:      "Bravo DMZ",
					Asset:     3,
					Status:    "At-Risk",
					RiskScore: 35,
					Assets: []Asset{
						{ID: "asset-3", Type: "gateway", Hostname: "gw-01.bravo.internal", Compliance: "Non-Compliant", LastSeen: time.Now().Format(time.RFC3339)},
					},
				},
			}
			for _, enc := range defaults {
				data, _ := json.Marshal(enc)
				b.Put([]byte(enc.ID), data)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &Manager{
		db: db,
	}, nil
}

// Close closes the underlying BoltDB connection.
func (m *Manager) Close() error {
	return m.db.Close()
}

// GetEnclaves returns all managed enclaves from the database.
func (m *Manager) GetEnclaves() []Enclave {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []Enclave
	m.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("enclaves"))
		b.ForEach(func(k, v []byte) error {
			var e Enclave
			if err := json.Unmarshal(v, &e); err == nil {
				result = append(result, e)
			}
			return nil
		})
		return nil
	})
	return result
}

// GetSPRSSummary calculates the SPRS score for the fleet.
func (m *Manager) GetSPRSSummary() *FleetSPRSSummary {
	return &FleetSPRSSummary{
		FleetSPRS: 110, // Max score for DoD SPRS
	}
}

// GetLastScan returns the results of the last fleet scan from the database.
func (m *Manager) GetLastScan() *FleetScanSummary {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var summary *FleetScanSummary
	m.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("scans"))
		v := b.Get([]byte("lastScan"))
		if v != nil {
			var s FleetScanSummary
			if err := json.Unmarshal(v, &s); err == nil {
				summary = &s
			}
		}
		return nil
	})

	if summary == nil {
		return &FleetScanSummary{
			Status:    "None",
			Total:     0,
			FleetSPRS: 0,
		}
	}
	return summary
}

// DiscoverEnclave registers an edge node (Sentinel).
func (m *Manager) DiscoverEnclave(ctx context.Context, id string, status string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if id == "" {
		return fmt.Errorf("invalid enclave ID")
	}

	e := Enclave{
		ID:        id,
		Name:      "Sentinel Node: " + id,
		Asset:     1,
		Status:    status,
		RiskScore: 0,
	}

	data, err := json.Marshal(e)
	if err != nil {
		return err
	}

	return m.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("enclaves"))
		return b.Put([]byte(id), data)
	})
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
	m.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("scans"))
		data, err := json.Marshal(summary)
		if err == nil {
			b.Put([]byte("lastScan"), data)
		}
		return nil
	})
	m.mu.Unlock()

	results <- summary
}
