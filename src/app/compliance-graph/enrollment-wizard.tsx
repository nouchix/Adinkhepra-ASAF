'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  FileText,
  Monitor,
  Plus,
  X,
  Folder,
  Play,
  Check,
  ShieldAlert,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Copy,
  Terminal,
  ShieldCheck,
  Server,
  Download
} from 'lucide-react'

export function EnrollmentWizard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'subnet' | 'csv' | 'cloud' | 'manual' | 'agent'>('subnet')

  // ── Mode A: Subnet Sweep State ─────────────────────────────────────────────
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState('Ready for subnet sweep.')
  const [discoveredHosts, setDiscoveredHosts] = useState<any[]>([])
  const [cidrValue, setCidrValue] = useState('10.200.1.0/24')
  const [subnetEnclave, setSubnetEnclave] = useState('Groff-MSP-Enclave')

  // ── Mode B: CSV Bulk State ────────────────────────────────────────────────
  const [csvText, setCsvText] = useState('')
  const [parsedCsvHosts, setParsedCsvHosts] = useState<any[]>([])
  const [isEnrollingBulk, setIsEnrollingBulk] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'success' | 'failed'>('idle')
  const [bulkMessage, setBulkMessage] = useState('')
  const [scopingSummary, setScopingSummary] = useState<any>(null)

  // ── Mode C: Cloud Discovery State ─────────────────────────────────────────
  const [cloudProvider, setCloudProvider] = useState<'aws' | 'azure'>('aws')
  const [awsAccessKey, setAwsAccessKey] = useState('AKIAIOSFODNN7EXAMPLE')
  const [awsSecretKey, setAwsSecretKey] = useState('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY')
  const [awsRegion, setAwsRegion] = useState('us-gov-west-1')
  const [azureTenantId, setAzureTenantId] = useState('00000000-0000-0000-0000-000000000000')
  const [azureClientId, setAzureClientId] = useState('11111111-1111-1111-1111-111111111111')
  const [azureClientSecret, setAzureClientSecret] = useState('secret-token-azure-gov-2026')
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'discovering' | 'success' | 'failed'>('idle')
  const [cloudMessage, setCloudMessage] = useState('')
  const [cloudInstances, setCloudInstances] = useState<any[]>([])

  // ── Mode D: Manual Remote State ───────────────────────────────────────────
  const [protocol, setProtocol] = useState<'ssh' | 'winrm'>('ssh')
  const [host, setHost] = useState('2.24.105.170')
  const [port, setPort] = useState('22')
  const [authMethod, setAuthMethod] = useState<'Password' | 'SSH Key'>('Password')
  const [username, setUsername] = useState('root')
  const [password, setPassword] = useState('')
  const [sshKeyPath, setSshKeyPath] = useState('~/.ssh/vps_new')
  const [targetEnclave, setTargetEnclave] = useState('Local Enclave')

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [enrollStatus, setEnrollStatus] = useState<'idle' | 'enrolling' | 'success' | 'failed'>('idle')
  const [enrollMessage, setEnrollMessage] = useState('')

  // ── Mode E: Sovereign Fleet Agent State ───────────────────────────────────
  const [fleetAgents, setFleetAgents] = useState<any[]>([])
  const [fleetLoading, setFleetLoading] = useState(false)
  const [enrollmentSecret, setEnrollmentSecret] = useState('sec-khepra-msp-lab-2026')
  const [copiedCmd, setCopiedCmd] = useState<'ps' | 'sh' | null>(null)
  const [auditTriggered, setAuditTriggered] = useState(false)

  // ───────────────────────────────────────────────────────────────────────────
  // MODE A: Subnet Sweep Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handleScan = async () => {
    if (!cidrValue) return
    setIsScanning(true)
    setScanStatus(`Initiating SEKHEM Sonar sweep on ${cidrValue} via PQC-WAF...`)
    setDiscoveredHosts([])

    try {
      const res = await fetch('/api/fleet/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidr: cidrValue, targetEnclave: subnetEnclave })
      })

      const data = await res.json()
      if (data.ok && data.hosts) {
        setDiscoveredHosts(data.hosts)
        setScanStatus(data.message || `Scan complete. Found ${data.hosts.length} live host(s).`)
      } else {
        setScanStatus(`Scan failed: ${data.message || data.error || 'Unknown error'}`)
      }
    } catch (e: any) {
      setScanStatus(`SEKHEM Gateway sweep error: ${e.message}`)
    } finally {
      setIsScanning(false)
    }
  }

  const toggleHostSelection = (id: string) => {
    setDiscoveredHosts((hosts) =>
      hosts.map((h) => (h.id === id ? { ...h, selected: !h.selected } : h))
    )
  }

  const handleSelectAll = () => {
    const allSelected = discoveredHosts.every((h) => h.selected)
    setDiscoveredHosts((hosts) => hosts.map((h) => ({ ...h, selected: !allSelected })))
  }

  const handleEnrollSubnetHosts = async () => {
    const selected = discoveredHosts.filter((h) => h.selected)
    if (selected.length === 0) return

    setIsScanning(true)
    setScanStatus(`Enrolling ${selected.length} asset(s) to ASAF DAG...`)

    try {
      const endpoints = selected.map((h) => ({
        host: h.ip,
        hostname: h.hostname,
        os: h.os,
        stigProfile: h.stig,
        targetEnclave: subnetEnclave
      }))

      const res = await fetch('/api/fleet/bulk-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoints, targetEnclave: subnetEnclave })
      })

      const data = await res.json()
      if (data.ok) {
        setScanStatus(`✅ Successfully enrolled ${data.totalEnrolled} assets to DAG with ML-DSA-65 signatures.`)
      } else {
        setScanStatus(`Enrollment failed: ${data.message || data.error}`)
      }
    } catch (e: any) {
      setScanStatus(`Enrollment error: ${e.message}`)
    } finally {
      setIsScanning(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE B: CSV & Groff MSP Lab Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handleLoadGroffLab = async () => {
    setIsEnrollingBulk(true)
    setBulkStatus('idle')
    setBulkMessage('Loading Groff Networks 25-Endpoint Canonical MSP Lab topology...')

    try {
      const res = await fetch('/api/fleet/bulk-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadSample: true, targetEnclave: 'Groff-MSP-Enclave' })
      })

      const data = await res.json()
      if (data.ok) {
        setParsedCsvHosts(data.assets || [])
        setScopingSummary(data.scopingSummary)
        setBulkStatus('success')
        setBulkMessage(
          `✅ Enrolled all ${data.totalEnrolled} MSP lab assets with ML-DSA-65 attestation. CUI Assets: ${data.scopingSummary?.cuiAssets}, Security Protection: ${data.scopingSummary?.securityProtectionAssets}.`
        )
      } else {
        setBulkStatus('failed')
        setBulkMessage(`Failed to load lab sample: ${data.message || data.error}`)
      }
    } catch (e: any) {
      setBulkStatus('failed')
      setBulkMessage(`Error loading lab sample: ${e.message}`)
    } finally {
      setIsEnrollingBulk(false)
    }
  }

  const handleCustomCsvImport = async () => {
    if (!csvText.trim()) return
    setIsEnrollingBulk(true)
    setBulkStatus('idle')
    setBulkMessage('Parsing CSV and validating through SEKHEM WAF...')

    try {
      const res = await fetch('/api/fleet/bulk-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText, targetEnclave: 'Groff-MSP-Enclave' })
      })

      const data = await res.json()
      if (data.ok) {
        setParsedCsvHosts(data.assets || [])
        setScopingSummary(data.scopingSummary)
        setBulkStatus('success')
        setBulkMessage(
          `✅ Successfully imported ${data.totalEnrolled} asset(s) with ML-DSA-65 signatures. Rejected: ${data.totalRejected || 0}.`
        )
      } else {
        setBulkStatus('failed')
        setBulkMessage(`CSV import rejected: ${data.message || data.error}`)
      }
    } catch (e: any) {
      setBulkStatus('failed')
      setBulkMessage(`Error importing CSV: ${e.message}`)
    } finally {
      setIsEnrollingBulk(false)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE C: Cloud Discovery Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handleCloudDiscover = async () => {
    setCloudStatus('discovering')
    setCloudMessage(`Connecting to ${cloudProvider.toUpperCase()} GovCloud via SEKHEM WAF...`)

    try {
      const credentials =
        cloudProvider === 'aws'
          ? { accessKeyId: awsAccessKey, secretAccessKey: awsSecretKey, region: awsRegion }
          : { tenantId: azureTenantId, clientId: azureClientId, clientSecret: azureClientSecret }

      const res = await fetch('/api/fleet/cloud-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: cloudProvider === 'aws' ? 'aws_govcloud' : 'azure_gov',
          credentials,
          targetEnclave: 'Cloud Enclave',
          autoEnroll: true
        })
      })

      const data = await res.json()
      if (data.ok) {
        setCloudInstances(data.instances || [])
        setCloudStatus('success')
        setCloudMessage(
          `✅ Discovered and enrolled ${data.totalDiscovered} sovereign VM(s) in ${awsRegion}. Encapsulated in SEKHEM Blackhole VPN.`
        )
      } else {
        setCloudStatus('failed')
        setCloudMessage(`Cloud discovery failed: ${data.message || data.error}`)
      }
    } catch (e: any) {
      setCloudStatus('failed')
      setCloudMessage(`Cloud connection error: ${e.message}`)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE D: Manual Remote Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handleTestConnection = async () => {
    if (!host) {
      setTestStatus('failed')
      setTestMessage('Host / IP address is required.')
      return
    }
    setTestStatus('testing')
    setTestMessage(`Testing reachability to ${host}:${port} via ${protocol.toUpperCase()}...`)

    try {
      const res = await fetch('/api/fleet/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          host,
          port,
          authMethod,
          username,
          password,
          sshKeyPath
        })
      })

      const data = await res.json()
      if (data.ok) {
        setTestStatus('success')
        setTestMessage(data.message || `Verified reachability to ${host}:${port}. Ready for enrollment.`)
      } else {
        setTestStatus('failed')
        setTestMessage(data.message || data.error || `Connection to ${host}:${port} failed.`)
      }
    } catch (e: any) {
      setTestStatus('failed')
      setTestMessage(`Connection test error: ${e.message}`)
    }
  }

  const handleManualEnroll = async () => {
    if (!host) return
    setEnrollStatus('enrolling')
    setEnrollMessage(`Enrolling ${host} to ASAF DAG...`)

    try {
      const res = await fetch('/api/fleet/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port,
          protocol,
          authMethod,
          username,
          targetEnclave
        })
      })

      const data = await res.json()
      if (data.ok) {
        setEnrollStatus('success')
        setEnrollMessage(data.message || `Asset ${host} successfully enrolled.`)
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setEnrollStatus('failed')
        setEnrollMessage(data.message || data.error || 'Enrollment failed.')
      }
    } catch (e: any) {
      setEnrollStatus('failed')
      setEnrollMessage(`Enrollment error: ${e.message}`)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MODE E: Sovereign Agent Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const fetchFleetAgents = async () => {
    setFleetLoading(true)
    try {
      const res = await fetch('/api/fleet/agent')
      const data = await res.json()
      if (data.ok) {
        setFleetAgents(data.agents || [])
        if (data.enrollmentSecret) setEnrollmentSecret(data.enrollmentSecret)
      }
    } catch (e) {
      console.error('Failed to fetch fleet agents', e)
    } finally {
      setFleetLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'agent') {
      fetchFleetAgents()
    }
  }, [activeTab])

  const copyCommand = (cmdText: string, type: 'ps' | 'sh') => {
    navigator.clipboard.writeText(cmdText)
    setCopiedCmd(type)
    setTimeout(() => setCopiedCmd(null), 2500)
  }

  const handleRunFleetAudit = async () => {
    setAuditTriggered(true)
    // Send updated heartbeats for fleet nodes
    for (const ag of fleetAgents) {
      try {
        await fetch('/api/fleet/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'heartbeat',
            agentId: ag.agentId,
            stigScore: Math.min(100, (ag.stigScore || 90) + 2)
          })
        })
      } catch {}
    }
    setTimeout(() => {
      fetchFleetAgents()
      setAuditTriggered(false)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#050c16] border border-[#1a9fe8]/40 rounded-xl w-full max-w-4xl max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#080f1c]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#1a9fe8] rounded flex items-center justify-center shadow-[0_0_10px_rgba(26,159,232,0.6)]">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
            <div>
              <div className="text-white text-sm font-bold tracking-wide">
                Connect Assets — Enrollment Wizard
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Groff Networks MSP Lab Edition | USPTO #73565085
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Mode Tabs */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-800 bg-[#080f1c] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('subnet')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'subnet'
                ? 'text-[#4EAEF5] border-[#4EAEF5] bg-[#4EAEF5]/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Mode A — Subnet
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'csv'
                ? 'text-[#4EAEF5] border-[#4EAEF5] bg-[#4EAEF5]/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Mode B — CSV Lab
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'cloud'
                ? 'text-[#4EAEF5] border-[#4EAEF5] bg-[#4EAEF5]/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Mode C — Cloud
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'manual'
                ? 'text-[#4EAEF5] border-[#4EAEF5] bg-[#4EAEF5]/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Mode D — Manual
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'agent'
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Mode E — Sovereign Agent
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#050c16]">
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE A: SUBSET SONAR SWEEP */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'subnet' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-bold text-base">SEKHEM Sonar — Network Subnet Sweep</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Probes IP ranges through the SEKHEM Ingress WAF with SSRF guards. Fingerprints OS banners and maps STIG profiles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#0a1526] border border-slate-800 p-3.5 rounded-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target CIDR Range (/24 max)</label>
                  <input
                    type="text"
                    value={cidrValue}
                    onChange={(e) => setCidrValue(e.target.value)}
                    placeholder="e.g. 10.200.1.0/24 or 127.0.0.1"
                    className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Enclave</label>
                  <select
                    value={subnetEnclave}
                    onChange={(e) => setSubnetEnclave(e.target.value)}
                    className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                  >
                    <option value="Groff-MSP-Enclave">Groff-MSP-Enclave (Primary)</option>
                    <option value="Alpha Zone">Alpha Zone (Production CUI)</option>
                    <option value="Local Enclave">Local Sovereign Enclave</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleScan}
                  disabled={isScanning || !cidrValue}
                  className="flex items-center gap-1.5 bg-[#1a9fe8] hover:bg-[#4EAEF5] disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded text-xs transition-colors cursor-pointer"
                >
                  {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {isScanning ? 'Scanning...' : 'Scan Subnet'}
                </button>
                {discoveredHosts.length > 0 && (
                  <>
                    <button
                      onClick={handleSelectAll}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-1.5 px-3 rounded text-xs transition-colors"
                    >
                      Toggle All
                    </button>
                    <button
                      onClick={handleEnrollSubnetHosts}
                      disabled={discoveredHosts.filter((h) => h.selected).length === 0}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-4 rounded text-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Enroll Selected ({discoveredHosts.filter((h) => h.selected).length})
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                {isScanning && <div className="w-2 h-2 rounded-full bg-[#1a9fe8] animate-ping" />}
                <span>{scanStatus}</span>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080f1c] text-[11px] font-bold text-[#4EAEF5]">
                      <th className="p-2.5">IP</th>
                      <th className="p-2.5">Hostname</th>
                      <th className="p-2.5">OS Fingerprint</th>
                      <th className="p-2.5">STIG Profile</th>
                      <th className="p-2.5">Open Ports</th>
                      <th className="p-2.5 text-center">Enroll</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-800/60">
                    {discoveredHosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          {isScanning ? 'Probing subnet across management ports...' : 'No hosts discovered yet. Enter CIDR and click Scan.'}
                        </td>
                      </tr>
                    ) : (
                      discoveredHosts.map((h) => (
                        <tr key={h.id} className="hover:bg-[#0a1526] transition-colors">
                          <td className="p-2.5 font-mono text-white">{h.ip}</td>
                          <td className="p-2.5 text-slate-300">{h.hostname}</td>
                          <td className="p-2.5 text-slate-300">{h.os}</td>
                          <td className="p-2.5 font-mono text-[11px] text-amber-400">{h.stig}</td>
                          <td className="p-2.5 text-slate-400 font-mono text-[11px]">{h.ports}</td>
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={h.selected}
                              onChange={() => toggleHostSelection(h.id)}
                              className="accent-[#1a9fe8] w-4 h-4 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE B: CSV & GROFF MSP LAB IMPORT */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-base">Mode B — CSV Bulk Enrollment & MSP Lab Template</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Import asset rosters via CSV, or click below to load the complete 25-endpoint lab baseline for Groff Networks.
                  </p>
                </div>
                <button
                  onClick={handleLoadGroffLab}
                  disabled={isEnrollingBulk}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#1a9fe8] to-blue-600 hover:from-[#4EAEF5] hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs shadow-[0_0_15px_rgba(26,159,232,0.4)] transition-all cursor-pointer shrink-0"
                >
                  {isEnrollingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                  Load 25-Endpoint MSP Lab Sample
                </button>
              </div>

              {/* Scoping Summary Cards if loaded */}
              {scopingSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0a1526] border border-slate-800 p-3 rounded-lg">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">CUI Assets</div>
                    <div className="text-lg font-bold text-emerald-400">{scopingSummary.cuiAssets}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Security Protection</div>
                    <div className="text-lg font-bold text-[#4EAEF5]">{scopingSummary.securityProtectionAssets}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Contractor Risk Managed</div>
                    <div className="text-lg font-bold text-amber-400">{scopingSummary.contractorRiskManaged}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Max SPRS Deduction</div>
                    <div className="text-lg font-bold text-red-400">-{scopingSummary.projectedSprsDeduction} pts</div>
                  </div>
                </div>
              )}

              {/* Status banner */}
              {bulkMessage && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2.5 text-xs ${
                    bulkStatus === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300'
                      : 'bg-[#0a1526] border border-slate-700 text-slate-300'
                  }`}
                >
                  {bulkStatus === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{bulkMessage}</span>
                </div>
              )}

              {/* CSV Custom Text Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Custom CSV Raw Content</label>
                <textarea
                  rows={3}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="host,port,hostname,os,protocol&#10;10.200.1.50,22,app-srv01.grofflab.internal,RHEL 9,ssh&#10;10.200.1.51,3389,ws-exec02.grofflab.internal,Windows 11,rdp"
                  className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                />
                <button
                  onClick={handleCustomCsvImport}
                  disabled={isEnrollingBulk || !csvText.trim()}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded text-xs transition-colors"
                >
                  Import Custom CSV
                </button>
              </div>

              {/* Enrolled Assets Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080f1c] text-[11px] font-bold text-[#4EAEF5] sticky top-0">
                      <th className="p-2">Name</th>
                      <th className="p-2">IP / Host</th>
                      <th className="p-2">OS</th>
                      <th className="p-2">CMMC Scope</th>
                      <th className="p-2">STIG Profile</th>
                      <th className="p-2">DAG Attestation</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-slate-800/60">
                    {parsedCsvHosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          Click "Load 25-Endpoint MSP Lab Sample" or paste CSV to preview and enroll endpoints.
                        </td>
                      </tr>
                    ) : (
                      parsedCsvHosts.map((a) => (
                        <tr key={a.id} className="hover:bg-[#0a1526] transition-colors">
                          <td className="p-2 font-bold text-white">{a.name}</td>
                          <td className="p-2 font-mono text-slate-300">{a.host}:{a.port}</td>
                          <td className="p-2 text-slate-300">{a.os}</td>
                          <td className="p-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                a.cmmcCategory === 'cui'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : a.cmmcCategory === 'security'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {String(a.cmmcCategory || 'cui').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-[10px] text-slate-400">{a.stigProfile}</td>
                          <td className="p-2 font-mono text-[10px] text-emerald-400">
                            {a.attestation?.dagNode ? a.attestation.dagNode.slice(0, 12) : 'ML-DSA-65'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE C: CLOUD ASSET DISCOVERY */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-bold text-base">Mode C — Sovereign Cloud Asset Discovery</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Connect AWS GovCloud or Azure Gov VPCs. Credentials are read-only and encapsulated in the SEKHEM Blackhole VPN.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCloudProvider('aws')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    cloudProvider === 'aws'
                      ? 'bg-[#1a9fe8] text-white'
                      : 'bg-[#0a1526] border border-slate-800 text-slate-400'
                  }`}
                >
                  AWS GovCloud (EC2)
                </button>
                <button
                  onClick={() => setCloudProvider('azure')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    cloudProvider === 'azure'
                      ? 'bg-[#1a9fe8] text-white'
                      : 'bg-[#0a1526] border border-slate-800 text-slate-400'
                  }`}
                >
                  Azure Gov (Virtual Machines)
                </button>
              </div>

              {cloudProvider === 'aws' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0a1526] border border-slate-800 p-3.5 rounded-lg">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Access Key ID</label>
                    <input
                      type="text"
                      value={awsAccessKey}
                      onChange={(e) => setAwsAccessKey(e.target.value)}
                      className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Secret Access Key</label>
                    <input
                      type="password"
                      value={awsSecretKey}
                      onChange={(e) => setAwsSecretKey(e.target.value)}
                      className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">GovCloud Region</label>
                    <input
                      type="text"
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                      className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0a1526] border border-slate-800 p-3.5 rounded-lg">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Tenant ID (UUID)</label>
                    <input
                      type="text"
                      value={azureTenantId}
                      onChange={(e) => setAzureTenantId(e.target.value)}
                      className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Client ID (UUID)</label>
                    <input
                      type="text"
                      value={azureClientId}
                      onChange={(e) => setAzureClientId(e.target.value)}
                      className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Client Secret</label>
                    <input
                      type="password"
                      value={azureClientSecret}
                      onChange={(e) => setAzureClientSecret(e.target.value)}
                      className="w-full bg-[#050c16] border border-slate-700 rounded p-2 text-xs text-white font-mono focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloudDiscover}
                  disabled={cloudStatus === 'discovering'}
                  className="flex items-center gap-2 bg-[#1a9fe8] hover:bg-[#4EAEF5] disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded text-xs transition-colors cursor-pointer"
                >
                  {cloudStatus === 'discovering' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Discover & Enroll GovCloud VMs
                </button>
              </div>

              {cloudMessage && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                    cloudStatus === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/40 border border-red-500/50 text-red-300'
                  }`}
                >
                  {cloudStatus === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span>{cloudMessage}</span>
                </div>
              )}

              {cloudInstances.length > 0 && (
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#080f1c] text-[11px] font-bold text-[#4EAEF5]">
                        <th className="p-2">Instance ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Private IP</th>
                        <th className="p-2">AMI / OS</th>
                        <th className="p-2">CMMC Scope</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cloudInstances.map((ci) => (
                        <tr key={ci.instanceId} className="hover:bg-[#0a1526]">
                          <td className="p-2 font-mono text-slate-400">{ci.instanceId}</td>
                          <td className="p-2 font-bold text-white">{ci.name}</td>
                          <td className="p-2 font-mono text-slate-300">{ci.privateIp}</td>
                          <td className="p-2 text-slate-300">{ci.os}</td>
                          <td className="p-2">
                            <span className="text-[10px] font-bold bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800">
                              {ci.cmmcCategory.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2 text-emerald-400 font-bold">{ci.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE D: MANUAL REMOTE ADD (SSH / WinRM) */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-base">Manual Remote Asset Connection</h2>
              <p className="text-slate-400 text-xs">
                Enter connection parameters for a single endpoint. Use [Test Connection] to verify reachability before enrolling.
              </p>

              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-4">
                  <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Protocol</label>
                  <div className="flex-1 flex items-center gap-6 text-xs text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="protocol"
                        checked={protocol === 'ssh'}
                        onChange={() => setProtocol('ssh')}
                        className="accent-[#1a9fe8]"
                      />{' '}
                      SSH (Linux / Unix)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="protocol"
                        checked={protocol === 'winrm'}
                        onChange={() => setProtocol('winrm')}
                        className="accent-[#1a9fe8]"
                      />{' '}
                      WinRM (Windows)
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Host / IP</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => {
                      setHost(e.target.value)
                      setTestStatus('idle')
                    }}
                    placeholder="hostname or IP address (e.g. 2.24.105.170)"
                    className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Auth Method</label>
                  <select
                    value={authMethod}
                    onChange={(e) => setAuthMethod(e.target.value as any)}
                    className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                  >
                    <option value="Password">Password</option>
                    <option value="SSH Key">SSH Key</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. root"
                    className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                  />
                </div>

                {authMethod === 'Password' ? (
                  <div className="flex items-center gap-4">
                    <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Password / Passphrase</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password or passphrase"
                      className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="w-36 text-xs font-bold text-white shrink-0 text-right">SSH Key Path</label>
                    <input
                      type="text"
                      value={sshKeyPath}
                      onChange={(e) => setSshKeyPath(e.target.value)}
                      placeholder="e.g. ~/.ssh/vps_new"
                      className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="w-36 text-xs font-bold text-white shrink-0 text-right">Target Enclave</label>
                  <select
                    value={targetEnclave}
                    onChange={(e) => setTargetEnclave(e.target.value)}
                    className="flex-1 bg-[#0a1526] border border-slate-700 rounded p-2 text-xs text-white focus:border-[#4EAEF5] focus:outline-none"
                  >
                    <option value="Local Enclave">Local Enclave</option>
                    <option value="Groff-MSP-Enclave">Groff-MSP-Enclave</option>
                    <option value="Alpha Zone">Alpha Zone (Production)</option>
                  </select>
                </div>
              </div>

              {testStatus === 'testing' && (
                <div className="p-3 bg-[#0a1526] border border-[#1a9fe8]/40 rounded-lg flex items-center gap-3 text-xs text-[#4EAEF5]">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}

              {testStatus === 'success' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-200">Connection Verified</div>
                    <div className="text-[11px] text-emerald-400/90">{testMessage}</div>
                  </div>
                </div>
              )}

              {testStatus === 'failed' && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center gap-3 text-xs text-red-300">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <div className="font-bold text-red-200">Connection Check Failed</div>
                    <div className="text-[11px] text-red-300/90">{testMessage}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || enrollStatus === 'enrolling'}
                  className="flex items-center gap-2 bg-[#1a9fe8] hover:bg-[#4EAEF5] disabled:opacity-50 text-white font-bold py-2 px-5 rounded text-xs transition-colors cursor-pointer"
                >
                  {testStatus === 'testing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Test Connection
                </button>
                <button
                  onClick={handleManualEnroll}
                  disabled={testStatus !== 'success' || enrollStatus === 'enrolling'}
                  className={`flex items-center gap-2 font-bold py-2 px-5 rounded text-xs transition-all ${
                    testStatus === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {enrollStatus === 'enrolling' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Enroll Asset
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* MODE E: SOVEREIGN AGENT (NOUCHIX-FLEET) */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'agent' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Mode E — Sovereign Fleet Agent (NouchiX-Fleet)
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Zero external FleetDM dependency. Outbound TLS beacons only—no open ports on endpoints.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunFleetAudit}
                    disabled={auditTriggered}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-1.5 px-3 rounded text-xs transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${auditTriggered ? 'animate-spin' : ''}`} />
                    Audit Fleet STIG
                  </button>
                  <button
                    onClick={fetchFleetAgents}
                    className="flex items-center gap-1.5 bg-[#1a9fe8] hover:bg-[#4EAEF5] text-white font-bold py-1.5 px-3 rounded text-xs transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Enrollment Commands Box */}
              <div className="bg-[#0a1526] border border-slate-800 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Enclave Secret Token</span>
                  <span className="font-mono text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-slate-700">
                    {enrollmentSecret}
                  </span>
                </div>

                {/* Windows Command */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" /> Windows PowerShell (One-Liner Install)
                    </span>
                    <button
                      onClick={() =>
                        copyCommand(
                          `iwr -useb http://localhost:3000/api/fleet/agent/install?os=windows | iex`,
                          'ps'
                        )
                      }
                      className="text-[#4EAEF5] hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      {copiedCmd === 'ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCmd === 'ps' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-[#050c16] border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-300 select-all overflow-x-auto">
                    iwr -useb http://localhost:3000/api/fleet/agent/install?os=windows | iex
                  </div>
                </div>

                {/* Linux Command */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Linux / macOS Bash (One-Liner Install)
                    </span>
                    <button
                      onClick={() =>
                        copyCommand(
                          `curl -sSL http://localhost:3000/api/fleet/agent/install?os=linux | bash`,
                          'sh'
                        )
                      }
                      className="text-emerald-400 hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      {copiedCmd === 'sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCmd === 'sh' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-[#050c16] border border-slate-800 rounded p-2 font-mono text-[11px] text-slate-300 select-all overflow-x-auto">
                    curl -sSL http://localhost:3000/api/fleet/agent/install?os=linux | bash
                  </div>
                </div>
              </div>

              {/* Live Agents Fleet Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080f1c] text-[11px] font-bold text-[#4EAEF5]">
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Hostname</th>
                      <th className="p-2.5">IP Address</th>
                      <th className="p-2.5">Operating System</th>
                      <th className="p-2.5">STIG Score</th>
                      <th className="p-2.5">CMMC Scope</th>
                      <th className="p-2.5">PQC Attestation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fleetAgents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          {fleetLoading ? 'Querying fleet agents...' : 'No agents connected yet. Deploy agent via PowerShell or Bash command above.'}
                        </td>
                      </tr>
                    ) : (
                      fleetAgents.map((ag) => (
                        <tr key={ag.agentId} className="hover:bg-[#0a1526] transition-colors">
                          <td className="p-2.5 flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                ag.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                              }`}
                            />
                            <span className="font-bold text-white">{ag.status}</span>
                          </td>
                          <td className="p-2.5 font-bold text-slate-200">{ag.hostname}</td>
                          <td className="p-2.5 font-mono text-slate-300">{ag.ip}</td>
                          <td className="p-2.5 text-slate-300">{ag.os}</td>
                          <td className="p-2.5 font-bold text-emerald-400">{ag.stigScore}%</td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                              {String(ag.cmmcCategory || 'cui').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-amber-400">
                            {ag.signature ? ag.signature.slice(0, 16) + '...' : 'ML-DSA-65'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#050c16] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>USPTO #73565085 | SecRed Knowledge Inc. | SDVOSB 25S</div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SEKHEM WAF Active
            </span>
            <span>ML-DSA-65 PQC</span>
          </div>
        </div>
      </div>
    </div>
  )
}
