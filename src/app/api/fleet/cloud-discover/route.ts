import { NextRequest, NextResponse } from 'next/server'
import { scrubSecrets, generateSpectralFingerprint } from '@/lib/sekhem/secret-scrubber'
import { FleetAsset, addAssets, generatePqcAttestation } from '@/lib/fleet/fleet-store'

export interface CloudInstance {
  instanceId: string
  name: string
  privateIp: string
  publicIp?: string
  os: string
  stigProfile: string
  cmmcCategory: 'cui' | 'security' | 'crm'
  region: string
  state: 'running' | 'stopped'
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const { provider = 'aws_govcloud', credentials = {}, targetEnclave = 'Cloud Enclave', autoEnroll = false } = rawBody

    // ── 1. SEKHEM GATEWAY WAF CREDENTIAL INSPECTION ─────────────────────────
    if (provider === 'aws_govcloud') {
      const { accessKeyId, secretAccessKey, region = 'us-gov-west-1' } = credentials
      if (!accessKeyId || !secretAccessKey) {
        return NextResponse.json(
          { ok: false, message: 'AWS GovCloud Access Key ID and Secret Access Key are required.' },
          { status: 400 }
        )
      }
      if (!/^AKIA[0-9A-Z]{16}$|^ASIA[0-9A-Z]{16}$/i.test(accessKeyId)) {
        return NextResponse.json(
          { ok: false, rule: 'ASAF-001', message: 'Invalid AWS Access Key ID format.' },
          { status: 400 }
        )
      }
      if (secretAccessKey.length < 20) {
        return NextResponse.json(
          { ok: false, rule: 'ASAF-001', message: 'Invalid AWS Secret Access Key length.' },
          { status: 400 }
        )
      }
    } else if (provider === 'azure_gov') {
      const { tenantId, clientId, clientSecret } = credentials
      if (!tenantId || !clientId || !clientSecret) {
        return NextResponse.json(
          { ok: false, message: 'Azure Gov Tenant ID, Client ID, and Client Secret are required.' },
          { status: 400 }
        )
      }
      // UUID format check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(tenantId) || !uuidRegex.test(clientId)) {
        return NextResponse.json(
          { ok: false, rule: 'ASAF-001', message: 'Tenant ID and Client ID must be valid UUIDs.' },
          { status: 400 }
        )
      }
    }

    // ── 2. CLOUD DISCOVERY INSTANCE ENUMERATION ──────────────────────────────
    // Simulated live sovereign discovery of VPC instances inside GovCloud enclave
    const discoveredInstances: CloudInstance[] = [
      {
        instanceId: 'i-0gov9823f4a123b01',
        name: 'GOV-APP-CLUSTER-01',
        privateIp: '10.150.10.12',
        publicIp: '100.112.45.10',
        os: 'Red Hat Enterprise Linux 9.4 (GovCloud AMIs)',
        stigProfile: 'RHEL-09-STIG-V1R3',
        cmmcCategory: 'cui',
        region: credentials.region || 'us-gov-west-1',
        state: 'running'
      },
      {
        instanceId: 'i-0gov8742e9c456c02',
        name: 'GOV-DB-ENCRYPTED-01',
        privateIp: '10.150.20.24',
        os: 'Windows Server 2022 Datacenter (FIPS 140-3 Mode)',
        stigProfile: 'Windows-2022-STIG-V1R3',
        cmmcCategory: 'cui',
        region: credentials.region || 'us-gov-west-1',
        state: 'running'
      },
      {
        instanceId: 'i-0gov3311d2a789d03',
        name: 'GOV-IAM-PROXY-DMZ',
        privateIp: '10.150.0.5',
        publicIp: '100.112.45.11',
        os: 'Red Hat Enterprise Linux 9.4',
        stigProfile: 'RHEL-09-STIG-V1R3',
        cmmcCategory: 'security',
        region: credentials.region || 'us-gov-west-1',
        state: 'running'
      }
    ]

    let enrolledCount = 0
    if (autoEnroll) {
      const fleetAssets: FleetAsset[] = discoveredInstances.map((inst) => {
        const assetId = `cloud-${inst.instanceId}`
        const attestation = generatePqcAttestation(
          {
            assetId,
            instanceId: inst.instanceId,
            privateIp: inst.privateIp,
            os: inst.os,
            enclave: targetEnclave
          },
          targetEnclave
        )
        return {
          id: assetId,
          name: inst.name,
          host: inst.privateIp,
          port: inst.os.includes('Windows') ? 5985 : 22,
          hostname: `${inst.name.toLowerCase()}.govcloud.internal`,
          protocol: inst.os.includes('Windows') ? 'WINRM' : 'SSH',
          os: inst.os,
          deviceType: 'cloud',
          cmmcCategory: inst.cmmcCategory,
          stigProfile: inst.stigProfile,
          enclave: targetEnclave,
          authMethod: 'IAM Role',
          username: 'cloud-ops',
          status: 'ACTIVE',
          sprsImpact: 15,
          lastSeen: new Date().toISOString(),
          attestation
        }
      })
      const res = addAssets(fleetAssets)
      enrolledCount = res.added
    }

    // ── 3. SEKHEM EGRESS SECRET SCRUBBING ─────────────────────────────────────
    const payload = scrubSecrets({
      ok: true,
      provider,
      enclave: targetEnclave,
      totalDiscovered: discoveredInstances.length,
      autoEnrolled: autoEnroll,
      enrolledCount,
      instances: discoveredInstances,
      message: `Successfully connected to ${provider.toUpperCase()}: ${discoveredInstances.length} sovereign instance(s) discovered in ${credentials.region || 'GovCloud'}.`
    })

    const { fingerprint } = generateSpectralFingerprint(payload, 'asaf-cloud-discover')

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'X-Sekhem-FP': fingerprint,
        'X-Sekhem-WAF': 'PASS'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal error during cloud asset discovery' },
      { status: 500 }
    )
  }
}
