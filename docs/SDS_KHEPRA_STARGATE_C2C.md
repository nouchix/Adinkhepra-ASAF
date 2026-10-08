# Software Design Specification

# KHEPRA STARGATE: The Sovereign Comply-to-Connect Harness and Orchestration Platform

| | |
|---|---|
| **Document ID** | SDS-KHEPRA-STARGATE-C2C-v4.2 |
| **Date** | 08 October 2026 |
| **Standard alignment** | IEEE SWEBOK v4; IEEE Std 1016-2009 (Software Design Descriptions); ISO/IEC/IEEE 42010:2011 (Architecture Description) |
| **Classification** | Commercial Confidential. Written for Defense Industrial Base (DIB) compliance contexts |
| **Originating entity** | SecRed Knowledge Inc. (NouchiX) |
| **Patent priority** | U.S. Provisional Application No. 63/942,886 (17 December 2025). See Appendix D, item D-1 |

---

## How to read this document

This document is meant to be read in order, the way one reads a chapter of a textbook. It does not work well as a lookup table. Each chapter starts from a problem, explains the reasoning, and only then states the design. A reader who finishes Part I will know *why* the platform exists. A reader who finishes Part II will know *what* it is made of. Part III covers *how it behaves*, and Part IV covers *how we know it works*.

Three conventions run through the text.

**Status markers.** A specification that describes a finished product and a specification that describes an intended product look identical on the page, and mixing them up is how organisations end up making claims they cannot support. Every capability in this document therefore carries one of three markers.

| Marker | Meaning |
|---|---|
| **[SHIPPED]** | Implemented in this repository (`Adinkhepra-ASAF`) at the time of writing. A reader can find the code. |
| **[SIBLING]** | Implemented, or intended to be implemented, in a companion repository or binary that is not part of this repository. This document specifies the contract but does not vouch for the code. |
| **[PLANNED]** | Designed but not yet built. These are requirements, not features. |

**Normative language.** The words *shall*, *should* and *may* follow RFC 2119. "Shall" marks a requirement that a conforming implementation must meet.

**Worked examples.** Where a concept is abstract, the text follows one device, a laptop named `LT-4471`, from the moment it appears on the network until it is admitted. Keep that laptop in mind. It reappears in every part.

### Contents

- **Part I. Foundations**
  - 1. The problem and the mandate
  - 2. Design philosophy and the inherited-pattern strategy
- **Part II. Architecture**
  - 3. Architectural views and the nine-component suite
  - 4. The trust substrate: cryptography and the attestation ledger
  - 5. Component design, one by one
- **Part III. Behaviour**
  - 6. The Comply-to-Connect state machine
  - 7. The Human-in-the-Loop gate
  - 8. Data design
  - 9. Interface design
- **Part IV. Experience and Assurance**
  - 10. User interface and the web terminal
  - 11. Security architecture and threat model
  - 12. Verification, validation and quality assurance
  - 13. Deployment, operations and failure modes
- **Appendices**
  - A. Glossary
  - B. Requirements traceability
  - C. Implementation status register
  - D. Open issues and corrections to prior drafts
  - E. Document archive and OPORD linkage

---

# PART I. FOUNDATIONS

## 1. The problem and the mandate

### 1.1 Why a network door needs a bouncer that reads the paperwork

For most of the history of enterprise networking, security meant a perimeter. A device inside the building, or connected through a VPN, was trusted. The trust was a side effect of location. If a contractor's laptop sat on the corporate switch, it was a corporate laptop, and the network treated it that way.

That model has two well-known failures. The first is that location says nothing about condition. A laptop missing six months of patches, with a weak password policy and an unauthorised local language model listening on a port, is just as "inside" as a hardened one. The second is that attackers who get past the perimeter once inherit the trust that location confers. Lateral movement, the technique of hopping from one compromised machine to its neighbours, exists precisely because internal networks extend trust too freely.

The Department of Defense's answer is the Zero Trust model, and its enforcement mechanism at the network edge is **Comply-to-Connect (C2C)**. C2C reverses the default. A device is not trusted because of where it is. It is admitted only after it proves, at that moment, that it is configured as policy demands and that it is who it claims to be. If it later drifts out of compliance, admission is withdrawn.

KHEPRA STARGATE is a platform that implements this model for Defense Industrial Base organisations: the contractors and subcontractors who handle Controlled Unclassified Information (CUI) and must demonstrate to assessors that they do so safely. The word *demonstrate* matters. Compliance in this domain is not a state of being. It is a state of being *provable to a third party*, and much of this specification concerns producing that proof.

### 1.2 The governing directives

