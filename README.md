# ASAF — Agentic Security Attestation Framework

[![Patent Pending](https://img.shields.io/badge/PATENT-PENDING-blue?style=for-the-badge)](https://nouchix.com)
[![NouchiX / Sacred Knowledge Inc](https://img.shields.io/badge/BY-NouchiX-gold?style=for-the-badge)](https://nouchix.com)
[![ADINKHEPRA Certified](https://img.shields.io/badge/ADINKHEPRA-POST--QUANTUM_CERTIFIED-cyan?style=for-the-badge)](#certification)
[![FIPS-mode build](https://img.shields.io/badge/FIPS--mode_build-BoringCrypto-blue?style=for-the-badge)](#build)
[![Release](https://img.shields.io/badge/RELEASE-v0.1.0-brightgreen?style=for-the-badge)](#releases)

**By NouchiX (SecRed Knowledge Inc)**  
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
| **FIPS-mode build** | ❌ Standard build | ✅ `GOEXPERIMENT=boringcrypto` (BoringCrypto) — not a CMVP-validated module |
| **Pricing** | `$0 Free / $499 Platform / $2,999 Enterprise` | `$45K – $250K / year` flat annual |
| **Target buyer** | Developer / Security Engineer / Enterprise SOC | Prime contractor, DIB, C3PAO, Sovereign Enclave |

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
- **FIPS-mode build** — Compiled with `GOEXPERIMENT=boringcrypto` (BoringCrypto). This is a FIPS-mode *build*, not a CMVP-validated module: no FIPS 140-3 certificate is held. For federal use, deploy on a CMVP-validated base module (Iron Bank / RHEL / Amazon Linux) and inherit its certificate for FIPS-approved algorithms. PQC (ML-DSA-65 / ML-KEM-768) implements FIPS 204/203 algorithms; CAVP validation in progress, module validation not yet held.

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


---
### 🚀 System Architecture Update: Public Kernel Extraction Complete
**Status:** ✅ Condition 3 (Kernel Standalone) Met

The core Khepra MCP (`PQC-Khepra-MCP`) has been successfully decoupled from all proprietary orchestration and security planes (Adinkra, Sekhem, Giza). Through the introduction of the `kernelports` dependency injection boundary, the `khepra-kernel` now builds and operates in complete isolation. All legacy internal tools continue to compile seamlessly against the original repository. 

*This paves the way for the formal Apache-2.0 open-source release of the standalone PQC-Khepra-MCP kernel!*

---

## 📋 TC-25 Operator Manual & Developer Runbook

ASAF is part of the KHEPRA Trust OS (KTOS) product family and adheres to DIB operator standards:
- **[TC-25 Technical Operator & Maintenance Manual](https://github.com/nouchix/khepra-trust-os/blob/main/docs/TC-25_KTOS_OPERATOR_MANUAL.md)** — Training Circular No. 25-KTOS-001 covering Four-Layer Sovereign Architecture, osquery Fleet Management, Windows Event Viewer hierarchy (IDs 1001–1050), and Dual-Engine Adversarial Neutralization (58/58 Verified).
- **[Developer Installation & Troubleshooting Runbook](https://github.com/nouchix/khepra-trust-os/blob/main/docs/DEVELOPER_INSTALLATION_AND_TROUBLESHOOTING.md)** — Universal installation runbook for Master Dev Machines, Antigravity IDE, Claude Code, and Bare-Metal Linux VPS.

### Unified KTOS Product Surfaces
- **Layer 4 — KTOS-MCP Master-Kernel** (`mcp.souhimbou.ai`): 100 native tools, ML-DSA-65 post-quantum signing, SEKHEM L7 WAF prompt defense, Event Viewer logging, Tactical RF suite.
- **Layer 3a — KTOS CMMC Hub & Fleet Engine** (`adinkhepra.com`): Sovereign bare-metal & osquery Fleet Manager for CMMC/STIG compliance audits.
- **Layer 3b — KTOS Agentic SOC** (`souhimbou.ai`): Cloud Agentic SOC & AI Security Architect with autonomous Flight Recorder SDK and KASA threat detector.
- **Layer 2 — Shared Trust Substrate**: 36,195 cross-framework compliance mappings, ML-DSA-65 / ML-KEM-1024, immutable DAG attestation.
- **Layer 1 — KHEPRA Protocol**: Patent-pending non-linear cryptographic attestation (USPTO #73565085).

### Dual-Engine Pentest Neutralization (58/58 Verified · 100.00% Zero-Bypass Rate)
- **CyberStryke Automated Assault (30/30)**: SQLi, XSS, Path Traversal, Null Byte Escapes, Prompt Injections, Egress Data Disclosure neutralized.
- **AgentHound Offensive Security Framework (28/28)**: MCP Tool Description Poisoning (`POISONED_DESCRIPTION`), Tool Shadowing (`SHADOWS`), A2A Impersonation (`CAN_IMPERSONATE`), Indirect Tool Execution (`CAN_EXECUTE`), Context Window Taint (`TAINTS`), and Information Flow Control Violations (`IFC_VIOLATION`) neutralized.

