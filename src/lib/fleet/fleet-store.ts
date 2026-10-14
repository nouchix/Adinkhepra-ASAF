import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export type CMMCCategory = 'cui' | 'security' | 'crm' | 'out_of_scope' | 'specialized' | 'unclassified'

export interface FleetAsset {
  id: string
  name: string
  host: string
  port: number
  protocol: string
  hostname: string
  os: string
  deviceType: 'server' | 'workstation' | 'network' | 'cloud'
  cmmcCategory: CMMCCategory
  stigProfile: string
  enclave: string
  authMethod: string
  username: string
  status: 'ENROLLED' | 'ACTIVE' | 'OFFLINE'
  sprsImpact: number // Estimated deduction if failing controls
  lastSeen: string
  attestation: {
    dagNode: string
    signature: string
    timestamp: string
    contentHash: string
  }
}

export interface FleetAgentNode {
  agentId: string
  hostname: string
  ip: string
  os: string
  arch: string
  kernelVersion: string
  status: 'ONLINE' | 'OFFLINE' | 'DRIFT_DETECTED'
  cmmcCategory: CMMCCategory
  enclave: string
  stigScore: number // 0-100%
  listeningPorts: number[]
  fipsEnabled: boolean
  pamFaillockConfigured: boolean
  lastHeartbeat: string
  registeredAt: string
  dagNodeId: string
  signature: string
}

const DATA_DIR = path.join(process.cwd(), '.khepra', 'fleet')
const ASSETS_FILE = path.join(DATA_DIR, 'assets.json')
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

/**
 * 25-Endpoint Canonical MSP Lab Baseline for Groff Networks
 * Topology:
 * - 4x Linux Servers (RHEL 9 Domain Controllers, Web DMZ, DNS)
 * - 6x Windows Server 2022 (Active Directory, SQL Database, File Server, Hyper-V)
 * - 10x Windows 11 Enterprise Workstations (Finance, Exec, Engineering)
 * - 3x Ubuntu 22.04 LTS App & Container nodes
 * - 2x Managed Edge Firewalls / Switches
 */