The platform is shaped by four bodies of guidance. Each is summarised here with the specific obligation it places on the design. These summaries are interpretive. The authoritative texts are published in the [DoD CIO Library](https://dodcio.defense.gov/Library/), and where this document and a directive disagree, the directive governs.

**DoD Zero Trust Strategy and Reference Architecture.** The strategy organises Zero Trust into seven pillars: User, Device, Network and Environment, Application and Workload, Data, Visibility and Analytics, and Automation and Orchestration. It sets a date by which DoD components are to reach a *Target Level* of Zero Trust across a defined set of capabilities, and the planning horizon in the source material for this document is the end of fiscal year 2027 (September 2027). The design consequence is that STARGATE cannot be a point tool. It touches all seven pillars. The Device pillar is served by posture assessment, the Network pillar by quarantine and the overlay mesh, the Application pillar by the sandboxing of agent tools, the Data pillar by signed evidence, the Visibility pillar by telemetry and the ledger, and the Automation pillar by playbook-driven remediation. The User pillar is served by the operator-approval gate described in Chapter 7.

> *Verification note.* Earlier drafts of this specification cited a specific memorandum number and a specific capability count for the Target Level. Those figures could not be confirmed against the library at the time of writing and have been removed from the body text. See Appendix D, item D-2.

**Comply-to-Connect.** C2C is the edge-gating discipline described above. Its core rule, which this specification adopts verbatim as design requirement **R-C2C-1**, is:

> *No endpoint (a laptop, a virtual machine, an operational-technology controller, or an autonomous software agent) shall be granted network access until its physical posture, its configuration baseline against the applicable DISA Security Technical Implementation Guides (STIGs), and its cryptographic identity have been verified.*

C2C also expects bidirectional integration among three systems: the policy controller that decides, the identity provider that vouches for who is asking (for DoD users, CAC-backed identity), and the Zero Trust network-access gateway that enforces the decision. STARGATE plays the policy-controller and evidence-producer roles, and it integrates with, rather than replaces, the other two.

**NSA Commercial Solutions for Classified (CSfC).** CSfC lets agencies protect classified data using layered commercial products instead of bespoke government hardware. Its central idea is *two independent layers of encryption*, so that a flaw in one product does not expose the data. Its security architecture also reasons across three concerns: resistance to tampering with the physical device, resistance to remote cyber attack, and reliability where failure is unsafe. STARGATE adopts the layered-independence principle for data in transit and data at rest, and it treats the CSfC capability packages as a design reference. It does not claim CSfC component listing, which is a separate process (Appendix D, item D-3).

**DoDI 8510.01 and NIST SP 800-37 (the Risk Management Framework).** The RMF governs how a system earns and keeps its authorisation to operate. It has shifted from periodic paperwork toward *continuous monitoring*, in which evidence is gathered constantly and fed to the authorising official. The Enterprise Mission Assurance Support Service (eMASS) is the DoD system of record, and it ingests machine-readable assessment results. STARGATE's job is to make that ingestion automatic: scan results become structured test results without a human retyping them.

### 1.3 Derived system requirements

The directives above reduce to a short list of top-level requirements. Everything later in this document traces back to one of them (Appendix B gives the full matrix).

| ID | Requirement |
|---|---|
| R-C2C-1 | The system shall deny network admission to any endpoint whose posture and identity have not been verified. |
| R-C2C-2 | The system shall re-evaluate admitted endpoints continuously and withdraw admission on drift. |
| R-EVD-1 | Every security-relevant observation and every configuration change shall be recorded as tamper-evident, signed evidence. |
| R-EVD-2 | The system shall emit assessment results in a machine-ingestible form suitable for eMASS and shall produce Plan of Action and Milestones (POA&M) records. |
| R-CHG-1 | No change to an endpoint's configuration shall be applied without a valid signature from an authorised principal. |
| R-HIT-1 | Any outbound action by the management plane against the fleet shall require explicit, time-limited human approval. |
| R-SOV-1 | The platform shall operate without cloud egress, including in fully air-gapped enclaves. |
| R-AGT-1 | Autonomous software agents shall reach infrastructure only through a validated, auditable gate. |

### 1.4 Scope and audience

This specification is written for four readers: the engineers who build the platform, the security assessors who evaluate it, the operators who run it, and the programme managers who decide what to build next. Chapters 3 through 9 are primarily for engineers. Chapters 11 and 12 are primarily for assessors. Chapter 13 is for operators. Chapter 2 and Appendix C are for managers.

---

## 2. Design philosophy and the inherited-pattern strategy

### 2.1 Do not reinvent solved infrastructure

A small company building a defence-grade platform has a choice. It can write every layer from scratch, which is slow and produces unproven code. Or it can identify the problems that large, well-resourced organisations have already solved in the open, learn the *pattern* from their work, and spend its own effort on what is genuinely new. STARGATE takes the second path.

The distinction between *borrowing a pattern* and *embedding a product* is important and easy to blur. In most rows of the table below, STARGATE adopts the **architectural idea** and implements its own component in the same spirit. Where an actual library is linked into a binary, the integration chapter says so. Readers should not infer that Meta, Google, Microsoft, NVIDIA or any other company endorses, supports or is a party to this platform. Those names identify the origin of a design idea, nothing more.

### 2.2 The derivation matrix

| Origin | Project | Pattern studied | STARGATE subsystem |
|---|---|---|---|
| Meta | osquery, RocksDB | SQL as the query language for operating-system state; deterministic embedded storage | `asaf-hub`; the attestation ledger |
| Google | gVisor | A user-space kernel that intercepts system calls, shrinking the host attack surface | Sandboxing of untrusted agent tools (KASA enclave bounds) |
| Microsoft | eBPF for Windows | Safe, verified in-kernel programs for telemetry without bespoke drivers | `asaf-daemon` Windows sensor |
| NVIDIA | OpenShell | A modular split into supervisor, gateway, prover, sandbox and cluster layers | The multi-OS distribution layout |
| Red Hat / IBM | Cockpit | A browser console driven over a WebSocket bus, with no heavy desktop client | Single-pane supervisor UI |
| Gravitational | Teleport | Short-lived certificates and recorded, replayable terminal sessions | The SEKHEM web terminal multiplexer |
| Inverse / Aker | PacketFence | 802.1X-based network access control with quarantine VLANs | The pre-admission posture gate |
| Slack | Nebula | A mutually authenticated overlay network with no public listeners | The phantom-node mesh |

### 2.3 Lessons drawn from each pattern

**SQL over operating-system state (osquery).** The insight of osquery is that an operating system can be presented as a set of database tables: `processes`, `listening_ports`, `users`, and hundreds more. A question that once required a bespoke script per operating system becomes a single query. For a compliance platform this is nearly ideal, because a STIG finding is a statement about state ("password lockout is configured with a threshold of three"), and a statement about state is a query. STARGATE's hub builds on this model so that the same check runs on Linux and on Windows. The hub's role is to *distribute* queries and *interpret* results against policy.

**Embedded, append-only storage.** The evidence ledger needs a store that is simple, crash-safe and local. A server database introduces an availability dependency and an attack surface that air-gapped enclaves cannot afford. The design therefore uses embedded stores. The shipped hub uses bbolt, a memory-mapped B+tree key-value store (Chapter 8). The target ledger uses a content-addressed directed acyclic graph over an embedded engine.

**User-space kernels (gVisor).** Untrusted code, such as a tool exposed to a local language-model agent, should not be able to reach the host kernel's full system-call surface. gVisor interposes a small, memory-safe reimplementation of the kernel interface. STARGATE applies the idea to agent tooling. The deliverable is a *confinement boundary*, not a claim that gVisor is shipped inside any current binary.

**Verified kernel telemetry (eBPF for Windows).** Windows endpoints traditionally required kernel drivers for deep visibility, and kernel drivers are a source of instability and of privilege-escalation bugs. eBPF programs run under a verifier that rejects unsafe code before it executes. STARGATE adopts this as the preferred telemetry approach for the Windows sensor.

**Modular distribution (OpenShell).** A platform that is one monolith is hard to deploy into constrained environments. Splitting it into a supervisor (lifecycle), a gateway (proxying), a prover (attestation), a sandbox (isolation) and a cluster layer (fleet management) lets each environment take only what it needs. Chapter 3 maps the nine binaries onto this five-layer idea.

**Clientless consoles and recorded sessions (Cockpit, Teleport).** Administrators of a fleet traditionally use a hypervisor console in one window and a terminal emulator in another. Cockpit showed that a browser can host the console, and Teleport showed that terminal sessions can be centrally brokered, authenticated with short-lived credentials and recorded for later review. Combining the two removes two desktop applications and puts both capabilities under a single audit trail.

**Network access control (PacketFence).** PacketFence's contribution is operational: it demonstrated how to put an unhealthy device on an isolated VLAN, give it just enough connectivity to fix itself, and release it when it passes. This is the quarantine-and-remediate loop at the heart of Chapter 6.

**Overlay networks without public listeners (Nebula).** A management plane that must be reachable from remote sites usually means opening inbound ports, and open ports are attack surface. A mutually authenticated overlay lets endpoints dial *out* to a rendezvous and form encrypted paths on demand, so nothing listens on the public internet.

### 2.4 Design principles

The patterns above are held together by six principles. When two design options conflict, these principles decide, in this order.

1. **Fail closed.** If the system cannot determine that something is safe, it treats it as unsafe. An unreachable policy controller means denial, not admission. The HITL guard in Chapter 7 is the clearest implemented example: with no operator key configured, approval is impossible and the hub stays sealed.
2. **Evidence before action.** An action that cannot be recorded in the ledger shall not occur.
3. **Reduce, never expand, privilege without a signature.** Revoking access needs no ceremony. Granting it needs cryptographic proof. This asymmetry is deliberate and is visible in the shipped code, where `Revoke` takes no signature and `Approve` takes a signed, nonce-bound message.
4. **Sovereignty by default.** No design element may require a cloud service to function (R-SOV-1).
5. **Claims shall match code.** A capability is described in the present tense only if it exists. Otherwise it carries a **[PLANNED]** or **[SIBLING]** marker. This principle exists because the platform's customers are assessors, and an overstated claim is both a legal exposure and a trust failure.
6. **Smallest trusted computing base.** Privileged code is kept short, and each privileged operation is individually gated.

---

# PART II. ARCHITECTURE

## 3. Architectural views and the nine-component suite

### 3.1 Why more than one view

ISO/IEC/IEEE 42010 asks an architecture description to be organised around *stakeholder concerns* and *viewpoints*. No single diagram serves every reader. An operator wants to know what runs where. An assessor wants to know where trust boundaries lie. A developer wants to know what calls what. This chapter gives three views of the same system.

| View | Stakeholder | Question answered |
|---|---|---|
| Logical (§3.2) | Developer, programme manager | What are the parts and how are they grouped? |
| Deployment (§3.4) | Operator | What runs on which machine and on which port? |
| Trust (§3.5) | Assessor | Where does authority come from and where is it checked? |

### 3.2 The logical view: nine binaries in three tiers

The platform is composed of nine canonical binaries arranged in three tiers around a common cryptographic substrate. The grouping follows the OpenShell idea of separating supervision, gatewaying, proving, sandboxing and fleet management.

```
                      ┌──────────────────────────────────────────────────────┐
                      │            KHEPRA STARGATE C2C HARNESS               │
                      │     Single-pane supervisor and web terminal (:8443)  │
                      └──────────────────────────┬───────────────────────────┘
                                                 │
        ┌────────────────────────────────────────┼───────────────────────────────────────┐
        ▼                                        ▼                                       ▼
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│   MANAGEMENT CORE         │      │  PERIMETER AND ACCESS     │      │  ENDPOINT DEFENCE AND     │
│                           │      │  GATEWAY                  │      │  EXECUTION                │
├───────────────────────────┤      ├───────────────────────────┤      ├───────────────────────────┤
│ 1. asaf-hub               │      │ 4. sekhem-gateway         │      │ 7. asaf-daemon            │
│ 2. apiserver              │      │ 5. phantom-node           │      │ 8. kasa-agent             │
│ 3. Living Trust console   │      │ 6. khepra-mcp             │      │ 9. sonar                  │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
                                                 │
                                                 ▼
                                ┌───────────────────────────────────┐
                                │   POST-QUANTUM PROVER SUBSTRATE   │
                                │   ktos-mint: signing and minting  │
                                │   Content-addressed DAG ledger    │
                                └───────────────────────────────────┘
```

*Figure 3.1. The logical view. Arrows from the harness show supervision, not data flow.*

> **A note on numbering.** The nine-binary count in the original draft listed the Living Trust web console as binary 3 and `ktos-mint` as part of the substrate, while the component specifications in Chapter 5 listed `ktos-mint` as component 9. This revision keeps the tiered figure above for the logical view and uses a single flat numbering in Chapter 5. The two schemes are reconciled in Table 3.1.

### 3.3 Component inventory

**Table 3.1. The nine components, their tier, and their status.**

| # | Component | Tier | Primary role | Status |
|---|---|---|---|---|
| 1 | `asaf-hub` | Management | Fleet coordination, policy bus, HITL gate | **[SHIPPED]** (partial: see §5.1) |
| 2 | `apiserver` | Management | Risk engine; eMASS results and POA&M compiler | **[SIBLING]** |
| 3 | Living Trust console | Management | Browser UI: compliance graph, fleet, docs | **[SHIPPED]** (Next.js app in `src/`) |
| 4 | `sekhem-gateway` | Gateway | L7 filtering proxy and web-terminal broker | **[SIBLING]** |
| 5 | `phantom-node` | Gateway | Overlay mesh with no public listeners | **[PLANNED]** |
| 6 | `khepra-mcp` | Gateway | Model Context Protocol bridge for AI agents | **[SIBLING]** |
| 7 | `asaf-daemon` | Endpoint | Privileged remediation executor | **[SIBLING]** |
| 8 | `kasa-agent` | Endpoint | Behavioural anomaly detection | **[SIBLING]** |
| 9 | `sonar` | Endpoint | Asset discovery | **[SIBLING]** |
| — | `ktos-mint` | Substrate | Signing and ledger minting | **[SIBLING]** |
| — | `asaf-hitl-sign` | Operator tool | Operator keygen and approval signing | **[SHIPPED]** |
| — | Sentinel edge agent | Endpoint | Registers with hub, relays scan results | **[SHIPPED]** (`pkg/asaf/sentinel`) |

The two rows marked "—" are not among the nine canonical binaries but exist in this repository and are essential to the HITL design, so they are included for completeness.

### 3.4 The deployment view

```
 OPERATOR WORKSTATION                 MANAGEMENT ENCLAVE                    MANAGED ENDPOINTS
┌───────────────────┐         ┌─────────────────────────────┐         ┌───────────────────────┐
│ Browser           │ HTTPS   │ asaf-hub        :8443       │  mesh   │ asaf-daemon (root)    │
│  - console        │────────▶│ apiserver       :45444      │◀───────▶│ kasa-agent            │
│  - web terminal   │         │ sekhem-gateway  :9090       │         │ sentinel / osquery    │
│                   │         │ ktos-mint (local)           │         │                       │
│ asaf-hitl-sign    │ signed  │ ledger (embedded store)     │         │ sonar (subnet scan)   │
│ (operator key)    │approval │                             │         │                       │
└───────────────────┘────────▶└─────────────────────────────┘         └───────────────────────┘
```

*Figure 3.2. The deployment view.*

**Port assignments.** The following table is authoritative for this document and resolves a conflict in earlier drafts, in which both the hub and the supervisor UI used `:8443` and both `sekhem-gateway` and `kasa-agent` used `:9090`.

| Port | Owner | Protocol | Notes |
|---|---|---|---|
| `:8443` | `asaf-hub` | HTTP (**shipped**); HTTPS (**planned**, §9.4) | Configurable via `ASAF_HUB_PORT`. The supervisor UI is served from this listener. |
| `:8444` | `asaf-hub` | WebSocket | **[PLANNED]**. Distributed WebSocket bus. |
| `:45444` | `apiserver` | REST and Server-Sent Events | **[SIBLING]** |
| `:9090` | `sekhem-gateway` | HTTPS and WebSocket | **[SIBLING]**. |
| local IPC | `kasa-agent` | gRPC over a local socket | **Moved off `:9090`.** An agent that talks only to its local daemon does not need a TCP port. |

### 3.5 The trust view

Authority in STARGATE flows from a small number of keys, and the trust view makes those keys explicit, because an assessor's first question is always "who can make this system do something, and how do you know?"

| Principal | Holds | Authorises | Checked by |
|---|---|---|---|
| **Operator** (human) | ML-DSA-87 private key, kept offline or on a hardware token | Unsealing the hub for a 15-minute window; approving ChangeRequests | `asaf-hub` (pinned public key); `asaf-daemon` |
| **Hub** | A transport identity and the pinned operator public key | Distributing queries and playbooks, within an approval window | Endpoints |
| **Endpoint** (device) | A device identity key issued at enrolment | Reporting posture | Hub, `sekhem-gateway` |
| **Prover** (`ktos-mint`) | A ledger signing key | Sealing evidence into the DAG | Any verifier of the ledger |

Three trust boundaries separate these principals: the **operator boundary** (human to machine), the **management boundary** (hub to endpoints, crossed only with a signed change), and the **evidence boundary** (any component to the ledger, crossed only through the prover). Chapter 11 analyses each.

---

## 4. The trust substrate: cryptography and the attestation ledger

### 4.1 Why post-quantum, and why now

A signature or key exchange that is secure today may not be secure against a large quantum computer. The relevant risk for a compliance platform is *harvest now, decrypt later*: an adversary records encrypted traffic today and decrypts it when the capability arrives. Evidence signed today may also need to remain verifiable for a decade or more, long enough for the signature scheme to be at risk. NSA's Commercial National Security Algorithm Suite 2.0 (CNSA 2.0) therefore sets a schedule for moving national-security systems to quantum-resistant algorithms, and NIST has standardised the first set: ML-KEM for key establishment (FIPS 203) and ML-DSA for digital signatures (FIPS 204).

### 4.2 The algorithm set, honestly stated

The most important thing a cryptographic specification can do is say exactly what is used. The table below reflects the code and the project's own public statements (`SECURITY.md`, `TRUST_CENTER.md`).

**Table 4.1. Cryptographic algorithm status.**

| Function | Target algorithm | Algorithm in the code today | Status |
|---|---|---|---|
| Digital signatures, operator approval | ML-DSA-87 (FIPS 204) | ML-DSA-87, in `pkg/asaf/hub/hitl.go` and `cmd/asaf-hitl-sign` | **[SHIPPED]** |
| Digital signatures, ledger and attestation | ML-DSA-87 | Public statements describe **ML-DSA-65** for ledger and licence signing | **[SIBLING]**, **inconsistent**. See Appendix D, item D-4 |
| Key encapsulation | ML-KEM-1024 (FIPS 203) | Pre-standard CRYSTALS-Kyber-1024 (NIST Round 3), via Cloudflare CIRCL | Migration **[PLANNED]**. Not FIPS 203 |
| Hashing, content addressing | SHA3-256 (FIPS 202) | SHA-256 and SHA3-256 | **[SIBLING]** |
| Transport | TLS 1.3 | Plain HTTP in the shipped hub | **[PLANNED]** for the hub (§9.4) |

Two points deserve emphasis for any reader quoting this document.

First, **Kyber-1024 is not ML-KEM-1024.** The NIST standard made changes to the Round 3 design, and the two are not interoperable. The platform shall not describe its current key encapsulation as FIPS 203. Earlier drafts of this specification did; that wording has been corrected, consistent with the project's own correction of its public materials.

Second, **implementing a FIPS algorithm is not the same as holding a validation.** Validation of the algorithm implementation (CAVP) and of the cryptographic module (CMVP) are separate NIST programmes, and the project holds neither for its post-quantum code. NIST does not "certify" products, and the platform shall use the phrase *Post-Quantum Signed*, not *Post-Quantum Certified*. FIPS 140-3 status is that the build can run in a FIPS-mode configuration using BoringCrypto, and that inheritance from a validated base module is the intended path for regulated deployments.

### 4.3 Domain separation: why the context string matters

A subtle and real weakness in many systems is that a signature made for one purpose can be replayed for another. If an operator's key signs "approve the hub" and the same key signs "approve this ChangeRequest", an attacker who captures one signature might present it in the wrong place.

FIPS 204 provides a mechanism for this: each signature binds a **context string**. The shipped HITL code derives its context from an *attestation* context labelled `hitl-approve`, and signs a message prefixed with the literal text `asaf-hitl-approve` followed by a timestamp and a nonce, separated by NUL bytes. NUL separators prevent two different `(timestamp, nonce)` pairs from concatenating into the same byte string.

**Design rule R-CRY-1.** Every signing use in the platform shall use a distinct context label, so that a signature valid for one purpose is invalid for every other. Planned labels include at least `hitl-approve`, `change-request`, and `ledger-seal`.

### 4.4 The attestation ledger as a directed acyclic graph

**The idea in plain terms.** Imagine a notebook where every entry contains a fingerprint of the entries it depends on. Change an old entry and its fingerprint changes, so every later entry that referenced it no longer matches. You cannot quietly edit history. That is the principle behind a hash chain, and a DAG generalises it from a single line to a branching structure, so that one entry can depend on several earlier ones.

**Structure.** Each ledger node shall contain:

| Field | Meaning |
|---|---|
| `id` | SHA3-256 of the canonical encoding of the node's other fields (its *content address*) |
| `parents` | The `id`s of the nodes this one causally depends on |
| `kind` | `observation`, `change`, `approval`, `session`, or `admission` |
| `payload` | The structured record itself |
| `time` | Timestamp, noted as a claim by the author and not a proof of time |
| `signer` | Identifier of the signing key |
| `signature` | ML-DSA signature over `id` using the `ledger-seal` context |

**Properties.** Content addressing makes nodes immutable by construction. The parent links make causality explicit: a remediation node names the assessment node that justified it, which names the discovery node that began the story. Because signatures cover the `id`, which covers the parents, tampering with any ancestor is detectable by anyone holding the public key.

**What the ledger does not prove.** A ledger proves that a record existed in this form and was signed by a given key. It does not prove that the *content* was true, only that an authorised signer attested to it. It also does not, by itself, prove *when*: the `time` field is the signer's claim. Where trusted time matters, an external timestamp authority is required (Appendix D, item D-5). This is the honest scope of the phrase "tamper-evident". It does not mean "mathematically court-admissible". Admissibility is a legal determination made case by case, and the specification shall not assert it.

### 4.5 Worked example: the first three ledger nodes for LT-4471

When the laptop `LT-4471` first appears:

1. `sonar` observes a new MAC address. `ktos-mint` writes node **N1** (`kind=observation`, no parents).
2. The laptop is enrolled and assessed. The hub writes **N2** (`kind=observation`, parents `[N1]`), recording that 14 CAT II checks failed.
3. An operator approves a fix. **N3** (`kind=approval`, parents `[N2]`) is signed by the operator's key.

Later, when an assessor asks "why was this change made to LT-4471?", the ledger answers by walking from the change node back through N3 and N2 to N1. The answer is a verifiable chain, not a log line.

---

## 5. Component design, one by one

This chapter follows the pattern of IEEE 1016: for each component, its purpose, its interfaces, its internal design, its dependencies and its failure behaviour. Components marked **[SIBLING]** are specified as contracts. A contract is the behaviour other components may rely on.

### 5.1 `asaf-hub`: fleet management and the policy bus

**Purpose.** The hub is the coordinator. It knows which endpoints exist, asks them questions, compares the answers to policy, and decides what should happen next. It is the only component with authority to *initiate* fleet-wide action, and it is therefore the component most carefully gated.

**Design.** The hub is a single Go process. Its HTTP surface is registered by `registerRoutes` in `pkg/asaf/hub/server.go`. State lives in an embedded bbolt database (`hub.db`, mode `0600`, one-second lock timeout) managed by `fleet.Manager`. Two guarantees shape the design.

*Guarantee 1: read endpoints are open; action endpoints are sealed.* Routes that merely *report* state (enclave listings, SPRS score, last scan, scan status) are available at all times. Routes that *cause outbound action* (starting a scan, opening the scan stream) are wrapped in `RequireApprovalMiddleware` and return `403` with the code `TRL10_VIOLATION` unless a valid operator approval is in effect.

*Guarantee 2: only a signed approval unseals the hub.* See Chapter 7.

**Interfaces (as shipped).**

| Route | Method | Gated | Purpose |
|---|---|---|---|
| `/api/v1/fleet/enclaves[/{id}]` | GET | No | List or fetch enclaves |
| `/api/v1/fleet/sprs` | GET | No | Fleet SPRS summary |
| `/api/v1/fleet/scan/status`, `/scan/last` | GET | No | Scan state and last summary |
| `/api/v1/fleet/scan` | POST | **Yes** | Begin a fleet scan |
| `/api/v1/fleet/scan/stream` | GET | **Yes** | Server-sent scan results |
| `/api/v1/hub/approve` | POST | Signature | Unseal the hub |
| `/api/v1/hub/revoke` | POST | No | Reseal the hub |
| `/api/v1/hub/register` | POST | No | Sentinel registration |
| `/api/v1/hub/stream` | POST | No | Sentinel result upload |

**Data model.** Three types in `pkg/asaf/fleet/types.go`: `Asset` (a machine: id, type, hostname, compliance state, last-seen), `Enclave` (an isolated zone containing assets, with a status and integer risk score), and `FleetScanSummary` (counts by severity, a fleet SPRS value, and per-finding results).

**Known gaps in the shipped hub.** An honest design document names them. They are the work items that separate the shipped hub from the specification.

| Gap | Effect | Planned remedy |
|---|---|---|
| Listener uses `http.ListenAndServe`, not TLS | Traffic, including the approval POST, is unencrypted on the wire. The approval is signed, so it cannot be forged, but it can be observed. | §9.4: mutual TLS |
| `/hub/register` and `/hub/stream` carry no authentication | Any network peer can register an "enclave" or inject a scan result | §5.1.1: enrolment tokens and signed result envelopes |
| Scan-result upload only logs the result | The result is not yet aggregated into `FleetScanSummary` or the ledger | §5.1.1 |
| STIG rule evaluation is not in this repository | The hub cannot yet compare osquery telemetry against the full rule set | Sibling engine; contract in §5.1.2 |
| Seed enclaves are created when the store is empty | Demonstration data appears on a fresh install | Remove for production builds |

**5.1.1 Enrolment (required design).** A new endpoint shall present a single-use enrolment token minted by an operator. The hub exchanges it for a device identity credential bound to the device's key. All subsequent calls from that device authenticate with that credential, and result uploads are signed by the device so the hub can reject forgeries.

**5.1.2 Policy evaluation contract.** The hub shall evaluate returned telemetry against a rule set expressed in the ASAF Policy Declaration Language (APDL, §5.7). The source material for earlier drafts stated that this rule set contains 19,943 STIG rules, while the project README reports 28,639 STIG-to-CCI mapping rows. These counts measure different things (rules versus mapping rows) and neither is verified here; the specification therefore does not fix a number. The authoritative count is whatever the embedded dataset reports at build time, and the build shall publish it.

**Failure behaviour.** If the database cannot be opened, the hub exits at startup (fail closed). If no operator key is configured, the hub starts and logs that approvals are disabled, and the sealed endpoints remain unreachable.

### 5.2 `apiserver`: the risk engine and the eMASS compiler **[SIBLING]**

**Purpose.** To turn raw findings into two things an authorising official can act on: a *quantified risk* and a *submission-ready artefact*.

**Behaviour.** The apiserver ingests assessment results and CVE data and computes, per finding, an exposure expressed in dollars rather than only in severity categories. The reasoning is that a CAT II finding on a build server that signs production software is not equivalent to the same finding on a kiosk, and a number a chief financial officer can read changes how remediation is prioritised. It then serialises results into the structured test-results format eMASS ingests and produces the POA&M with the columns that format requires.

**Contract.** Given a set of signed assessment nodes, the apiserver shall produce a results file that validates against the applicable eMASS schema, and shall record the hash of that file in the ledger so the exported artefact can later be proven to match what was assessed. Schema conformance is checked in the quality gates of Chapter 12.

**Interface.** REST and server-sent events on `:45444`.

### 5.3 The Living Trust console **[SHIPPED]**

The browser front end is a Next.js application in `src/` (see `src/app/compliance-graph`, `fleet`, `evidence`, `docs`, `whitepaper`). Its central view is a force-directed graph of compliance controls rendered with D3: nodes are controls, edges are dependencies, and a node's size and colour convey status and exposure. Selecting a control reveals its *blast radius*, the set of other controls and assets that would be affected if it failed. Chapter 10 treats the interface in depth.

> **Developer note.** The repository's `AGENTS.md` warns that this version of Next.js has breaking changes relative to widely published guidance. Engineers shall read the bundled guide under `node_modules/next/dist/docs/` before changing the console.

### 5.4 `sekhem-gateway`: the L7 filter and web-terminal broker **[SIBLING]**

**Purpose.** Two jobs share one process because they share one trust decision, namely whether this request, from this principal, to this target, is allowed.

**Job 1: application-layer filtering.** The gateway is a reverse proxy that inspects requests at layer 7. Its rules reject malformed input, shell-metacharacter injection, path traversal, oversized fields and known attack signatures. The Playwright suite in `e2e/sekhem-membrane.spec.ts` already exercises this behaviour against the console's own API, using rule identifiers such as `ASAF-004` (port bounds) and `ASAF-001`/`ASAF-002` (injection).

**Job 2: terminal brokering.** The gateway terminates browser WebSockets carrying terminal sessions and connects them to managed hosts, as detailed in Chapter 10.

**Key encapsulation.** The gateway protects its tunnels with Kyber-1024 today and ML-KEM-1024 after migration (Table 4.1). The gateway shall not advertise its algorithm in a response header. The project removed such a header, `X-Khepra-Algorithm`, from its middleware for exactly this reason: it was an unverifiable claim sent on every response.

### 5.5 `phantom-node`: the blackhole mesh **[PLANNED]**

**Problem.** The hub must reach endpoints that sit behind NAT, behind firewalls, or across an air-gapped cross-domain boundary, without any of them exposing a listening port to the internet.

**Design.** An overlay network in the style of Nebula. Every node holds a certificate issued by a mesh certificate authority that is separate from the operator key. Nodes do not listen publicly. They dial out to one or more *rendezvous* nodes, learn each other's reachable addresses, and then establish direct encrypted paths. Traffic between nodes is mutually authenticated at the packet level.

**Requirement R-MSH-1.** An unauthenticated packet from the public internet shall elicit no response of any kind. The node is a "blackhole": there is nothing to scan, fingerprint or probe.

**Open design question.** The source material described the mesh as a "Nebula/WireGuard hybrid". The rationale for combining them is not stated, and the specification does not adopt it until a rationale is documented (Appendix D, item D-6).

### 5.6 `khepra-mcp`: the agent bridge **[SIBLING]**

**Context.** The Model Context Protocol (MCP) lets AI agents call tools. That is powerful and dangerous. A tool can read files, run commands or call APIs, and an agent may be steered by a hostile instruction hidden in a document or a tool description (prompt injection). The bridge puts a validating gate between the agent and any infrastructure.

**WriteGate.** Every tool call that could change state passes through a gate that checks three things: that the calling agent's identity is established, that the tool is on an allow-list for that identity, and that the arguments satisfy a schema and a policy. Calls that fail are refused and recorded. A call that would modify infrastructure additionally requires the human approval of Chapter 7.

**Threats addressed.** Tool-description poisoning (a tool's description contains hidden instructions), tool shadowing (a malicious tool imitates a legitimate one), agent impersonation, and context tainting (hostile content persisting in an agent's memory across steps).

**Interface.** Standard input/output for local agents and JSON-RPC over HTTP for remote ones.

### 5.7 `asaf-daemon` and the APDL language **[SIBLING]**

**Purpose.** The daemon is the execution muscle on each endpoint. It is the only component that changes the operating system, and so it is the most privileged and the most constrained.

**Privilege boundary.** On Linux the daemon runs as a `systemd` service holding only the capabilities it needs (`CAP_SYS_ADMIN`, `CAP_NET_ADMIN`, `CAP_AUDIT_WRITE`) and no more. On Windows it runs as a service under the SYSTEM account. Both are very powerful. Because of this, the design does not trust the daemon's caller: the daemon verifies authority itself, by checking an operator signature on every ChangeRequest, rather than trusting the hub (R-CHG-1).

**What it changes.** Kernel parameters (`sysctl`), PAM account lockout (`faillock`), mandatory access control (SELinux), audit rules (`auditd`), and boot parameters (GRUB).

**ChangeRequest.** A ChangeRequest is a signed object containing the target host, the exact change, a reference to the justifying ledger node, an expiry time, and a symbol attestation. The symbol, `Eban` in the examples, is part of the project's Adinkra-based policy grammar and acts as a typed tag on the policy; it is not itself a cryptographic primitive. The daemon shall refuse a ChangeRequest if the signature is invalid, the context label is wrong, the request has expired, the target host does not match, or the nonce has been seen.

**APDL.** The ASAF Policy Declaration Language states remediation policy in a human-readable, machine-checkable form. An example:

```asaf
@symbol(Eban) @framework(CMMC.L2) @tier(Sovereign) @gate(human)
control AC-2 {
  require: pam_faillock
  deny = 3
  unlock_time = 900
  maps: CMMC.AC.L2-3.1.2, NIST.AC-2, CCI-000048
}
```

Read it line by line. The annotations say this control carries the `Eban` symbol, belongs to CMMC Level 2, applies at the Sovereign tier, and requires a human gate. The body says the account-lockout module must be present, that three failed attempts lock the account, and that it unlocks after 900 seconds. The `maps` line connects the control to the CMMC practice, the NIST 800-53 control and the Control Correlation Identifier it satisfies, which is how one configuration change yields evidence for several frameworks at once.

**Staging.** Before production, the daemon shall produce a diff of the intended change against the current state, so that the approver reviews exactly what will happen.

### 5.8 `kasa-agent`: behavioural anomaly detection **[SIBLING]**

**Purpose.** STIG checks are static: they ask whether a setting has the right value. They cannot see that someone installed a local language model that is quietly processing CUI. `kasa-agent` watches behaviour.

**Signals.** Processes and listening ports that match unsanctioned local model runtimes, unusual child processes spawned from agent tooling, outbound connections to model-hosting services, and tool-invocation patterns that deviate from a learned baseline. Findings are scored and passed to the hub, which can quarantine the endpoint.

**Interface.** Local IPC (§3.4), not a TCP port.

### 5.9 `sonar`: asset discovery **[SIBLING]**

**Why it exists.** The most common way to fail an assessment is not to have a bad configuration on a known machine, but to have an unknown machine. An assessor who finds a device that is not in your inventory concludes that your scope boundary is wrong, which invalidates everything inside it. This failure is called a **scope gap**.

**Method.** `sonar` combines passive observation (watching ARP and DHCP traffic, which is quiet and safe) with active probing (ARP sweeps, ICMP, and TCP SYN scans) on authorised subnets. It fingerprints the operating system and reports the device to the hub as **DISCOVERED** (Chapter 6).

**Safety.** Active scanning of OT networks can disrupt fragile controllers. `sonar` shall be configurable to passive-only per subnet, and active scanning shall be rate-limited and shall honour an operator-maintained exclusion list.

### 5.10 `ktos-mint`: the prover **[SIBLING]**

**Purpose.** To be the single path by which evidence reaches the ledger. Every observation, change and audit record passes through the prover, which assigns the content address, signs the node, and appends it.

**Why a single path.** If any component could write to the ledger directly, a compromise of that component could forge history. A single narrow prover reduces the attack surface to one small program whose key can be protected in hardware.

**Signing.** FIPS 204 ML-DSA with the context labels of §4.3 (Table 4.1 records the open question of ML-DSA-65 versus ML-DSA-87).

---

# PART III. BEHAVIOUR

## 6. The Comply-to-Connect state machine

### 6.1 From a flowchart to a formal machine

The original draft of this specification presented the C2C process as a flowchart with six boxes and then defined six states with different names. A flowchart tells a story, but a **state machine** is a contract: it names every state, every legal transition, and every event that triggers one. Implementers can test against it, and assessors can ask "can a device ever reach ADMITTED without passing through ASSESSED?" and get a yes-or-no answer by inspection.

### 6.2 States

| State | Name | Meaning | Network access |
|---|---|---|---|
| S0 | `DISCOVERED` | Seen on the wire; nothing is known beyond a MAC and IP. | None |
| S1 | `PROFILED` | OS, open ports and device identity established. | Isolation VLAN only |
| S2 | `ASSESSED` | Posture tested; findings classified CAT I, II, III. | Isolation VLAN only |
| S3 | `QUARANTINED` | At least one disqualifying finding. Redirected to remediation resources. | Remediation server only |
| S4 | `REMEDIATED` | A signed change has been applied; awaiting re-assessment. | Remediation server only |
| S5 | `ADMITTED` | Compliant and identified. A short-lived access token is issued. | Mission network, per policy |
| S6 | `REVOKED` | Previously admitted; drift or an alert withdrew admission. | None, then as S3 |

### 6.3 Transitions

```
                  ┌──────────────────────── drift / alert ──────────────────────┐
                  │                                                              │
                  ▼                                                              │
 S0 ──profile──▶ S1 ──enrol+assess──▶ S2 ──clean──▶ S5 ADMITTED ────────────────┘
 DISCOVERED     PROFILED              ASSESSED          │
                                         │              │ (to S6 REVOKED, then S3)
                                         │ disqualifying finding
                                         ▼
                                      S3 QUARANTINED ──signed change applied──▶ S4 REMEDIATED
                                         ▲                                         │
                                         └─────────── re-assess fails ◀───────────┤
                                                                                   │ re-assess
                                                                                   ▼
                                                                                  S2
```

**Table 6.1. Transition table (normative).**

| From | Event | Guard | To | Ledger node |
|---|---|---|---|---|
| S0 | `profile_complete` | OS and identity established | S1 | `observation` |
| S1 | `assessment_complete` | Agent enrolled; posture returned | S2 | `observation` |
| S2 | `evaluate` | No CAT I; no disqualifying CAT II per policy | S5 | `admission` |
| S2 | `evaluate` | Any disqualifying finding | S3 | `observation` |
| S3 | `change_applied` | Valid signed ChangeRequest executed | S4 | `change` |
| S4 | `reassess` | (always) | S2 | `observation` |
| S5 | `drift_detected` | Posture or behaviour no longer meets policy | S6 | `observation` |
| S5 | `token_expired` | Token lifetime elapsed | S2 | `observation` |
| S6 | `(automatic)` | (always) | S3 | `observation` |
| any | `operator_revoke` | Operator command | S6 | `approval` |

**Invariants.**

- **I-1.** S5 is reachable only from S2.
- **I-2.** Every transition writes a ledger node; a transition that cannot be recorded does not occur (fail closed).
- **I-3.** No transition into S4 occurs without a valid signed ChangeRequest.
- **I-4.** A device in S0 through S4 or S6 is never granted mission-network access.

### 6.4 Severity and the admission decision

DISA classifies findings by category. **CAT I** findings are those that directly allow an attacker to gain root access or bypass protections, **CAT II** findings could lead to unauthorised access, and **CAT III** findings degrade defences or provide information to an attacker. The source material states that any CAT I finding triggers quarantine, and that a "100% pass" is required for admission.

A literal 100% pass requirement is brittle. Real systems carry justified exceptions, and no large fleet is perfectly clean at every instant. This specification therefore separates two ideas that the earlier text conflated:

- **Disqualifying findings** are determined by *policy*. The default policy disqualifies any open CAT I finding and any CAT II finding on a configurable high-risk list.
- **Documented exceptions** are individually approved, time-limited deviations recorded in the ledger and, where appropriate, tracked in a POA&M. An exception removes a finding from the disqualifying set.

The strict "no findings" posture remains available as a policy setting for the most sensitive enclaves.

### 6.5 Worked example: the life of LT-4471

| Step | What happens | State | Ledger |
|---|---|---|---|
| 1 | `sonar` sees an unknown MAC on VLAN 40 | S0 | N1 |
| 2 | Switch places the port in the isolation VLAN; OS fingerprint says Windows 11 | S1 | N2 |
| 3 | The sentinel agent is installed; osquery returns posture. One CAT I (lockout not configured) and eight CAT II | S2 | N3 |
| 4 | Policy disqualifies the device | S3 | N4 |
| 5 | An operator reviews the staged diff and approves; the daemon applies the lockout policy | S4 | N5, N6 |
| 6 | Re-assessment passes; eight CAT II remain but are all on the exception list | S2→S5 | N7 |
| 7 | The gateway issues a 4-hour token; the switch moves the port to the mission VLAN | S5 | N8 |
| 8 | Two weeks later an unsanctioned local model runtime appears | S5→S6→S3 | N9 |

The laptop was never on the mission network until step 7, and the ledger lets an assessor reconstruct every step.

### 6.6 Timing and the problem of the stuck device

Two operational risks deserve explicit design. **Assessment time** matters: if the first assessment takes ten minutes, users wait ten minutes for network access, and they will complain loudly. The design therefore allows a *fast pre-check* of CAT I items first, with the full assessment completing in the background. **A device that cannot be remediated automatically** (an appliance with no agent, a legacy OT controller) must not be quarantined into uselessness. Such devices are placed in a named *compensating-control profile*: they stay in a restricted segment, are monitored passively by `sonar`, and carry a standing POA&M entry.

---

## 7. The Human-in-the-Loop gate

This chapter documents the most thoroughly implemented security mechanism in the repository, because it is a worked example of the principles in §2.4.

### 7.1 The threat it addresses

Suppose an attacker compromises the hub, or tricks an operator's browser into issuing a request. If a single HTTP call could start a fleet-wide scan or push a change, the attacker would gain broad reach in one step. The HITL gate ensures that outbound fleet action requires evidence of a human decision that cannot be forged or replayed.

### 7.2 The mechanism

The operator generates an ML-DSA-87 key pair offline with `asaf-hitl-sign -keygen -key operator_mldsa87`. The public half is placed on the hub host and named in the `ASAF_HITL_OPERATOR_KEY` environment variable. The private half never leaves the operator's control.

To authorise a session, the operator runs `asaf-hitl-sign -key operator_mldsa87`, which produces an `ApprovalRequest`:

```json
{ "timestamp": 1790000000, "nonce": "<hex, ≥16 bytes>", "signature": "<hex ML-DSA-87>" }
```

and posts it to `/api/v1/hub/approve`. The hub accepts it only if **all** of the following hold:

| Check | Why it exists |
|---|---|
| An operator key is configured | Without one, approval is impossible; a misconfigured hub fails closed |
| `timestamp` within ±5 minutes of the hub clock | Defeats replay of an old captured approval |
| `nonce` decodes and is ≥16 bytes | Ensures enough entropy that nonces do not collide |
| `nonce` not previously used | Defeats replay within the time window |
| Signature verifies under the pinned key, with the `hitl-approve` context, over `"asaf-hitl-approve" ‖ 0x00 ‖ timestamp ‖ 0x00 ‖ nonce` | Proves the operator made this exact decision |

On success the hub is **unsealed for 15 minutes** (`ApprovalWindow`). After that, or on a call to `/api/v1/hub/revoke`, it reseals. The request body is capped at 64 KiB.

### 7.3 Design properties

**Asymmetry.** Revocation requires no signature, because it can only reduce access. Approval requires one. An attacker who can call `/revoke` can deny service but cannot gain capability.

**Replay resistance in depth.** The timestamp bounds the window an approval is valid. The nonce set bounds reuse within that window. The nonce record is retained for twice the skew bound so that an approval cannot be replayed after it has been forgotten but while its timestamp is still acceptable.

**Domain separation.** Because of the context label, a signature intended for the hub cannot be accepted by any other verifier, and vice versa (§4.3).

**Fail-closed.** A nil operator key means approvals are always refused (`HITLGuard.Approve`).

### 7.4 Limits and residual risk

An approval unseals the hub *for all callers* during the window, not only for the person who signed it. An attacker with network access to the hub during those 15 minutes can invoke gated endpoints. Two mitigations apply: keep the window short, and require authenticated callers on gated routes (§9.4). A future refinement binds each approval to a specific action and a session identifier, so that approving "scan enclave alpha" does not also approve everything else. That refinement is **[PLANNED]**.

The guard keeps its state in memory. A hub restart reseals it, which is the safe direction.

### 7.5 Extending HITL to the endpoint

The same pattern applies one level down. A `ChangeRequest` (§5.7) is signed by the operator and verified by the daemon, so even a fully compromised hub cannot cause a configuration change. HITL at the hub bounds *what the management plane may attempt*, and signed ChangeRequests bound *what endpoints will accept*. Two independent checks, as CSfC's layered principle recommends.

---

## 8. Data design

### 8.1 Stores and their purposes

| Store | Technology | Holds | Status |
|---|---|---|---|
| Fleet state | bbolt file `hub.db` | Enclaves and scan summaries | **[SHIPPED]** |
| Sentinel queue | bbolt file per agent | `pending_scans` awaiting upload | **[SHIPPED]** |
| Evidence ledger | Content-addressed DAG on an embedded engine | Signed nodes (§4.4) | **[SIBLING]** |
| Session recordings | Append-only files, hashed into the ledger | Terminal sessions (§10.3) | **[PLANNED]** |

**bbolt behaviour worth knowing.** bbolt is a single-writer store. It takes an exclusive file lock, so a second process opening `hub.db` waits up to the configured timeout (one second) and then fails. That is the right behaviour for a hub, which should be a singleton, and it means high availability is achieved through replication at a higher layer rather than shared storage.

### 8.2 Buckets (shipped)

`enclaves` holds one JSON-encoded `Enclave` per key. `scans` holds `FleetScanSummary` records. The sentinel's `pending_scans` bucket makes uploads durable across network failure: results are written locally first and deleted only after the hub acknowledges them. This is the **store-and-forward** pattern, and it is how an endpoint on an intermittent link avoids losing evidence.

### 8.3 Retention and integrity

Retention periods shall be configurable per enclave and shall default to the period the applicable framework requires. Because ledger nodes are immutable, "deletion" at the end of retention means removing the *payload* while keeping the node's hash and signature (a tombstone), so that the chain of parents remains verifiable.

---

## 9. Interface design

### 9.1 Principles

Interfaces are versioned (`/api/v1/`), use JSON, and report errors with an HTTP status and a stable machine-readable code. Read operations are idempotent. State-changing operations are authenticated and ledgered.

### 9.2 Error model

The hub already uses a distinctive code for gating failures. `TRL10_VIOLATION` is returned with status `403` when a gated route is called while the hub is sealed. Clients shall treat it as "obtain an approval" and not as a fault.

### 9.3 Event streaming

Scan results stream as server-sent events (`/api/v1/fleet/scan/stream`). SSE was chosen over WebSockets for result streaming because it is unidirectional, works through simple proxies, reconnects automatically, and needs no custom framing. WebSockets are reserved for the bidirectional terminal traffic of Chapter 10.

### 9.4 Transport security (required design)

The hub shall serve TLS 1.3 only and shall require mutual TLS from endpoints and from the gateway, with certificates issued by an enclave-local certificate authority. Gated routes shall additionally require an authenticated operator session so that an unsealed hub is not open to every peer on the network (§7.4). Until this is built, the hub shall only be deployed on a network segment reachable by authorised operators and endpoints.

### 9.5 Rate and size limits

Request bodies are bounded (the approval endpoint limits bodies to 64 KiB). The remaining endpoints shall adopt explicit limits; the unauthenticated registration and result-upload routes in particular shall be capped, since they currently accept unbounded input.

---

# PART IV. EXPERIENCE AND ASSURANCE

## 10. User interface and the web terminal

### 10.1 What the operator needs

A defender at the console has three needs that compete for the same screen: a **map** (what do I have and what state is it in?), a **lever** (let me act on it, safely), and a **record** (prove what I did). The interface is organised around those three.

### 10.2 The supervisor console: a map

The console draws on two familiar patterns: the hypervisor tree view and the compliance graph.

**The tree.** A left-hand navigation shows data centres, clusters and individual hosts or enclaves, each with a status badge. Selecting a host shows its telemetry (CPU, memory, disk and network throughput, running services) and offers start, stop, restart and roll-back controls for the platform's own services.

**The compliance graph.** The D3 force-directed graph (§5.3) is the console's signature view. The designer's goal is that an assessor can see in seconds *which control, if it fails, takes the most other things with it*. Interaction rules: hover reveals identifiers; selection opens the blast-radius panel; the dollar-exposure figure for a selected control is shown beside the severity, never in place of it.

**Embedding.** The target distribution embeds the built front end into the Go binary with `//go:embed`, so the console is served from the hub's own listener with no separate web server and no runtime dependence on Node.js or on any cloud asset. The development console today runs separately under Next.js.

### 10.3 The web terminal: a lever and a record **[SIBLING / PLANNED]**

**The requirement.** Administrators need shell access to many hosts. Replacing a desktop terminal emulator with a browser terminal is attractive because it needs no client installation, and because the browser terminal can be forced through a gateway that records everything.

**Technology.** `xterm.js` renders the terminal in the browser. A WebSocket carries keystrokes and output between the browser and `sekhem-gateway`, which authenticates the user, authorises the target, opens the session on the host, and records it.

**Capabilities.**

- **Tabbed sessions.** Multiple parallel sessions, each isolated. The source material targets twenty concurrent endpoints, which this document adopts as a performance goal and not a verified figure.
- **Broadcast input.** One command typed once and sent to all selected hosts.
- **Session recording.** Input, output and exit codes are captured as a timestamped stream, hashed, and sealed into the ledger by the prover.

**Broadcast is a dangerous feature, and the design must say so.** Sending `rm` to twenty hosts at once is twenty times as destructive as sending it to one. The gateway shall therefore (a) require an explicit confirmation naming the count of target hosts before the first broadcast of a session, (b) apply the destructive-command filter of §5.4 to broadcast input as well as to single-session input, and (c) require the HITL approval of Chapter 7 for any broadcast.

**What recording does and does not give you.** A hashed, signed recording is strong evidence that a session transpired as recorded, and that the recording has not been altered since sealing. It does not prove *who was at the keyboard*, only which authenticated identity was used, and it does not by itself make the recording admissible in any proceeding. Earlier drafts called the log "mathematically court-admissible". That phrasing is withdrawn.

**Privacy of secrets.** Terminal sessions routinely display secrets: a typed password, a private key, a token. Recordings shall support redaction rules applied *before* sealing, and the redaction event is itself recorded, so a reader can tell that something was removed, though not what.

---

## 11. Security architecture and threat model

### 11.1 Method

The threat model uses STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) applied to each trust boundary from §3.5. For each, the table gives representative threats and the design response.

