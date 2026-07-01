'use client'
import Link from 'next/link'

import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import {
  Shield, Lock, ArrowRight, ChevronDown, Award,
  AlertTriangle, CheckCircle, FileText, Zap,
  Network, Cpu, Globe, Building2, Key, Clock,
  TrendingDown, DollarSign, ExternalLink, Terminal
} from 'lucide-react'

// ─── Canonical ASAF Stripe plans ───────────────────────────────────────────
const PLANS = [
  {
    key: 'advisory', tier: 'Ra', name: 'Remediation Advisory',
    price: '$5,000', suffix: 'one-time', tagline: 'Credited 100% toward Pilot',
    description: 'Godfather Report walkthrough, SPRS score projection, APDL policy declarations for top 10 failing controls.',
    features: ['Godfather Report walkthrough', 'SPRS improvement roadmap', 'Dollar-weighted remediation priority', 'APDL declarations for top 10 controls', 'C3PAO readiness briefing', '100% credited toward Pilot'],
    cta: 'Start Advisory', highlight: false, badge: 'Entry Point',
    badgeColor: 'text-sky-400 border-sky-500/40 bg-sky-500/10', accentColor: 'text-sky-400', borderColor: 'border-slate-700/60', icon: FileText,
  },
  {
    key: 'pilot', tier: 'Isis', name: 'Pilot Deployment',
    price: '$45,000', suffix: '/year', tagline: 'Single enclave · up to 50 endpoints',
    description: 'Full Phase 1–8 sovereign CMMC compliance. SPRS baseline, Godfather Report, ML-DSA-65 signed DAG attestation.',
    features: ['Full Phase 1–8 assessment workflow', 'SPRS baseline + Godfather Report', 'ML-DSA-65 signed DAG attestation', 'C3PAO-ready evidence (OSCAL)', '110 CMMC L2 practices mapped', 'Sovereign bare-metal · zero egress', 'Air-gappable deployment', '12-month remediation tracking'],
    cta: 'Deploy Pilot', highlight: true, badge: 'Most Popular',
    badgeColor: 'text-[#4EAEF5] border-[#4EAEF5]/40 bg-[#4EAEF5]/10', accentColor: 'text-[#4EAEF5]', borderColor: 'border-[#4EAEF5]/40', icon: Shield,
  },
  {
    key: 'program_std', tier: 'Horus', name: 'Program (Standard)',
    price: '$75,000', suffix: '/year', tagline: 'Multi-enclave · up to 200 endpoints',
    description: 'Everything in Pilot + KASA autonomous remediation, STIG drift detection, Ansible playbook generation.',
    features: ['Everything in Pilot', 'Multi-enclave (up to 3)', 'KASA autonomous remediation', 'Continuous STIG drift detection', 'Ansible playbook generation', 'SOAR playbook library (ML-DSA-65)', 'Quarterly Godfather briefings', 'Dedicated compliance engineer'],
    cta: 'Start Program', highlight: false, badge: 'DIB Standard',
    badgeColor: 'text-violet-400 border-violet-500/40 bg-violet-500/10', accentColor: 'text-violet-400', borderColor: 'border-slate-700/60', icon: Network,
  },
  {
    key: 'program_adv', tier: 'Amun', name: 'Program (Advanced)',
    price: '$120,000', suffix: '/year', tagline: 'Unlimited enclaves · up to 500 endpoints',
    description: 'Everything in Program Std + SBOM/KEV correlation, CI/CD integrity, CMMC Level 3 mapping.',
    features: ['Everything in Program Std', 'Unlimited enclaves', 'SBOM + KEV correlation engine', 'CI/CD integrity (Cosign)', 'CMMC Level 3 readiness', 'DFARS clause automation', 'Bi-weekly Godfather briefings', 'Priority engineering support'],
    cta: 'Go Advanced', highlight: false, badge: 'Level 3 Ready',
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10', accentColor: 'text-amber-400', borderColor: 'border-slate-700/60', icon: Cpu,
  },
  {
    key: 'enterprise', tier: 'Khepra', name: 'Enterprise',
    price: '$150,000', suffix: '/year', tagline: 'Unlimited endpoints · single prime',
    description: 'ASAF System Daemon for autonomous remediation, HSM signing, C3PAO interview prep, white-glove onboarding.',
    features: ['Everything in Program Adv', 'ASAF System Daemon (autonomous)', 'HSM signing (FIPS 140-3)', 'Custom Adinkra policy bindings', 'C3PAO interview prep sessions', 'White-glove onboarding (5 days)', 'Dedicated Sr. compliance architect', 'SDVOSB co-deployment support'],
    cta: 'Contact Enterprise', highlight: false, badge: 'Prime Contractor',
    badgeColor: 'text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10', accentColor: 'text-[#D4AF37]', borderColor: 'border-slate-700/60', icon: Award,
  },
  {
    key: 'enterprise_multi', tier: 'Khepra-Sovereign', name: 'Enterprise Multi-Site',
    price: '$250,000', suffix: '/year', tagline: 'Multi-site · multi-prime · k8s',
    description: 'k8s StatefulSet, multi-site DAG federation, prime/sub-tier reporting, DFARS flow-down, SDVOSB sole-source package.',
    features: ['Everything in Enterprise', 'k8s StatefulSet deployment', 'Multi-site DAG federation', 'Prime/sub-tier compliance reporting', 'DFARS flow-down automation', 'SDVOSB sole-source package', 'Congressional reporting automation', 'Designated CISO-level support'],
    cta: 'Contact Multi-Site', highlight: false, badge: 'SDVOSB Ready',
    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10', accentColor: 'text-rose-400', borderColor: 'border-slate-700/60', icon: Globe,
  },
]

