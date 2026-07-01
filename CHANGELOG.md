# Changelog — AdinKhepra ASAF

All stable release artifacts are documented here.  
Development history: [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield)

---

## v1.1.0 — 2026-06-30

**TRL10 Security Hardening + Sovereign Auth + Full Sovereign Stack**

### Security — Critical Fixes (ship-blocker class)

Five pre-deployment security gaps closed before any customer deployment:

- **Unauthenticated privileged daemon access** — `POST /api/v1/asaf/remediate` had zero auth.
  Any process reaching the HTTP port could trigger `asaf-daemon` (CAP_SYS_ADMIN privileged
  executor). Fixed: `RemediateAPI.authorize()` validates `Authorization: Bearer <token>` →
  `GetSession()` → `VerifyPermission("remediation","write")` before daemon contact.

- **Session token plaintext storage** — tokens stored raw in SQLite. Fixed: SHA-256 hash
  stored at rest; raw token returned to client only at creation.

- **No server-side login rate limiting** — brute force uncapped. Fixed: 5 attempts / 15-min
  window per username, 15-min lockout, `Retry-After` header on 429.

- **Database world-readable** — SQLite auth DB created with default umask. Fixed:
  `os.Chmod(dbPath, 0600)` immediately after open (non-Windows).

- **Dead port in sovereign auth** — `AuthProvider.tsx` pointed to `localhost:45444`
  (retired, never real). Auth silently appeared to work while doing nothing. Fixed: all
  six call sites target `localhost:8443` (env-configurable via `NEXT_PUBLIC_ASAF_API_URL`).

### Added

**Sovereign SQLite Auth Backend** (`pkg/auth/sqlite_provider.go`)
- On-premise SQLite `AuthProvider` — zero external calls, air-gap safe
- Argon2id key derivation (OWASP 2024 params: t=1, m=64MB, p=4)
- Per-user random salts; `subtle.ConstantTimeCompare` for timing safety
- `GetSession()` returns full session with roles; `HasAnyUsers()` for bootstrap detection

**HTTP Auth API** (`pkg/webui/auth_api.go`)
- `POST /api/v1/auth/login` — rate-limited credential validation + DAG audit log
- `POST /api/v1/auth/validate` — session token check on every page load
- `GET  /api/v1/auth/bootstrap` — returns `{"needs_bootstrap": true/false}`
- `POST /api/v1/auth/bootstrap` — creates first admin; 403 after first call
- Every auth event (success/fail/rate-limited/bootstrap) written to immutable DAG — satisfies CMMC AU-2

**Remediate API** (`pkg/webui/remediate_api.go`)
- `POST /api/v1/asaf/remediate` — ML-DSA-65 signed ChangeRequest to asaf-daemon; auth-gated
- `GET  /api/v1/asaf/remediate/status` — staging job poll; auth-gated
- `REMEDIATE_REQUESTED` DAG node written before daemon contact (audit trail)

**ASAF Daemon Client** (`pkg/asaf/client/`)
- Unix socket client: JSON ChangeRequest in, ChangeResult out, 30s deadline
- ML-DSA-65 agent keypair auto-generated on first run

**Sekhem WAF HTTP Middleware** (`pkg/sekhem/http_middleware.go`)
- Ingress: body-size cap, spectral fingerprint, 8 L7 rules
- Egress: secret scrubbing, `X-Sekhem-FP` header
- SSE-safe flush for streaming paths

**DAG Atomic Writes + Cross-Process Reload**
- `FlushNode()` → write `.tmp` then `os.Rename()` (atomic)
- 5-second `AutoReloadDaemon` for cross-process DAG sync

**Lean Docker Image** (`Dockerfile.adinkhepra`)
- Single binary, CGO_ENABLED=0, Alpine 3.21, non-root user `adinkhepra`
- Resolves two prior build failures in the monolith Dockerfile

**Sovereign Stack Docker Compose** (`docker-compose.asaf.yml`)
- 4-service sovereign stack: asaf-api, asaf-ui (Next.js), ollama (local LLM), khepra-mcp
- `khepra-mcp` bound to `127.0.0.1:8765` only (not internet-exposed)

### Changed

- Sovereign boot validates stored session against live SQLite on every page load
- `useUserRoles()` reads role from user object directly — no dead-port round-trip
- `bootstrapAdmin()` and `checkNeedsBootstrap()` added to Auth context for first-run UX
- `docker-compose.asaf.yml`: corrected `KHEPRA_DAG_PATH` env var name; removed stale flag overrides

### Platforms

| Platform | Binary | Size |
|----------|--------|------|
| Linux x86_64 | `bin/adinkhepra-linux-amd64` | 103 MB |
| Windows x86_64 | `bin/adinkhepra-windows-amd64.exe` | 105 MB |
| macOS Apple Silicon | `bin/adinkhepra-darwin-arm64` | 99 MB |

### Validation

```
[OK] go build ./cmd/adinkhepra/...    — clean
[OK] go vet  (cmd + all packages)     — clean
[OK] go test ./pkg/auth/...           — pass
[OK] go test ./pkg/webui/...          — pass
[OK] go test ./pkg/dag/...            — pass
[OK] go test ./pkg/sekhem/...         — pass
[OK] go test ./pkg/agi/...            — pass
[OK] go test ./pkg/asaf/...           — pass
[OK] Docker build adinkhepra-test     — clean (CGO_ENABLED=0, Alpine 3.21)
```

### Quick Start (Sovereign)

```bash
# 1. Start the full sovereign stack
docker compose -f docker-compose.asaf.yml up -d

# 2. Bootstrap admin on first run (one-time)
curl -X POST http://localhost:8443/api/v1/auth/bootstrap \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","email":"admin@yourorg.com","password":"<strong-password>"}'

# 3. Open the compliance graph UI
open http://localhost:3000
```

Or run the binary directly:
```bash
# Linux/macOS
chmod +x bin/adinkhepra-linux-amd64
KHEPRA_MODE=sovereign ./bin/adinkhepra-linux-amd64 serve -port 8443

# Windows (PowerShell)
$env:KHEPRA_MODE="sovereign"
.\bin\adinkhepra-windows-amd64.exe serve -port 8443
```

---

## v0.1.1 — 2026-05-25 (patch)

**Fixes scan --target 403 on first run.**

- `scan --target` defaults to local agent (`http://127.0.0.1:45444`) instead of cloud SaaS
- Clear pre-flight error message when local agent is not running
- Sovereign two-terminal workflow documented

---

## v0.1.0 — 2026-05-25

**First stable release. Sovereign binary.**

- ML-DSA-65 (Dilithium) + Kyber-768 — NIST FIPS 204/203
- 36,195 compliance control mappings (STIG, NIST 800-171r2, CMMC 2.0, FedRAMP)
- Godfather Report — dollar-denominated risk findings
- Tamper-evident DAG with PQC signatures
- MCP tool-call scanner
- ASAF flight recorder (SSE real-time audit stream)
- ERT (Emergency Response Toolkit)
- Windows x86_64 only

---

## Versioning Policy

- This repo receives only versioned release artifacts.
- Development lives in [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield).
- A release is cut after all `go test` suites pass and Docker build is clean.

## Security Contact

security@nouchix.com

## License

Proprietary — NouchiX SecRed Knowledge Inc.