### 11.2 Operator boundary

| Threat | Response |
|---|---|
| Stolen operator key | Hardware-backed key storage; short approval windows; ledgered approvals; key rotation procedure (§13.4) |
| Forged approval | Signature verification under pinned key with domain-separated context (§7) |
| Approval replay | Timestamp window plus single-use nonce (§7.2) |
| Coerced or careless approval | Approver sees a staged diff of exactly what will change (§5.7) |

### 11.3 Management boundary (hub to endpoint)

| Threat | Response |
|---|---|
| Hub compromise issuing malicious changes | The daemon verifies operator signatures itself; the hub cannot forge them (§7.5) |
| Spoofed endpoint registering | Enrolment tokens and device credentials (§5.1.1). **Not yet implemented** |
| Forged scan results | Device-signed result envelopes. **Not yet implemented** |
| Eavesdropping | Mutual TLS (§9.4); overlay mesh (§5.5). **Not yet implemented** |

### 11.4 Evidence boundary

| Threat | Response |
|---|---|
| Retroactive tampering | Content addressing and parent-linked signatures (§4.4) |
| Forged evidence from a compromised component | All writes via the prover only (§5.10) |
| Prover key compromise | Hardware key protection; key-epoch rotation, with each epoch cross-signed by the previous one |
| Backdated records | External timestamp anchoring (Appendix D, item D-5) |
| Quantum adversary against signatures | ML-DSA (post-quantum) |

