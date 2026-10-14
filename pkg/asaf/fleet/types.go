package fleet

// FleetSPRSSummary represents the combined Supplier Performance Risk System score for the entire fleet.
type FleetSPRSSummary struct {
	FleetSPRS int `json:"fleet_sprs"`
}

// Asset represents a target machine or node in the enclave.
type Asset struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	Hostname   string `json:"hostname"`
	Compliance string `json:"compliance"`
	LastSeen   string `json:"last_seen"`
}

// Enclave represents an isolated network zone or tenant space.
type Enclave struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Asset     int     `json:"asset"`
	Status    string  `json:"status"`
	RiskScore int     `json:"risk_score"`
	Assets    []Asset `json:"assets,omitempty"`
}

// FleetScanResult represents an incremental finding discovered during a scan.
type FleetScanResult struct {
	ID       string `json:"id"`
	Host     string `json:"host"`
	Issue    string `json:"issue"`
	Severity string `json:"severity"`
	Time     string `json:"time"`
}

// FleetScanSummary represents the final aggregate results of a fleet-wide scan.
type FleetScanSummary struct {
	Status    string            `json:"status"`
	Total     int               `json:"total"`
	Critical  int               `json:"critical"`
	High      int               `json:"high"`
	Medium    int               `json:"medium"`
	Low       int               `json:"low"`
	FleetSPRS int               `json:"fleet_sprs"`
	Results   []FleetScanResult `json:"results,omitempty"`
}
