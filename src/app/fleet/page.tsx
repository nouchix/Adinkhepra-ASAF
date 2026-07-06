'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Server, Shield, AlertTriangle, CheckCircle, Plus, Upload,
  Search, RefreshCw, ChevronRight, ChevronDown, Activity,
  Network, Lock, FileText, Zap, BarChart2, Cpu, Globe,
  ArrowLeft, Eye, Download, Play, Pause, XCircle, Info,
  Wifi, WifiOff, Hash, Calendar, TrendingUp, TrendingDown,
  Database, HardDrive, Layers, AlertOctagon
} from 'lucide-react'

// ─── API base ─────────────────────────────────────────────────────────────────
declare const window: any
const API = () =>
  (typeof window !== 'undefined' && window.ASAF_CONFIG?.apiURL) || ''

// ─── Types (mirror pkg/asaf/fleet/types.go) ───────────────────────────────────
type CMMCCategory = 'cui' | 'ot' | 'it_general' | 'dmz' | 'admin'
type AssetStatus = 'enrolled' | 'pending' | 'offline' | 'scanning' | 'remediation'
type AssetOS = 'rhel9' | 'rhel8' | 'ubuntu22' | 'win2022' | 'win2019' | 'other'

interface Asset {
  id: string
  name: string
  ip: string
  os: AssetOS
  enclave_id: string
  cmmc_category: CMMCCategory
  status: AssetStatus
  stig_profile?: string
  last_scan?: string
  last_score?: number    // 0.0–1.0
  sprs_impact?: number   // e.g. 107 out of 110
  hostname?: string
  description?: string
  created_at: string
}

interface Enclave {
  id: string
  name: string
  description?: string
  network_cidr?: string
  sprs: number
  cui_sprs: number
  asset_count: number
  created_at: string
}

interface FleetSPRSSummary {
  fleet_sprs: number
  enclave_count: number
  asset_count: number
  failing_assets: number
  categories: Record<CMMCCategory, { count: number; avg_sprs: number }>
}

interface FleetScanResult {
  asset_id: string
  asset_name: string
  host: string
  score: number
  sprs_impact: number
  passed: number
  failed: number
  errors: number
  total_checks: number
  dag_node_id?: string
  scanned_at: string
  scan_error?: string
  profile: string
}

interface FleetScanSummary {
  run_id: string
  started_at: string
  completed_at?: string
  total_assets: number
  completed: number
  successful: number
  failed: number
  results: FleetScanResult[]
  fleet_sprs: number
}