### 11.5 Agent boundary

| Threat | Response |
|---|---|
| Prompt injection steering an agent | WriteGate allow-lists and schema validation; human approval for state change (§5.6) |
| Tool-description poisoning or shadowing | Pinning and hashing tool manifests; refusing manifests that change without re-approval |
| Agent escaping its sandbox | User-space kernel confinement (§2.3); least-privilege capabilities |
| Shadow AI on endpoints | `kasa-agent` behavioural detection (§5.8) |

### 11.6 Supply chain

A security product is itself a high-value target. Release artefacts shall ship with a checksum manifest signed by the project's signing key (the repository carries `bin/CHECKSUMS.txt`), builds should be reproducible, and a software bill of materials shall accompany every release. The repository also carries a key-material guard so that private keys are not committed; contributors must not disable it.

### 11.7 Residual risk register

The following risks are accepted for now and are tracked openly:

1. The hub accepts unauthenticated registration and upload (§5.1). *High.* Remedy scheduled.
2. Approval unseals the hub for all callers for the window (§7.4). *Medium.*
3. Ledger time is signer-asserted (§4.4). *Medium* for evidentiary use.
4. Key encapsulation is pre-standard (§4.2). *Medium* until the ML-KEM migration.
5. No CMVP-validated module is held (§4.2). *Constrains sale into regulated tiers.*

