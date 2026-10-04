'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield, Lock, ArrowRight, ChevronDown, Award,
  CheckCircle, FileText, Zap, Network, Cpu, Globe,
  Key, Terminal, Eye, AlertTriangle, Activity,
  Database, Layers, GitBranch, Radio, Fingerprint,
  Search, BookOpen, Repeat, TrendingUp, Menu, X,
  ExternalLink, ChevronRight
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DATA — KTOS 12 MODULE MATRIX
   ═══════════════════════════════════════════════════════════════ */
const MODULES = [
  // Core Trust
  { id: 'attest',   group: 'core',      icon: Shield,      name: 'KTOS Attest',   tagline: 'Prove what happened',       desc: 'Every AI agent action signed with ML-DSA-65 and anchored in an immutable DAG ledger. Cryptographically impossible to backdate.', color: 'cyan'  },
  { id: 'passport', group: 'core',      icon: Fingerprint, name: 'KTOS Passport', tagline: 'Identity that travels',      desc: 'Portable ML-DSA-65 identity credential for AI agents. Binds intent + action + outcome in a verifiable Agent Evidence Object (AEO).', color: 'cyan'  },
  { id: 'replay',   group: 'core',      icon: Repeat,      name: 'KTOS Replay',   tagline: 'Forensic rewind',            desc: 'Full deterministic replay of any AI agent session. Reproduce exact tool calls, arguments, and outputs for incident investigation.', color: 'cyan'  },
  { id: 'score',    group: 'core',      icon: TrendingUp,  name: 'KTOS Score',    tagline: 'Trust standing',             desc: 'Continuous behavioral trust scoring across agent fleets. Anomaly detection powered by KASA evolutionary algorithm.', color: 'cyan'  },
  // Detection & Boundary
  { id: 'scan',     group: 'detect',    icon: Search,      name: 'KTOS Scan',     tagline: 'OmniScan — 50+ detectors',  desc: '8 scanning lanes: Shadow AI discovery (Ollama/vLLM), Plugin4Shell audit, STIG CAT I/II checks, SBOM/KEV correlation, secret scanning.', color: 'amber' },
  { id: 'guard',    group: 'detect',    icon: Eye,         name: 'KTOS Guard',    tagline: 'SEKHEM PQC-WAF',            desc: 'Post-quantum L7 WAF with ML-KEM-1024 rotating vaults, polymorphic argument scrubbing, and Kyber-1024 ephemeral sessions.', color: 'amber' },
  { id: 'profile',  group: 'detect',    icon: Radio,       name: 'KTOS Profile',  tagline: 'MCP protocol inspection',   desc: 'Deep packet inspection of MCP JSON-RPC sessions. Flags prompt injections, indirect tool abuse, and cross-agent privilege escalation.', color: 'amber' },
  { id: 'enclave',  group: 'detect',    icon: Lock,        name: 'KTOS Enclave',  tagline: 'PTY sandbox supervisor',    desc: 'Canonical PTY supervisor wrapping every AI agent shell session. Keystroke attestation + isolation boundary enforcement.', color: 'amber' },
  // Actuation & Governance
  { id: 'comply',   group: 'govern',    icon: BookOpen,    name: 'KTOS Comply',   tagline: 'CMMC/STIG/Residue',         desc: '110 CMMC L2 practices + 36,195 cross-framework mappings. APDL policy declarations compile to Ansible. Assessment-ready evidence (self-assessment or C3PAO).', color: 'gold'  },
  { id: 'heal',     group: 'govern',    icon: Zap,         name: 'KTOS Heal',     tagline: 'ASAF Remediation Daemon',   desc: 'ML-DSA-65 authorized kernel-level remediation: sysctl, PAM, SELinux, GRUB FIPS. Human gate required. DAG-attested on execution.', color: 'gold'  },
  { id: 'prover',   group: 'govern',    icon: Database,    name: 'KTOS Prover',   tagline: 'Z3 SMT formal proof',       desc: 'Formal mathematical verification of compliance policies using Z3 SMT solver. Proves policy satisfiability before deployment.', color: 'gold'  },
  { id: 'stream',   group: 'govern',    icon: Activity,    name: 'KTOS Stream',   tagline: 'OCSF SIEM integration',     desc: 'Real-time OCSF 1.0 event stream to Splunk HEC, Elastic/Filebeat, and Axonius DSPM. Every DAG event surfaces in your SOC.', color: 'gold'  },
]

const MODULE_GROUPS = [
  { id: 'core',   label: 'Core Trust',              color: 'cyan'  },
  { id: 'detect', label: 'Detection & Boundary',    color: 'amber' },
  { id: 'govern', label: 'Actuation & Governance',  color: 'gold'  },
]

