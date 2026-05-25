## v0.1.1 -- 2026-05-25 (patch)

**Fixes scan --target 403 on first run.**

### What Changed

- **scan --target now defaults to the local agent** (http://127.0.0.1:45444)
  instead of the cloud SaaS (https://agent.souhimbou.org).
  Sovereign Profile B users no longer need a cloud API key to run a scan.
- **Clear pre-flight error** if the local agent isn't running:
  `
  [SOVEREIGN] Local agent not reachable at http://127.0.0.1:45444
  Start it first:
    .\adinkhepra-windows-amd64.exe run
  Then re-run the scan in a second terminal:
    .\adinkhepra-windows-amd64.exe scan --target 127.0.0.1
  `
- **Sovereign workflow** (two terminals):
  `powershell
  # Terminal 1
  .\adinkhepra-windows-amd64.exe run

  # Terminal 2
  .\adinkhepra-windows-amd64.exe scan --target <host>
  `
- To use the cloud SaaS explicitly set ASAF_API_URL=https://agent.souhimbou.org

**SHA-256:** 487EFDC95BC83E002CD1F91BEF9A8B670CC6E07043EB985537CD528B64860BDB

---
# Changelog â€” ASAF (Agentic Security Attestation Framework)

All notable changes to stable releases are documented here.  
Development history: [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield)

---

## v0.1.0 â€” 2026-05-25

**First stable release. Sovereign binary. FIPS 140-3.**

### What's Included

- **ML-DSA-65 (Dilithium) + Kyber-768** â€” NIST FIPS 204/203 post-quantum key generation,
  signing, and verification. All crypto routed through BoringCrypto
  (`GOEXPERIMENT=boringcrypto`, `CGO_ENABLED=1`)
- **36,195 compliance control mappings** â€” STIG, NIST 800-171r2, CMMC 2.0 (Levels 1â€“3),
  FedRAMP, GSA applied automatically at scan time
- **Godfather Report** â€” Dollar-denominated risk findings export; structured for C3PAO / ISSM
  intake without manual reformatting
- **Tamper-evident DAG** â€” Directed Acyclic Graph anchoring all attestation nodes with PQC
  signatures; mathematically verifiable provenance chain
- **MCP tool-call scanner** â€” Audits Model Context Protocol tool surfaces (`tools/list`,
  `tools/call`) for auth posture, schema exposure, and capability blast radius
- **ASAF flight recorder** â€” SSE-based real-time audit stream for live monitoring dashboards;
  `/api/v1/asaf/stream`, `/api/v1/asaf/sessions`, `/api/v1/asaf/record`
- **ERT (Emergency Response Toolkit)** â€” Crash dummy, lane sonar, Godfather orchestration,
  crypto hardening assessment (`ert_readiness`, `ert_architect`, `ert_crypto`, `ert_godfather`)
- **Resilience validated (TRL-10)** â€” 5/5 documented failure modes verified self-recoverable:
  - R1: Agent process crash recovery (10.5s)
  - R2: DAG persistence corruption recovery (10.6s)
  - R3: Port contention self-healing
  - R4: Telemetry dependency degradation (graceful fallback, 522ms)
  - R5: Health liveness under sustained load (3ms response)

### Validation Results (this release)

```
[OK] Unit tests:          120 packages â€” 0 failures
[OK] PQC key generation:  ML-DSA-65 + Kyber â€” FIPS build confirmed
[OK] Agent API:           DAG write, ASAF smoke (stream/sessions/record)
[OK] Resilience:          5/5 â€” ALL SYSTEMS GO
[OK] Vuln scan:           0 CRITICAL  0 HIGH  0 MODERATE  0 LOW
```

### Deployment Profile

This binary is **Profile B â€” Sovereign**:
- No Supabase dependency in the binary
- No external calls at runtime
- Air-gap capable
- SQLite attestation store

### Platform

| Platform | Binary | FIPS |
|----------|--------|------|
| Windows x86_64 | `bin/adinkhepra-windows-amd64.exe` | âœ… BoringCrypto |
| Linux x86_64 | coming v0.2.0 | âœ… BoringCrypto |

### Known Limitations

- **16-class agentic threat scanner (T01â€“T16):** Taxonomy defined; Go implementation
  scheduled for next sprint. Current binary performs compliance scanning (36,195 controls)
  â€” not real-time agentic threat classification.
- **Souhimbou AI ASAF (ML anomaly detection):** Architecture complete; deployable service
  scheduled for v0.3.0.
- **Linux / macOS binaries:** Cross-compiled builds coming in v0.2.0.
- **Windows `route print` parser:** Fixed in this release â€” no longer panics on 4-column
  routing table entries from Hyper-V / WSL2 environments.

---

## Versioning Policy

- **This repo** receives only versioned release artifacts.
- Development, PRs, and feature branches live in `EtherVerseCodeMate/giza-cyber-shield`.
- A release is cut here only after `python adinkhepra.py validate` passes with exit code 0
  (full unit + integration + resilience suite).
- Binaries are signed with the ADINKHEPRA master key (see `keys/` in the dev repo).