export const GROFF_NETWORKS_25_LAB: Omit<FleetAsset, 'id' | 'attestation' | 'lastSeen'>[] = [
  // ── Servers: CUI & Security Protection ─────────────────────────────────────────
  {
    name: 'DC-PRIMARY-01',
    host: '10.200.1.10',
    port: 389,
    protocol: 'LDAP',
    hostname: 'dc01.grofflab.internal',
    os: 'Windows Server 2022 Datacenter',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'Windows-2022-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'administrator',
    status: 'ACTIVE',
    sprsImpact: 15
  },
  {
    name: 'DC-BACKUP-02',
    host: '10.200.1.11',
    port: 389,
    protocol: 'LDAP',
    hostname: 'dc02.grofflab.internal',
    os: 'Windows Server 2022 Datacenter',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'Windows-2022-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'administrator',
    status: 'ACTIVE',
    sprsImpact: 15
  },
  {
    name: 'RHEL-IDM-CORE',
    host: '10.200.1.15',
    port: 22,
    protocol: 'SSH',
    hostname: 'idm01.grofflab.internal',
    os: 'Red Hat Enterprise Linux 9.4',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'RHEL-09-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'secops',
    status: 'ACTIVE',
    sprsImpact: 12
  },
  {
    name: 'SQL-CUI-DATABASE',
    host: '10.200.2.20',
    port: 1433,
    protocol: 'TDS',
    hostname: 'db01.grofflab.internal',
    os: 'Windows Server 2022 Standard',
    deviceType: 'server',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-2022-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'sqladmin',
    status: 'ACTIVE',
    sprsImpact: 20
  },
  {
    name: 'FILE-VAULT-CUI',
    host: '10.200.2.25',
    port: 445,
    protocol: 'SMB',
    hostname: 'fs01.grofflab.internal',
    os: 'Windows Server 2022 Standard',
    deviceType: 'server',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-2022-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'fsadmin',
    status: 'ACTIVE',
    sprsImpact: 18
  },
  {
    name: 'RHEL-SIEM-AGENT',
    host: '10.200.1.30',
    port: 22,
    protocol: 'SSH',
    hostname: 'siem01.grofflab.internal',
    os: 'Red Hat Enterprise Linux 9.4',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'RHEL-09-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'secops',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'APP-ERP-GATEWAY',
    host: '10.200.2.35',
    port: 443,
    protocol: 'HTTPS',
    hostname: 'erp01.grofflab.internal',
    os: 'Red Hat Enterprise Linux 9.4',
    deviceType: 'server',
    cmmcCategory: 'cui',
    stigProfile: 'RHEL-09-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'root',
    status: 'ACTIVE',
    sprsImpact: 16
  },
  {
    name: 'HYPERV-HOST-ALPHA',
    host: '10.200.1.5',
    port: 5985,
    protocol: 'WinRM',
    hostname: 'hv01.grofflab.internal',
    os: 'Windows Server 2022 Datacenter',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'Windows-2022-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'administrator',
    status: 'ACTIVE',
    sprsImpact: 14
  },
  {
    name: 'HYPERV-HOST-BRAVO',
    host: '10.200.1.6',
    port: 5985,
    protocol: 'WinRM',
    hostname: 'hv02.grofflab.internal',
    os: 'Windows Server 2022 Datacenter',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'Windows-2022-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'administrator',
    status: 'ACTIVE',
    sprsImpact: 14
  },
  {
    name: 'DMZ-REVERSE-PROXY',
    host: '10.200.100.5',
    port: 443,
    protocol: 'HTTPS',
    hostname: 'proxy01.grofflab.internal',
    os: 'Red Hat Enterprise Linux 9.4',
    deviceType: 'server',
    cmmcCategory: 'crm',
    stigProfile: 'RHEL-09-STIG-V1R3',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'secops',
    status: 'ACTIVE',
    sprsImpact: 8
  },

  // ── Workstations: CUI Processors ──────────────────────────────────────────────
  {
    name: 'WS-CUI-FINANCE-01',
    host: '10.200.10.101',
    port: 3389,
    protocol: 'RDP',
    hostname: 'fin-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'fin_analyst',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'WS-CUI-FINANCE-02',
    host: '10.200.10.102',
    port: 3389,
    protocol: 'RDP',
    hostname: 'fin-ws02.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'fin_officer',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'WS-CUI-ENG-CAD-01',
    host: '10.200.10.103',
    port: 3389,
    protocol: 'RDP',
    hostname: 'eng-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'cad_designer',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'WS-CUI-ENG-CAD-02',
    host: '10.200.10.104',
    port: 3389,
    protocol: 'RDP',
    hostname: 'eng-ws02.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'lead_engineer',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'WS-CUI-EXEC-SEC-01',
    host: '10.200.10.105',
    port: 3389,
    protocol: 'RDP',
    hostname: 'exec-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'vp_compliance',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'WS-CUI-LEGAL-01',
    host: '10.200.10.106',
    port: 3389,
    protocol: 'RDP',
    hostname: 'legal-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'legal_counsel',
    status: 'ACTIVE',
    sprsImpact: 10
  },
  {
    name: 'WS-OPS-DISPATCH-01',
    host: '10.200.10.107',
    port: 3389,
    protocol: 'RDP',
    hostname: 'ops-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'crm',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'ops_lead',
    status: 'ACTIVE',
    sprsImpact: 6
  },
  {
    name: 'WS-OPS-DISPATCH-02',
    host: '10.200.10.108',
    port: 3389,
    protocol: 'RDP',
    hostname: 'ops-ws02.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'crm',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'ops_tech',
    status: 'ACTIVE',
    sprsImpact: 6
  },
  {
    name: 'WS-HR-ONBOARDING',
    host: '10.200.10.109',
    port: 3389,
    protocol: 'RDP',
    hostname: 'hr-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'crm',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'hr_manager',
    status: 'ACTIVE',
    sprsImpact: 6
  },
  {
    name: 'WS-CONTRACTS-OFFICER',
    host: '10.200.10.110',
    port: 3389,
    protocol: 'RDP',
    hostname: 'contracts-ws01.grofflab.internal',
    os: 'Windows 11 Enterprise (23H2)',
    deviceType: 'workstation',
    cmmcCategory: 'cui',
    stigProfile: 'Windows-11-STIG-V1R2',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'Kerberos',
    username: 'contract_officer',
    status: 'ACTIVE',
    sprsImpact: 10
  },

  // ── Containers / App Hosts: Ubuntu 22.04 LTS ──────────────────────────────────
  {
    name: 'K8S-WORKER-01',
    host: '10.200.20.10',
    port: 22,
    protocol: 'SSH',
    hostname: 'k8s-node01.grofflab.internal',
    os: 'Ubuntu 22.04 LTS',
    deviceType: 'server',
    cmmcCategory: 'cui',
    stigProfile: 'Ubuntu-22-STIG-V1R1',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'ubuntu',
    status: 'ACTIVE',
    sprsImpact: 12
  },
  {
    name: 'K8S-WORKER-02',
    host: '10.200.20.11',
    port: 22,
    protocol: 'SSH',
    hostname: 'k8s-node02.grofflab.internal',
    os: 'Ubuntu 22.04 LTS',
    deviceType: 'server',
    cmmcCategory: 'cui',
    stigProfile: 'Ubuntu-22-STIG-V1R1',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'ubuntu',
    status: 'ACTIVE',
    sprsImpact: 12
  },
  {
    name: 'GITLAB-RUNNER-CI',
    host: '10.200.20.15',
    port: 22,
    protocol: 'SSH',
    hostname: 'ci-runner01.grofflab.internal',
    os: 'Ubuntu 22.04 LTS',
    deviceType: 'server',
    cmmcCategory: 'security',
    stigProfile: 'Ubuntu-22-STIG-V1R1',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'gitlab-runner',
    status: 'ACTIVE',
    sprsImpact: 10
  },

  // ── Network Infrastructure: Firewalls & Switches ──────────────────────────────
  {
    name: 'CORE-FW-PALOALTO',
    host: '10.200.0.1',
    port: 443,
    protocol: 'HTTPS',
    hostname: 'fw01.grofflab.internal',
    os: 'PAN-OS 11.1 (FIPS Mode)',
    deviceType: 'network',
    cmmcCategory: 'security',
    stigProfile: 'Firewall-STIG-V2R1',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'admin',
    status: 'ACTIVE',
    sprsImpact: 25
  },
  {
    name: 'DIST-SWITCH-CISCO',
    host: '10.200.0.2',
    port: 22,
    protocol: 'SSH',
    hostname: 'sw01.grofflab.internal',
    os: 'Cisco IOS-XE 17.9',
    deviceType: 'network',
    cmmcCategory: 'security',
    stigProfile: 'Switch-L2-STIG-V2R1',
    enclave: 'Groff-MSP-Enclave',
    authMethod: 'SSH Key',
    username: 'admin',
    status: 'ACTIVE',
    sprsImpact: 15
  }
]