/* ── Pricing Tiers ────────────────────────────────────────────── */
const TIERS = [
  {
    key: 'community',
    name: 'Community',
    price: 'Free',
    suffix: 'Open-Core Kernel',
    tagline: 'The sovereign trust kernel. 4 Core Trust Modules. Local SQLite Ledger.',
    modules: ['KTOS Attest', 'KTOS Passport', 'KTOS Replay', 'KTOS Score'],
    features: ['500 Tokenomics credits', '4 core trust modules', '9 base MCP tools', 'Local SQLite ledger', 'ML-DSA-65 signing', 'PQC key generation', 'Flight recorder (7-day)', 'GHCR container image'],
    cta: 'Get the MCP Server',
    ctaHref: 'https://smithery.ai/servers/skone/pqc-khepra-mcp',
    badge: 'Open Core',
    featured: false,
    sovereign: false,
    gated: false,
  },
  {
    key: 'platform',
    name: 'Platform',
    price: '$499',
    suffix: '/month',
    tagline: 'Self-serve KTOS — Full OmniScan (50+ Detectors) + threat detection.',
    modules: ['+ KTOS Scan', '+ KTOS Guard', '+ KTOS Profile', '+ KTOS Stream'],
    features: ['3,000 Tokenomics credits', 'Everything in Community', 'OmniScan (50+ Detectors across 8 lanes)', 'Shadow AI discovery', 'Plugin4Shell audit', 'STIGViewer API integration', 'OCSF SIEM telemetry stream', 'Agent anomaly alerts (Slack/PD)', 'Unlimited DAG history'],
    cta: 'Subscribe via Stripe (Self-Serve)',
    ctaHref: 'https://buy.stripe.com/aFa7sLaIi6x4cZBevV9ws04',
    badge: 'Most Popular',
    featured: true,
    sovereign: false,
    gated: false,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '$2,999',
    suffix: '/month',
    tagline: 'Full Agentic SOC with remediation daemon & SEKHEM L7 PQC-WAF.',
    modules: ['+ KTOS Enclave', '+ KTOS Comply', '+ KTOS Heal', '+ KTOS Prover'],
    features: ['15,000 Tokenomics credits', 'Everything in Platform', 'Full Agentic SOC', 'SEKHEM L7 PQC-WAF', 'PTY Enclave supervisor', 'ASAF Remediation Daemon', 'Z3 SMT formal proof', 'DataLoop self-healing', 'Team seats + RBAC', 'SOC 2 / EU AI Act evidence'],
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@nouchix.com?subject=KTOS%20Enterprise%20Inquiry',
    badge: 'Full Agentic SOC',
    featured: false,
    sovereign: false,
    gated: true,
  },
  {
    key: 'sovereign',
    name: 'Sovereign',
    price: '$45K',
    suffix: '– $250K/yr',
    tagline: 'Air-gapped. Bare-metal. SDVOSB. Zero egress.',
    modules: ['All 12 KTOS modules', 'APDL compiler', 'Iron Bank delivery', 'Assessment evidence engineering'],
    features: [
      '100,000+ Tokenomics credits',
      'Everything in Enterprise',
      'Air-gapped static binaries',
      'FIPS 140-3 (boringcrypto)',
      'Zero-egress enforcement',
      'APDL compiler + policy editor',
      'Dedicated assessment evidence engineering',
      /* Tactical RF Anti-Jamming: Removed from public copy; available on request. */
      'SDVOSB sole-source package',
      'Iron Bank / k8s deployment',
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@nouchix.com?subject=Sovereign%20Deployment%20Inquiry',
    badge: 'DoD / DIB',
    featured: false,
    sovereign: true,
    gated: true,
  },
]

/* ── KHEPRA Trust OS (KTOS) — Product Family ──────────────────────
   Branding rule: "KTOS" + the literal function of the product.
   Each product keeps its own buyer, question, and tiers (AGENTS.md #6). */
const PRODUCTS = [
  {
    key: 'cmmc',
    surface: 'Product Surface 1',
    name: 'KTOS CMMC Hub & Fleet Engine',
    domain: 'adinkhepra.com',
    question: 'Can I prove what I attested?',
    buyer: 'CISO · Compliance Lead · Contracts Officer (DIB)',
    accent: '#c9a227',
    icon: Shield,
    capabilities: [
      'Desktop App, Fleet Hub & osquery Fleet Remote Engine',
      'Sovereign bare-metal scans (zero egress)',
      'APDL staging & human-gated remediation',
      'Assessment-ready OSCAL / SSP / POA&M evidence packages',
    ],
    tiers: [
      { name: 'Enterprise', price: '$2,999', suffix: '/month', note: 'Fleet Hub + ASAF Remediation Daemon + assessment export' },
      { name: 'Sovereign', price: '$45K', suffix: '– $250K/yr', note: 'Air-gapped, FIPS 140-3, SDVOSB sole-source eligible' },
    ],
    cta: 'Book a CMMC Readiness Call',
    ctaHref: 'https://calendly.com/cybersouhimbou',
  },
  {
    key: 'soc',
    surface: 'Product Surface 2',
    name: 'KTOS Agentic SOC',
    domain: 'souhimbou.ai',
    question: 'What did my AI agents do, and can I prove it?',
    buyer: 'Security Engineer · Platform Lead · Startup CTO',
    accent: '#00d4ff',
    icon: Activity,
    capabilities: [
      'Agentic SOC SaaS platform',
      'Continuous Flight Recorder SDK',
      'KASA behavioral anomaly detector',
      'ML-DSA-65 signed SOAR playbooks · multi-agent orchestration',
    ],
    tiers: [
      { name: 'Platform', price: '$499', suffix: '/month', note: 'Self-serve via Stripe · OmniScan + Flight Recorder' },
      { name: 'Enterprise', price: '$2,999', suffix: '/month', note: 'Full SOAR engine, team seats + RBAC' },
    ],
    cta: 'Subscribe via Stripe',
    ctaHref: 'https://buy.stripe.com/aFa7sLaIi6x4cZBevV9ws04',
  },
  {
    key: 'mcp',
    surface: 'Product Surface 3',
    name: 'KTOS-MCP Master-Kernel',
    domain: 'mcp.souhimbou.ai + MCP registries',
    question: 'How do my AI coding agents touch tools and infrastructure safely?',
    buyer: 'Developer · DevSecOps · Agent runtimes (Claude Code, Cursor, Antigravity)',
    accent: '#22c55e',
    icon: Cpu,
    capabilities: [
      '100-tool post-quantum kernel',
      'Native stdio & HTTP JSON-RPC server',
      'SEKHEM L7 WAF prompt defense',
      'Windows Event Viewer logging (IDs 1001–1050) · Tactical RF tools',
    ],
    tiers: [],
    cta: 'Get the MCP Server',
    ctaHref: 'https://smithery.ai/servers/skone/pqc-khepra-mcp',
  },
]

// 3-state: true = full ✓ | 'partial' = ◑ | false = —
/* ── Moat Matrix ──────────────────────────────────────────────── */
type MoatVal = true | 'partial' | false
interface MoatRow {
  capability: string
  sub: string
  ktos: MoatVal
  lineation: MoatVal
  paloalto: MoatVal
  sentinel: MoatVal
  snyk: MoatVal
  wiz: MoatVal
  steel: MoatVal
  drata: MoatVal
  patero: MoatVal
  nvidia: MoatVal
}
const MOAT_ROWS: MoatRow[] = [
  //                                                                                                  KTOS        Lineation   PaloAlto    Sentinel    Snyk        Wiz         SteelCloud  Drata/Vanta Patero      NVIDIA
  { capability: 'Primary Focus',              sub: 'autonomous agent execution vs legacy tooling',     ktos: true, lineation: 'partial', paloalto: false, sentinel: false, snyk: false, wiz: false, steel: false, drata: false, patero: false, nvidia: 'partial' },
  { capability: 'MCP Protocol Mediation',     sub: 'deep JSON-RPC + PTY inspection',                   ktos: true, lineation: 'partial', paloalto: false, sentinel: 'partial', snyk: false, wiz: false, steel: false, drata: false, patero: false, nvidia: true },
  { capability: 'Host / Terminal Enclave',    sub: 'PTY enclave, subprocess, PAM/sysctl',              ktos: true, lineation: false,     paloalto: false, sentinel: false, snyk: false, wiz: false, steel: true,  drata: false, patero: false, nvidia: true },
  { capability: 'Human-in-the-Loop Gating',   sub: 'isolated staging mirror → signed apply',           ktos: true, lineation: 'partial', paloalto: false, sentinel: 'partial', snyk: false, wiz: false, steel: false, drata: false, patero: false, nvidia: 'partial' },
  { capability: 'Audit Trail Architecture',   sub: 'immutable content-addressed DAG',                  ktos: true, lineation: 'partial', paloalto: false, sentinel: false, snyk: false, wiz: false, steel: 'partial', drata: false, patero: false, nvidia: 'partial' },
  { capability: 'Cryptographic Verifiability',sub: 'FIPS 204 ML-DSA-65 (vendor-independent)',        ktos: true, lineation: false,     paloalto: false, sentinel: false, snyk: false, wiz: false, steel: false, drata: false, patero: false, nvidia: 'partial' },
  { capability: 'Air-Gap / Zero-Egress',      sub: 'native sovereign bare-metal (zero external APIs)',  ktos: true, lineation: 'partial', paloalto: false, sentinel: false, snyk: false, wiz: false, steel: 'partial', drata: false, patero: true,  nvidia: 'partial' },
  { capability: 'DoD / CMMC / FCA Defense',   sub: '36,195 STIG/CMMC mappings + signed AEO',          ktos: true, lineation: false,     paloalto: false, sentinel: false, snyk: false, wiz: false, steel: true,  drata: false, patero: false, nvidia: false },
  // TODO: Restore npx @souhimbou/verify wording after npm publish.
  { capability: 'Offline Verifier',           sub: 'available to design partners',                      ktos: true, lineation: false,     paloalto: false, sentinel: false, snyk: false, wiz: false, steel: false, drata: false, patero: false, nvidia: 'partial' },
  { capability: 'Shadow AI Discovery',        sub: 'Ollama, vLLM, rogue LLM endpoints',                ktos: true, lineation: 'partial', paloalto: 'partial', sentinel: false, snyk: false, wiz: false, steel: false, drata: false, patero: false, nvidia: 'partial' },
  { capability: 'SIEM / OCSF Stream',         sub: 'Splunk HEC, Elastic, Axonius DSPM',                ktos: true, lineation: 'partial', paloalto: true,  sentinel: true,  snyk: false, wiz: true,  steel: false, drata: false, patero: false, nvidia: false },
]

/* ── Terminal demo lines ──────────────────────────────────────── */
const OMNI_LINES = [
  { delay: 0,    cls: 't-cyan',  text: '$ ktos scan --all-lanes --target agent://cursor-pro-session' },
  { delay: 600,  cls: 't-dim',   text: '  [✦] KTOS OmniScan v2.1 — 8 lanes initialized' },
  { delay: 1200, cls: 't-white', text: '  [→] Lane 1: Shadow AI Discovery...' },
  { delay: 1900, cls: 't-amber', text: '  [!] Ollama detected on :11434 (llama3.1:8b) — UNATTESTED' },
  { delay: 2600, cls: 't-white', text: '  [→] Lane 3: Plugin4Shell audit...' },
  { delay: 3200, cls: 't-green', text: '  [✓] No shell injection vectors in MCP manifest' },
  { delay: 3900, cls: 't-white', text: '  [→] Lane 5: STIG CAT I scan (RHEL 9)...' },
  { delay: 4600, cls: 't-red',   text: '  [✗] STIG-ID V-258029  CAT I  — fips_enabled=0 on kernel' },
  { delay: 5300, cls: 't-red',   text: '  [✗] STIG-ID V-258053  CAT I  — auditd not enforcing' },
  { delay: 6000, cls: 't-white', text: '  [→] Lane 7: SBOM/KEV correlation...' },
  { delay: 6700, cls: 't-amber', text: '  [!] 3 KEV-listed CVEs in openssl@3.0.7' },
  { delay: 7400, cls: 't-gold',  text: '  [★] Godfather Report: $2.4M exposure · SPRS: -147' },
  { delay: 8100, cls: 't-cyan',  text: '  [✦] DAG node signed: sha3-256:a7f3e9c1...  ✓ ML-DSA-65' },
]

const PASSPORT_LINES = [
  { delay: 0,    cls: 't-cyan',  text: '$ ktos passport issue --agent cursor-pro --symbol Nkyinkyim' },
  { delay: 700,  cls: 't-dim',   text: '  [✦] Generating ML-DSA-65 keypair (FIPS 204)...' },
  { delay: 1400, cls: 't-green', text: '  [✓] Public key: MLDS65-k1:7a3f9e2d8b1c...' },
  { delay: 2100, cls: 't-white', text: '  [→] Binding Adinkra symbol: Nkyinkyim (adaptability)' },
  { delay: 2800, cls: 't-white', text: '  [→] Issuing Agent Evidence Object (AEO #00042)...' },
  { delay: 3500, cls: 't-dim',   text: '  {' },
  { delay: 3700, cls: 't-dim',   text: '    "agentID": "cursor-pro-session-7a3f",'},
  { delay: 3900, cls: 't-gold',  text: '    "symbol": "Nkyinkyim",'},
  { delay: 4100, cls: 't-cyan',  text: '    "action": "edit_file(src/app/page.tsx)",'},
  { delay: 4300, cls: 't-green', text: '    "outcome": "SUCCESS",'},
  { delay: 4500, cls: 't-dim',   text: '    "sig": "σ:ML-DSA-65:3a9f..."'},
  { delay: 4700, cls: 't-dim',   text: '  }' },
  { delay: 5400, cls: 't-cyan',  text: '$ ktos replay --aeo 00042' },
  { delay: 6100, cls: 't-green', text: '  [✓] Replay verified — deterministic match confirmed' },
]

const COMPLY_LINES = [
  { delay: 0,    cls: 't-cyan',  text: '$ ktos comply --framework CMMC.L2 --generate-apdl' },
  { delay: 700,  cls: 't-dim',   text: '  [✦] Loading 36,195 cross-framework mappings...' },
  { delay: 1400, cls: 't-amber', text: '  [!] AC-2: Account Management — FAILING (CCI-000048)' },
  { delay: 2100, cls: 't-white', text: '  [→] Generating APDL declaration...' },
  { delay: 2800, cls: 't-gold',  text: "  @symbol(Eban) @framework(CMMC.L2) @tier(Sovereign) @gate(human)" },
  { delay: 3200, cls: 't-cyan',  text: "  control AC-2 {" },
  { delay: 3600, cls: 't-white', text: "    require: pam_faillock" },
  { delay: 3900, cls: 't-white', text: "    deny = 3" },
  { delay: 4200, cls: 't-white', text: "    unlock_time = 900" },
  { delay: 4500, cls: 't-dim',   text: "    maps: CMMC.AC.L2-3.1.2, NIST.AC-2, CCI-000048" },
  { delay: 4800, cls: 't-cyan',  text: "  }" },
  { delay: 5500, cls: 't-white', text: '  [→] Staging remediation (mirror env)...' },
  { delay: 6200, cls: 't-green', text: '  [✓] STAGED — awaiting human gate approval' },
  { delay: 6900, cls: 't-cyan',  text: '  [✦] DAG node signed: sha3-256:c4d8f2a1... ✓ ML-DSA-65' },
]

const GUARD_LINES = [
  { delay: 0,    cls: 't-cyan',  text: '$ ktos guard status --endpoint mcp.souhimbou.ai' },
  { delay: 700,  cls: 't-dim',   text: '  [✦] SEKHEM PQC-WAF — Active (ML-KEM-1024 vault)' },
  { delay: 1400, cls: 't-green', text: '  [✓] This request: ML-DSA-65 attestation verified' },
  { delay: 2100, cls: 't-white', text: '  [→] Scanning last 60s of edge traffic...' },
  { delay: 2800, cls: 't-red',   text: '  [✗] BLOCKED: Prompt injection via tool arg (3 attempts)' },
  { delay: 3500, cls: 't-red',   text: '  [✗] BLOCKED: Directory traversal /../.env (1 attempt)' },
  { delay: 4200, cls: 't-amber', text: '  [!] Dihedral D₈ rotation applied — payload scrubbed' },
  { delay: 4900, cls: 't-green', text: '  [✓] 2,847 clean requests passed' },
  { delay: 5600, cls: 't-gold',  text: '  [★] X-Khepra-Trust: Post-Quantum-Protected' },
  { delay: 6300, cls: 't-gold',  text: '  [★] X-Khepra-Algorithm: ML-DSA-65 + ML-KEM-1024' },
]

const CONSOLE_TABS = [
  { id: 'scan',     label: 'OmniScan',         icon: Search,   lines: OMNI_LINES    },
  { id: 'passport', label: 'Passport & Replay', icon: Fingerprint, lines: PASSPORT_LINES },
  { id: 'comply',   label: 'Comply + APDL',    icon: BookOpen, lines: COMPLY_LINES  },
  { id: 'guard',    label: 'SEKHEM Guard',      icon: Eye,      lines: GUARD_LINES   },
]

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function TerminalConsole({ lines }: { lines: typeof OMNI_LINES }) {
  const [visible, setVisible] = useState<number[]>([])
  const timerRefs = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    // Clear previous
    timerRefs.current.forEach(t => clearTimeout(t))
    timerRefs.current = []
    setVisible([])

    lines.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisible(v => [...v, i])
      }, lines[i].delay)
      timerRefs.current.push(t)
    })

    return () => timerRefs.current.forEach(t => clearTimeout(t))
  }, [lines])

  return (
    <div className="terminal h-72 overflow-hidden">
      <div className="terminal-header">
        <div className="terminal-dot" style={{ background: '#ef4444' }} />
        <div className="terminal-dot" style={{ background: '#f59e0b' }} />
        <div className="terminal-dot" style={{ background: '#22c55e' }} />
        <span className="ml-2 text-xs text-slate-500 font-mono">ktos — khepra trust os</span>
        <span className="ml-auto status-live text-xs text-green-400">LIVE</span>
      </div>
      <div className="terminal-body overflow-y-auto h-full">
        {lines.map((line, i) =>
          visible.includes(i) ? (
            <div key={i} className={`font-mono text-xs leading-6 ${line.cls}`}>
              {line.text}
            </div>
          ) : null
        )}
        {visible.length > 0 && visible.length < lines.length && (
          <span className="cursor-blink" />
        )}
      </div>
    </div>
  )
}