---

## 12. Verification, validation and quality assurance

### 12.1 Verification versus validation

Two questions are easily confused. **Verification** asks "did we build it right?", that is, does the implementation meet the specification. **Validation** asks "did we build the right thing?", that is, does it serve the user's real need. A platform can pass every unit test and still fail validation if it solves the wrong problem. The three quality gates below are arranged so that each looks at the system from a different distance.

### 12.2 The gates

| Gate | What it examines | Acceptance criterion |
|---|---|---|
| **Tier 1: functional end-to-end** | User workflows in a real browser | All defined workflows pass |
| **Tier 2: adversarial testing** | Resistance to attack | No unresolved high or critical bypass in the defined test battery |
| **Tier 3: founder acceptance** | Fitness for purpose on a clean machine | Manual sign-off against a written checklist |

A caution about wording. Earlier drafts expressed these criteria as "100% pass" and "zero bypasses". A pass rate describes a *test suite*, not the *system*: a suite of 92 tests that all pass shows that the system defeats those 92 attacks and says nothing about the 93rd. The criteria above are therefore stated against a *defined battery*, and public statements about results shall name the battery and its size.

### 12.3 Tier 1: Playwright end-to-end tests **[SHIPPED]**

The repository's `e2e/` directory contains five suites: `compliance-graph.spec.ts`, `fleet-5mode-enrollment.spec.ts`, `hub-mode.spec.ts`, `pricing-products.spec.ts` and `sekhem-membrane.spec.ts`. They drive a real browser and the console's API. The membrane suite is organised in numbered "batteries"; Battery 1 covers input validation and boundary fuzzing (negative and oversized port numbers return `400` with rule `ASAF-004`), and Battery 2 covers command-injection and metacharacter blocking (rules `ASAF-001` and `ASAF-002`).

