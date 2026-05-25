# ASAF — Agentic Security Attestation Framework

[![Patent Pending](https://img.shields.io/badge/PATENT-PENDING-blue?style=for-the-badge)](https://nouchix.com)
[![NouchiX / Sacred Knowledge Inc](https://img.shields.io/badge/BY-NouchiX-gold?style=for-the-badge)](https://nouchix.com)
[![ADINKHEPRA Certified](https://img.shields.io/badge/ADINKHEPRA-POST--QUANTUM_CERTIFIED-cyan?style=for-the-badge)](#certification)
[![FIPS 140-3](https://img.shields.io/badge/FIPS-140--3_BoringCrypto-green?style=for-the-badge)](#build)
[![Release](https://img.shields.io/badge/RELEASE-v0.1.0-brightgreen?style=for-the-badge)](#releases)

**By NouchiX (Sacred Knowledge Inc)**  
**Stable release artifacts for the ASAF sovereign binary.**

> Development branch: [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield)  
> This repo: signed stable release binaries, changelogs, and sovereign deployment packages only.

---

## Deployment Profiles

ASAF ships in two distinct profiles. Choose the one that matches your compliance posture.

| | **Profile A — SaaS** | **Profile B — Sovereign** |
|-|----------------------|--------------------------|
| **Hosting** | Managed cloud (`adinkhepra.com`) | Your infrastructure (Docker Compose / bare-metal) |
| **Auth** | Supabase (cloud-managed) | On-premise SQLite — no external auth calls |
| **Data egress** | Cloud-hosted dashboard | Zero external calls — fully air-gap capable |
| **Compliance posture** | SMB / developer self-serve | DIB / CMMC / FedRAMP / air-gapped |
| **Sovereign claim** | ❌ Not applicable | ✅ On your metal, no cloud, no token meter |
| **FIPS 140-3 binary** | ❌ Standard build | ✅ `GOEXPERIMENT=boringcrypto` — BoringCrypto |
| **Pricing** | `$0 / $99 / $499 /mo` → [adinkhepra.com](https://app.nouchix.com) | `$25K – $250K / year` flat annual |
| **Target buyer** | Developer / security engineer | Prime contractor, DIB, C3PAO, enterprise |

> **If you are a DIB contractor, prime, or C3PAO evaluator: use Profile B.**  
> Profile A does not satisfy CUI handling, DFARS 252.204-7021, or CMMC Level 2 requirements.

---

## Quick Start — Profile B (Sovereign)

```bash
# Windows (x86_64)
./bin/adinkhepra-windows-amd64.exe keygen -out ./keys/node -comment "my-environment"
./bin/adinkhepra-windows-amd64.exe scan --target <host> --sign --key ./keys/node
./bin/adinkhepra-windows-amd64.exe report --godfather --out godfather_report.pdf

# Linux (x86_64) — coming in v0.2.0
./bin/adinkhepra-linux-amd64 keygen -out ./keys/node -comment "my-environment"
```

**Five-minute demo:** PQC-signed MCP tool-call scan, DAG write, tamper-evident attestation node —  
no license key required, no cloud, no telemetry.

---

## What This Binary Does

- **ML-DSA-65 (Dilithium) + Kyber** — NIST FIPS 204/203 post-quantum key generation and signing
- **36,195 control mappings** — STIG / NIST 800-171 / CMMC 2.0 compliance checks applied automatically
- **Godfather Report** — Dollar-denominated findings export for C3PAO / ISSM intake
- **Tamper-evident DAG** — Provenance chain anchoring all attestation nodes; mathematically verifiable
- **MCP tool-call scanner** — Audits Model Context Protocol tool surfaces for security posture
- **FIPS 140-3** — Built with `GOEXPERIMENT=boringcrypto` (BoringCrypto); all crypto goes through the FIPS-validated module

---

## Releases

| Version | Date | Binary | SHA-256 |
|---------|------|--------|---------|
| [v0.1.0](CHANGELOG.md#v010) | 2026-05-25 | `bin/adinkhepra-windows-amd64.exe` | see [CHECKSUMS.txt](bin/CHECKSUMS.txt) |

---

## Certification

The **ADINKHEPRA badge** is the standard enterprises earn by passing an ASAF audit.

- Cryptographically signed (ML-DSA-65 — NIST FIPS 204 aligned)
- Timestamped and DAG-anchored — tamper-evident provenance chain
- Revocable if posture degrades
- Shareable with auditors, C3PAOs, customers, and cyber insurers

---

## Enterprise / DIB Procurement

Flat annual license. No per-seat fees. No cloud dependency in the Go binary.  
AWS Marketplace listing available for GovCloud procurement vehicles.

**Contact:** skone@alumni.albany.edu  
**Company:** NouchiX / Sacred Knowledge Inc  
**Patent:** Pending

---

## About This Repository

This repository receives only:
- Signed release binaries (versioned)
- Release notes and changelogs  
- `CHECKSUMS.txt` with SHA-256 hashes for all artifacts

Active development, feature branches, and PRs live in:  
→ [EtherVerseCodeMate/giza-cyber-shield](https://github.com/EtherVerseCodeMate/giza-cyber-shield)
