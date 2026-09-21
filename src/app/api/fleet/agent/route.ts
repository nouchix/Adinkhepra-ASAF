import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { scrubSecrets, generateSpectralFingerprint } from '@/lib/sekhem/secret-scrubber'
import {
  getAgents,
  saveAgents,
  upsertAgent,
  generatePqcAttestation,
  FleetAgentNode
} from '@/lib/fleet/fleet-store'

const ENROLLMENT_SECRET = process.env.KHEPRA_FLEET_SECRET || 'sec-khepra-msp-lab-2026'

// Canonical seed agents for Groff MSP Lab
const SEED_AGENTS: FleetAgentNode[] = [
  {
    agentId: 'agent-rhel9-core-01',
    hostname: 'idm01.grofflab.internal',
    ip: '10.200.1.15',
    os: 'Red Hat Enterprise Linux 9.4',
    arch: 'x86_64',
    kernelVersion: '5.14.0-427.el9.x86_64',
    status: 'ONLINE',
    cmmcCategory: 'security',
    enclave: 'Groff-MSP-Enclave',
    stigScore: 94,
    listeningPorts: [22, 389, 636],
    fipsEnabled: true,
    pamFaillockConfigured: true,
    lastHeartbeat: new Date().toISOString(),
    registeredAt: new Date(Date.now() - 3600000).toISOString(),
    dagNodeId: 'dag-agent-idm01',
    signature: 'ML-DSA-65:b10a56fe7812bc89fa0123'
  },
  {
    agentId: 'agent-win11-exec-01',
    hostname: 'exec-ws01.grofflab.internal',
    ip: '10.200.10.105',
    os: 'Windows 11 Enterprise (23H2)',
    arch: 'x86_64',
    kernelVersion: '10.0.22631.3447',
    status: 'ONLINE',
    cmmcCategory: 'cui',
    enclave: 'Groff-MSP-Enclave',
    stigScore: 91,
    listeningPorts: [3389, 5985],
    fipsEnabled: true,
    pamFaillockConfigured: true,
    lastHeartbeat: new Date().toISOString(),
    registeredAt: new Date(Date.now() - 7200000).toISOString(),
    dagNodeId: 'dag-agent-execws01',
    signature: 'ML-DSA-65:c48a77de4911ef62fa9812'
  },
  {
    agentId: 'agent-ubuntu22-k8s-01',
    hostname: 'k8s-node01.grofflab.internal',
    ip: '10.200.20.10',
    os: 'Ubuntu 22.04 LTS',
    arch: 'x86_64',
    kernelVersion: '5.15.0-105-generic',
    status: 'ONLINE',
    cmmcCategory: 'cui',
    enclave: 'Groff-MSP-Enclave',
    stigScore: 88,
    listeningPorts: [22, 6443, 10250],
    fipsEnabled: false,
    pamFaillockConfigured: true,
    lastHeartbeat: new Date().toISOString(),
    registeredAt: new Date(Date.now() - 5400000).toISOString(),
    dagNodeId: 'dag-agent-k8s01',
    signature: 'ML-DSA-65:fa9942bc112390ef887612'
  }
]

export async function GET() {
  let agents = getAgents()
  if (agents.length === 0) {
    saveAgents(SEED_AGENTS)
    agents = SEED_AGENTS
  }

  // Update real-time online status based on 120-second heartbeat window
  const now = Date.now()
  const enhancedAgents = agents.map((ag) => {
    const ageMs = now - new Date(ag.lastHeartbeat).getTime()
    return {
      ...ag,
      status: ageMs < 120000 ? 'ONLINE' : 'OFFLINE'
    }
  })

  return NextResponse.json({
    ok: true,
    enrollmentSecret: ENROLLMENT_SECRET,
    totalAgents: enhancedAgents.length,
    onlineAgents: enhancedAgents.filter((a) => a.status === 'ONLINE').length,
    agents: enhancedAgents
  })
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const { action = 'heartbeat' } = rawBody

    // ── ACTION: ENROLL ───────────────────────────────────────────────────────
    if (action === 'enroll') {
      const { token, hostname, ip, os, arch, kernelVersion, enclave = 'Groff-MSP-Enclave' } = rawBody

      if (token !== ENROLLMENT_SECRET) {
        return NextResponse.json(
          { ok: false, rule: 'ASAF-001', message: 'Unauthorized: Invalid enclave enrollment token.' },
          { status: 401 }
        )
      }

      if (!hostname || !ip) {
        return NextResponse.json(
          { ok: false, message: 'Agent registration requires hostname and ip.' },
          { status: 400 }
        )
      }

      const agentId = `agent-${hostname.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomUUID().slice(0, 6)}`
      const attestation = generatePqcAttestation(
        { agentId, hostname, ip, os, enclave },
        enclave
      )

      const newAgent: FleetAgentNode = {
        agentId,
        hostname: hostname.trim(),
        ip: ip.trim(),
        os: os || 'Linux / Sovereign OS',
        arch: arch || 'x86_64',
        kernelVersion: kernelVersion || 'generic-kernel',
        status: 'ONLINE',
        cmmcCategory: 'cui',
        enclave,
        stigScore: 95,
        listeningPorts: [22],
        fipsEnabled: true,
        pamFaillockConfigured: true,
        lastHeartbeat: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        dagNodeId: attestation.dagNode,
        signature: attestation.signature
      }

      upsertAgent(newAgent)

      const payload = scrubSecrets({
        ok: true,
        agentId,
        sessionToken: crypto.randomBytes(24).toString('hex'),
        dagNodeId: attestation.dagNode,
        signature: attestation.signature,
        status: 'ENROLLED',
        message: `Agent ${hostname} (${ip}) successfully registered to ${enclave}.`
      })

      const { fingerprint } = generateSpectralFingerprint(payload, 'asaf-agent-enroll')

      return NextResponse.json(payload, {
        status: 200,
        headers: { 'X-Sekhem-FP': fingerprint }
      })
    }

    // ── ACTION: HEARTBEAT ────────────────────────────────────────────────────
    if (action === 'heartbeat') {
      const { agentId, listeningPorts = [], fipsEnabled, pamFaillockConfigured, stigScore } = rawBody
      if (!agentId) {
        return NextResponse.json({ ok: false, message: 'agentId is required for heartbeat' }, { status: 400 })
      }

      const agents = getAgents()
      const existing = agents.find((a) => a.agentId === agentId)

      if (existing) {
        existing.lastHeartbeat = new Date().toISOString()
        existing.status = 'ONLINE'
        if (Array.isArray(listeningPorts)) existing.listeningPorts = listeningPorts
        if (typeof fipsEnabled === 'boolean') existing.fipsEnabled = fipsEnabled
        if (typeof pamFaillockConfigured === 'boolean') existing.pamFaillockConfigured = pamFaillockConfigured
        if (typeof stigScore === 'number') existing.stigScore = stigScore

        upsertAgent(existing)
      }

      return NextResponse.json({
        ok: true,
        agentId,
        serverTime: new Date().toISOString(),
        tasks: [] // Distributed query tasks (FleetDM style)
      })
    }

    return NextResponse.json({ ok: false, message: 'Unknown agent action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal error in sovereign agent hub' },
      { status: 500 }
    )
  }
}