The workflows the full gate shall cover:

1. Opening the compliance graph, selecting a control, and checking that the blast-radius figures agree with an independently computed expected value.
2. Approving a staged configuration diff through the HITL flow.
3. Exporting an eMASS results file and validating it against the DISA schema.
4. Fleet enrolment in each supported mode.

**Test design guidance.** A good end-to-end test asserts on *outcomes the user cares about*, not on incidental page structure. Prefer role- and label-based locators to CSS selectors, because they survive restyling. Keep each test independent so that a failure points to one cause.

### 12.4 Unit and property tests **[SHIPPED, partial]**

`pkg/asaf/hub/hitl_test.go` tests the approval guard. A model for further tests: each row of the §7.2 table should have at least one test that fails when that check is removed (a *mutation-style* discipline). Property-based tests suit the ledger: for any generated sequence of nodes, altering any ancestor must cause verification to fail.

### 12.5 Tier 2: adversarial testing

Three tool families are used, each aimed at a different surface:

| Tool | Target | Purpose |
|---|---|---|
| CyberStryke | `apiserver` (`:45444`) and `sekhem-gateway` (`:9090`) | Automated scanning and API boundary fuzzing |
| AgentHound | `khepra-mcp` | Prompt-injection resilience and tool-boundary confinement |
| HexStrike | `sekhem-gateway` | L7 protocol-parsing fuzzing and bypass attempts |