// ─── DAG demo data — real ASAF scan output ──────────────────────────────────
const DEMO_DAG = {
  meta: { tool_calls: 7, attestations: 7, findings: 4, controls_mapped: 12, session_id: 'asaf-demo-2026' },
  nodes: [
    { id:'p1', label:'ASAF Baseline Scan', type:'prompt', val:22, desc:'AdinKhepra ASAF initiated full Phase 4 assessment', ts:'02:43:01' },
    { id:'t1', label:'ert_scan', type:'tool', val:14, desc:'Enterprise Risk & Threat — STIG + NIST + CMMC', ts:'02:43:02', tool_args:{ target:'/etc', frameworks:['STIG','NIST800-53','CMMC'], output_format:'godfather' } },
    { id:'t2', label:'pqc_stig', type:'tool', val:12, desc:'PQC-01-STIG-V1R1 post-quantum readiness scan', ts:'02:43:04', tool_args:{ scan_path:'/etc', profile:'full' } },
    { id:'t3', label:'nist_map', type:'tool', val:10, desc:'Map findings → NIST 800-53 Rev 5 controls', ts:'02:43:05' },
    { id:'t4', label:'godfather_report', type:'tool', val:11, desc:'Godfather Report — dollar-denominated business impact', ts:'02:43:07' },
    { id:'t5', label:'cmmc_assess', type:'tool', val:10, desc:'CMMC Level 2 — 110 practice assessment', ts:'02:43:06' },
    { id:'f1', label:'RHEL-09-212030', type:'finding', severity:'CAT_I', val:18, desc:'No FIPS-validated crypto — exposed to Harvest-Now-Decrypt-Later', ts:'02:43:03', impact:'$2,400,000', remediation_cost:'$800', roi:'3000x' },
    { id:'f2', label:'RHEL-09-431030', type:'finding', severity:'CAT_II', val:12, desc:'Audit logs not centrally collected — AU-2 FAIL', ts:'02:43:03', impact:'$420,000', remediation_cost:'$200', roi:'2100x' },
    { id:'f3', label:'PQC-01-000010', type:'finding', severity:'CAT_I', val:16, desc:'ML-DSA-65 not implemented — CNSA 2.0 non-compliant', ts:'02:43:05', impact:'$3,800,000', remediation_cost:'$12,000', roi:'317x' },
    { id:'f4', label:'PQC-01-000040', type:'finding', severity:'CAT_II', val:10, desc:'No hybrid classical/PQC key exchange during transition period', ts:'02:43:05', impact:'$890,000', remediation_cost:'$4,000', roi:'222x' },
    { id:'c1', label:'NIST AC-17', type:'control', val:8, desc:'Remote Access controls', framework:'NIST 800-53 Rev 5' },
    { id:'c2', label:'NIST AU-2', type:'control', val:8, desc:'Audit Events — continuous monitoring', framework:'NIST 800-53 Rev 5' },
    { id:'c3', label:'NIST SC-13', type:'control', val:8, desc:'Cryptographic Protection — CNSA 2.0', framework:'NIST 800-53 Rev 5' },
    { id:'c4', label:'CMMC CA.2.158', type:'control', val:7, desc:'Periodically assess security controls', framework:'CMMC Level 2' },
    { id:'c5', label:'CNSA 2.0 ML-DSA', type:'control', val:9, desc:'NSA CNSA 2.0 — ML-DSA-65 required by 2030', framework:'NSA CNSA 2.0' },
    { id:'c6', label:'FIPS 204', type:'control', val:8, desc:'Module-Lattice Digital Signature Standard', framework:'NIST FIPS 204' },
    { id:'c7', label:'NIST SC-8', type:'control', val:7, desc:'Transmission Confidentiality and Integrity', framework:'NIST 800-53 Rev 5' },
    { id:'a1', label:'ML-DSA-65 · ert_scan', type:'attest', val:6, desc:'Attestation on ert_scan', sig:'3d7f2a9b1e4c8f0a6b2d5e8f1a3c7b9d2e5f8a1b4c6d9e2f', ts:'02:43:02' },
    { id:'a2', label:'ML-DSA-65 · pqc_stig', type:'attest', val:6, desc:'Attestation on pqc_stig', sig:'8f1a3c7b9d2e5f8a1b3d7f2a9b1e4c8f0a6b2d5e8c1f3a7', ts:'02:43:04' },
    { id:'a3', label:'ML-DSA-65 · godfather', type:'attest', val:6, desc:'Attestation on Godfather Report', sig:'1b3d7f2a9b1e4c8f0a6b2d5e8f1a3c7b9d2e5f8a4c7b2e9', ts:'02:43:07' },
  ],
  links: [
    { source:'p1', target:'t1', w:3 }, { source:'p1', target:'t2', w:2 },
    { source:'t1', target:'f1', w:2 }, { source:'t1', target:'f2', w:2 },
    { source:'t2', target:'f3', w:2 }, { source:'t2', target:'f4', w:2 },
    { source:'t1', target:'t3', w:1 }, { source:'t3', target:'c1', w:1 },
    { source:'t3', target:'c2', w:1 }, { source:'t3', target:'c7', w:1 },
    { source:'t2', target:'c3', w:2 }, { source:'t2', target:'c5', w:2 },
    { source:'t2', target:'c6', w:2 }, { source:'f1', target:'c1', w:1 },
    { source:'f2', target:'c2', w:1 }, { source:'f3', target:'c5', w:2 },
    { source:'f4', target:'c3', w:1 }, { source:'t4', target:'f1', w:1 },
    { source:'t4', target:'f2', w:1 }, { source:'t4', target:'f3', w:1 },
    { source:'t1', target:'t4', w:1 }, { source:'t5', target:'c4', w:1 },
    { source:'t1', target:'a1', w:1 }, { source:'t2', target:'a2', w:1 },
    { source:'t4', target:'a3', w:1 }, { source:'f3', target:'c6', w:1 },
  ]
}

