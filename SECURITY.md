# Security Policy — ASAF (Agentic Security Attestation Framework)
### NouchiX / Sacred Knowledge Inc

---

## OWASP SDLC Alignment

| SDLC Phase | Implementation |
|---|---|
| **Requirements** | ASVS Level 2 target; CMMC 3.0 Level 2/3; NIST 800-53; FIPS 140-3 |
| **Design** | PQC-first architecture (ML-DSA-65 + Kyber); tamper-evident DAG provenance |
| **Implementation** | FIPS 140-3 BoringCrypto build; code generated from [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield) — see that repo's security posture |
| **Verification** | SHA-256 checksums for all binaries; CodeQL + Trivy in development repo CI |
| **Operation** | Tamper-evident attestation chain; PQC-signed binary releases |

---

## Reporting a Vulnerability

**Do NOT open public issues for security vulnerabilities.**

### Secure Reporting Channels

| Channel | Use For |
|---|---|
| `security@souhimbou.ai` (PGP: `keys/security_contact.asc`) | All vulnerabilities |
| `skone@alumni.albany.edu` | Primary researcher contact |
| `legal@souhimbou.ai` | IP-sensitive disclosures |

**For high-assurance reporting**, use our Post-Quantum keys:
- Dilithium signing: `keys/id_dilithium.pub`
- Kyber encryption: `keys/regalia_kyber.pub`

### Response Timeline

| Step | SLA |
|---|---|
| Acknowledgement | Within 24 hours |
| Initial assessment | Within 5 business days |
| Patch for Critical/High | Within 30 days of confirmation |
| CVE coordination | On patch release |

### What to Include
- ASAF version (`./bin/adinkhepra-windows-amd64.exe --version`)
- Component (CLI, crypto engine, DAG layer, MCP scanner)
- Description and reproduction steps
- Impact assessment (CIA triad)

---

## Binary Integrity Verification

Every ASAF release binary is:
1. **SHA-256 hashed** — checksums published in `bin/CHECKSUMS.txt`
2. **ML-DSA-65 signed** — PQC digital signature (NIST FIPS 204 aligned)
3. **CI-verified** — GitHub Actions re-verifies checksums on every push

### Verify Before Running

```powershell
# Windows — verify SHA-256 before execution
$expected = (Get-Content bin\CHECKSUMS.txt | Select-String "adinkhepra-windows-amd64.exe").Line.Split()[0]
$actual = (Get-FileHash bin\adinkhepra-windows-amd64.exe -Algorithm SHA256).Hash.ToLower()
if ($expected -eq $actual) { Write-Host "✅ Integrity verified" } else { Write-Host "❌ MISMATCH — do not run!" }
```

---

## Supported Versions

| Version | Status | Security Support |
|---|---|---|
| v0.1.x (current) | ✅ Active | Full patches |
| < v0.1 | ❌ EOL | None |

---

## Legal Protections

This software contains proprietary post-quantum cryptographic algorithms.
Unauthorized reverse engineering or IP extraction is prohibited under:

- Economic Espionage Act (18 U.S.C. § 1831-1839)
- DMCA Anti-Circumvention (17 U.S.C. § 1201)
- DoD FAR Supplement (DFARS 252.227-7013)

See full terms: `LICENSE`

---

## Compliance Certifications

| Standard | Level / Claim |
|---|---|
| FIPS 140-3 | BoringCrypto build (`GOEXPERIMENT=boringcrypto`) |
| NIST 800-53 | Continuous monitoring (CA-7), System Integrity (SI-7) |
| CMMC 3.0 | Level 2 target; Level 3 for sovereign deployments |
| NIST PQC | ML-DSA-65 (FIPS 204) + Kyber (FIPS 203) |

*References: [OWASP SAMM](https://owasp.org/www-project-samm/) | [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)*