The project reports a combined battery of 92 scenarios (30, 28 and 34 by engine). This specification records that figure as a project-reported result and not as an independently verified one. An assessor evaluating the platform should request the battery definition and the raw run logs.

### 12.6 Tier 3: founder acceptance

The final production binary is run on a clean virtual machine with no development tooling, and a written checklist is walked: install, first run, enrolment of a test endpoint, a full C2C cycle (§6.5), graph responsiveness, and export of an eMASS artefact. The founder signs the checklist. This gate exists because some defects, such as confusing first-run behaviour, appear only to a fresh pair of eyes on a clean machine.

### 12.7 Continuous integration

Every change shall run, at minimum: Go build and vet, Go unit tests, the front-end type check and lint, and the Playwright suite against a built console. The key-material guard runs on every commit. A change that weakens a gate (by deleting or skipping a test) shall not merge without an explicit written justification.

---

## 13. Deployment, operations and failure modes

### 13.1 Packaging

The v4.2.0 release plan targets ten distribution formats: Debian and RPM packages; a Snap; a statically linked musl build for air-gapped enclaves with no shared-library dependencies; a macOS build via Homebrew; a Windows build; Python and Node SDKs; a Helm chart; and a signed checksum manifest. The musl build is the reference for sovereign deployments because it has the fewest runtime assumptions.

### 13.2 A sovereign deployment, step by step

1. Generate the operator key pair on an offline machine: `asaf-hitl-sign -keygen -key operator_mldsa87`.
2. Copy only `operator_mldsa87.pub` to the hub host.
3. Start the hub with `ASAF_HITL_OPERATOR_KEY=/path/operator_mldsa87.pub` (and optionally `ASAF_HUB_PORT`).
4. Confirm the log line reports that HITL enforcement is active and outbound calls are sealed.
5. Enrol endpoints.
6. When a scan is needed, sign an approval, post it, run the scan, and revoke when finished rather than waiting for the window to lapse.

### 13.3 Failure modes and degradation

| Failure | Behaviour | Rationale |
|---|---|---|
| Hub down | Endpoints keep enforcing their last-known posture; new devices cannot be admitted; admitted devices keep access until their token expires | Availability for existing mission traffic; no new trust |
| Ledger unwritable | State transitions halt (invariant I-2) | Evidence before action |
| Operator unavailable | No approvals; hub stays sealed | Fail closed. Break-glass procedure below |
| Clock skew > 5 minutes | Approvals rejected | Replay protection depends on time |
| Mesh partition | Isolated enclaves continue autonomously; results are queued locally and forwarded on reconnect (§8.2) | Store-and-forward |

