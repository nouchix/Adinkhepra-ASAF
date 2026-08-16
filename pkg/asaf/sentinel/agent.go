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
)

// Agent represents a KHEPRA Edge Node (Sentinel).
type Agent struct {
	ID         string
	HubURL     string
	HTTPClient *http.Client
}

// NewAgent initializes a new edge node agent.
func NewAgent(id, hubURL string) *Agent {
	return &Agent{
		ID:     id,
		HubURL: hubURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
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

// Poll commands from the Hub.
func (a *Agent) Poll(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Simulated polling for the prototype
			// log.Printf("[Sentinel %s] Polling for commands...", a.ID)
		}
	}
}

// ExecuteScan runs a local compliance scan on the edge node and streams results back.
func (a *Agent) ExecuteScan(ctx context.Context) {
	// In production, this executes pqc_stig or fim checks locally using playbooks.
	log.Printf("[Sentinel %s] Executing compliance scan...", a.ID)
	
	result := fleet.FleetScanResult{
		ID:       fmt.Sprintf("scan-%d", time.Now().Unix()),
		Host:     a.ID,
		Issue:    "STIG-V1R3 finding on local endpoint",
		Severity: "CAT II",
		Time:     time.Now().Format(time.RFC3339),
	}
	
	a.streamResultToHub(ctx, result)
}

func (a *Agent) streamResultToHub(ctx context.Context, result fleet.FleetScanResult) {
	url := fmt.Sprintf("%s/api/v1/hub/stream", a.HubURL)
	body, _ := json.Marshal(result)
	
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Error building stream request: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := a.HTTPClient.Do(req)
	if err != nil {
		log.Printf("Error streaming result to hub: %v", err)
		return
	}
	defer resp.Body.Close()
}