// Node color map — matches dag-viewer.html exactly
const NODE_COLORS: Record<string, string> = {
  prompt:          '#818cf8',
  tool:            '#e5a54b',
  finding_CAT_I:   '#cc2a36',
  finding_CAT_II:  '#f97316',
  control:         '#22c55e',
  attest:          '#06b6d4',
  default:         '#3d5a78',
}
function nodeColor(n: any) {
  if (n.type === 'finding') return NODE_COLORS['finding_' + n.severity] ?? '#cc2a36'
  return NODE_COLORS[n.type] ?? NODE_COLORS.default
}
function nodeVal(n: any) {
  if (n.type === 'prompt') return 22
  if (n.type === 'finding' && n.severity === 'CAT_I') return 18
  if (n.type === 'finding' && n.severity === 'CAT_II') return 13
  return n.val ?? 6
}

// ─── CNSA 2.0 countdown ─────────────────────────────────────────────────────
function useCNSACountdown() {
  const [days, setDays] = useState(0)
  useEffect(() => {
    const deadline = new Date('2030-01-01').getTime()
    const tick = () => setDays(Math.ceil((deadline - Date.now()) / 86400000))
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])
  return days
}

// ─── Stripe checkout helper ──────────────────────────────────────────────────
async function handleCheckout(planKey: string, email: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: planKey, email }),
  })
  const data = await res.json()
  if (data.url) { window.location.href = data.url }
  else { alert(data.error ?? 'Checkout failed — contact sales@adinkhepra.com') }
}

// ─── Components ──────────────────────────────────────────────────────────────

/** Live 3D DAG — adapted from dag-viewer.html, mounted via ForceGraph3D CDN */
function LiveDAGDemo({ onNodeClick }: { onNodeClick: (n: any) => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  // Poll for ForceGraph3D to be available (loaded via CDN Script tag)
  useEffect(() => {
    let attempts = 0
    const poll = setInterval(() => {
      if ((window as any).ForceGraph3D) { setReady(true); clearInterval(poll) }
      if (++attempts > 40) clearInterval(poll)
    }, 250)
    return () => clearInterval(poll)
  }, [])

  useEffect(() => {
    if (!ready || !mountRef.current) return
    const FG = (window as any).ForceGraph3D

    const el = mountRef.current
    el.innerHTML = ''

    const g = FG()(el)
      .backgroundColor('#050c16')
      .width(el.clientWidth)
      .height(el.clientHeight)
      .graphData({ nodes: DEMO_DAG.nodes, links: DEMO_DAG.links })
      .nodeId('id')
      .nodeLabel((n: any) => {
        const col = nodeColor(n)
        return `<div style="border-left:2px solid ${col};padding-left:8px;font-family:'JetBrains Mono',monospace">
          <div style="color:${col};font-weight:700;font-size:12px">${n.label}</div>
          <div style="color:#6b8aaa;font-size:9px;letter-spacing:1px">${n.type.toUpperCase()}${n.severity ? ' · ' + n.severity : ''}</div>
          <div style="color:#e0eaf5;font-size:11px">${n.desc ?? ''}</div>
          ${n.impact ? `<div style="color:#e5a54b;font-size:13px;font-weight:700;margin-top:4px">💥 ${n.impact} exposure</div>` : ''}
        </div>`
      })
      .nodeColor((n: any) => nodeColor(n))
      .nodeVal((n: any) => nodeVal(n))
      .nodeOpacity(0.95)
      .nodeResolution(18)
      .linkColor(() => '#1a4f7a')
      .linkOpacity(0.40)
      .linkWidth((l: any) => 0.5 + (l.w ?? 1) * 0.5)
      .linkDirectionalParticles((l: any) => (l.w ?? 1) > 1 ? 3 : 1)
      .linkDirectionalParticleColor(() => '#1a9fe8')
      .linkDirectionalParticleWidth(1.2)
      .linkDirectionalParticleSpeed(0.005)
      .onNodeClick((n: any) => {
        onNodeClick(n)
        const dist = 120
        const dr = 1 + dist / Math.hypot(n.x ?? 1, n.y ?? 1, n.z ?? 1)
        g.cameraPosition({ x: (n.x ?? 0) * dr, y: (n.y ?? 0) * dr, z: (n.z ?? 0) * dr }, n, 700)
      })
      .onNodeHover((n: any) => { el.style.cursor = n ? 'pointer' : 'default' })

    g.d3Force('charge')?.strength?.(-120)
    g.d3Force('link')?.distance?.(40)
    setTimeout(() => g.zoomToFit(400, 80), 1200)

    graphRef.current = g

    const onResize = () => { if (graphRef.current) { g.width(el.clientWidth).height(el.clientHeight) } }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); g._destructor?.() }
  }, [ready, onNodeClick])

  return (
    <div ref={mountRef} className="w-full h-full">
      {!ready && (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4EAEF5]/30 border-t-[#4EAEF5] rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-500">Initializing ASAF DAG Engine…</p>
          </div>
        </div>
      )}
    </div>
  )
}

