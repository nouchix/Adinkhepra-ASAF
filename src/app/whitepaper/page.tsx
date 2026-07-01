import type { Metadata } from 'next'
import { Shield, AlertTriangle, FileText, Download, Terminal, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PQC-01-STIG-V1R1 Whitepaper — The World\'s First DoD-Style Post-Quantum Cryptography STIG',
  description: 'NouchiX publishes PQC-01-STIG-V1R1: 12 actionable controls mapped to CCI, NIST 800-53 Rev 5, and CNSA 2.0. The compliance framework gap DISA has not filled. Read the whitepaper.',
  openGraph: {
    title: 'PQC-01-STIG-V1R1 — The World\'s First PQC STIG',
    description: 'DISA has published zero PQC STIGs. We filled the gap. 12 controls. CCI-mapped. Production-implemented in KHEPRA.',
  },
}

const CONTROLS = [
  { id: 'PQC-01-000010', cat: 'CAT I', title: 'CNSA 2.0 Algorithm Approval', nist: 'SC-13', cci: 'CCI-002450', desc: 'RSA, ECDSA, ECDH, and DH are non-compliant for new NSS implementations as of 2025. ML-DSA (FIPS 204), ML-KEM (FIPS 203), AES-256, SHA-384/512 only.' },
  { id: 'PQC-01-000020', cat: 'CAT I', title: 'ML-DSA Key Strength', nist: 'SC-13', cci: 'CCI-002450', desc: 'Digital signature operations must use ML-DSA-65 (3293-byte public keys) or ML-DSA-87 minimum. ML-DSA-44 is not approved for NSS use.' },
  { id: 'PQC-01-000030', cat: 'CAT I', title: 'ML-KEM Encapsulation Strength', nist: 'SC-13', cci: 'CCI-002450', desc: 'Key encapsulation must use ML-KEM-768 (1184-byte public keys) or ML-KEM-1024. ML-KEM-512 is not approved for NSS key encapsulation.' },
  { id: 'PQC-01-000040', cat: 'CAT II', title: 'Hybrid Cryptography During Transition', nist: 'SC-8', cci: 'CCI-002418', desc: 'Systems in active transition (2025–2030) must implement hybrid key exchange combining classical (X25519) + ML-KEM-768. NSA requires both simultaneously.' },
  { id: 'PQC-01-000050', cat: 'CAT I', title: 'Key Storage and Protection', nist: 'SC-12', cci: 'CCI-001924', desc: 'ML-DSA and ML-KEM private keys for identity/signing must be in FIPS 140-3 Level 3+ validated HSMs for systems above SECRET or handling CUI requiring NSS protection.' },
  { id: 'PQC-01-000060', cat: 'CAT I', title: 'Constant-Time Implementation', nist: 'SI-7', cci: 'CCI-002696', desc: 'PQC library must have documented constant-time guarantees for all operations involving private key material. Acceptable: liboqs, Cloudflare CIRCL, pq-crystals reference.' },
  { id: 'PQC-01-000070', cat: 'CAT II', title: 'Certificate Chain Validation', nist: 'IA-3', cci: 'CCI-001084', desc: 'System must validate X.509 certificates with id-ml-dsa-65 OID in subjectPublicKeyInfo and signatureAlgorithm fields without error.' },
  { id: 'PQC-01-000080', cat: 'CAT II', title: 'Algorithm Inventory & Cryptographic Agility', nist: 'PL-8', cci: 'CCI-000640', desc: 'A complete CBOM must exist identifying every public-key algorithm use, library version, key size, and migration status. NSM-10 reporting requires it.' },
  { id: 'PQC-01-000090', cat: 'CAT I', title: 'FIPS 140-3 Module Validation', nist: 'SC-13', cci: 'CCI-002450', desc: 'The PQC cryptographic module must have an active CMVP certificate number. "Review pending" or "implementation under test" status is non-compliant for production NSS use.' },
  { id: 'PQC-01-000100', cat: 'CAT II', title: 'Key Lifecycle and Rotation', nist: 'SC-12', cci: 'CCI-001924', desc: 'ML-DSA signing keys must rotate at ≤12 months for long-term identity keys. ML-KEM session keys must be ephemeral (per-session). Static long-lived KEM keys = CAT II finding.' },
  { id: 'PQC-01-000110', cat: 'CAT I', title: 'PQC Random Number Generation', nist: 'SC-13', cci: 'CCI-002450', desc: 'All PQC key generation must use NIST SP 800-90A Rev 1 compliant DRBG (CTR_DRBG/AES-256 or Hash_DRBG/SHA-512) seeded from a hardware entropy source.' },
  { id: 'PQC-01-000120', cat: 'CAT II', title: 'Attestation and Audit Trail', nist: 'AU-9', cci: 'CCI-001350', desc: 'Tamper-evident audit trail required for all PQC key generation, signing, and encapsulation events. Audit entries must themselves be signed with ML-DSA. KHEPRA implements this via the AdinKhepra DAG attestation chain.' },
]

