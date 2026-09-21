import { NextRequest, NextResponse } from 'next/server'
import { validateHost, validatePort } from '@/lib/sekhem/ingress-waf'
import { scrubSecrets, generateSpectralFingerprint } from '@/lib/sekhem/secret-scrubber'
import { addAssets, generatePqcAttestation, FleetAsset } from '@/lib/fleet/fleet-store'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const { host, port = 22, protocol = 'ssh', authMethod, username, targetEnclave = 'Local Enclave' } = rawBody

    // 1. Sekhem Ingress WAF Check
    const hostCheck = validateHost(host)
    if (!hostCheck.valid) {
      return NextResponse.json(
        { ok: false, rule: hostCheck.rule, message: hostCheck.reason },
        { status: 400 }
      )
    }

    const portCheck = validatePort(port)
    if (!portCheck.valid) {
      return NextResponse.json(
        { ok: false, rule: portCheck.rule, message: portCheck.reason },
        { status: 400 }
      )
    }

    const cleanHost = String(host).trim()
    const cleanPort = Number(port) || 22
    const assetId = `asset-${cleanHost.replace(/[^a-zA-Z0-9]/g, '-')}-${cleanPort}`
    
    // TRL 10 Cryptographic PQC Attestation
    const attestation = generatePqcAttestation(
      {
        assetId,
        host: cleanHost,
        port: cleanPort,
        protocol,
        enclave: targetEnclave
      },
      targetEnclave
    )

    const asset: FleetAsset = {
      id: assetId,
      name: `HOST-${cleanHost.replace(/\./g, '-')}`,
      host: cleanHost,
      port: cleanPort,
      protocol: String(protocol).toUpperCase(),
      hostname: `${cleanHost}.sovereign.internal`,
      os: cleanPort === 5985 || cleanPort === 3389 ? 'Windows Server 2022' : 'Red Hat Enterprise Linux 9',
      deviceType: 'server',
      cmmcCategory: 'cui',
      stigProfile: cleanPort === 5985 || cleanPort === 3389 ? 'Windows-2022-STIG-V1R3' : 'RHEL-09-STIG-V1R3',
      enclave: targetEnclave,
      authMethod: authMethod || 'SSH Key',
      username: username || 'root',
      status: 'ENROLLED',
      sprsImpact: 10,
      lastSeen: new Date().toISOString(),
      attestation
    }

    // Persist to disk substrate
    addAssets([asset])

    const safeResponsePayload = scrubSecrets({
      ok: true,
      asset,
      message: `Asset ${cleanHost} successfully enrolled into enclave "${targetEnclave}" with ML-DSA-65 signed attestation.`
    })

    const { fingerprint } = generateSpectralFingerprint(safeResponsePayload, 'asaf-enroll-membrane')

    return NextResponse.json(safeResponsePayload, {
      headers: {
        'X-Sekhem-FP': fingerprint,
        'X-Sekhem-WAF': 'PASS'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error during asset enrollment' },
      { status: 500 }
    )
  }
}