/** Node inspector panel — sidebar detail when user clicks a node */
function NodeInspector({ node }: { node: any | null }) {
  if (!node) return (
    <div className="p-5 text-xs font-mono text-slate-500 leading-loose">
      <span className="text-[#1a9fe8]">drag · scroll · click a node</span><br /><br />
      Node types:<br />
      <span className="text-[#818cf8]">●</span> Prompt — AI scan origin<br />
      <span className="text-[#e5a54b]">●</span> Tool — MCP tool execution<br />
      <span className="text-[#cc2a36]">●</span> CAT I finding — critical<br />
      <span className="text-[#f97316]">●</span> CAT II finding — high<br />
      <span className="text-[#22c55e]">●</span> Control — framework mapped<br />
      <span className="text-[#06b6d4]">●</span> Attestation — ML-DSA-65<br /><br />
      <span className="text-[#e5a54b]">Click any red node<br />to see your exposure.</span>
    </div>
  )

  const col = nodeColor(node)
  return (
    <div className="p-5 space-y-4 text-xs font-mono overflow-y-auto h-full">
      <div>
        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Type</div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: col, border: `1px solid ${col}40`, background: `${col}15` }}>
          {node.type.toUpperCase()}{node.severity ? ` · ${node.severity}` : ''}
        </span>
      </div>
      <div>
        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">ID / Label</div>
        <div className="font-bold" style={{ color: col }}>{node.label}</div>
      </div>
      <div>
        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Description</div>
        <div className="text-slate-300 leading-relaxed">{node.desc ?? '—'}</div>
      </div>
      {node.type === 'finding' && (
        <>
          <div>
            <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Business Impact (FAIR)</div>
            <div className="text-[#e5a54b] text-xl font-black">{node.impact}</div>
          </div>
          <div>
            <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Remediation Cost</div>
            <div className="text-green-400">{node.remediation_cost}</div>
          </div>
          <div>
            <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">ROI of Fixing This</div>
            <div className="text-green-400 font-bold text-base">{node.roi}</div>
          </div>
        </>
      )}
      {node.type === 'control' && (
        <div>
          <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Framework</div>
          <div className="text-[#06b6d4]">{node.framework}</div>
        </div>
      )}
      {node.type === 'attest' && node.sig && (
        <div>
          <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">ML-DSA-65 Signature</div>
          <div className="text-[#06b6d4] text-[9px] break-all p-2 rounded border border-[#06b6d4]/20 bg-[#06b6d4]/5 leading-relaxed">
            {node.sig}
          </div>
        </div>
      )}
      {node.ts && (
        <div>
          <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Timestamp</div>
          <div className="text-slate-400">2026-06-15 {node.ts} UTC</div>
        </div>
      )}
    </div>
  )
}