const TIMELINE = [
  { year: '2022', event: 'NSM-10', detail: 'Agencies directed to inventory quantum-vulnerable systems and begin migration planning' },
  { year: 'Aug 2024', event: 'FIPS 203/204/205 Final', detail: 'NIST finalizes ML-KEM, ML-DSA, SLH-DSA. Algorithm question settled.' },
  { year: '2025 ⚠️', event: 'NSS Software/Firmware', detail: 'Must support CNSA 2.0 algorithms. This deadline has passed.' },
  { year: '2026 ⚠️', event: 'Priority Systems', detail: 'Must complete PQC transitions. RFPs beginning to include PQC requirements.' },
  { year: '2030 🎯', event: 'Full NSS Transition', detail: 'All NSS fully transitioned. DIB contractors must demonstrate compliance during contract performance.' },
]

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-[#050c16] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1a9fe8]/15 bg-[#080f1c]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1a9fe8]/10 border border-[#1a9fe8]/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-[#1a9fe8]" />
            </div>
            <span className="text-white font-bold text-sm">AdinKhepra <span className="text-[#1a9fe8] tracking-widest">ASAF</span></span>
          </Link>
          <Link href="/#pricing"
            className="px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #4EAEF5, #2D8FE0)' }}>
            Get CMMC Baseline <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="py-16 px-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(26,159,232,0.12) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1a9fe8]/25 bg-[#1a9fe8]/8 mb-6">
            <span className="text-[10px] font-mono text-[#1a9fe8] uppercase tracking-widest">Unclassified // For Public Release // NouchiX / SecRed Knowledge Inc.</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            PQC-01-STIG-V1R1:<br />
            <span className="text-[#1a9fe8]">The World's First DoD-Style<br />Post-Quantum Cryptography STIG</span>
          </h1>
          <p className="text-slate-400 text-lg mb-2">A Technical Whitepaper on Filling the CNSA 2.0 Compliance Gap</p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 mb-8">
            <span>Authors: NouchiX / SecRed Knowledge Inc.</span>
            <span>·</span>
            <span>Version: 1.0 · June 2026</span>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/nouchix/pqc-khepra-mcp" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1a9fe8]/30 bg-[#1a9fe8]/8 text-sm text-[#1a9fe8] hover:bg-[#1a9fe8]/15 transition-colors">
              <Download className="w-4 h-4" />
              Download Raw STIG (GitHub)
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://registry.modelcontextprotocol.io/?q=khepra" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e5a54b]/30 bg-[#e5a54b]/8 text-sm text-[#e5a54b] hover:bg-[#e5a54b]/15 transition-colors">
              <Terminal className="w-4 h-4" />
              Run pqc_stig Tool (MCP)
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link href="/#pricing"
               className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/8 text-sm text-[#22c55e] hover:bg-[#22c55e]/15 transition-colors">
              <Shield className="w-4 h-4" />
              Get ASAF Assessment
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* Abstract */}
        <section>
          <h2 className="text-2xl font-black text-white mb-4">Abstract</h2>
          <div className="p-6 rounded-2xl border border-[#cc2a36]/20 bg-[#cc2a36]/5 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#cc2a36] flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 text-sm leading-relaxed">
                The NSA's CNSA 2.0 mandates post-quantum cryptographic transitions across all NSS and DIB contractors by 2030, with priority systems required by 2026.
                NIST finalized FIPS 203, 204, and 205 in August 2024. <strong className="text-white">Yet as of June 2026, DISA has published no STIG specifically addressing post-quantum cryptographic controls.</strong>
              </p>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">
            This paper introduces <strong className="text-white">PQC-01-STIG-V1R1</strong>, the world's first DoD-style Post-Quantum Cryptography STIG, developed by NouchiX to fill this critical compliance gap.
            We document 12 actionable controls mapped to existing CCI identifiers, NIST 800-53 Rev 5 controls, and CNSA 2.0 requirements.
            We further describe the production implementation of these controls in the KHEPRA MCP Server, including ML-DSA-65 / FIPS 204 attestation on every cryptographic operation,
            offline compliance validation, and Iron Bank-ready containerization.
          </p>
        </section>

        {/* The Policy Gap */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">1. The Policy Gap</h2>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#1a9fe8] mb-3">1.1 Mandates Without Checklists</h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              NSM-10 (May 2022) directed all federal agencies to inventory cryptographic systems vulnerable to quantum attack and begin migration planning.
              OMB M-23-02 followed with reporting requirements. The CNSA 2.0 advisory (September 2022) set hard timelines.
              NIST's work is complete — FIPS 203, 204, and 205 were finalized August 13, 2024. <strong className="text-white">The algorithm question is settled.</strong>
            </p>
            <p className="text-slate-400 leading-relaxed">
              The compliance framework question is not. DISA STIGs exist for hundreds of technologies — RHEL, Windows, Kubernetes, PostgreSQL, Apache —
              but no STIG addresses how to implement, validate, or audit post-quantum cryptographic controls.
              Program managers, ISSOs, and DIB contractors have mandatory algorithm requirements but <strong className="text-white">no authoritative checklist to assess conformance.</strong>
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#cc2a36] mb-3">1.2 The Harvest-Now-Decrypt-Later Threat Is Active Today</h3>
            <div className="p-5 rounded-xl border border-[#cc2a36]/25 bg-[#cc2a36]/5 mb-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Adversaries capable of quantum decryption — including nation-state actors assessed to be 8–15 years from cryptographically relevant quantum computers —
                are <strong className="text-white">actively collecting encrypted data today</strong> for future decryption.
                Intelligence community assessments classify this as a current, active collection threat against NSS communications, CUI, and controlled technical data.
              </p>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Data encrypted today with RSA-2048 or ECDSA P-256 <strong className="text-white">may be decrypted within the decade.</strong>{' '}
              DIB contractors transmitting ITAR-controlled technical data or sharing CUI with acquisition programs are generating this attack surface daily.
            </p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">CNSA 2.0 Transition Timeline</h3>
            <div className="space-y-3">
              {TIMELINE.map((t, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border ${
                  t.year.includes('2026') ? 'border-[#f97316]/30 bg-[#f97316]/5' :
                  t.year.includes('2025') ? 'border-[#cc2a36]/30 bg-[#cc2a36]/5' :
                  t.year.includes('2030') ? 'border-[#1a9fe8]/30 bg-[#1a9fe8]/5' :
                  'border-slate-800/60 bg-slate-900/30'
                }`}>
                  <div className="w-24 flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-300">{t.year}</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white mb-0.5">{t.event}</div>
                    <div className="text-xs text-slate-400">{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The 12 Controls */}
        <section>
          <h2 className="text-2xl font-black text-white mb-2">2. PQC-01-STIG-V1R1: The Twelve Controls</h2>
          <p className="text-slate-500 text-sm mb-8 font-mono">CCI-mapped · NIST 800-53 Rev 5 cross-referenced · CNSA 2.0 aligned</p>

          <div className="space-y-4">
            {CONTROLS.map((c) => (
              <div key={c.id} className="p-5 rounded-xl border border-slate-800/70 bg-slate-900/40 hover:border-slate-700/80 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#1a9fe8] font-bold">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      c.cat === 'CAT I'
                        ? 'text-[#fca5a5] bg-[#cc2a36]/15 border border-[#cc2a36]/40'
                        : 'text-[#fdba74] bg-[#f97316]/12 border border-[#f97316]/35'
                    }`}>{c.cat}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#22c55e]/25 bg-[#22c55e]/8 text-[#22c55e]">{c.nist}</span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#06b6d4]/25 bg-[#06b6d4]/8 text-[#06b6d4]">{c.cci}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Production Implementation */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">3. Production Implementation: KHEPRA MCP Server</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { label: 'ML-DSA-65 attestation', detail: 'On every MCP tool call — tamper-evident DAG chain from session initiation through completion' },
              { label: 'Offline license validation', detail: 'ML-DSA-65 signed license.adinkhepra files — fully air-gap compatible, zero external validation calls' },
              { label: '36,195 bundled mappings', detail: 'STIG/CCI/NIST 800-53/NIST 800-171/CMMC in-container — no external database calls in any mode' },
              { label: 'Iron Bank compatible', detail: 'Dockerfile.ironbank implements DoD Container Hardening Guide — submitted to Repo One' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-800/60 bg-slate-900/30">
                <CheckCircle className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">{f.label}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{f.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance DB */}
          <div className="p-5 rounded-xl border border-[#e5a54b]/20 bg-[#e5a54b]/3 mb-6">
            <div className="text-xs font-mono text-[#e5a54b] uppercase tracking-widest mb-3">Bundled Compliance Database</div>
            <table className="w-full text-xs font-mono">
              <thead><tr className="text-slate-500 border-b border-white/5">
                <th className="text-left pb-2">File</th><th className="text-right pb-2">Rows</th><th className="text-left pb-2 pl-4">Content</th>
              </tr></thead>
              <tbody>
                {[
                  ['STIG_CCI_Map.csv', '28,639', 'STIG finding ID → CCI identifier'],
                  ['CCI_to_NIST53.csv', '7,433', 'CCI → NIST 800-53 Rev 5'],
                  ['NIST53_to_171.csv', '123', 'NIST 800-53 → NIST 800-171'],
                  ['Total', '36,195', 'Embedded in binary via embed.FS'],
                ].map(([f, r, c], i) => (
                  <tr key={i} className={`border-b border-white/5 ${i === 3 ? 'text-[#e5a54b] font-bold' : 'text-slate-300'}`}>
                    <td className="py-2">{f}</td>
                    <td className="py-2 text-right">{r}</td>
                    <td className="py-2 pl-4 text-slate-400">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick start */}
          <h3 className="text-lg font-bold text-white mb-3">Quick Start — Free, No License Required</h3>
          <p className="text-slate-400 text-sm mb-4">The Community tier <code className="text-[#1a9fe8] bg-[#1a9fe8]/10 px-1.5 py-0.5 rounded">pqc_stig</code> tool is permanently free. Add to Claude Desktop or any MCP-capable AI assistant:</p>
          <div className="rounded-xl border border-[#1a9fe8]/20 bg-[#0a0e1a] overflow-hidden mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1a9fe8]/10 bg-white/2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-[10px] font-mono text-slate-500">claude_desktop_config.json</span>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">{`{
  "mcpServers": {
    "khepra": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "KHEPRA_MODE=sovereign",
        "-v", "/var/lib/khepra:/var/lib/khepra",
        "ghcr.io/nouchix/pqc-khepra-mcp:latest"
      ]
    }
  }
}`}</pre>
          </div>
          <p className="text-slate-500 text-xs mb-6">Then prompt your AI assistant: <em className="text-slate-300">"Run pqc_stig on my project and tell me if I'm CNSA 2.0 compliant."</em></p>

          <a href="https://registry.modelcontextprotocol.io/?q=khepra" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#e5a54b]/30 bg-[#e5a54b]/8 text-sm font-bold text-[#e5a54b] hover:bg-[#e5a54b]/15 transition-colors">
            <Terminal className="w-4 h-4" />
            View on MCP Registry — io.github.nouchix/pqc-khepra-mcp
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>

        {/* References */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6">References</h2>
          <ol className="space-y-2 text-xs text-slate-500 font-mono">
            {[
              'NSA, "Commercial National Security Algorithm Suite 2.0," CNSSP 15, September 2022',
              'NIST, "Module-Lattice-Based Key-Encapsulation Mechanism Standard," FIPS 203, August 2024',
              'NIST, "Module-Lattice-Based Digital Signature Standard," FIPS 204, August 2024',
              'NIST, "Stateless Hash-Based Digital Signature Standard," FIPS 205, August 2024',
              'NSC, "National Security Memorandum on Promoting United States Leadership in Quantum Computing," NSM-10, May 2022',
              'OMB, "Migrating to Post-Quantum Cryptography," M-23-02, December 2022',
              'NIST, "Protecting Controlled Unclassified Information in Nonfederal Systems," SP 800-171 Rev 3, May 2024',
              'NIST, "Security and Privacy Controls for Information Systems and Organizations," SP 800-53 Rev 5',
              'DISA, "Red Hat Enterprise Linux 9 Security Technical Implementation Guide," V2R5',
              'NIST IR 8547, "Transition to Post-Quantum Cryptography Standards," 2024',
            ].map((ref, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-slate-700 flex-shrink-0">[{i+1}]</span>
                <span>{ref}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-700 mt-6 italic">
            PQC-01-STIG-V1R1 is a community contribution. NouchiX makes no claim to official DISA endorsement.
            All control mappings reference publicly available CCI and NIST 800-53 Rev 5 data.
          </p>
        </section>

        {/* CTA */}
        <section className="p-8 rounded-2xl border border-[#1a9fe8]/25 bg-gradient-to-br from-[#080f1c] to-[#0d1728] text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#1a9fe8]/10 border border-[#1a9fe8]/25 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-[#1a9fe8]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Run These Checks Against Your Infrastructure</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            ASAF implements all 12 PQC-01-STIG-V1R1 controls in a sovereign, air-gappable compliance platform.
            Get your SPRS score and Godfather Report today.
          </p>
          <Link href="/#pricing"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
               style={{ background: 'linear-gradient(135deg, #4EAEF5, #2D8FE0)' }}>
            Get My CMMC Baseline <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-700">
            © 2026 SecRed Knowledge Inc. · EIN 99-0529252 · SDVOSB · contact@nouchix.com
          </div>
          <div className="flex gap-4 text-xs font-mono text-slate-700">
            <a href="https://github.com/nouchix/pqc-khepra-mcp" className="hover:text-slate-400 transition-colors">GitHub</a>
            <span>·</span>
            <a href="https://registry.modelcontextprotocol.io/?q=khepra" className="hover:text-slate-400 transition-colors">MCP Registry</a>
            <span>·</span>
            <Link href="/" className="hover:text-slate-400 transition-colors">adinkhepra.com</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