function AnimatedPipeline() {
  const steps = [
    { icon: Fingerprint, label: 'Intercept',  sub: 'KTOS Enclave & Profile', color: '#00d4ff' },
    { icon: Shield,      label: 'Guard',       sub: 'KTOS Guard & SEKHEM',    color: '#f59e0b' },
    { icon: Search,      label: 'Scan',        sub: 'KTOS Scan & OmniScan',   color: '#a78bfa' },
    { icon: Zap,         label: 'Remediate',   sub: 'KTOS Heal & Comply',     color: '#22c55e' },
    { icon: Database,    label: 'Attest',      sub: 'KTOS Attest & Stream',   color: '#c9a227' },
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % steps.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-center gap-0 my-8">
      {steps.map((step, i) => {
        const Icon = step.icon
        const isActive = active === i
        const isPast = active > i || (active === 0 && i > 0 && false)
        return (
          <div key={step.label} className="flex flex-col md:flex-row items-center">
            <div className={`flex flex-col items-center gap-3 px-6 py-5 rounded-xl transition-all duration-500 border
              ${isActive
                ? 'bg-[rgba(0,0,0,0.5)] scale-105'
                : 'bg-[rgba(0,0,0,0.2)] scale-100'
              }`}
              style={{
                borderColor: isActive ? step.color : 'rgba(255,255,255,0.06)',
                boxShadow: isActive ? `0 0 40px ${step.color}30` : 'none',
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500`}
                style={{
                  background: isActive ? `${step.color}22` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isActive ? step.color : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <Icon size={20} style={{ color: isActive ? step.color : '#475569' }} />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{step.label}</div>
                <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{step.sub}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="md:w-16 h-8 md:h-px flex items-center justify-center my-2 md:my-0">
                <svg width="64" height="24" viewBox="0 0 64 24" className="hidden md:block" fill="none">
                  <line x1="0" y1="12" x2="64" y2="12" stroke="rgba(0,212,255,0.15)" strokeWidth="1" />
                  <circle r="3" fill="#00d4ff" opacity="0.7">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M0,12 L64,12" />
                  </circle>
                </svg>
                <svg width="24" height="40" viewBox="0 0 24 40" className="md:hidden" fill="none">
                  <line x1="12" y1="0" x2="12" y2="40" stroke="rgba(0,212,255,0.15)" strokeWidth="1" />
                  <circle r="3" fill="#00d4ff" opacity="0.7">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M12,0 L12,40" />
                  </circle>
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EcosystemIntegrations() {
  const categories = [
    {
      label: 'Agent Frameworks & IDEs',
      items: [
        { name: 'Anthropic Claude Code', badge: 'Stdio & SSE' },
        { name: 'Cursor Pro & Agent IDE', badge: 'PTY Enclave' },
        { name: 'Google Antigravity IDE', badge: 'Native MCP' },
        { name: 'Cline & OpenHands', badge: 'Zero-Egress' },
      ],
    },
    {
      label: 'Frontier & Sovereign LLMs',
      items: [
        { name: 'Anthropic Claude 3.7', badge: 'JSON-RPC' },
        { name: 'OpenAI GPT-4o / o1', badge: 'Mediated' },
        { name: 'Google Gemini 2.0', badge: 'Attested' },
        { name: 'Ollama Sovereign (Local)', badge: 'Air-Gap' },
      ],
    },
    {
      label: 'Enclaves, Cloud & SIEM',
      items: [
        { name: 'Model Context Protocol (MCP)', badge: '100 Tools' },
        { name: 'SEKHEM PQC-WAF', badge: 'ML-KEM-1024' },
        { name: 'Linux PTY / Windows Server', badge: 'Signed Exec' },
        { name: 'Splunk HEC & Axonius DSPM', badge: 'OCSF Stream' },
      ],
    },
  ]

  return (
    <div className="relative py-12 px-6 bg-[rgba(0,212,255,0.02)] border-b border-[rgba(0,212,255,0.08)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00d4ff] text-[11px] font-mono uppercase font-bold tracking-wider mb-2">
              <Network size={12} /> Ecosystem Interoperability
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Works Across Your Existing Agent Stack
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            KTOS mediates agent execution without replacing your tools or forcing cloud lock-in. Encapsulates runtime tools, terminal commands, and LLM calls into verifiable cryptographic artifacts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="text-xs font-mono text-slate-400 font-semibold mb-4 uppercase tracking-wider flex items-center justify-between">
                <span>{cat.label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]/60" />
              </div>
              <div className="space-y-2.5">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-slate-800/50 text-xs">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800/80 text-[#00d4ff] border border-slate-700/60">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            * All third-party trademarks and logos belong to their respective owners. KTOS connects as an independent, non-intrusive execution membrane.
          </p>
        </div>
      </div>
    </div>
  )
}

function FourLayerArchitectureDiagram() {
  return (
    <div className="mt-20 pt-16 border-t border-[rgba(0,212,255,0.08)]">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
          <Layers size={14} /> Canonical Architecture · USPTO #73565085
        </div>
        <h3 className="text-3xl lg:text-4xl font-black text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>
          The Four-Layer Sovereign Architecture
        </h3>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          How KTOS separates untrusted agent reasoning from authoritative system execution. Every layer is isolated, air-gappable, and cryptographically anchored.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Layer 4 */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#07090f] border border-cyan-500/30 shadow-[0_0_25px_rgba(0,212,255,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] font-mono text-xs font-bold">
                LAYER 4
              </span>
              <h4 className="text-lg font-bold text-white font-sans">
                KTOS-MCP Master-Kernel
              </h4>
              <span className="text-xs font-mono text-slate-400 hidden md:inline">· Agent Channel &amp; Execution Gate</span>
            </div>
            <span className="text-[11px] font-mono text-[#00d4ff]">mcp.souhimbou.ai · 100 Tools</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            The MCP server surface connecting Claude Code, Cursor, Antigravity, and autonomous sub-agents. Intercepts every tool call, validates parameters against schema and injection policies, and routes requests to sovereign execution backends.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-300">Stdio &amp; mTLS SSE Transport</span>
            <span className="px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-300">Non-Human Identity (NHI) Passports</span>
            <span className="px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-300">Polymorphic D₈ Argument Scrubbing</span>
          </div>
        </div>

        {/* Directional Arrow */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 py-1">
          <ArrowRight className="rotate-90 text-[#00d4ff]" size={14} />
          <span>Execution Gate Enforcement &amp; Staging Approval</span>
          <ArrowRight className="rotate-90 text-[#00d4ff]" size={14} />
        </div>

        {/* Layer 3: Dual Product Engines */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Layer 3a */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1220] to-[#07090f] border border-[#c9a227]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-[#c9a227]/10 border border-[#c9a227]/30 text-[#c9a227] font-mono text-xs font-bold">
                LAYER 3a
              </span>
              <span className="text-[11px] font-mono text-[#c9a227]">adinkhepra.com</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              AdinKhepra ASAF (Compliance Autopilot)
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Sovereign bare-metal compliance engine. Evaluates 110 CMMC L2 controls, generates APDL remediations, runs mirror staging dry-runs, and issues assessment-ready evidence packages.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">Zero-Egress Host Scan</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">APDL Policy Compiler</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">Human Approval Gate</span>
            </div>
          </div>

          {/* Layer 3b */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a1525] to-[#07090f] border border-[#00d4ff]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] font-mono text-xs font-bold">
                LAYER 3b
              </span>
              <span className="text-[11px] font-mono text-[#00d4ff]">souhimbou.ai</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              KTOS Agentic SOC (SouHimBou AI)
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Autonomous AI Security Architect. Supervises terminal commands inside canonical PTY enclaves, detects behavioral anomalies, triggers signed SOAR playbooks, and records real-time agent flight logs.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">SEKHEM PQC-WAF</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">Autonomous Flight Recorder</span>
              <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">PTY Sandbox Supervisor</span>
            </div>
          </div>
        </div>

        {/* Directional Arrow */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 py-1">
          <ArrowRight className="rotate-90 text-[#a78bfa]" size={14} />
          <span>FIPS 204 ML-DSA-65 Attestation &amp; Evidence Object Packaging</span>
          <ArrowRight className="rotate-90 text-[#a78bfa]" size={14} />
        </div>

        {/* Layer 2 */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-[#07090f] border border-purple-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-bold">
                LAYER 2
              </span>
              <h4 className="text-lg font-bold text-white font-sans">
                Shared Trust &amp; Compliance Substrate
              </h4>
            </div>
            <span className="text-[11px] font-mono text-purple-400">36,195 Embedded Mappings · ML-DSA-65</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            The mathematical foundation shared by all surfaces: embedded DISA STIG to CCI to NIST SP 800-53/171 to CMMC crosswalk database, FIPS 204 ML-DSA-65 digital signatures, FIPS 203 ML-KEM encapsulation, and an immutable content-addressed DAG ledger.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-300">Immutable Content-Addressed DAG</span>
            <span className="px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-300">Cloudflare CIRCL Post-Quantum Primitives</span>
            <span className="px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-300">Z3 SMT Formal Policy Proofs</span>
          </div>
        </div>

        {/* Directional Arrow */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 py-1">
          <ArrowRight className="rotate-90 text-amber-500" size={14} />
          <span>Cryptographic Root Anchor</span>
          <ArrowRight className="rotate-90 text-amber-500" size={14} />
        </div>

        {/* Layer 1 */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#140e06] to-[#07090f] border border-amber-500/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                LAYER 1
              </span>
              <h4 className="text-lg font-bold text-white font-sans">
                KHEPRA Protocol — Patent-Pending IP
              </h4>
            </div>
            <span className="text-[11px] font-mono text-amber-400">USPTO #73565085 · Sovereign Root of Trust</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The sovereign moat underlying everything. Never sold directly. Binds cryptographic machine identity to hardware roots of trust, providing mathematical non-repudiation for all upstream decisions, agent actions, and attestation objects.
          </p>
        </div>
      </div>
    </div>
  )
}

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function KTOSPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState('platform')
  const [tabKey, setTabKey] = useState(0)
  useReveal()

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const switchTab = (i: number) => {
    setActiveTab(i)
    setTabKey(k => k + 1)
  }

  const filteredModules = activeGroup === 'all'
    ? MODULES
    : MODULES.filter(m => m.group === activeGroup)

  const moduleColorMap: Record<string, string> = {
    cyan:  'rgba(0,212,255,0.15)',
    amber: 'rgba(245,158,11,0.15)',
    gold:  'rgba(201,162,39,0.15)',
  }
  const moduleTextMap: Record<string, string> = {
    cyan:  '#00d4ff',
    amber: '#f59e0b',
    gold:  '#c9a227',
  }

  return (
    <div className="min-h-screen bg-[#07090f] overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? 'nav-scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Shield size={16} className="text-black" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide" style={{ fontFamily: 'Space Grotesk' }}>NouchiX</span>
              <span className="ml-2 text-xs text-slate-500 hidden sm:inline font-mono">KTOS Platform</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Platform', href: '#platform' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Dual Pentest (58/58)', href: '#cyberstryke' },
              { label: 'Modules', href: '#modules' },
              { label: 'Documentation', href: '/docs' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Company', href: '#company' },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/docs"
              className="btn-ghost text-sm py-2 px-4 border border-[rgba(0,212,255,0.25)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)]">
              API Docs
            </a>
            <a href="https://smithery.ai/servers/skone/pqc-khepra-mcp" target="_blank" rel="noopener noreferrer"
              className="btn-ghost text-sm py-2 px-4">
              MCP Registry
            </a>
            <a href="mailto:cybersouhimbou@secredknowledgeinc.tech?subject=KTOS%20Demo"
              className="btn-cyan text-sm py-2 px-5">
              Request Demo
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-[rgba(0,212,255,0.1)] px-6 py-4 space-y-4">
            {['Platform', 'How It Works', 'Assault Benchmark', 'Modules', 'Documentation', 'Pricing', 'Company'].map(l => (
              <a key={l} href={l === 'Documentation' ? '/docs' : `#${l.toLowerCase().replace(/ /g, '-')}`}
                className="block text-sm text-slate-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}>
                {l}
              </a>
            ))}
            <a href="/docs"
              className="btn-ghost block text-center text-sm py-2 px-4 mt-2 border border-[rgba(0,212,255,0.25)] text-[#00d4ff]">
              API Documentation
            </a>
            <a href="mailto:cybersouhimbou@secredknowledgeinc.tech?subject=KTOS%20Demo"
              className="btn-cyan block text-center text-sm py-2 px-4 mt-2">
              Request Demo
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section id="platform" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 dot-grid-bg opacity-40" />
        <div className="absolute inset-0 grid-overlay opacity-50" />
        <div className="hero-blob-cyan" style={{ top: '10%', left: '5%' }} />
        <div className="hero-blob-gold" style={{ bottom: '20%', right: '10%' }} />
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, #07090f)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-[rgba(0,212,255,0.15)]">
                <span className="status-live text-xs text-slate-300 font-mono">AUTONOMOUS AGENT EXECUTION & POST-QUANTUM ATTESTATION · USPTO #73565085</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight mb-6"
                style={{ fontFamily: 'Space Grotesk' }}>
                <span className="text-white">Proof Over Promises</span>
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #00d4ff, #c9a227)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>for AI Agents That Touch Production.</span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-4 max-w-xl">
                <strong className="text-white">The Cryptographic Proof & Execution Gate for AI Agents.</strong> Your AI agents write production code, run shell commands, query live databases, and invoke remote MCP tools while your teams trust their output.
              </p>
              <p className="text-base text-slate-400 leading-relaxed mb-8 max-w-xl">
                KTOS provides an uncompromising execution membrane: zero-trust agent passports, runtime MCP mediation, host-level PTY enclaves, and cryptographic evidence objects (AEOs) your auditors and regulators can verify independently—without trusting our servers.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { val: '58 / 58', label: 'Internal Adversarial Tests Blocked' },
                  { val: '100',   label: 'MCP Kernel Tools' },
                  { val: '36K+',  label: 'Compliance Mappings' },
                  { val: '12',    label: 'KTOS Modules' },
                  { val: 'ML-DSA-65', label: 'FIPS 204 Signed' },
                ].map(s => (
                  <div key={s.val}>
                    <div className="text-2xl font-black text-[#00d4ff]"
                      style={{ fontFamily: 'Space Grotesk' }}>{s.val}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="#modules" className="btn-cyan inline-flex items-center gap-2">
                  Explore KTOS <ArrowRight size={16} />
                </a>
                <a href="/docs" className="btn-ghost inline-flex items-center gap-2 border border-[rgba(0,212,255,0.3)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.06)]">
                  <BookOpen size={16} /> Authoritative Docs
                </a>
                <a href="#pricing" className="btn-ghost inline-flex items-center gap-2">
                  See Pricing <ChevronDown size={16} />
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mt-8">
                {['Zero Cloud Telemetry Required', 'FIPS 204 ML-DSA-65 Signed', 'Dual-Engine Pentest 58/58', 'CMMC & False Claims Act Defensible', 'SDVOSB'].map(b => (
                  <span key={b} className="tier-badge px-3 py-1 rounded border text-[10px] text-slate-400 border-slate-700/50">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Interactive Console */}
            <div>
              {/* Tab selector */}
              <div className="flex overflow-x-auto gap-1 mb-3 pb-1 scrollbar-hide">
                {CONSOLE_TABS.map((tab, i) => {
                  const Icon = tab.icon
                  return (
                    <button key={tab.id} onClick={() => switchTab(i)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all duration-200
                        ${activeTab === i
                          ? 'bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff]'
                          : 'text-slate-500 hover:text-slate-300 border border-transparent'
                        }`}
                    >
                      <Icon size={12} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Terminal */}
              <div key={tabKey} className="glow-cyan rounded-xl overflow-hidden">
                <TerminalConsole lines={CONSOLE_TABS[activeTab].lines} />
              </div>

              {/* Badge below terminal */}
              <div className="mt-4 flex items-center gap-3 justify-end">
                <Image src="/asaf-badge.png" alt="AdinKhepra ASAF Post-Quantum Certified" width={60} height={60}
                  className="opacity-80 hover:opacity-100 transition-opacity" />
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">Post-Quantum Certified</div>
                  <div className="text-xs text-[#c9a227] font-mono">ML-DSA-65 · FIPS 204</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[rgba(0,212,255,0.04)] border-y border-[rgba(0,212,255,0.08)] py-3">
        <div className="flex items-center gap-12 animate-[ticker_25s_linear_infinite] whitespace-nowrap px-8"
          style={{ animation: 'ticker 30s linear infinite' }}>
          {Array(3).fill([
            'ML-DSA-65 Signed', 'CMMC L2 Autopilot', 'Zero Egress', 'Air-Gap Native',
            '36K+ Mappings', 'FIPS 204 · FIPS 203', 'Patent Pending #73565085',
            'OmniScan 50+ Detectors', 'SDVOSB · Veteran-Led', 'KTOS Trust OS'
          ]).flat().map((t, i) => (
            <span key={i} className="text-xs text-slate-500 font-mono inline-flex items-center gap-3">
              <span className="w-1 h-1 rounded-full bg-[#00d4ff] opacity-50" />
              {t}
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }`}</style>
      </div>

      {/* ── ECOSYSTEM INTEGRATIONS MARQUEE ──────────────────────── */}
      <EcosystemIntegrations />

      {/* ── HOW KTOS OPERATES ────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-28 px-6">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5 border border-[rgba(0,212,255,0.15)]">
              <span className="text-xs text-slate-400 font-mono">How KTOS Operates</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Space Grotesk' }}>
              Five Steps to{' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #c9a227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Provable Trust
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              KTOS is the first platform to close the full loop: intercept → guard → scan → remediate → attest.
              Every action signed. Every state change proven.
            </p>
          </div>

          <div className="reveal">
            <AnimatedPipeline />
          </div>

          {/* Step detail cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-12">
            {[
              {
                n: '01', icon: Fingerprint, color: '#00d4ff',
                title: 'Intercept',
                sub: 'KTOS Enclave & Profile',
                body: 'Captures AI agent intent and MCP JSON-RPC calls before execution. Canonical PTY supervisor with keystroke attestation.',
              },
              {
                n: '02', icon: Shield, color: '#f59e0b',
                title: 'Guard',
                sub: 'KTOS Guard & SEKHEM',
                body: 'Post-quantum L7 WAF. ML-KEM-1024 rotating vaults. Dihedral D₈ polymorphic argument scrubbing. Zero-day prompt injection blocked.',
              },
              {
                n: '03', icon: Search, color: '#a78bfa',
                title: 'Scan',
                sub: 'KTOS Scan & OmniScan',
                body: 'OmniScan 8-lane sweep: Shadow AI discovery, Plugin4Shell audit, STIG CAT I/II, SBOM/KEV correlation, and secret scanning across the full asset boundary.',
              },
              {
                n: '04', icon: Zap, color: '#22c55e',
                title: 'Remediate',
                sub: 'KTOS Heal & Comply',
                body: 'Closed-loop ASAF engine applying host remediations under a human gate. APDL declarations compile to Ansible. FIPS kernel enforced.',
              },
              {
                n: '05', icon: Database, color: '#c9a227',
                title: 'Attest',
                sub: 'KTOS Attest & Stream',
                body: 'Every state change anchored in ML-DSA-65 signed DAG ledger. Streaming OCSF findings to Splunk and Axonius. Assessment-ready evidence (self-assessment or C3PAO).',
              },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.n} className="module-card reveal">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}>
                      <Icon size={18} style={{ color: step.color }} />
                    </div>
                    <span className="text-3xl font-black opacity-10 text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      {step.n}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-xs font-mono mb-2" style={{ color: step.color }}>{step.sub}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              )
            })}
          </div>

          {/* Canonical 4-Layer Architecture Diagram */}
          <FourLayerArchitectureDiagram />
        </div>
      </section>

      <div className="section-divider mx-12" />

      {/* ── DUAL-ENGINE PENTEST ASSAULT SHOWCASE (CYBERSTRYKE + AGENTHOUND) ── */}
      <section id="cyberstryke" className="relative py-28 px-6 bg-[rgba(0,212,255,0.015)] border-y border-[rgba(0,212,255,0.08)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5 border border-emerald-500/30 bg-emerald-500/10">
              <Shield size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-mono font-bold tracking-wider uppercase">
                Dual-Engine Pentest Verification · 58/58 Attacks Neutralized
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Space Grotesk' }}>
              100.00% Neutralization Across{' '}
              <span style={{ background: 'linear-gradient(135deg, #22c55e, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Both Autonomous Pentest Engines
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4 tracking-wide">
              Internal adversarial testing by the NouchiX team using CyberStryke and AgentHound. Not a third-party audit.
            </p>
            <p className="text-slate-400 max-w-3xl mx-auto text-base leading-relaxed">
              Rigorous adversarial verification executing 58 targeted attack patterns across two independent security engines: CyberStryke Automated Assault (30/30 OWASP API &amp; LLM vectors) and the AgentHound Offensive Security Framework (28/28 agentic attack paths across MCP, A2A, model gateways, vector DBs, and execution sandboxes). All 58 vectors intercepted, scrubbed, or quarantined in real-time with zero false passes.
            </p>
          </div>

          {/* Metrics summary banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 reveal">
            <div className="glass p-5 rounded-xl border border-emerald-500/20 text-center">
              <div className="text-3xl font-black text-emerald-400 font-mono">58 / 58</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">Assaults Neutralized</div>
            </div>
            <div className="glass p-5 rounded-xl border border-[#00d4ff]/20 text-center">
              <div className="text-3xl font-black text-[#00d4ff] font-mono">100.00%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">Interception Rate</div>
            </div>
            <div className="glass p-5 rounded-xl border border-purple-500/20 text-center">
              <div className="text-3xl font-black text-purple-400 font-mono">30 / 30</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">CyberStryke API/LLM</div>
            </div>
            <div className="glass p-5 rounded-xl border border-cyan-500/20 text-center">
              <div className="text-3xl font-black text-cyan-400 font-mono">28 / 28</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-mono">AgentHound Agentic</div>
            </div>
          </div>

          {/* Dual-Engine Overview Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12 reveal">
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-black">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Engine 1: CyberStryke Automated Assault
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">30 / 30 Neutralized</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                OWASP API Top 10 &amp; OWASP LLM Top 10 Neutralization
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Validates edge resilience against classic web API threats and LLM prompt compromise. Neutralizes SQL Injection, Cross-Site Scripting (XSS), Directory Traversal, Null Byte Escapes, System Prompt Leaks, and Egress Token Disclosure via SEKHEM L7 WAF.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-emerald-300">
                <span className="px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-700/40">AST Parameterization</span>
                <span className="px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-700/40">Dihedral D₈ Scrubbing</span>
                <span className="px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-700/40">Strict WriteGate Jail</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#00d4ff]/30 bg-gradient-to-br from-cyan-950/20 to-black">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#00d4ff] px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30">
                  Engine 2: AgentHound Offensive Security Framework
                </span>
                <span className="text-xs font-mono font-bold text-[#00d4ff]">28 / 28 Neutralized</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                BloodHound for the Agentic Stack (MCP, A2A &amp; Inference Mesh)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Adversarial framework targeting agentic attack graphs across MCP servers, A2A protocols, model gateways (LiteLLM), inference backends (Ollama/vLLM), and vector DBs (Qdrant). Neutralizes Tool Shadowing, Description Poisoning, Identity Forgery, and IFC Taints.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-cyan-300">
                <span className="px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-700/40">POISONED_DESCRIPTION Intercept</span>
                <span className="px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-700/40">ML-DSA-65 Passports</span>
                <span className="px-2 py-0.5 rounded bg-cyan-900/30 border border-cyan-700/40">IFC Taint Isolation</span>
              </div>
            </div>
          </div>

          {/* Attack Vector Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'SQL Injection & Parameter Tampering',
                status: '5/5 Neutralized',
                engine: 'CyberStryke · Rule 101',
                desc: 'Union-based extractions, blind boolean injections, and out-of-band SQLi payloads completely scrubbed and blocked.',
                badge: '100% Blocked',
                color: '#22c55e',
              },
              {
                title: 'Cross-Site Scripting (XSS & Polyglots)',
                status: '5/5 Neutralized',
                engine: 'CyberStryke · Rule 102',
                desc: 'Reflected DOM injections, mutated SVG vectors, and script tag payloads neutralized prior to execution.',
                badge: '100% Scrubbed',
                color: '#22c55e',
              },
              {
                title: 'Path Traversal & Null Byte Escapes',
                status: '5/5 Neutralized',
                engine: 'CyberStryke · Rule 103',
                desc: 'Dot-dot-slash directory traversal (/../etc/shadow) and %00 null byte bypasses intercepted and contained in sandbox.',
                badge: '100% Confined',
                color: '#22c55e',
              },
              {
                title: 'MCP Tool Description Poisoning & Shadowing',
                status: '6/6 Neutralized',
                engine: 'AgentHound · POISONED_DESCRIPTION',
                desc: 'Adversarial instruction injection hidden in tool parameter docstrings and tool shadowing collisions neutralized by AST schema lockdown.',
                badge: '100% Neutralized',
                color: '#00d4ff',
              },
              {
                title: 'A2A Impersonation & Identity Spoofing',
                status: '6/6 Neutralized',
                engine: 'AgentHound · CAN_IMPERSONATE',
                desc: 'Subagent forgery and caller spoofing attempts blocked via Nkyinkyim-bound ML-DSA-65 Agent Passports and cryptographic nonces.',
                badge: '100% Denied',
                color: '#00d4ff',
              },
              {
                title: 'IFC Violation, Taints & Secret Exfiltration',
                status: '6/6 Neutralized',
                engine: 'AgentHound · IFC_VIOLATION & TAINTS',
                desc: 'Context window taint propagation, vector DB token leakage, and side-channel exfiltration severed by Zero-Egress Blackhole.',
                badge: '100% Isolated',
                color: '#00d4ff',
              },
            ].map(vec => (
              <div key={vec.title} className="module-card reveal border border-slate-800 hover:border-emerald-500/40 transition-all p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {vec.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {vec.engine}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{vec.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{vec.desc}</p>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Benchmark Result</span>
                  <span className="text-emerald-400 font-bold">{vec.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Deep link to Documentation */}
          <div className="text-center reveal">
            <Link href="/docs" className="inline-flex items-center gap-2 btn-ghost border border-[rgba(0,212,255,0.4)] text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] px-6 py-3 text-sm">
              <BookOpen size={16} />
              Read Full 58-Vector Dual Pentest Benchmark in Authoritative Docs
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="section-divider mx-12" />

      {/* ── 12-MODULE GRID ───────────────────────────────────────── */}
      <section id="modules" className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5 border border-[rgba(0,212,255,0.15)]">
              <Layers size={12} className="text-[#00d4ff]" />
              <span className="text-xs text-slate-400 font-mono">12 Named KTOS Modules</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Space Grotesk' }}>
              One Platform.{' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Complete Trust.
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every module is post-quantum signed, DAG-attested, and sovereignty-auditable.
              Mix and match by deployment tier.
            </p>
          </div>

          {/* Group filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-10 reveal">
            {[{ id: 'all', label: 'All Modules' }, ...MODULE_GROUPS].map(g => (
              <button key={g.id} onClick={() => setActiveGroup(g.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${activeGroup === g.id
                    ? 'bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff]'
                    : 'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}>
                {g.label}
              </button>
            ))}
          </div>

          {/* Module cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredModules.map((mod) => {
              const Icon = mod.icon
              const isActive = activeModule === mod.id
              return (
                <div key={mod.id}
                  className={`module-card reveal ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveModule(isActive ? null : mod.id)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: moduleColorMap[mod.color], border: `1px solid ${moduleTextMap[mod.color]}30` }}>
                      <Icon size={16} style={{ color: moduleTextMap[mod.color] }} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{mod.name}</div>
                      <div className="text-[10px] font-mono" style={{ color: moduleTextMap[mod.color] }}>
                        {mod.tagline}
                      </div>
                    </div>
                  </div>
                  <p className={`text-xs text-slate-400 leading-relaxed transition-all duration-300 ${isActive ? '' : 'line-clamp-2'}`}>
                    {mod.desc}
                  </p>
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <span className="tier-badge text-[10px]" style={{ color: moduleTextMap[mod.color] }}>
                        {MODULE_GROUPS.find(g => g.id === mod.group)?.label}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="section-divider mx-12" />

      {/* ── COMPETITIVE MOAT ─────────────────────────────────────── */}
      <section className="relative py-28 px-6">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="max-w-6xl mx-auto relative z-10">

          <div className="text-center mb-12 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5 border border-[rgba(201,162,39,0.15)]">
              <Award size={12} className="text-[#c9a227]" />
              <span className="text-xs text-slate-400 font-mono">Honest Competitive Matrix</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Space Grotesk' }}>
              The Only Platform That{' '}
              <span style={{ background: 'linear-gradient(135deg, #c9a227, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Closes the Loop
              </span>
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              SaaS proxies trap logs in vendor clouds. Cloud scanners ignore agent keystrokes. GRC checklists verify paperwork.
              KTOS is the only platform providing <em className="text-[#00d4ff]">host execution gating and vendor-independent post-quantum proof</em>.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5 justify-center mb-5 reveal">
            {[
              { icon: '✓', color: '#22c55e', label: 'Does it, for real' },
              { icon: '◑', color: '#f59e0b', label: 'Sort of, not fully' },
              { icon: '—', color: '#374151', label: 'Cannot do it' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: l.color }}>{l.icon}</span>
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl overflow-hidden reveal">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-[rgba(0,212,255,0.08)]">
                    <th className="text-left px-5 py-4 text-xs text-slate-500 font-mono uppercase tracking-widest min-w-[200px]">Capability ↓ / Vendor →</th>
                    {[
                      { label: 'KTOS',            sub: 'NouchiX',           highlight: true  },
                      { label: 'Lineation',       sub: 'Agent Gateway',     highlight: false },
                      { label: 'Palo Alto',       sub: 'Protect AI',        highlight: false },
                      { label: 'SentinelOne',     sub: 'Prompt Sec',        highlight: false },
                      { label: 'Snyk',            sub: 'Invariant',         highlight: false },
                      { label: 'Wiz',             sub: 'Cloud CSPM',        highlight: false },
                      { label: 'SteelCloud',      sub: 'ConfigOS',          highlight: false },
                      { label: 'Vanta / Drata',   sub: 'GRC Checklists',    highlight: false },
                      { label: 'Patero',          sub: 'Packet Encrypt',    highlight: false },
                      { label: 'NVIDIA',          sub: 'OpenShell',         highlight: false },
                    ].map(h => (
                      <th key={h.label}
                        className={`text-center px-3 py-4 font-bold whitespace-nowrap ${
                          h.highlight ? 'text-[#00d4ff]' : 'text-slate-500'
                        }`}>
                        <div className={`text-sm ${h.highlight ? 'text-[#00d4ff]' : 'text-slate-400'}`}>{h.label}</div>
                        <div className="text-[10px] font-mono font-normal opacity-60 mt-0.5">{h.sub}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOAT_ROWS.map((row, i) => {
                    const Cell = ({ val, isKtos }: { val: MoatVal; isKtos?: boolean }) => {
                      if (val === true)      return <CheckCircle size={15} className="inline" style={{ color: isKtos ? '#22c55e' : '#4b5563' }} />
                      if (val === 'partial') return <span className="text-sm" style={{ color: '#f59e0b' }}>◑</span>
                      return <span className="text-slate-700 text-base">—</span>
                    }
                    return (
                      <tr key={i} className="moat-row border-b border-[rgba(255,255,255,0.03)] transition-colors duration-200 group">
                        <td className="px-5 py-3 min-w-[200px]">
                          <div className="text-sm text-slate-200 font-medium">{row.capability}</div>
                          <div className="text-[10px] text-slate-600 font-mono mt-0.5">{row.sub}</div>
                        </td>
                        <td className="px-3 py-3 text-center bg-[rgba(0,212,255,0.02)] group-hover:bg-[rgba(0,212,255,0.04)]">
                          <Cell val={row.ktos} isKtos />
                        </td>
                        <td className="px-3 py-3 text-center"><Cell val={row.lineation} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.paloalto} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.sentinel} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.snyk} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.wiz} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.steel} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.drata} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.patero} /></td>
                        <td className="px-3 py-3 text-center"><Cell val={row.nvidia} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* Footer note */}
            <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-mono">THE ROW EVERYONE ELSE LEAVES BLANK → Cryptographic proof · Bounded autonomy · Sovereign/air-gap · Post-quantum (all four)</span>
              <span className="text-[10px] text-[#00d4ff] font-mono">KTOS ONLY ✓✓✓✓</span>
            </div>
          </div>

          {/* Veteran callout */}
          <div className="mt-8 glass-gold rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 reveal">
            <Image src="/founder-symposium.jpg" alt="Cyber — Founder, NouchiX"
              width={80} height={80} className="rounded-full object-cover border-2 border-[rgba(201,162,39,0.4)] shrink-0" />
            <div>
              <p className="text-slate-200 text-sm leading-relaxed italic">
                &ldquo;78% of organizations have already had an AI security incident<sup><a href="#source-1" className="text-[#00d4ff] hover:underline font-mono ml-0.5">[1]</a></sup>, and nearly half can&apos;t trace what their AI did<sup><a href="#source-2" className="text-[#00d4ff] hover:underline font-mono ml-0.5">[2]</a></sup>. When an AI agent changes production, &apos;trust our logs&apos; isn&apos;t an answer. Proof is. KTOS signs every agent action at the moment it happens, so anyone can verify what happened — without trusting us.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div>
                  <div className="text-sm font-bold text-white">Souhimbou &ldquo;Cyber&rdquo; Doh Kone</div>
                  <div className="text-xs text-[#c9a227] font-mono">Founder & CEO · Army Signal Corps 25S · SDVOSB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-12" />

      {/* ── FLAGSHIP SCENARIOS ────────────────────────────────────── */}
      <section className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5 border border-[rgba(0,212,255,0.15)]">
              <GitBranch size={12} className="text-[#00d4ff]" />
              <span className="text-xs text-slate-400 font-mono">Flagship Deployment Scenarios</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Space Grotesk' }}>
              Built for the{' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hardest Problems
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                letter: 'A',
                title: 'Defensible Self-Attestation',
                modules: 'Attest + Scan + Comply',
                color: '#00d4ff',
                desc: 'Every SPRS score and self-assessment backed by signed, independently verifiable evidence: OSCAL-formatted SSP, POA&M analysis, traceability matrix, and a signed manifest. Ready for a C3PAO the day your prime or contract requires one.',
                icon: FileText,
                stat: (
                  <span>
                    DOJ&apos;s cyber-fraud resolutions have more than tripled in each of the past two years. Self-attestation without proof is liability.<sup><a href="#source-3" className="text-[#00d4ff] hover:underline font-mono ml-0.5">[3]</a></sup>
                  </span>
                ),
                note: (
                  <span className="block mt-2 text-[10px] text-slate-500 font-mono">
                    In an independent 2022 study, 87% of defense contractors scored below 70 on SPRS, the DoD&apos;s own measure of cybersecurity compliance.<sup><a href="#source-4" className="text-[#00d4ff] hover:underline font-mono ml-0.5">[4]</a></sup>
                  </span>
                ),
              },
              {
                letter: 'B',
                title: 'Autonomous Agentic SOC',
                modules: 'Attest + Passport + Score + Replay',
                color: '#a78bfa',
                desc: "Enterprise security teams wrap their Claude, Cursor, and Antigravity agent fleets with KTOS. Every tool call attested. Anomaly scores computed. Incidents replayed forensically. SOAR playbooks staged for human approval.",
                icon: Activity,
                stat: 'Zero trust for AI agents — at the cryptographic layer',
                note: null,
              },
              {
                letter: 'C',
                title: 'Stargate CMMC Autopilot',
                modules: 'Comply + Heal + Guard + Scan',
                color: '#c9a227',
                desc: "Sovereign air-gapped compliance autopilot. APDL declarations compile to Ansible. PAM, SELinux, kernel FIPS enforced autonomously under a human approval gate. DAG-attested on every execution. Zero telemetry. Bare-metal.",
                icon: Shield,
                stat: 'Full CMMC L2 remediation — no cloud, no egress',
                note: null,
              },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.letter} className="module-card reveal flex flex-col h-full"
                  style={{ borderColor: `${s.color}10` }}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-lg"
                      style={{ background: `${s.color}15`, color: s.color, fontFamily: 'Space Grotesk' }}>
                      {s.letter}
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-snug">{s.title}</h3>
                      <div className="text-[10px] font-mono mt-1" style={{ color: s.color }}>
                        {s.modules}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed flex-1">{s.desc}</p>
                  <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-start gap-2">
                      <Icon size={12} style={{ color: s.color, marginTop: 2 }} className="shrink-0" />
                      <span className="text-xs text-slate-500 italic">{s.stat}</span>
                    </div>
                    {s.note}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="section-divider mx-12" />

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="relative py-28 px-6">
        <div className="absolute inset-0 dot-grid-bg opacity-20" />
        <div className="max-w-7xl mx-auto relative z-10">

          <div className="text-center mb-14 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-5 border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)]">
              <Key size={12} className="text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-mono uppercase tracking-wider font-semibold">KHEPRA Trust OS · One Protocol · Three Products</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4"
              style={{ fontFamily: 'Space Grotesk' }}>
              KHEPRA Trust OS (KTOS){' '}
              <span style={{ background: 'linear-gradient(135deg, #00d4ff, #4eaef5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Pricing
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every KTOS product runs on the same patent-pending KHEPRA Protocol. Pick the product that answers your question. Platform tiers activate instantly through Stripe. Enterprise and Sovereign deployments run air-gapped on your own bare metal.
            </p>
          </div>

          {/* ── Product family tree ── */}
          <div id="ktos-family" className="mb-16 reveal">
            <div className="mx-auto max-w-md text-center rounded-xl border border-[rgba(201,162,39,0.35)] bg-[rgba(201,162,39,0.06)] px-6 py-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#c9a227]">KHEPRA Protocol</div>
              <div className="text-[11px] text-slate-400 mt-1">Layer 1 · Patent-pending · USPTO #73565085</div>
            </div>
            <div className="mx-auto h-8 w-px bg-gradient-to-b from-[#c9a227] to-slate-700" />
            <div className="grid md:grid-cols-3 gap-5">
              {PRODUCTS.map(p => {
                const Icon = p.icon
                return (
                  <a key={p.key} href={`#product-${p.key}`}
                    className="group rounded-xl border bg-[rgba(15,20,32,0.6)] p-5 transition-all duration-300 hover:-translate-y-1"
                    style={{ borderColor: `${p.accent}55` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={16} style={{ color: p.accent }} />
                      <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: p.accent }}>{p.surface}</span>
                    </div>
                    <div className="font-bold text-white text-base" style={{ fontFamily: 'Space Grotesk' }}>{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">{p.domain}</div>
                    <div className="text-xs text-slate-300 italic mt-3">&ldquo;{p.question}&rdquo;</div>
                  </a>
                )
              })}
            </div>
          </div>

          {/* ── One section per product (separate buyer narratives) ── */}
          <div className="space-y-10 mb-16">
            {PRODUCTS.filter(p => p.tiers.length > 0).map(p => {
              const Icon = p.icon
              return (
                <div key={p.key} id={`product-${p.key}`}
                  className="rounded-2xl border p-6 lg:p-8 reveal bg-[rgba(10,14,24,0.7)]"
                  style={{ borderColor: `${p.accent}40` }}>
                  <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={18} style={{ color: p.accent }} />
                        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: p.accent }}>{p.surface} · {p.domain}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>{p.name}</h3>
                      <p className="text-sm text-slate-200 mb-1">&ldquo;{p.question}&rdquo;</p>
                      <p className="text-[11px] font-mono text-slate-500 mb-5">For: {p.buyer}</p>
                      <ul className="space-y-2">
                        {p.capabilities.map(c => (
                          <li key={c} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle size={12} className="mt-0.5 shrink-0" style={{ color: p.accent }} />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4 content-start">
                      {p.tiers.map(t => (
                        <div key={t.name} className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(15,20,32,0.8)] p-5 flex flex-col">
                          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">{t.name}</div>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk', color: p.accent }}>{t.price}</span>
                            <span className="text-xs text-slate-500">{t.suffix}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed flex-1">{t.note}</p>
                        </div>
                      ))}
                      <a href={p.ctaHref} target="_blank" rel="noopener noreferrer"
                        className="sm:col-span-2 block text-center py-3 px-4 rounded-lg font-semibold text-sm btn-cyan">
                        {p.cta}
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Product Surface 3: KTOS-MCP Master-Kernel license ladder ── */}
          <div id="product-mcp" className="text-center mb-8 reveal">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Cpu size={18} className="text-[#22c55e]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#22c55e]">Product Surface 3 · mcp.souhimbou.ai + MCP registries</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>KTOS-MCP Master-Kernel</h3>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              100 native tools, ML-DSA-65 post-quantum signing, SEKHEM L7 WAF prompt defense, and Windows Event Viewer logging. One license key unlocks the kernel from Community to Sovereign.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {TIERS.map((tier) => (
              <div key={tier.key}
                className={`rounded-xl border p-6 flex flex-col transition-all duration-300 reveal
                  ${tier.featured ? 'price-featured border-[rgba(0,212,255,0.35)]'
                    : tier.sovereign ? 'price-sovereign border-[rgba(201,162,39,0.35)]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[rgba(15,20,32,0.6)]'}`}>

                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`tier-badge px-3 py-1 rounded text-[10px] border
                    ${tier.featured ? 'text-[#00d4ff] border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)]'
                      : tier.sovereign ? 'text-[#c9a227] border-[rgba(201,162,39,0.3)] bg-[rgba(201,162,39,0.08)]'
                      : 'text-slate-500 border-slate-700 bg-transparent'}`}>
                    {tier.badge}
                  </span>
                  {tier.featured && (
                    <span className="text-[10px] text-[#00d4ff] font-mono">★ Recommended</span>
                  )}
                </div>

                <h3 className="font-bold text-white text-lg mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-black ${tier.featured ? 'text-[#00d4ff]' : tier.sovereign ? 'text-[#c9a227]' : 'text-white'}`}
                    style={{ fontFamily: 'Space Grotesk' }}>
                    {tier.price}
                  </span>
                  <span className="text-xs text-slate-500">{tier.suffix}</span>
                </div>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">{tier.tagline}</p>

                {/* Module pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {tier.modules.map(m => (
                    <span key={m} className={`text-[10px] px-2 py-0.5 rounded font-mono
                      ${tier.featured ? 'bg-[rgba(0,212,255,0.08)] text-[#00d4ff]'
                        : tier.sovereign ? 'bg-[rgba(201,162,39,0.08)] text-[#c9a227]'
                        : 'bg-[rgba(255,255,255,0.05)] text-slate-400'}`}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle size={12} className={`mt-0.5 shrink-0 ${tier.featured ? 'text-[#00d4ff]' : tier.sovereign ? 'text-[#c9a227]' : 'text-[#22c55e]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {(tier as any).gated ? (
                  <div className="flex flex-col gap-2 mt-auto">
                    <a href={tier.ctaHref}
                      className={`block text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200
                        ${tier.sovereign ? 'btn-gold' : 'btn-ghost'}`}>
                      ✉ Email Sales
                    </a>
                    <a href="https://calendly.com/cybersouhimbou"
                      target="_blank" rel="noopener noreferrer"
                      className={`block text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200
                        ${tier.sovereign ? 'btn-cyan' : 'btn-cyan'}`}>
                      📅 Book a Call
                    </a>
                  </div>
                ) : (
                  <a href={tier.ctaHref}
                    target={tier.ctaHref.startsWith('http') ? '_blank' : undefined}
                    rel={tier.ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`block text-center py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200
                      ${tier.featured ? 'btn-cyan'
                        : tier.sovereign ? 'btn-gold'
                        : 'btn-ghost'}`}>
                    {tier.cta}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Advisory note */}
          <div className="mt-8 glass rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 reveal border border-[rgba(239,68,68,0.25)]">
            <div className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">Remediation Advisory &amp; Diagnostic Session (100% Credited to Pilot)</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Book a 1-on-1 session with founder Souhimbou &quot;Cyber&quot; Doh Kone (Army Signal Corps 25S SATCOM) or order the full Godfather Report walkthrough + SPRS projection.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <a href="https://buy.stripe.com/5kQ00j17I4oW0cPdrR9ws01"
                target="_blank" rel="noopener noreferrer"
                className="btn-cyan text-xs py-2 px-4 whitespace-nowrap text-center">
                💳 Buy 1-Hr Session ($150)
              </a>
              <a href="https://calendly.com/cybersouhimbou"
                target="_blank" rel="noopener noreferrer"
                className="btn-ghost text-xs py-2 px-4 whitespace-nowrap text-center">
                📅 Book Directly
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-12" />

      {/* ── COMPANY / SOCIAL PROOF ───────────────────────────────── */}
      <section id="company" className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: About */}
            <div className="reveal">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-[rgba(201,162,39,0.15)]">
                <span className="text-xs text-slate-400 font-mono">About NouchiX</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-6"
                style={{ fontFamily: 'Space Grotesk' }}>
                Built by a Veteran.
                <br />
                <span style={{ color: '#c9a227' }}>Engineered for Proof.</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong>SecRed Knowledge Inc. d/b/a NouchiX</strong> is a Service-Disabled
                Veteran-Owned Small Business (SDVOSB) founded by Army Signal Corps Sergeant
                Souhimbou &ldquo;Cyber&rdquo; Doh Kone — 25S SATCOM, active Secret clearance,
                M.S. Digital Forensics & Cybersecurity (NSA CAE-CDE).
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The KHEPRA Protocol (USPTO #73565085) is the sovereign trust kernel under every
                NouchiX product. It is never sold directly — it is the moat.
              </p>

              {/* Creds */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'SDVOSB', val: 'EIN 99-0529252' },
                  { label: 'Clearance', val: 'Active Secret' },
                  { label: 'Patent', val: 'USPTO #73565085' },
                  { label: 'Recognition', val: 'F6S Top 10 Finalist' },
                ].map(c => (
                  <div key={c.label} className="module-card p-4">
                    <div className="text-[10px] text-slate-500 font-mono mb-1">{c.label}</div>
                    <div className="text-sm font-semibold text-white">{c.val}</div>
                  </div>
                ))}
              </div>

              {/* MCP registry links */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-mono mb-2">MCP Registry Listings</p>
                {[
                  { label: 'Smithery.ai', href: 'https://smithery.ai/servers/skone/pqc-khepra-mcp' },
                  { label: 'MCP Registry (Anthropic)', href: 'https://registry.modelcontextprotocol.io/?q=khepra' },
                  { label: 'mcpservers.org', href: 'https://mcpservers.org/servers/nouchix/pqc-khepra-mcp' },
                  { label: 'Live Endpoint', href: 'https://mcp.souhimbou.ai/' },
                ].map(l => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#00d4ff] transition-colors font-mono">
                    <ChevronRight size={12} className="text-[#00d4ff]" />
                    {l.label}
                    <ExternalLink size={10} className="opacity-50" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right: SouHimBou + media */}
            <div className="space-y-6 reveal">
              {/* SouHimBou hero */}
              <div className="relative glass rounded-2xl p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,212,255,0.03)] to-transparent" />
                <Image src="/souhimbou-standalone.png" alt="I AM SOUHIMBOU — The AI Security Architect"
                  width={220} height={220} className="mx-auto mb-4 relative z-10" />
                <h3 className="font-black text-white text-xl mb-1 relative z-10"
                  style={{ fontFamily: 'Space Grotesk' }}>
                  I AM SOUHIMBOU
                </h3>
                <p className="text-xs text-[#00d4ff] font-mono relative z-10">
                  The AI Security Architect For Your Agentic SOC · KTOS Agentic SOC
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 relative z-10">
                  {['$0 Free (Community)', '$499/mo Platform', '$2,999/mo Enterprise', '$45K–$250K Sovereign'].map(t => (
                    <span key={t} className="text-[10px] px-3 py-1 rounded-full border border-[rgba(0,212,255,0.2)] text-slate-300 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Launch poster teaser */}
              <div className="glass rounded-xl overflow-hidden relative">
                <Image src="/khepra-launch-poster.jpg" alt="KHEPRA Protocol Launch"
                  width={600} height={200} className="w-full h-40 object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80">
                  <div className="text-xs font-mono text-[#00d4ff] mb-1">THE WORLD&apos;S FIRST PQC-STIG</div>
                  <div className="text-sm font-bold text-white">AN ARMY SGT JUST SECURED AI AGENTS</div>
                  <div className="text-xs text-slate-400 mt-0.5">Harvest Now, Decrypt Later — not on our watch.</div>
                </div>
              </div>

              {/* Fit to Think podcast */}
              <div className="glass rounded-xl overflow-hidden">
                <Image src="/fit-to-think-banner.png" alt="Fit to Think — The Philosopher API Podcast"
                  width={600} height={120} className="w-full h-28 object-cover" />
                <div className="p-4">
                  <div className="text-xs font-mono text-[#c9a227] mb-1">EVERY THURSDAY</div>
                  <div className="text-sm font-bold text-white">Fit to Think — The Philosopher API</div>
                  <div className="text-xs text-slate-400 mt-1">Building in public. Showing capability, not the playbook.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-grid-bg opacity-30" />
        <div className="hero-blob-cyan" style={{ top: '20%', left: '30%', opacity: 0.6 }} />
        <div className="hero-blob-gold" style={{ bottom: '10%', right: '20%', opacity: 0.5 }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center reveal">
          <Image src="/asaf-badge.png" alt="Post-Quantum Certified" width={100} height={100}
            className="mx-auto mb-8 opacity-90" />
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6"
            style={{ fontFamily: 'Space Grotesk' }}>
            Ready to Prove It?
          </h2>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Schedule a sovereign demo. See your AI agent activity attested in real time.
            Get your SPRS score projection. Walk away with an assessment-ready evidence package.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="mailto:cybersouhimbou@secredknowledgeinc.tech?subject=KTOS%20Demo%20Request"
              className="btn-cyan inline-flex items-center gap-2 text-base px-8 py-4">
              Request a Demo <ArrowRight size={18} />
            </a>
            <a href="https://smithery.ai/servers/skone/pqc-khepra-mcp" target="_blank" rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 text-base px-8 py-4">
              Pull the MCP Server <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(0,212,255,0.06)] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Shield size={13} className="text-black" />
                </div>
                <span className="font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>NouchiX</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                SecRed Knowledge Inc. d/b/a NouchiX<br />
                169 Madison Ave Ste 2965<br />
                New York, NY 10016
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'adinkhepra.com',   href: 'https://adinkhepra.com' },
                  { label: 'souhimbou.ai',     href: 'https://souhimbou.ai' },
                  { label: 'mcp.souhimbou.ai', href: 'https://mcp.souhimbou.ai' },
                ].map(l => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-[#00d4ff] transition-colors font-mono">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 font-bold">Platform & Docs</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-xs text-[#00d4ff] hover:text-white font-semibold transition-colors">Authoritative Docs (STIGViewer)</Link></li>
                <li><a href="#cyberstryke" className="text-xs text-emerald-400 hover:text-white transition-colors">Internal Adversarial Tests (58/58 Blocked)</a></li>
                {['KTOS Attest', 'KTOS Scan', 'KTOS Comply', 'KTOS Guard', 'KTOS Heal', 'KTOS Passport'].map(m => (
                  <li key={m}><a href="#modules" className="text-xs text-slate-500 hover:text-white transition-colors">{m}</a></li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 font-bold">Products</h4>
              <ul className="space-y-2">
                {[
                  { label: 'KTOS CMMC Hub & Fleet Engine', href: 'https://adinkhepra.com' },
                  { label: 'KTOS Agentic SOC', href: 'https://souhimbou.ai' },
                  { label: 'KTOS-MCP Master-Kernel', href: 'https://mcp.souhimbou.ai' },
                  { label: 'KTOS Platform & Pricing', href: '#pricing' },
                ].map(l => (
                  <li key={l.label}>
                    <a href={l.href} className="text-xs text-slate-500 hover:text-white transition-colors">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4 font-bold">Legal & Standards</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>SOUHIMBOU DOH KONE LLC</li>
                <li>USPTO #73565085 (provisional)</li>
                <li>EIN 99-0529252 (SecRed)</li>
                <li className="pt-1 border-t border-slate-800">CNSA 2.0</li>
                <li>FIPS 203 (ML-KEM)</li>
                <li>FIPS 204 (ML-DSA)</li>
                <li>NIST SP 800-171 Rev 2/3</li>
                <li>CMMC 2.0 Level 2</li>
              </ul>
            </div>
          </div>

          {/* Sources Section */}
          <div id="sources" className="section-divider my-8" />
          <div className="mb-10 p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
              <span className="text-[#00d4ff]">Reference Sources</span> · Independent Research &amp; Legal Citations
            </h5>
            <ol className="space-y-2.5 text-xs text-slate-500 font-sans leading-relaxed">
              <li id="source-1" className="scroll-mt-24">
                <span className="font-mono text-slate-400 font-semibold">[1]</span> DigiCert, &ldquo;AI Trust Pulse&rdquo; (survey of 1,001 IT and security leaders, May 2026):{' '}
                <a href="https://www.digicert.com/content/dam/digicert/pdfs/report/ai-trust-pulse.pdf"
                   target="_blank" rel="noopener noreferrer"
                   className="text-slate-400 hover:text-[#00d4ff] underline break-all">
                  https://www.digicert.com/content/dam/digicert/pdfs/report/ai-trust-pulse.pdf
                </a>
              </li>
              <li id="source-2" className="scroll-mt-24">
                <span className="font-mono text-slate-400 font-semibold">[2]</span> Cloud Security Alliance / Token Security, &ldquo;Autonomous but Not Controlled: AI Agent Incidents Now Common in Enterprises&rdquo; (Apr 2026):{' '}
                <a href="https://cloudsecurityalliance.org/artifacts/autonomous-but-not-controlled-ai-agent-incidents-now-common-in-enterprises"
                   target="_blank" rel="noopener noreferrer"
                   className="text-slate-400 hover:text-[#00d4ff] underline break-all">
                  https://cloudsecurityalliance.org/artifacts/autonomous-but-not-controlled-ai-agent-incidents-now-common-in-enterprises
                </a>
              </li>
              <li id="source-3" className="scroll-mt-24">
                <span className="font-mono text-slate-400 font-semibold">[3]</span> U.S. Department of Justice FY2025 False Claims Act statistics, as summarized by Norton Rose Fulbright (2026):{' '}
                <a href="https://www.dataprotectionreport.com/?p=6772"
                   target="_blank" rel="noopener noreferrer"
                   className="text-slate-400 hover:text-[#00d4ff] underline break-all">
                  https://www.dataprotectionreport.com/?p=6772
                </a>
              </li>
              <li id="source-4" className="scroll-mt-24">
                <span className="font-mono text-slate-400 font-semibold">[4]</span> Merrill Research / CyberSheath, DIB cybersecurity study &ldquo;More Than 87% of Pentagon Supply Chain Fails Basic Cybersecurity Minimums&rdquo; (2022):{' '}
                <a href="https://www.businesswire.com/news/home/20221130005061/en/More-than-87-of-Pentagon-Supply-Chain-Fails-Basic-Cybersecurity-Minimums"
                   target="_blank" rel="noopener noreferrer"
                   className="text-slate-400 hover:text-[#00d4ff] underline break-all">
                  https://www.businesswire.com/news/home/20221130005061/en/More-than-87-of-Pentagon-Supply-Chain-Fails-Basic-Cybersecurity-Minimums
                </a>
              </li>
            </ol>
          </div>

          {/* Bottom bar */}
          <div className="section-divider mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-mono">
              © 2026 SOUHIMBOU DOH KONE LLC · Exclusively licensed to SecRed Knowledge Inc. d/b/a NouchiX
            </div>
            <div className="flex items-center gap-4">
              <span className="tier-badge text-[10px] text-slate-600">SDVOSB · Army Signal Corps</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }} />
                <span className="text-[10px] text-slate-500 font-mono">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
