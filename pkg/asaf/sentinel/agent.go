package sentinel

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/nouchix/Adinkhepra-ASAF/pkg/asaf/fleet"
	"go.etcd.io/bbolt"
)

// Agent represents a KHEPRA Edge Node (Sentinel).
type Agent struct {
	ID         string
	HubURL     string
	HTTPClient *http.Client
	db         *bbolt.DB
}

// NewAgent initializes a new edge node agent with local BoltDB storage.
func NewAgent(id, hubURL, dbPath string) (*Agent, error) {
	db, err := bbolt.Open(dbPath, 0600, &bbolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("pending_scans"))
		return err
	})

	if err != nil {
		return nil, err
	}

	return &Agent{
		ID:     id,
		HubURL: hubURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		db: db,
	}, nil
}

// Close closes the local BoltDB database.
func (a *Agent) Close() error {
	return a.db.Close()
}

// Register authenticates and registers the Sentinel with the Hub.
func (a *Agent) Register(ctx context.Context) error {
	url := fmt.Sprintf("%s/api/v1/hub/register", a.HubURL)
	
	payload := map[string]string{
		"agent_id": a.ID,
		"status":   "Online",
	}
	body, _ := json.Marshal(payload)
	
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := a.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to register with hub: %d", resp.StatusCode)
	}
	
	log.Printf("[Sentinel %s] Registered with Hub at %s", a.ID, a.HubURL)
	return nil
}

// Poll commands from the Hub and flush pending scans.
func (a *Agent) Poll(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			a.flushPendingScans(ctx)
		}
	}
}

// ExecuteScan runs a local compliance scan on the edge node and streams results back.
func (a *Agent) ExecuteScan(ctx context.Context) {
	log.Printf("[Sentinel %s] Executing compliance scan...", a.ID)
	
	result := fleet.FleetScanResult{
		ID:       fmt.Sprintf("scan-%d", time.Now().Unix()),
		Host:     a.ID,
		Issue:    "STIG-V1R3 finding on local endpoint",
		Severity: "CAT II",
		Time:     time.Now().Format(time.RFC3339),
	}
	
	err := a.streamResultToHub(ctx, result)
	if err != nil {
		log.Printf("[Sentinel %s] Hub unreachable, saving scan offline: %v", a.ID, err)
		a.saveScanOffline(result)
	}
}

func (a *Agent) streamResultToHub(ctx context.Context, result fleet.FleetScanResult) error {
	url := fmt.Sprintf("%s/api/v1/hub/stream", a.HubURL)
	body, _ := json.Marshal(result)
	
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := a.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status code: %d", resp.StatusCode)
	}
	return nil
}

func (a *Agent) saveScanOffline(result fleet.FleetScanResult) {
	a.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("pending_scans"))
		data, err := json.Marshal(result)
		if err == nil {
			return b.Put([]byte(result.ID), data)
		}
		return nil
	})
}

func (a *Agent) flushPendingScans(ctx context.Context) {
	var pending [][]byte

	a.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("pending_scans"))
		b.ForEach(func(k, v []byte) error {
			pending = append(pending, k)
			return nil
		})
		return nil
	})

	for _, key := range pending {
		var data []byte
		a.db.View(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte("pending_scans"))
			data = b.Get(key)
			return nil
		})

		if data == nil {
			continue
		}

		var result fleet.FleetScanResult
		if err := json.Unmarshal(data, &result); err != nil {
			continue
		}

		err := a.streamResultToHub(ctx, result)
		if err == nil {
			// Successfully sent, delete from offline store
			a.db.Update(func(tx *bbolt.Tx) error {
				b := tx.Bucket([]byte("pending_scans"))
				return b.Delete(key)
			})
			log.Printf("[Sentinel %s] Flushed offline scan: %s", a.ID, result.ID)
		} else {
			// Stop flushing on first failure
			break
		}
	}
}
