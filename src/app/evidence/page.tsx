import Link from 'next/link'
import { Shield, Lock, FileText, ArrowLeft, Network, Activity, Clock, ShieldCheck } from 'lucide-react'

export default function EvidencePage() {
  return (
    <main className="min-h-screen bg-[#050c16] text-white">
      {/* Header */}
      <header className="border-b border-[#1a9fe8]/20 bg-[#080f1c]/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1a9fe8]" />
              <span>AdinKhepra ASAF</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
              ML-DSA-65 VERIFIED
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e5a54b]/20 bg-[#e5a54b]/5">
            <span className="text-[10px] font-mono text-[#e5a54b] tracking-widest">PROPRIETARY / PROSPECT-SHAREABLE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            KHEPRA ASAF — Complete Forensic <span className="text-[#1a9fe8]">Chain of Custody</span> & Executive Evidence Brief
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            A complete, unbroken chain of custody from the moment we connected to the external test environment through every tool execution, every policy decision, every cryptographic seal.
          </p>
        </div>

        {/* Execution Metadata */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-[#080f1c]">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Timestamp</div>
              <div className="font-mono text-xs font-bold text-white">2026-07-30T23:05:34Z</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-[#080f1c]">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Lock className="w-3 h-3"/> Evaluator</div>
              <div className="font-mono text-xs font-bold text-[#1a9fe8]">did:khepra:secred-evaluator-oumou</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-[#080f1c]">
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Network className="w-3 h-3"/> Target Boundary</div>
              <div className="font-mono text-xs font-bold text-white">Hostinger VPS 2.24.105.170</div>
            </div>
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="text-[9px] font-mono text-emerald-500/70 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> Guard Status</div>
              <div className="font-mono text-xs font-bold text-emerald-400">INTACT</div>
            </div>
          </div>
        </section>

        {/* The Business Case */}
        <section className="space-y-6 bg-[#080f1c] p-8 rounded-2xl border border-slate-800">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4EAEF5]/10 border border-[#4EAEF5]/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#4EAEF5]"/>
            </div>
            Part I: Why This Matters
          </h2>
          
          <div className="prose prose-invert max-w-none text-sm text-slate-300">
            <p>
              Your company uses AI agents. Those agents have credentials. Those credentials give them access to databases, file systems, APIs, and customer records. <strong>Right now, nobody is watching what those agents actually do with that access.</strong>
            </p>
            <p>
              When a traditional employee misuses access, you have badge logs, camera footage, and HR records. When an AI agent misuses access — whether it was tricked by a malicious document or simply hallucinated a bad decision — you have <strong>nothing</strong>. No logs. No proof. No defense.
            </p>
            <p>That gap is not a technology problem. It is a <strong>financial exposure</strong> problem.</p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 text-white">The FAIR Risk Math</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#050c16] text-slate-400 border-b border-slate-800 font-mono text-xs">
                  <tr>
                    <th className="p-4 uppercase tracking-widest font-normal">FAIR Factor</th>
                    <th className="p-4 uppercase tracking-widest font-normal">Without KHEPRA</th>
                    <th className="p-4 uppercase tracking-widest font-normal text-emerald-400">With KHEPRA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">Threat Event Frequency (TEF)</td>
                    <td className="p-4 text-slate-300">High — AI agents execute thousands of actions per hour</td>
                    <td className="p-4 text-slate-300">Unchanged — agents still execute at speed</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">Vulnerability (V)</td>
                    <td className="p-4 text-red-400 font-medium">Near 100% — no runtime boundary exists</td>
                    <td className="p-4 text-emerald-400 font-bold">Near 0% — every action traverses the ASAF gateway</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">Loss Event Frequency (LEF)</td>
                    <td className="p-4 text-red-400 font-bold">High</td>
                    <td className="p-4 text-emerald-400 font-bold">Near Zero</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">Primary Loss Magnitude (PLM)</td>
                    <td className="p-4 text-slate-300">Unbounded — agent has full credential authority</td>
                    <td className="p-4 text-slate-300">Hard ceiling — session isolation caps damage</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Chain of Custody */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e5a54b]/10 border border-[#e5a54b]/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#e5a54b]"/>
            </div>
            Part IV: Target 2 (PentestGPT)
          </h2>
          
          <div className="grid gap-3 relative">
             <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-800 -z-10" />
             
             {[
               { e: "GENESIS", desc: "Hash: 000000000000... State: CHAIN_INITIALIZED" },
               { e: "EVENT 1", desc: "Agent Registration | ML-DSA-65 (FIPS 204)" },
               { e: "EVENT 2", desc: "Intent Declaration | Declared Goal: Scan DVWS" },
               { e: "EVENT 3", desc: "Tool Execution (Approved) | nmap -sV dvws-node-web-1" },
               { e: "EVENT 4", desc: "Poisoned Document Ingestion | Signal: INDIRECT_PROMPT_INJECTION (Confidence: 0.99)", isRed: true },
               { e: "EVENT 5", desc: "Exfiltration Attempt Intercepted | Verdict: DENY_AND_CONTAIN", isRed: true },
               { e: "EVENT 6", desc: "Session Isolation & Credential Revocation" },
               { e: "EVENT 7", desc: "Cryptographic Attestation & Passport Update" }
             ].map((evt, idx) => (
                <div key={idx} className={\`p-4 rounded-xl border flex items-center gap-4 \${evt.isRed ? 'border-[#cc2a36]/30 bg-[#cc2a36]/10 text-white' : 'border-slate-800 bg-[#080f1c]'}\`}>
                   <div className={\`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border text-xs font-bold font-mono \${evt.isRed ? 'border-[#cc2a36] bg-[#cc2a36]/20 text-[#fca5a5]' : 'border-slate-700 bg-slate-800/50 text-slate-300'}\`}>
                      {idx}
                   </div>
                   <div>
                     <div className={\`font-mono text-[10px] uppercase tracking-widest \${evt.isRed ? 'text-[#fca5a5]' : 'text-slate-500'}\`}>{evt.e}</div>
                     <div className="font-semibold text-sm mt-0.5">{evt.desc}</div>
                   </div>
                </div>
             ))}
          </div>
        </section>

        {/* Interactive 3D DAGs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#1a9fe8]/10 border border-[#1a9fe8]/30 flex items-center justify-center">
              <Network className="w-4 h-4 text-[#1a9fe8]"/>
            </div>
            Part V: Interactive FAIR Risk DAGs
          </h2>
          <p className="text-slate-400 text-sm">
             Interact with the full forensic chains of custody below. Click, drag, and rotate the nodes. Hover over events to view cryptographic details.
          </p>
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-800 bg-[#080f1c] overflow-hidden aspect-video">
              <div className="bg-slate-800/50 p-2 text-xs font-mono text-center text-slate-300 border-b border-slate-800">Target 1: DVWS (Control)</div>
              <iframe src="/dvws-fair-dag.html" className="w-full h-full border-0" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#080f1c] overflow-hidden aspect-video">
              <div className="bg-slate-800/50 p-2 text-xs font-mono text-center text-slate-300 border-b border-slate-800">Target 2: PentestGPT Incident</div>
              <iframe src="/pentestgpt-fair-dag.html" className="w-full h-full border-0" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#080f1c] overflow-hidden aspect-video">
              <div className="bg-slate-800/50 p-2 text-xs font-mono text-center text-slate-300 border-b border-slate-800">Target 3: HackGPT Prompt Security</div>
              <iframe src="/hackgpt-fair-dag.html" className="w-full h-full border-0" />
            </div>
          </div>
        </section>

        {/* JSON Display */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-400"/>
            </div>
            Part VII: CycloneDX Agent Attestation
          </h2>
          <p className="text-slate-400 text-sm">
             Our cryptographic evidence chains are fully exportable to standard defense-grade compliance formats.
          </p>
          <div className="p-6 bg-[#080f1c] rounded-2xl border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
{\`{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:3e242ca3-08e0-454e-9400-043f140d39e9",
  "version": 1,
  "attestations": [
    {
      "summary": "KHEPRA ASAF Autonomous Agent Governance Attestation",
      "assessor": "did:khepra:registrar-01",
      "map": [
        {
          "requirement": "Runtime Egress Isolation",
          "conformance": {"score": 1.0, "rationale": "100% of unauthorized egress attempts blocked before connection establishment. 0 bytes transmitted."}
        },
        {
          "requirement": "Prompt Injection Containment",
          "conformance": {"score": 1.0, "rationale": "Indirect prompt injection detected at 0.99 confidence and contained within 1.42ms."}
        },
        {
          "requirement": "Cryptographic Evidence Integrity",
          "conformance": {"score": 1.0, "rationale": "7-event AEO chain verified via forensic replay. ML-DSA-65 (FIPS 204) signatures valid. Dual-anchor consensus PASS."}
        }
      ]
    }
  ]
}\`}
          </div>
        </section>

      </div>
    </main>
  )
}