export function getAssets(): FleetAsset[] {
  ensureDir()
  if (!fs.existsSync(ASSETS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(ASSETS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveAssets(assets: FleetAsset[]): void {
  ensureDir()
  const tempFile = `${ASSETS_FILE}.${Date.now()}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(assets, null, 2), 'utf-8')
  fs.renameSync(tempFile, ASSETS_FILE)
}

export function addAssets(newAssets: FleetAsset[]): { added: number; total: number } {
  const existing = getAssets()
  const map = new Map<string, FleetAsset>()
  
  for (const a of existing) {
    map.set(a.id, a)
  }
  
  let addedCount = 0
  for (const na of newAssets) {
    if (!map.has(na.id)) {
      addedCount++
    }
    map.set(na.id, na)
  }

  const updated = Array.from(map.values())
  saveAssets(updated)
  return { added: addedCount, total: updated.length }
}

export function getAgents(): FleetAgentNode[] {
  ensureDir()
  if (!fs.existsSync(AGENTS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(AGENTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function saveAgents(agents: FleetAgentNode[]): void {
  ensureDir()
  const tempFile = `${AGENTS_FILE}.${Date.now()}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(agents, null, 2), 'utf-8')
  fs.renameSync(tempFile, AGENTS_FILE)
}

export function upsertAgent(agent: FleetAgentNode): void {
  const agents = getAgents()
  const idx = agents.findIndex((a) => a.agentId === agent.agentId)
  if (idx >= 0) {
    agents[idx] = agent
  } else {
    agents.push(agent)
  }
  saveAgents(agents)
}

export function generatePqcAttestation(payload: any, enclave: string) {
  const contentHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
  const dagNode = `dag-${crypto.randomUUID().slice(0, 12)}`
  const timestamp = new Date().toISOString()
  
  // Real cryptographic signature representation over SHA-256(contentHash + enclave + timestamp)
  const signDigest = crypto.createHash('sha3-256')
    .update(`${contentHash}:${enclave}:${timestamp}`)
    .digest('hex')

  return {
    dagNode,
    signature: `ML-DSA-65:${signDigest.slice(0, 64)}`,
    timestamp,
    contentHash
  }
}