// ─── SPRS gauge component ──────────────────────────────────────────────────────
function SPRSGauge({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const pct = Math.max(0, Math.min(1, (score + 203) / 313)) // SPRS: -203 to 110
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#e5a54b' : score >= 40 ? '#f97316' : '#cc2a36'
  const dim = size === 'lg' ? 120 : size === 'md' ? 80 : 56
  const r = (dim / 2) - 8
  const circ = 2 * Math.PI * r
  const dash = pct * circ * 0.75 // 270° arc

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
          {/* Track */}
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none" stroke="#1a2540" strokeWidth="7"
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
            strokeLinecap="round"
            transform={`rotate(135 ${dim / 2} ${dim / 2})`}
          />
          {/* Fill */}
          <circle
            cx={dim / 2} cy={dim / 2} r={r}
            fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(135 ${dim / 2} ${dim / 2})`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black tabular-nums leading-none ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'}`} style={{ color }}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-[8px] font-mono text-slate-500 mt-0.5">/ 110</span>
          )}
        </div>
      </div>
      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider text-center">{label}</span>
    </div>
  )
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AssetStatus }) {
  const cfg: Record<AssetStatus, { color: string; bg: string; label: string; dot?: string }> = {
    enrolled:    { color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10 border-[#22c55e]/30', label: 'Enrolled', dot: '#22c55e' },
    pending:     { color: 'text-[#e5a54b]', bg: 'bg-[#e5a54b]/10 border-[#e5a54b]/30', label: 'Pending' },
    offline:     { color: 'text-slate-500',  bg: 'bg-slate-800/50 border-slate-700/30',  label: 'Offline' },
    scanning:    { color: 'text-[#4EAEF5]', bg: 'bg-[#4EAEF5]/10 border-[#4EAEF5]/30', label: 'Scanning', dot: '#4EAEF5' },
    remediation: { color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30', label: 'Remediation' },
  }
  const c = cfg[status] ?? cfg.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono border ${c.bg} ${c.color}`}>
      {c.dot && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.dot }} />}
      {c.label}
    </span>
  )
}

// ─── CMMC category badge ───────────────────────────────────────────────────────
function CMMCBadge({ cat }: { cat: CMMCCategory }) {
  const cfg: Record<CMMCCategory, { label: string; color: string }> = {
    cui:        { label: 'CUI', color: 'text-[#cc2a36] border-[#cc2a36]/30 bg-[#cc2a36]/8' },
    ot:         { label: 'OT', color: 'text-amber-400 border-amber-500/30 bg-amber-500/8' },
    it_general: { label: 'IT', color: 'text-slate-400 border-slate-600/30 bg-slate-700/20' },
    dmz:        { label: 'DMZ', color: 'text-violet-400 border-violet-500/30 bg-violet-500/8' },
    admin:      { label: 'ADMIN', color: 'text-[#4EAEF5] border-[#4EAEF5]/30 bg-[#4EAEF5]/8' },
  }
  const c = cfg[cat] ?? cfg.it_general
  return (
    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${c.color}`}>{c.label}</span>
  )
}

// ─── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score, className }: { score: number; className?: string }) {
  const pct = score * 100
  const color = pct >= 90 ? '#22c55e' : pct >= 70 ? '#e5a54b' : pct >= 40 ? '#f97316' : '#cc2a36'
  return (
    <div className={`h-1.5 bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

// ─── CSV Import wizard ────────────────────────────────────────────────────────
function CSVImportWizard({ enclaveId, onDone }: { enclaveId: string; onDone: () => void }) {
  const [csv, setCsv] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const TEMPLATE = `name,ip,os,cmmc_category,hostname,description
web-server-01,10.1.1.10,rhel9,cui,web01.corp.mil,Primary web server
db-server-01,10.1.1.11,rhel9,cui,db01.corp.mil,Database server
admin-ws-01,10.1.2.50,win2022,admin,ws50.corp.mil,Admin workstation`

  function parsePreview(raw: string) {
    const lines = raw.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim())
    return lines.slice(1, 6).map(line => {
      const vals = line.split(',').map(v => v.trim())
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
    })
  }

  async function doImport() {
    setLoading(true)
    try {
      const res = await fetch(`${API()}/api/v1/fleet/enclaves/${enclaveId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csv,
      })
      const data = await res.json()
      setResult(data)
      if (data.imported > 0) setTimeout(onDone, 1500)
    } catch (e: any) {
      setResult({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">CSV Import Wizard</span>
        <button
          onClick={() => { setCsv(TEMPLATE); setPreview(parsePreview(TEMPLATE)) }}
          className="text-[10px] font-mono text-[#4EAEF5] hover:text-[#4EAEF5]/80 transition-colors"
        >
          Load template
        </button>
      </div>

      <textarea
        value={csv}
        onChange={e => { setCsv(e.target.value); setPreview(parsePreview(e.target.value)) }}
        placeholder={TEMPLATE}
        rows={6}
        className="w-full bg-[#080f1c] border border-[#1a9fe8]/20 rounded-lg p-3 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#1a9fe8]/50 resize-y"
      />

      {preview.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#1a9fe8]/15">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-[#1a9fe8]/10 bg-[#080f1c]">
                {Object.keys(preview[0]).map(h => (
                  <th key={h} className="px-3 py-2 text-left text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-[#1a9fe8]/8 hover:bg-[#1a9fe8]/5">
                  {Object.values(row).map((v: any, j) => (
                    <td key={j} className="px-3 py-2 text-slate-300">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-1.5 bg-[#080f1c] text-[9px] text-slate-500 font-mono">
            Previewing {preview.length} of {csv.trim().split('\n').length - 1} assets
          </div>
        </div>
      )}

      {result && (
        <div className={`p-3 rounded-lg border text-xs font-mono ${result.error ? 'border-[#cc2a36]/30 bg-[#cc2a36]/8 text-[#cc2a36]' : 'border-[#22c55e]/30 bg-[#22c55e]/8 text-[#22c55e]'}`}>
          {result.error ? `Error: ${result.error}` : `✓ Imported ${result.imported} assets — ${result.skipped} skipped`}
        </div>
      )}

      <button
        onClick={doImport}
        disabled={loading || !csv.trim()}
        className="w-full py-2.5 rounded-lg bg-[#4EAEF5]/15 border border-[#4EAEF5]/40 text-[#4EAEF5] text-xs font-bold hover:bg-[#4EAEF5]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <span className="w-4 h-4 border-2 border-[#4EAEF5]/30 border-t-[#4EAEF5] rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Import to Enclave
      </button>
    </div>
  )
}

// ─── Subnet discovery dialog ──────────────────────────────────────────────────
function SubnetDiscovery({ enclaveId, onDone }: { enclaveId: string; onDone: () => void }) {
  const [cidr, setCidr] = useState('')
  const [loading, setLoading] = useState(false)
  const [discovered, setDiscovered] = useState<any[]>([])
  const [error, setError] = useState('')

  async function doDiscover() {
    setLoading(true)
    setError('')
    setDiscovered([])
    try {
      const res = await fetch(`${API()}/api/v1/fleet/enclaves/${enclaveId}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidr }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setDiscovered(data.discovered ?? [])
      if (data.discovered?.length > 0) setTimeout(onDone, 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Subnet Discovery</span>
      <div className="flex gap-2">
        <input
          value={cidr}
          onChange={e => setCidr(e.target.value)}
          placeholder="10.1.1.0/24"
          className="flex-1 bg-[#080f1c] border border-[#1a9fe8]/20 rounded-lg px-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1a9fe8]/50"
        />
        <button
          onClick={doDiscover}
          disabled={loading || !cidr}
          className="px-4 py-2.5 rounded-lg bg-violet-500/15 border border-violet-500/40 text-violet-400 text-xs font-bold hover:bg-violet-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <span className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Scan
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-[#cc2a36]/30 bg-[#cc2a36]/8 text-xs font-mono text-[#cc2a36]">{error}</div>
      )}

      {discovered.length > 0 && (
        <div className="rounded-lg border border-[#22c55e]/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-[#22c55e]/15 bg-[#22c55e]/5">
            <span className="text-[10px] font-mono text-[#22c55e]">✓ {discovered.length} hosts discovered</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {discovered.map((h: any) => (
              <div key={h.ip} className="flex items-center justify-between px-3 py-2 border-b border-[#1a9fe8]/8 hover:bg-[#1a9fe8]/5">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3 h-3 text-[#22c55e]" />
                  <span className="text-xs font-mono text-white">{h.ip}</span>
                  {h.hostname && <span className="text-[10px] text-slate-500">{h.hostname}</span>}
                </div>
                {h.os && <span className="text-[9px] font-mono text-[#4EAEF5] border border-[#4EAEF5]/20 px-1.5 py-0.5 rounded">{h.os}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Asset detail panel ───────────────────────────────────────────────────────
function AssetDetail({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const score = asset.last_score ?? 0
  const sprs = asset.sprs_impact ?? 110

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a9fe8]/15">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Asset Detail</span>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a2540] border border-[#1a9fe8]/20 flex items-center justify-center flex-shrink-0">
            <Server className="w-5 h-5 text-[#4EAEF5]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{asset.name}</div>
            <div className="text-[10px] font-mono text-slate-500">{asset.ip}</div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <StatusBadge status={asset.status} />
              <CMMCBadge cat={asset.cmmc_category} />
            </div>
          </div>
        </div>

        {/* SPRS + Score gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-3 flex flex-col items-center">
            <SPRSGauge score={sprs} label="SPRS Score" size="md" />
          </div>
          <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-3 flex flex-col items-center">
            <div className="text-2xl font-black text-[#4EAEF5] tabular-nums">{(score * 100).toFixed(0)}%</div>
            <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-wider">STIG Score</div>
            <ScoreBar score={score} className="w-full mt-2" />
          </div>
        </div>

        {/* Metadata table */}
        <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl overflow-hidden">
          {[
            ['Hostname', asset.hostname || '—'],
            ['OS / Profile', `${asset.os} → ${asset.stig_profile || 'auto'}`],
            ['Enclave', asset.enclave_id],
            ['Last Scan', asset.last_scan ? new Date(asset.last_scan).toLocaleString() : 'Never'],
            ['Asset ID', asset.id.slice(0, 16) + '…'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between px-3 py-2.5 border-b border-[#1a9fe8]/8 last:border-0">
              <span className="text-[10px] font-mono text-slate-500 w-24 flex-shrink-0">{k}</span>
              <span className="text-[10px] font-mono text-slate-300 text-right break-all">{v}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {asset.description && (
          <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-3">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Description</div>
            <div className="text-xs text-slate-300">{asset.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Scan progress panel ──────────────────────────────────────────────────────
function ScanProgressPanel({ summary, results }: { summary: FleetScanSummary | null; results: FleetScanResult[] }) {
  if (!summary) return null
  const done = summary.completed_at != null
  const pct = summary.total_assets > 0 ? (summary.completed / summary.total_assets) * 100 : 0

  return (
    <div className="bg-[#080f1c] border border-[#4EAEF5]/25 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!done && <span className="w-2 h-2 bg-[#4EAEF5] rounded-full animate-pulse" />}
          {done && <CheckCircle className="w-4 h-4 text-[#22c55e]" />}
          <span className="text-xs font-mono text-white font-bold">
            {done ? 'Scan Complete' : 'Scanning Fleet…'}
          </span>
          <span className="text-[9px] font-mono text-slate-500">{summary.run_id}</span>
        </div>
        <span className="text-xs font-mono text-[#4EAEF5]">
          {summary.completed}/{summary.total_assets}
        </span>
      </div>

      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4EAEF5] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-4 text-[10px] font-mono">
        <span className="text-[#22c55e]">✓ {summary.successful} ok</span>
        <span className="text-[#cc2a36]">✗ {summary.failed} failed</span>
        {done && summary.fleet_sprs > 0 && (
          <span className="text-[#4EAEF5]">Fleet SPRS: {summary.fleet_sprs}</span>
        )}
      </div>

      {results.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-1.5">
          {results.slice(-8).map(r => (
            <div key={r.asset_id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono ${r.scan_error ? 'bg-[#cc2a36]/8 border border-[#cc2a36]/20' : 'bg-[#22c55e]/5 border border-[#22c55e]/15'}`}>
              <span className={r.scan_error ? 'text-[#cc2a36]' : 'text-[#22c55e]'}>
                {r.scan_error ? '✗' : '✓'} {r.asset_name}
              </span>
              {!r.scan_error && (
                <span className="text-slate-400">
                  {(r.score * 100).toFixed(0)}% · SPRS {r.sprs_impact}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Enclave tree node ────────────────────────────────────────────────────────
function EnclaveTreeItem({
  enclave, assets, selected, onSelect, selectedAsset, onSelectAsset,
}: {
  enclave: Enclave
  assets: Asset[]
  selected: boolean
  onSelect: () => void
  selectedAsset: Asset | null
  onSelectAsset: (a: Asset | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const enclaveAssets = assets.filter(a => a.enclave_id === enclave.id)
  const avgScore = enclaveAssets.length > 0
    ? enclaveAssets.reduce((s, a) => s + (a.last_score ?? 0), 0) / enclaveAssets.length
    : 0
  const sprsColor = enclave.sprs >= 90 ? '#22c55e' : enclave.sprs >= 70 ? '#e5a54b' : '#cc2a36'

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${selected ? 'border-[#4EAEF5]/40' : 'border-[#1a9fe8]/15'}`}>
      {/* Enclave header */}
      <button
        onClick={() => { onSelect(); setExpanded(!expanded) }}
        className={`w-full flex items-center justify-between px-3 py-3 transition-all ${selected ? 'bg-[#4EAEF5]/8' : 'bg-[#080f1c] hover:bg-[#4EAEF5]/5'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
          <Layers className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span className="text-sm font-bold text-white truncate">{enclave.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-mono text-slate-500">{enclaveAssets.length} assets</span>
          <span className="text-xs font-black font-mono" style={{ color: sprsColor }}>{enclave.sprs}</span>
        </div>
      </button>

      {/* Network CIDR + score bar */}
      {enclave.network_cidr && expanded && (
        <div className="px-3 py-1.5 bg-[#050c16]/80 border-b border-[#1a9fe8]/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono text-slate-500">{enclave.network_cidr}</span>
            <span className="text-[9px] font-mono text-slate-400">{(avgScore * 100).toFixed(0)}% avg</span>
          </div>
          <ScoreBar score={avgScore} />
        </div>
      )}

      {/* Asset list */}
      {expanded && (
        <div className="divide-y divide-[#1a9fe8]/8">
          {enclaveAssets.length === 0 ? (
            <div className="px-4 py-4 text-center text-[10px] font-mono text-slate-600">
              No assets — import CSV or run subnet discovery
            </div>
          ) : (
            enclaveAssets.map(a => (
              <button
                key={a.id}
                onClick={() => onSelectAsset(selectedAsset?.id === a.id ? null : a)}
                className={`w-full flex items-center justify-between px-4 py-2.5 transition-all text-left ${selectedAsset?.id === a.id ? 'bg-[#4EAEF5]/12' : 'hover:bg-[#1a9fe8]/5'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.status === 'enrolled' ? 'bg-[#22c55e] animate-pulse' : a.status === 'scanning' ? 'bg-[#4EAEF5] animate-pulse' : 'bg-slate-600'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white font-medium truncate">{a.name}</span>
                      <CMMCBadge cat={a.cmmc_category} />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">{a.ip} · {a.os}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  {a.last_score != null && (
                    <div className="text-[10px] font-mono" style={{
                      color: a.last_score >= 0.9 ? '#22c55e' : a.last_score >= 0.7 ? '#e5a54b' : '#cc2a36'
                    }}>
                      {(a.last_score * 100).toFixed(0)}%
                    </div>
                  )}
                  {a.sprs_impact != null && (
                    <div className="text-[9px] font-mono text-slate-500">SPRS {a.sprs_impact}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── SPRS Cockpit tiles (Proxmox-style) ───────────────────────────────────────
function SPRSCockpit({ summary, assets }: { summary: FleetSPRSSummary | null; assets: Asset[] }) {
  if (!summary) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-600 font-mono text-xs">
        Loading fleet SPRS…
      </div>
    )
  }

  const tiles = [
    { label: 'Fleet SPRS', value: summary.fleet_sprs, max: 110, icon: Shield, color: '#4EAEF5' },
    { label: 'Enclaves', value: summary.enclave_count, icon: Layers, color: '#818cf8' },
    { label: 'Assets', value: summary.asset_count, icon: Server, color: '#22c55e' },
    { label: 'Failing', value: summary.failing_assets, icon: AlertTriangle, color: '#cc2a36' },
  ]

  const catLabels: Record<CMMCCategory, string> = {
    cui: 'CUI Zone', ot: 'OT Zone', it_general: 'IT Zone', dmz: 'DMZ', admin: 'Admin',
  }

  return (
    <div className="space-y-4">
      {/* Top stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0"
              style={{ borderColor: `${t.color}30`, background: `${t.color}12` }}>
              <t.icon className="w-4 h-4" style={{ color: t.color }} />
            </div>
            <div>
              <div className="text-xl font-black tabular-nums" style={{ color: t.color }}>
                {t.value}
                {t.max && <span className="text-xs text-slate-600 font-normal">/{t.max}</span>}
              </div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{t.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-category SPRS */}
      <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1a9fe8]/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SPRS by Zone</span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.entries(summary.categories) as [CMMCCategory, any][]).map(([cat, data]) => (
            <div key={cat} className="bg-[#050c16] border border-[#1a9fe8]/10 rounded-lg p-2.5 text-center">
              <CMMCBadge cat={cat} />
              <div className="text-lg font-black mt-2 tabular-nums" style={{
                color: data.avg_sprs >= 90 ? '#22c55e' : data.avg_sprs >= 70 ? '#e5a54b' : '#cc2a36'
              }}>
                {Math.round(data.avg_sprs)}
              </div>
              <div className="text-[8px] font-mono text-slate-600 mt-0.5">{catLabels[cat]}</div>
              <div className="text-[8px] font-mono text-slate-500">{data.count} assets</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Fleet Manager page ───────────────────────────────────────────────────
export default function FleetManager() {
  const [enclaves, setEnclaves] = useState<Enclave[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [fleetSPRS, setFleetSPRS] = useState<FleetSPRSSummary | null>(null)
  const [selectedEnclave, setSelectedEnclave] = useState<Enclave | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'fleet' | 'scan' | 'import' | 'discover'>('fleet')

  // Scan state
  const [scanRunning, setScanRunning] = useState(false)
  const [scanSummary, setScanSummary] = useState<FleetScanSummary | null>(null)
  const [scanResults, setScanResults] = useState<FleetScanResult[]>([])
  const [stigProfile, setStigProfile] = useState('rhel9')
  const [lastScan, setLastScan] = useState<FleetScanSummary | null>(null)

  // New enclave form
  const [showNewEnclave, setShowNewEnclave] = useState(false)
  const [newEnclaveName, setNewEnclaveName] = useState('')
  const [newEnclaveCIDR, setNewEnclaveCIDR] = useState('')

  // ─── Data fetch
  const refresh = useCallback(async () => {
    try {
      const base = API()
      const [eRes, sRes] = await Promise.all([
        fetch(`${base}/api/v1/fleet/enclaves`),
        fetch(`${base}/api/v1/fleet/sprs`),
      ])
      if (eRes.ok) {
        const eData = await eRes.json()
        setEnclaves(eData.enclaves ?? [])
        // Collect all assets across enclaves
        const allAssets: Asset[] = []
        for (const enc of (eData.enclaves ?? [])) {
          const aRes = await fetch(`${base}/api/v1/fleet/enclaves/${enc.id}/assets`)
          if (aRes.ok) {
            const aData = await aRes.json()
            allAssets.push(...(aData.assets ?? []))
          }
        }
        setAssets(allAssets)
      }
      if (sRes.ok) {
        setFleetSPRS(await sRes.json())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // ─── Poll scan status
  useEffect(() => {
    if (!scanRunning) return
    const interval = setInterval(async () => {
      const res = await fetch(`${API()}/api/v1/fleet/scan/status`)
      if (!res.ok) return
      const data = await res.json()
      if (!data.running) {
        setScanRunning(false)
        const lastRes = await fetch(`${API()}/api/v1/fleet/scan/last`)
        if (lastRes.ok) setLastScan(await lastRes.json())
        setScanSummary(null)
        refresh()
      } else {
        setScanSummary(data.scan)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [scanRunning, refresh])

  // ─── SSE scan stream
  async function startScan() {
    setScanRunning(true)
    setScanResults([])
    setScanSummary(null)

    const res = await fetch(`${API()}/api/v1/fleet/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enclave_id: selectedEnclave?.id ?? '',
        stig_profile: stigProfile,
      }),
    })
    const data = await res.json()
    if (data.error) { setScanRunning(false); return }

    // SSE stream
    const es = new EventSource(`${API()}/api/v1/fleet/scan/stream`)
    es.addEventListener('result', (e) => {
      const r: FleetScanResult = JSON.parse(e.data)
      setScanResults(prev => [...prev, r])
    })
    es.addEventListener('done', (e) => {
      const s: FleetScanSummary = JSON.parse(e.data)
      setLastScan(s)
      setScanRunning(false)
      es.close()
      refresh()
    })
    es.onerror = () => { setScanRunning(false); es.close() }
  }

  // ─── Create enclave
  async function createEnclave() {
    if (!newEnclaveName.trim()) return
    const res = await fetch(`${API()}/api/v1/fleet/enclaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newEnclaveName, network_cidr: newEnclaveCIDR }),
    })
    if (res.ok) {
      setNewEnclaveName('')
      setNewEnclaveCIDR('')
      setShowNewEnclave(false)
      refresh()
    }
  }

  // ─── Sign boundary
  async function signBoundary() {
    if (!selectedEnclave) return
    const res = await fetch(`${API()}/api/v1/fleet/enclaves/${selectedEnclave.id}/boundary/attest`, {
      method: 'POST',
    })
    if (res.ok) {
      alert('Boundary signed — ML-DSA-65 attestation written to DAG.')
      refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#050c16] text-white">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#050c16]/97 backdrop-blur border-b border-[#1a9fe8]/10">
        <div className="max-w-[1600px] mx-auto px-5 py-2.5 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-mono">ASAF</span>
          </Link>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#4EAEF5]" />
            <span className="text-sm font-bold text-white">Fleet Manager</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/8">
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-[#22c55e]">ML-DSA-65 ACTIVE</span>
            </div>
            <button
              onClick={refresh}
              className="p-1.5 rounded-lg border border-[#1a9fe8]/20 hover:border-[#1a9fe8]/40 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-[52px] flex h-screen overflow-hidden">
        {/* ─── Left sidebar: enclave tree ─────────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-r border-[#1a9fe8]/15 flex flex-col bg-[#080f1c]/60 overflow-hidden">
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-[#1a9fe8]/10 flex items-center justify-between flex-shrink-0">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Enclave Registry</span>
            <button
              onClick={() => setShowNewEnclave(!showNewEnclave)}
              className="w-5 h-5 rounded border border-[#4EAEF5]/30 text-[#4EAEF5] flex items-center justify-center hover:bg-[#4EAEF5]/15 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* New enclave form */}
          {showNewEnclave && (
            <div className="px-3 py-3 border-b border-[#1a9fe8]/10 space-y-2 flex-shrink-0">
              <input
                value={newEnclaveName}
                onChange={e => setNewEnclaveName(e.target.value)}
                placeholder="Enclave name"
                className="w-full bg-[#050c16] border border-[#1a9fe8]/20 rounded-lg px-2.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1a9fe8]/50"
              />
              <input
                value={newEnclaveCIDR}
                onChange={e => setNewEnclaveCIDR(e.target.value)}
                placeholder="CIDR (optional) 10.0.0.0/24"
                className="w-full bg-[#050c16] border border-[#1a9fe8]/20 rounded-lg px-2.5 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-[#1a9fe8]/50"
              />
              <button
                onClick={createEnclave}
                className="w-full py-1.5 rounded-lg bg-[#4EAEF5]/15 border border-[#4EAEF5]/30 text-[#4EAEF5] text-[10px] font-mono font-bold hover:bg-[#4EAEF5]/25 transition-all"
              >
                Create Enclave
              </button>
            </div>
          )}

          {/* Enclave tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 rounded-xl bg-[#080f1c] border border-[#1a9fe8]/10 animate-pulse" />
                ))}
              </div>
            ) : enclaves.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Layers className="w-8 h-8 text-slate-700 mx-auto" />
                <div className="text-xs font-mono text-slate-600">No enclaves yet</div>
                <div className="text-[10px] text-slate-700">Create one above to begin</div>
              </div>
            ) : (
              enclaves.map(enc => (
                <EnclaveTreeItem
                  key={enc.id}
                  enclave={enc}
                  assets={assets}
                  selected={selectedEnclave?.id === enc.id}
                  onSelect={() => setSelectedEnclave(selectedEnclave?.id === enc.id ? null : enc)}
                  selectedAsset={selectedAsset}
                  onSelectAsset={setSelectedAsset}
                />
              ))
            )}
          </div>

          {/* Sign boundary button */}
          {selectedEnclave && (
            <div className="flex-shrink-0 p-3 border-t border-[#1a9fe8]/10">
              <button
                onClick={signBoundary}
                className="w-full py-2.5 rounded-lg bg-[#D4AF37]/12 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#D4AF37]/20 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign Boundary — ML-DSA-65
              </button>
            </div>
          )}
        </div>

        {/* ─── Main content area ───────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex-shrink-0 border-b border-[#1a9fe8]/10 px-6">
              <div className="flex items-center gap-1">
                {([
                  ['fleet', 'SPRS Cockpit', BarChart2],
                  ['scan', 'STIG Scanner', Shield],
                  ['import', 'CSV Import', Upload],
                  ['discover', 'Subnet Discovery', Search],
                ] as const).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-[10px] font-mono font-bold border-b-2 transition-all ${
                      activeTab === id
                        ? 'border-[#4EAEF5] text-[#4EAEF5]'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'fleet' && (
                <>
                  <div>
                    <h1 className="text-lg font-black text-white mb-1">SPRS Cockpit</h1>
                    <p className="text-xs text-slate-400">
                      NIST SP 800-171A · 110-practice DoD scoring across all enrolled assets
                    </p>
                  </div>
                  <SPRSCockpit summary={fleetSPRS} assets={assets} />

                  {/* Asset roster */}
                  {assets.length > 0 && (
                    <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-[#1a9fe8]/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Asset Roster</span>
                        <span className="text-[9px] font-mono text-slate-600">{assets.length} total</span>
                      </div>
                      <div className="divide-y divide-[#1a9fe8]/8">
                        {assets.map(a => (
                          <div
                            key={a.id}
                            onClick={() => setSelectedAsset(selectedAsset?.id === a.id ? null : a)}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-[#1a9fe8]/5 cursor-pointer transition-all"
                          >
                            <Server className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-white">{a.name}</span>
                                <CMMCBadge cat={a.cmmc_category} />
                                <StatusBadge status={a.status} />
                              </div>
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5">{a.ip} · {a.os}</div>
                            </div>
                            {a.last_score != null && (
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="w-24">
                                  <div className="flex justify-between text-[9px] font-mono mb-0.5">
                                    <span className="text-slate-500">STIG</span>
                                    <span style={{ color: a.last_score >= 0.9 ? '#22c55e' : a.last_score >= 0.7 ? '#e5a54b' : '#cc2a36' }}>
                                      {(a.last_score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <ScoreBar score={a.last_score} />
                                </div>
                                {a.sprs_impact != null && (
                                  <div className="text-sm font-black tabular-nums" style={{
                                    color: a.sprs_impact >= 90 ? '#22c55e' : a.sprs_impact >= 70 ? '#e5a54b' : '#cc2a36'
                                  }}>
                                    {a.sprs_impact}
                                  </div>
                                )}
                              </div>
                            )}
                            {a.last_score == null && (
                              <span className="text-[9px] font-mono text-slate-600">Not scanned</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assets.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Server className="w-12 h-12 text-slate-700" />
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-400">No assets enrolled</div>
                        <div className="text-xs text-slate-600 mt-1">Use CSV Import or Subnet Discovery to add assets</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setActiveTab('import')} className="px-4 py-2 rounded-lg bg-[#4EAEF5]/15 border border-[#4EAEF5]/30 text-[#4EAEF5] text-xs font-bold hover:bg-[#4EAEF5]/25 transition-all flex items-center gap-1.5">
                          <Upload className="w-3 h-3" /> CSV Import
                        </button>
                        <button onClick={() => setActiveTab('discover')} className="px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-bold hover:bg-violet-500/25 transition-all flex items-center gap-1.5">
                          <Search className="w-3 h-3" /> Discover Subnet
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'scan' && (
                <>
                  <div>
                    <h1 className="text-lg font-black text-white mb-1">STIG Scanner</h1>
                    <p className="text-xs text-slate-400">
                      Run BulkScanner across enrolled assets · Results signed as ML-DSA-65 DAG nodes
                    </p>
                  </div>

                  {/* Scan config */}
                  <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Target Enclave</label>
                        <select
                          value={selectedEnclave?.id ?? ''}
                          onChange={e => setSelectedEnclave(enclaves.find(enc => enc.id === e.target.value) ?? null)}
                          className="w-full bg-[#050c16] border border-[#1a9fe8]/20 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1a9fe8]/50"
                        >
                          <option value="">All enclaves</option>
                          {enclaves.map(enc => (
                            <option key={enc.id} value={enc.id}>{enc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">STIG Profile</label>
                        <select
                          value={stigProfile}
                          onChange={e => setStigProfile(e.target.value)}
                          className="w-full bg-[#050c16] border border-[#1a9fe8]/20 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#1a9fe8]/50"
                        >
                          <option value="rhel9">RHEL 9 STIG (8 checks)</option>
                          <option value="windows">Windows Server 2022 STIG</option>
                          <option value="ubuntu">Ubuntu 22.04 STIG</option>
                          <option value="generic">Generic (connectivity)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={startScan}
                        disabled={scanRunning || assets.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4EAEF5]/15 border border-[#4EAEF5]/40 text-[#4EAEF5] text-sm font-bold hover:bg-[#4EAEF5]/25 transition-all disabled:opacity-50"
                      >
                        {scanRunning
                          ? <><span className="w-4 h-4 border-2 border-[#4EAEF5]/30 border-t-[#4EAEF5] rounded-full animate-spin" /> Scanning…</>
                          : <><Play className="w-4 h-4" /> Start Fleet Scan</>
                        }
                      </button>
                      <span className="text-[10px] font-mono text-slate-500">
                        {assets.length} assets eligible
                      </span>
                    </div>
                  </div>

                  {/* Active scan */}
                  <ScanProgressPanel summary={scanSummary} results={scanResults} />

                  {/* Last completed scan */}
                  {lastScan && (
                    <div className="bg-[#080f1c] border border-[#22c55e]/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                          <span className="text-xs font-mono font-bold text-white">Last Scan</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">
                          {lastScan.completed_at ? new Date(lastScan.completed_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#22c55e]/8 border border-[#22c55e]/20 rounded-lg py-2">
                          <div className="text-xl font-black text-[#22c55e]">{lastScan.successful}</div>
                          <div className="text-[9px] font-mono text-slate-500">Passed</div>
                        </div>
                        <div className="bg-[#cc2a36]/8 border border-[#cc2a36]/20 rounded-lg py-2">
                          <div className="text-xl font-black text-[#cc2a36]">{lastScan.failed}</div>
                          <div className="text-[9px] font-mono text-slate-500">Failed</div>
                        </div>
                        <div className="bg-[#4EAEF5]/8 border border-[#4EAEF5]/20 rounded-lg py-2">
                          <div className="text-xl font-black text-[#4EAEF5]">{lastScan.fleet_sprs}</div>
                          <div className="text-[9px] font-mono text-slate-500">Fleet SPRS</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'import' && (
                <>
                  <div>
                    <h1 className="text-lg font-black text-white mb-1">CSV Import Wizard</h1>
                    <p className="text-xs text-slate-400">
                      Bulk-import assets from spreadsheet · Accepted columns: name, ip, os, cmmc_category, hostname, description
                    </p>
                  </div>
                  {selectedEnclave ? (
                    <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-5">
                      <CSVImportWizard enclaveId={selectedEnclave.id} onDone={refresh} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <Layers className="w-10 h-10 text-slate-700" />
                      <div className="text-sm font-bold text-slate-400">Select an enclave first</div>
                      <div className="text-xs text-slate-600">Choose from the tree on the left, or create a new one</div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'discover' && (
                <>
                  <div>
                    <h1 className="text-lg font-black text-white mb-1">Subnet Discovery</h1>
                    <p className="text-xs text-slate-400">
                      Scan a CIDR range for live hosts · Auto-fingerprints OS and hostname
                    </p>
                  </div>
                  {selectedEnclave ? (
                    <div className="bg-[#080f1c] border border-[#1a9fe8]/15 rounded-xl p-5">
                      <SubnetDiscovery enclaveId={selectedEnclave.id} onDone={refresh} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                      <Network className="w-10 h-10 text-slate-700" />
                      <div className="text-sm font-bold text-slate-400">Select an enclave first</div>
                      <div className="text-xs text-slate-600">Choose from the tree on the left, or create a new one</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ─── Right panel: asset detail ──────────────────────────────────── */}
          {selectedAsset && (
            <div className="w-72 flex-shrink-0 border-l border-[#1a9fe8]/15 bg-[#080f1c]/60 flex flex-col overflow-hidden">
              <AssetDetail asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