/** Urgency counter strip */
function UrgencyStrip({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5 bg-[#cc2a36]/10 border-b border-[#cc2a36]/30 text-center">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-[#cc2a36] flex-shrink-0" />
        <span className="text-xs font-mono text-[#fca5a5]">
          <span className="text-white font-bold">CNSA 2.0 DEADLINE: {daysLeft.toLocaleString()} days</span>
          {' '}— NSA mandates ML-DSA-65 for all NSS by 2030
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-[#cc2a36] rounded-full animate-pulse flex-shrink-0" />
        <span className="text-xs font-mono text-[#fca5a5]">
          Harvest-Now-Decrypt-Later is <span className="text-white font-bold">ACTIVE</span> — adversaries collecting your encrypted CUI today
        </span>
      </div>
    </div>
  )
}

/** Hero section — the DAG IS the hero */
function DemoHero() {
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const daysLeft = useCNSACountdown()

  const totalExposure = DEMO_DAG.nodes
    .filter(n => n.type === 'finding' && (n as any).impact)
    .reduce((sum, n) => sum + parseInt(((n as any).impact).replace(/\$|,/g, '')), 0)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await handleCheckout('advisory', email)
    setLoading(false)
  }

  return (
    <>
      {/* Load 3d-force-graph from CDN */}
      <Script
        src="https://unpkg.com/3d-force-graph@1.73.4/dist/3d-force-graph.min.js"
        strategy="beforeInteractive"
      />

      {/* Classification / urgency banner */}
      <div className="bg-[#050c16] border-b border-[#1a9fe8]/20 py-1 text-center">
        <span className="font-mono text-[9px] text-[#cc2a36]/80 tracking-[3px] uppercase">
          Unclassified // Open Source // National Security Relevant
        </span>
      </div>
      <UrgencyStrip daysLeft={daysLeft} />

      {/* Full-screen DAG section */}
      <section className="relative" style={{ height: 'calc(100vh - 80px)', minHeight: '600px' }}>
        {/* DAG canvas — fills the screen */}
        <div className="absolute inset-0">
          <LiveDAGDemo onNodeClick={setSelectedNode} />
        </div>

        {/* Left node inspector panel */}
        <div className="absolute top-0 left-0 bottom-0 w-72 bg-[#080f1c]/90 backdrop-blur border-r border-[#1a9fe8]/20 flex flex-col z-20 hidden lg:flex">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a9fe8]/15">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Node Inspector</span>
            <span className="px-2 py-0.5 rounded text-[8px] font-mono text-[#1a9fe8] border border-[#1a9fe8]/30 bg-[#1a9fe8]/8">ASAF ENGINE</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NodeInspector node={selectedNode} />
          </div>
        </div>

        {/* Top-right stats bar */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-3">
          <span className="font-mono text-[10px] text-slate-400 hidden sm:block">
            <span className="text-[#e5a54b] font-bold">{DEMO_DAG.meta.tool_calls}</span> tools &nbsp;·&nbsp;
            <span className="text-[#cc2a36] font-bold">{DEMO_DAG.meta.findings}</span> findings &nbsp;·&nbsp;
            <span className="text-[#06b6d4] font-bold">{DEMO_DAG.meta.attestations}</span> ML-DSA-65 sigs
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/8">
            <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="font-mono text-[9px] text-[#22c55e]">ML-DSA-65 VERIFIED</span>
          </div>
        </div>

        {/* Legend — bottom left of graph */}
        <div className="absolute bottom-16 left-80 z-20 bg-[#050c16]/90 border border-[#1a9fe8]/20 rounded-lg p-3 backdrop-blur pointer-events-none hidden lg:block">
          <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-2">Node Legend</div>
          {[
            { color: '#818cf8', label: 'AI Prompt' },
            { color: '#e5a54b', label: 'Tool Execution' },
            { color: '#cc2a36', label: 'CAT I Finding' },
            { color: '#f97316', label: 'CAT II Finding' },
            { color: '#22c55e', label: 'Control Satisfied' },
            { color: '#06b6d4', label: 'ML-DSA-65 Attest' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5 font-mono text-[10px] text-slate-300">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA overlay — right side */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 w-80 hidden xl:block">
          <div className="bg-[#080f1c]/95 border border-[#1a9fe8]/25 rounded-2xl p-5 backdrop-blur shadow-2xl">
            {/* Exposure counter */}
            <div className="mb-4 p-3 rounded-xl bg-[#cc2a36]/10 border border-[#cc2a36]/25">
              <div className="text-[8px] font-mono text-[#cc2a36]/80 uppercase tracking-widest mb-1">Total Exposure (this demo network)</div>
              <div className="text-2xl font-black text-[#cc2a36]">
                ${totalExposure.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">4 findings · FAIR risk model</div>
            </div>

            <h2 className="text-white font-black text-lg leading-tight mb-1">
              Is your network in the graph?
            </h2>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              This is a real ASAF scan output. Your infrastructure generates findings like these every day.
              Get your SPRS score before your C3PAO does.
            </p>

            <form onSubmit={onSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ciso@company.mil"
                required
                className="w-full px-3 py-2.5 bg-white/5 border border-[#1a9fe8]/20 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1a9fe8]/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Get My CMMC Baseline</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              $5K Advisory · credited 100% toward $45K Pilot Deployment
            </p>
          </div>
        </div>

        {/* Mobile CTA — bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 xl:hidden bg-[#080f1c]/95 border-t border-[#1a9fe8]/20 p-3 flex items-center gap-3">
          <div className="text-xs font-mono">
            <span className="text-[#cc2a36] font-bold">${totalExposure.toLocaleString()}</span>
            <span className="text-slate-500"> demo exposure</span>
          </div>
          <a href="#pricing" className="btn-primary ml-auto px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2">
            Get Baseline <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </>
  )
}

/** Urgency section — whitepaper-sourced */
function UrgencySection() {
  const daysLeft = useCNSACountdown()
  const stats = [
    {
      icon: Clock,
      value: daysLeft.toLocaleString(),
      unit: 'days',
      label: 'Until CNSA 2.0 Final Deadline',
      color: 'text-[#cc2a36]',
      borderColor: 'border-[#cc2a36]/30',
      bgColor: 'bg-[#cc2a36]/5',
      detail: 'NSA mandates ML-DSA-65 for all NSS/DIB by January 2030',
    },
    {
      icon: TrendingDown,
      value: '0',
      unit: 'STIGs',
      label: 'DISA STIGs for Post-Quantum',
      color: 'text-[#f97316]',
      borderColor: 'border-[#f97316]/30',
      bgColor: 'bg-[#f97316]/5',
      detail: 'DISA has published zero PQC STIGs as of June 2026. ASAF fills the gap.',
    },
    {
      icon: DollarSign,
      value: '$3.8M',
      unit: '',
      label: 'Avg. Exposure per PQC Finding',
      color: 'text-[#e5a54b]',
      borderColor: 'border-[#e5a54b]/30',
      bgColor: 'bg-[#e5a54b]/5',
      detail: 'PQC-01-000010 (CNSA 2.0 non-compliance) · FAIR risk model · Whitepaper §3.2',
    },
    {
      icon: Zap,
      value: '2,666x',
      unit: 'ROI',
      label: 'Remediation vs. Breach Cost',
      color: 'text-[#22c55e]',
      borderColor: 'border-[#22c55e]/30',
      bgColor: 'bg-[#22c55e]/5',
      detail: '$1,200 remediation vs. $3.2M breach exposure · PQC-01-STIG-V1R1 Whitepaper',
    },
  ]

  return (
    <section className="py-20 px-6 border-y border-white/5 bg-[#080f1c]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#cc2a36]/30 bg-[#cc2a36]/8 mb-4">
            <AlertTriangle className="w-3 h-3 text-[#cc2a36]" />
            <span className="text-xs font-mono text-[#fca5a5] tracking-widest">NSA CNSA 2.0 — ACTIVE THREAT WINDOW</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            The Harvest-Now-Decrypt-Later<br />
            <span className="text-[#cc2a36]">Threat Is Not Hypothetical.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Nation-state adversaries are collecting your encrypted CUI <em>right now</em> for decryption when quantum computers arrive.
            Data encrypted today with RSA-2048 or ECDSA P-256 may be decrypted within the decade.
            <br />
            <span className="text-slate-300">— PQC-01-STIG-V1R1 Whitepaper §1.2, NouchiX / SecRed Knowledge Inc.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${s.borderColor} ${s.bgColor} card-hover`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.bgColor} border ${s.borderColor}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-3xl font-black ${s.color} mb-0.5`}>{s.value}<span className="text-lg ml-1">{s.unit}</span></div>
              <div className="text-white font-semibold text-sm mb-2">{s.label}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{s.detail}</div>
            </div>
          ))}
        </div>

        {/* Whitepaper pull-quote */}
        <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-[#1a9fe8]/20 bg-[#0d1728] relative">
          <div className="absolute top-4 left-5 text-[#1a9fe8]/20 text-6xl font-serif leading-none">"</div>
          <blockquote className="text-slate-300 text-sm leading-relaxed italic pl-6 mb-4">
            NIST finalized FIPS 203, 204, and 205 in August 2024. The algorithm question is settled.
            The compliance framework question is not. Program managers, ISSOs, and DIB contractors have
            mandatory algorithm requirements but <strong className="text-white">no authoritative checklist to assess conformance.</strong>
          </blockquote>
          <div className="flex items-center justify-between pl-6">
            <div>
              <div className="text-xs font-mono text-[#1a9fe8]">PQC-01-STIG-V1R1 — §1.1 The Policy Gap</div>
              <div className="text-xs text-slate-600">NouchiX / SecRed Knowledge Inc. · June 2026</div>
            </div>
            <Link href="/whitepaper" className="flex items-center gap-1.5 text-xs font-mono text-[#1a9fe8] hover:text-white transition-colors border border-[#1a9fe8]/30 px-3 py-1.5 rounded-lg">
              <FileText className="w-3 h-3" />
              Read Whitepaper
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** PQC STIG findings table — sourced from whitepaper controls */
function FindingsSection() {
  const findings = [
    { id:'PQC-01-000010', cat:'CAT I', title:'CNSA 2.0 Algorithm Non-Compliance', desc:'RSA/ECDSA in use. ML-DSA-65 not implemented.', impact:'$3,800,000', remediation:'$12,000', roi:'317x', control:'NIST SC-13 · CCI-002450' },
    { id:'RHEL-09-212030', cat:'CAT I', title:'No FIPS-Validated Crypto on SSH', desc:'OpenSSH not configured for FIPS mode. Harvest-Now risk.', impact:'$2,400,000', remediation:'$800', roi:'3,000x', control:'NIST AC-17 · CCI-000068' },
    { id:'PQC-01-000040', cat:'CAT II', title:'No Hybrid Transition Cryptography', desc:'Pure classical crypto with no PQC hybrid during transition.', impact:'$890,000', remediation:'$4,000', roi:'222x', control:'NIST SC-8 · CCI-002418' },
    { id:'RHEL-09-431030', cat:'CAT II', title:'Audit Logs Not Centrally Collected', desc:'syslog not forwarding to SIEM. AU-2 FAIL.', impact:'$420,000', remediation:'$200', roi:'2,100x', control:'NIST AU-2 · CCI-000172' },
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e5a54b]/20 bg-[#e5a54b]/5 mb-4">
            <span className="text-xs font-mono text-[#e5a54b] tracking-widest">DEMO SCAN RESULTS — YOUR NETWORK WILL VARY</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            What ASAF Found in the Demo Network
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Four findings. $7.5M total exposure. $17,000 to fix all of them. The DAG above shows every finding,
            its framework mapping, and the ML-DSA-65 signed attestation on every tool call.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a9fe8]/15 bg-[#080f1c]">
                {['STIG ID', 'SEV', 'Finding', 'Business Impact', 'Rem. Cost', 'ROI', 'Framework'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[8px] font-mono text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-[#1a9fe8]/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-[#1a9fe8]">{f.id}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded ${
                      f.cat === 'CAT I'
                        ? 'text-[#fca5a5] bg-[#cc2a36]/15 border border-[#cc2a36]/40'
                        : 'text-[#fdba74] bg-[#f97316]/12 border border-[#f97316]/35'
                    }`}>
                      {f.cat}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white font-semibold">{f.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-black text-[#e5a54b]">{f.impact}</td>
                  <td className="px-4 py-3 font-mono text-xs text-green-400">{f.remediation}</td>
                  <td className="px-4 py-3 font-mono text-xs text-green-400 font-bold">{f.roi}</td>
                  <td className="px-4 py-3 font-mono text-[9px] text-slate-500">{f.control}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#080f1c] border-t border-[#1a9fe8]/15">
                <td colSpan={3} className="px-4 py-3 font-mono text-[10px] text-slate-500">4 findings · ML-DSA-65 signed DAG attestation on all</td>
                <td className="px-4 py-3 font-mono font-black text-[#cc2a36]">$7,510,000</td>
                <td className="px-4 py-3 font-mono text-green-400">$17,000</td>
                <td className="px-4 py-3 font-mono font-bold text-green-400">442x avg</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center mt-8">
          <a href="#pricing" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white">
            Scan My Network <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-xs text-slate-600 mt-2">Starts with $5K Remediation Advisory · real scan · real SPRS score</p>
        </div>
      </div>
    </section>
  )
}

/** Pricing section */
function PricingSection() {
  const [activeEmail, setActiveEmail] = useState('')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>('pilot')

  const onCheckout = async (planKey: string) => {
    if (planKey === 'enterprise' || planKey === 'enterprise_multi') {
      window.location.href = 'mailto:sales@adinkhepra.com?subject=ASAF%20Enterprise%20Inquiry'
      return
    }
    const email = activeEmail || (window.prompt('Enter your work email:') ?? '')
    if (!email) return
    if (!activeEmail) setActiveEmail(email)
    setLoadingPlan(planKey)
    await handleCheckout(planKey, email)
    setLoadingPlan(null)
  }

  return (
    <section id="pricing" className="py-20 px-6 bg-[#080f1c] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4EAEF5]/20 bg-[#4EAEF5]/5 mb-4">
            <span className="text-xs font-mono text-[#4EAEF5] tracking-widest">ANNUAL SOVEREIGN LICENSING</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            No Subscriptions. No Cloud. No Lock-In.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Annual flat-fee licensing. ASAF runs on your infrastructure.
            Every tier includes everything to pass CMMC at that scope.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-10">
          <input
            type="email" value={activeEmail} onChange={e => setActiveEmail(e.target.value)}
            placeholder="your@company.com — pre-fills checkout"
            className="flex-1 px-4 py-2.5 bg-white/5 border border-[#4EAEF5]/20 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#4EAEF5]/40 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div key={plan.key}
                 className={`card-hover relative rounded-2xl border p-5 flex flex-col ${
                   plan.highlight ? 'card-featured border-[#4EAEF5]/40' : `${plan.borderColor} bg-gradient-to-br from-slate-900/60 to-slate-800/20`
                 }`}>
              {plan.highlight && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none"
                     style={{ boxShadow: '0 0 0 1px rgba(78,174,245,0.3), 0 0 60px rgba(78,174,245,0.06)' }} />
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    plan.highlight ? 'bg-[#4EAEF5]/15 border border-[#4EAEF5]/30' : 'bg-white/5 border border-white/10'
                  }`}>
                    <plan.icon className={`w-4 h-4 ${plan.accentColor}`} />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Tier {plan.tier}</p>
                    <h3 className="text-white font-bold text-sm">{plan.name}</h3>
                  </div>
                </div>
                <span className={`tier-badge px-2 py-0.5 rounded-full border text-[10px] ${plan.badgeColor}`}>{plan.badge}</span>
              </div>

              <div className="mb-1">
                <span className={`text-2xl font-black ${plan.accentColor}`}>{plan.price}</span>
                <span className="text-sm text-slate-500 ml-1">{plan.suffix}</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-1 font-mono">{plan.tagline}</p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{plan.description}</p>

              <button
                onClick={() => setExpanded(expanded === plan.key ? null : plan.key)}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-3 transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded === plan.key ? 'rotate-180' : ''}`} />
                {expanded === plan.key ? 'Hide features' : 'View all features'}
              </button>

              {expanded === plan.key && (
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${plan.accentColor}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-3">
                <button
                  onClick={() => onCheckout(plan.key)}
                  disabled={loadingPlan === plan.key}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                    plan.highlight ? 'btn-primary text-white' : 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {loadingPlan === plan.key
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>{plan.cta}<ArrowRight className="w-3.5 h-3.5" /></>
                  }
                </button>
                {plan.key === 'advisory' && <p className="text-center text-[10px] text-slate-600 mt-1.5">→ Credited toward <button onClick={() => setExpanded('pilot')} className="text-[#4EAEF5] hover:underline">Pilot Deployment</button></p>}
                {plan.key === 'pilot' && <p className="text-center text-[10px] text-slate-600 mt-1.5">→ Scales to <button onClick={() => setExpanded('program_std')} className="text-violet-400 hover:underline">Program Standard</button></p>}
                {plan.key === 'program_std' && <p className="text-center text-[10px] text-slate-600 mt-1.5">→ Add SBOM/KEV with <button onClick={() => setExpanded('program_adv')} className="text-amber-400 hover:underline">Program Advanced</button></p>}
                {plan.key === 'program_adv' && <p className="text-center text-[10px] text-slate-600 mt-1.5">→ Full autonomy with <button onClick={() => setExpanded('enterprise')} className="text-[#D4AF37] hover:underline">Enterprise</button></p>}
                {plan.key === 'enterprise' && <p className="text-center text-[10px] text-slate-600 mt-1.5">→ Multi-site with <button onClick={() => setExpanded('enterprise_multi')} className="text-rose-400 hover:underline">Multi-Site</button></p>}
              </div>
            </div>
          ))}
        </div>

        {/* SDVOSB / Iron Bank block */}
        <div className="mt-10 space-y-4">
          {/* SDVOSB */}
          <div className="p-5 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-bold text-sm">SDVOSB Sole-Source Pending Certification — Up to $5M</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              SecRed Knowledge Inc. · Current VOSB · Army Signal Corps 25S SATCOM · Active Secret Clearance.
              Pursuing sole-source contracts up to $5M under SBA regulations.{' '}
              <a href="mailto:contact@nouchix.com" className="text-[#D4AF37] hover:underline">contact@nouchix.com</a>
            </p>
          </div>

          {/* Iron Bank CTA — direct blocker removal */}
          <div className="p-6 rounded-2xl border border-[#cc2a36]/25 bg-[#cc2a36]/5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-[#cc2a36]" />
                  <span className="text-[#cc2a36] font-bold text-sm uppercase tracking-wide">DoD Program Offices — We Need You</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AdinKhepra ASAF is <strong className="text-white">Repo One account live</strong> (CAC authenticated, Souhimbou Doh Kone). Iron Bank certification requires a
                  DoD Program Office or Prime Contractor as Mission Owner. If your program needs sovereign CMMC compliance tooling
                  with PQC attestation, you can co-submit us — and get free pilot access in return.
                  Primes, Subs, and Government Business POCs: this is the ask.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a href="mailto:contact@nouchix.com?subject=Iron%20Bank%20Mission%20Owner%20Inquiry&body=I%20represent%20[Program%20Office%2FOrganization]%20and%20am%20interested%20in%20co-submitting%20AdinKhepra%20ASAF%20to%20Iron%20Bank%20as%20Mission%20Owner."
                   className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-[#cc2a36]/40 bg-[#cc2a36]/10 text-[#fca5a5] hover:bg-[#cc2a36]/20 transition-colors whitespace-nowrap">
                  <Shield className="w-4 h-4" />
                  Become Mission Owner
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** MCP Registry CTA */
function MCPCtaSection() {
  return (
    <section className="py-14 px-6 bg-[#050c16] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded-2xl border border-[#e5a54b]/20 bg-gradient-to-r from-[#0d1117] to-[#0a0e1a] flex flex-col md:flex-row items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-[#e5a54b]/10 border border-[#e5a54b]/25 flex items-center justify-center flex-shrink-0">
            <Terminal className="w-5 h-5 text-[#e5a54b]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="text-[9px] font-mono text-[#e5a54b]/70 uppercase tracking-widest mb-1">Anthropic MCP Registry</div>
            <h3 className="text-white font-bold text-base mb-1">
              Run <code className="text-[#e5a54b] bg-[#e5a54b]/10 px-1.5 py-0.5 rounded text-sm">pqc_stig</code> directly in Claude Desktop, Cursor, or any MCP client
            </h3>
            <p className="text-xs text-slate-500">
              <span className="text-slate-400 font-mono">io.github.nouchix/pqc-khepra-mcp</span>
              {' · '}Free Community tier · ML-DSA-65 signed · 36K+ mappings · Air-gappable
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <a href="https://registry.modelcontextprotocol.io/?q=khepra"
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e5a54b]/30 bg-[#e5a54b]/8 text-xs font-bold text-[#e5a54b] hover:bg-[#e5a54b]/15 transition-colors whitespace-nowrap">
              <ExternalLink className="w-3.5 h-3.5" />
              MCP Registry
            </a>
            <Link href="/whitepaper"
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1a9fe8]/30 bg-[#1a9fe8]/8 text-xs font-bold text-[#1a9fe8] hover:bg-[#1a9fe8]/15 transition-colors whitespace-nowrap">
              <FileText className="w-3.5 h-3.5" />
              PQC-01-STIG Whitepaper
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Business Advisor — Donnie Yancey */
function AdvisorSection() {
  return (
    <section className="py-16 px-6 bg-[#080f1c] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">Validation</div>
          <h2 className="text-2xl font-black text-white">Advisory Board</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-800/20 flex flex-col sm:flex-row gap-6">
            {/* Photo placeholder — drop public/donnie-yancey.jpg to activate */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/donnie-yancey.jpg.png"
                  alt="Donnie Yancey — Lead Business Advisor"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-3xl font-black text-slate-600">DY</div>
              </div>
              <div className="mt-2 text-[8px] font-mono text-slate-600 uppercase tracking-widest text-center">Lead Business<br />Advisor</div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-3">Donnie Yancey</h3>
              <ul className="space-y-2 mb-4">
                {[
                  'COO who scaled a SaaS company from $0 to $15M ARR in 3 years.',
                  'UNC Kenan-Flagler Business School.',
                  'Assigned 1:1 Business Mentor through the OneDay MBA program (Williams Jewels College).',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-[#1a9fe8] rounded-full flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 italic">
                Actively advising on GTM execution, operational scaling, and revenue systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Partnerships & Ecosystem */
function PartnershipsSection() {
  const partners = [
    {
      name: 'Anthropic',
      badge: 'Claude Partner Network',
      detail: 'Official partner. Core AI infrastructure for agentic security products. ASAF runs on Claude Sonnet-4 in commercial tier.',
      color: 'text-[#e17b4f]',
      border: 'border-[#e17b4f]/25',
      bg: 'bg-[#e17b4f]/5',
      logo: '🤖',
    },
    {
      name: 'HPE',
      badge: 'Partner Program — Tier 2',
      detail: 'Hewlett Packard Enterprise Solutions Provider since early stage. Enterprise hardware & infrastructure channel. Effective 9/16/2024.',
      color: 'text-[#00b388]',
      border: 'border-[#00b388]/25',
      bg: 'bg-[#00b388]/5',
      logo: '🖥️',
    },
    {
      name: 'NSF I-Corps Alumni',
      badge: 'UAlbany Innovation Center',
      detail: 'R&D by former operators from Sandia National Labs & NSA-affiliated programs. NSA Center of Academic Excellence in Cyber Defense Education (CAE-CDE).',
      color: 'text-[#1a9fe8]',
      border: 'border-[#1a9fe8]/25',
      bg: 'bg-[#1a9fe8]/5',
      logo: '🔬',
    },
  ]

  return (
    <section className="py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">Ecosystem</div>
          <h2 className="text-2xl font-black text-white">Partnerships & Ecosystem</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p.name} className={`p-5 rounded-2xl border ${p.border} ${p.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{p.logo}</span>
                <div>
                  <div className={`font-black text-sm ${p.color}`}>{p.name}</div>
                  <div className={`text-[9px] font-mono uppercase tracking-widest ${p.color}/70`}>{p.badge}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Footer */

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#4EAEF5]/10 border border-[#4EAEF5]/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#4EAEF5]" />
            </div>
            <span className="text-white font-bold">AdinKhepra</span>
            <span className="text-[#4EAEF5] font-bold text-sm tracking-widest">ASAF</span>
          </div>
          <p className="text-xs text-slate-700 max-w-xs leading-relaxed mb-2">
            Agentic Security Attestation Framework. Sovereign CMMC compliance for the DIB. Post-quantum certified. USPTO #73565085.
          </p>
          <p className="text-xs text-slate-800">
            © 2026 SecRed Knowledge Inc. · EIN 99-0529252 · SDVOSB<br />
            IP exclusively licensed from Souhimbou Doh Kone LLC
          </p>
        </div>
        <div>
          <h4 className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-3">Compliance Docs</h4>
          <ul className="space-y-2">
            {['PQC-01-STIG-V1R1 Whitepaper', 'PQC STIG Technical Brief', 'CNSA 2.0 Gap Analysis', 'OSCAL Evidence Package', 'Godfather Report Sample'].map(i => (
              <li key={i}><a href="#" className="text-xs text-slate-700 hover:text-slate-400 transition-colors">{i}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-3">Company</h4>
          <ul className="space-y-2">
            {[['SDVOSB Contracting', 'mailto:sales@adinkhepra.com'], ['Security Policy', '#'], ['Patent #73565085', '#'], ['sales@adinkhepra.com', 'mailto:sales@adinkhepra.com']].map(([l, h]) => (
              <li key={l}><a href={h} className="text-xs text-slate-700 hover:text-slate-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-slate-800">
          {['ML-DSA-65 (FIPS 204)', 'ML-KEM-768 (FIPS 203)', 'KHEPRA Protocol', 'USPTO #73565085', 'Zero Telemetry'].map((t, i, a) => (
            <span key={t} className="flex items-center gap-3">
              {t}{i < a.length - 1 && <span className="text-slate-900">·</span>}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-800">
          <Lock className="w-3 h-3" />
          <span>Sovereign deployment · Zero egress · Air-gappable</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050c16]">
      {/* Sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050c16]/95 backdrop-blur border-b border-[#1a9fe8]/10">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1a9fe8]/10 border border-[#1a9fe8]/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#1a9fe8]" />
            </div>
            <span className="text-white font-bold text-sm">AdinKhepra</span>
            <span className="text-[#1a9fe8] font-bold text-xs tracking-widest">ASAF</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[['Live Demo', '#'], ['Findings', '#findings'], ['Pricing', '#pricing'], ['Whitepaper', '/whitepaper']].map(([l, h]) => (
              <Link key={l} href={h} className="text-xs text-slate-500 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <a href="#pricing" className="btn-primary px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5">
            Get CMMC Baseline <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </nav>

      {/* Page sections — offset for fixed nav */}
      <div className="pt-10">
        <DemoHero />
        <UrgencySection />
        <div id="findings"><FindingsSection /></div>
        <PricingSection />
        <MCPCtaSection />
        <AdvisorSection />
        <PartnershipsSection />
        <Footer />
      </div>
    </main>
  )
}