**Break-glass.** A documented, dual-control procedure shall exist for emergencies in which the operator key is unavailable. It shall require two named people, shall be recorded in the ledger, and shall expire automatically. It is a last resort and its use triggers a review.

### 13.4 Key lifecycle

Keys have a defined life: generation on an offline machine, activation, use, rotation and destruction. Operator keys rotate at least annually and immediately on suspected compromise. Rotation is performed by installing the new public key on the hub (the hub reads the key at startup, so rotation involves a restart) and recording the change. The prover's ledger key rotates by *epochs*, with each epoch's first node signed by the outgoing key so the chain of custody is unbroken.

### 13.5 Observability

Each component logs structured events and exposes a health endpoint. Logs are for operators. The ledger is for assessors. The two shall not be confused: a log line can be edited, and a ledger node cannot.

---

# APPENDICES

## Appendix A. Glossary

| Term | Meaning |
|---|---|
| **APDL** | ASAF Policy Declaration Language, the project's policy grammar (§5.7) |
| **bbolt** | An embedded, single-writer, memory-mapped key-value store for Go |
| **Blast radius** | The set of controls and assets affected if a given control fails |
| **CAT I / II / III** | DISA STIG finding severity categories |
| **CAVP / CMVP** | NIST programmes validating cryptographic algorithm implementations and cryptographic modules respectively |
| **CCI** | Control Correlation Identifier, linking a STIG item to a NIST control |
| **ChangeRequest** | A signed instruction to alter an endpoint's configuration |
| **CNSA 2.0** | NSA's quantum-resistant algorithm suite and transition schedule |
| **C2C** | Comply-to-Connect, DoD edge gating based on verified posture |
| **CSfC** | Commercial Solutions for Classified, NSA's layered-commercial-products programme |
| **CUI** | Controlled Unclassified Information |
| **DAG** | Directed acyclic graph |
| **DIB** | Defense Industrial Base |
| **eMASS** | Enterprise Mission Assurance Support Service, DoD's RMF system of record |
| **HITL** | Human-in-the-Loop |
| **MCP** | Model Context Protocol, for connecting AI agents to tools |
| **ML-DSA / ML-KEM** | NIST post-quantum signature (FIPS 204) and key-encapsulation (FIPS 203) standards |
| **Nonce** | A number used once; here, a random value that makes each approval unique |
| **OT** | Operational technology (industrial and embedded control systems) |
| **POA&M** | Plan of Action and Milestones |
| **RMF** | Risk Management Framework (NIST SP 800-37) |
| **Scope gap** | An undiscovered asset that invalidates the assessed boundary |
| **SPRS** | Supplier Performance Risk System score |
| **STIG** | Security Technical Implementation Guide (DISA) |
| **STRIDE** | A threat-classification model (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) |
| **TRL10_VIOLATION** | The hub's error code for an action attempted while sealed |
| **ZTNA** | Zero Trust Network Access |

## Appendix B. Requirements traceability

| Requirement | Satisfied by | Verified by | Status |
|---|---|---|---|
| R-C2C-1 | §6 state machine; §5.4 gateway; PacketFence-style quarantine | Tier 3 C2C cycle (§12.6) | Mostly **[SIBLING]/[PLANNED]** |
| R-C2C-2 | §6.3 transitions S5→S6; `kasa-agent` | Tier 1/3 | **[SIBLING]** |
| R-EVD-1 | §4.4 ledger; §5.10 prover | Property tests (§12.4) | **[SIBLING]** |
| R-EVD-2 | §5.2 apiserver | Schema validation (§12.3 item 3) | **[SIBLING]** |
| R-CHG-1 | §5.7 ChangeRequest; §7.5 | Unit tests on the daemon | **[SIBLING]** |
| R-HIT-1 | §7 HITL guard | `hitl_test.go`; `hub-mode.spec.ts` (skips unless `ASAF_HITL_APPROVAL_JSON` supplies a signed approval) | **[SHIPPED]** |
| R-SOV-1 | Embedded stores; embedded UI; static builds | Air-gap test in Tier 3 | Partly **[SHIPPED]** |
| R-AGT-1 | §5.6 WriteGate | AgentHound battery | **[SIBLING]** |
| R-CRY-1 | §4.3 context separation | Unit tests per context | **[SHIPPED]** for `hitl-approve` |
| R-MSH-1 | §5.5 mesh | Port-scan test | **[PLANNED]** |

## Appendix C. Implementation status register

The register is the quickest way to see where the specification outruns the code. It should be reviewed at every release.

| Area | Shipped in this repository | Not yet in this repository |
|---|---|---|
| Hub core | Routes, bbolt state, HITL guard, sentinel endpoints | TLS/mTLS, device auth, ledger writes, STIG evaluation, WebSocket bus |
| Operator tooling | `asaf-hitl-sign` keygen and signing | Hardware-token support, action-bound approvals |
| Console | Next.js app: graph, fleet, evidence, docs | `go:embed` bundling into the Go binary |
| Edge | Sentinel agent with durable queue | Signed result envelopes, enrolment |
| Tests | Five Playwright suites; HITL unit tests | eMASS schema conformance test; ledger property tests |
| Everything else | — | `apiserver`, `sekhem-gateway`, `phantom-node`, `khepra-mcp`, `asaf-daemon`, `kasa-agent`, `sonar`, `ktos-mint` |

## Appendix D. Open issues and corrections to prior drafts

This appendix records every place where this revision departs from the earlier outline, and every question that remains open. It exists so that a reviewer can audit the changes instead of discovering them.

| ID | Item | Resolution |
|---|---|---|
| **D-1** | **Patent reference.** The earlier outline cites provisional application 63/942,886 dated 17 December 2025. The repository README cites USPTO provisional #73565085, held by SOUHIMBOU DOH KONE LLC and exclusively licensed to SecRed Knowledge Inc. These do not match. (The number 73565085 is also in the series ordinarily used for trademark serial numbers.) | **Open.** Counsel to confirm the correct number(s) and whether there are two filings. The header retains the number from the outline pending confirmation. |
| **D-2** | **DTM number and "91 capabilities".** The outline cites a specific DTM and a specific capability count. | Removed from body text; not verifiable here. Confirm against the library. |
| **D-3** | CSfC. The outline implied conformance. | Reworded to "design reference". Component listing is a separate process. |
| **D-4** | **ML-DSA parameter set.** The code uses ML-DSA-87 for HITL approval. The README and Trust Center describe ML-DSA-65 for ledger, licence and daemon signing. CNSA 2.0 calls for ML-DSA-87. | **Open.** Decide on one parameter set per use and update the sibling code or the public statements. |
| **D-5** | Trusted time for the ledger. | Open. Evaluate RFC 3161 timestamping or an offline anchoring scheme. |
| **D-6** | The "Nebula/WireGuard hybrid" mesh. | Open. Rationale undocumented. |
| **D-7** | **FIPS 203.** The outline stated ML-KEM-1024 as implemented. | Corrected. The code uses pre-standard Kyber-1024. |
| **D-8** | **Port collisions** (`:8443` double use; `:9090` double use). | Resolved in §3.4. |
| **D-9** | **Component numbering** differed between the figure and the component list. | Reconciled in Table 3.1. |
| **D-10** | **"Court-admissible" and "mathematically".** | Withdrawn (§4.4, §10.3). |
| **D-11** | **"100% pass" and "zero bypass"** phrasing. | Restated against a defined battery (§12.2). |
| **D-12** | **STIG rule count** of 19,943 versus the README's 28,639 mapping rows. | Count left unfixed; the build shall publish it (§5.1.2). |
| **D-13** | **Document date.** The outline is dated 08 October 2026 and this revision keeps that date. | No action. |
| **D-14** | Link targets in the outline pointed at a local Windows path (`C:\Users\intel\...`). | Replaced with repository-relative references (Appendix E). |

## Appendix E. Document archive and OPORD linkage

This Software Design Specification is the working technical reference for the KHEPRA STARGATE C2C platform. It supersedes the outline version of the same ID.

- **Operations linkage.** Operation Jersey Shore OPORD, Annex E (R&D / DevSecOps and Product Maturity). Maintained outside this repository; the earlier outline linked to a local workstation path that is not valid for other readers.
- **Reference body of knowledge.** IEEE *Guide to the Software Engineering Body of Knowledge* (SWEBOK) v4.
- **Design-description standard.** IEEE Std 1016-2009.
- **Architecture-description standard.** ISO/IEC/IEEE 42010:2011.
- **DoD reference library.** <https://dodcio.defense.gov/Library/>.
- **Related repository documents.** `README.md`, `SECURITY.md`, `TRUST_CENTER.md`, `CHANGELOG.md`, `AGENTS.md`.

---

**Approval block**

The earlier outline carried a pre-printed approval and authentication statement. An approval statement is a signature, and a signature should be applied by the person signing, not drafted on their behalf. The block below is left blank.

| Role | Name | Signature | Date |
|---|---|---|---|
| Author / Founder and CEO | | | |
| Security reviewer | | | |
| Quality reviewer | | | |

*KHEPRA Protocol. Sovereign Defense System.*
