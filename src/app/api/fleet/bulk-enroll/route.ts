import { NextRequest, NextResponse } from 'next/server'
import { validateHost, validatePort } from '@/lib/sekhem/ingress-waf'
import { scrubSecrets, generateSpectralFingerprint } from '@/lib/sekhem/secret-scrubber'
import {
  FleetAsset,
  addAssets,
  getAssets,
  generatePqcAttestation,
  GROFF_NETWORKS_25_LAB,
  CMMCCategory
} from '@/lib/fleet/fleet-store'

export interface EndpointInput {
  host: string
  port?: number | string
  protocol?: string
  hostname?: string
  os?: string
  deviceType?: 'server' | 'workstation' | 'network' | 'cloud'
  cmmcCategory?: CMMCCategory
  stigProfile?: string
  targetEnclave?: string
  authMethod?: string
  username?: string
  sprsImpact?: number
}

export async function GET() {
  // Returns currently enrolled fleet assets from persistent storage
  const assets = getAssets()
  return NextResponse.json({
    ok: true,
    total: assets.length,
    assets
  })
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    let endpoints: EndpointInput[] = []

    // Check if user requested the canonical 25-endpoint Groff Networks MSP lab
    if (rawBody.loadSample === true) {
      endpoints = GROFF_NETWORKS_25_LAB.map((item) => ({
        ...item,
        targetEnclave: rawBody.targetEnclave || 'Groff-MSP-Enclave'
      }))
    } else if (Array.isArray(rawBody.endpoints)) {
      endpoints = rawBody.endpoints
    } else if (typeof rawBody.csv === 'string' && rawBody.csv.trim()) {
      endpoints = parseAndSanitizeCsv(rawBody.csv)
    } else {
      return NextResponse.json(
        { ok: false, message: 'Invalid request: Expected "endpoints" array, "csv" string, or "loadSample: true".' },
        { status: 400 }
      )
    }

    if (endpoints.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'No valid endpoints found in payload.' },
        { status: 400 }
      )
    }

    if (endpoints.length > 100) {
      return NextResponse.json(
        { ok: false, message: 'Batch size exceeds maximum limit of 100 endpoints per enrollment transaction.' },
        { status: 400 }
      )
    }

    const enrolledAssets: FleetAsset[] = []
    const rejectedEndpoints: { host: string; rule: string; reason: string }[] = []
    const targetEnclave = rawBody.targetEnclave || 'Groff-MSP-Enclave'

    for (const ep of endpoints) {
      const cleanHost = String(ep.host || '').trim()
      const hostCheck = validateHost(cleanHost)

      if (!hostCheck.valid) {
        rejectedEndpoints.push({
          host: cleanHost || 'UNKNOWN',
          rule: hostCheck.rule || 'ASAF-WAF',
          reason: hostCheck.reason || 'Failed host validation.'
        })
        continue
      }

      const cleanPort = ep.port ? Number(ep.port) : 22
      const portCheck = validatePort(cleanPort)
      if (!portCheck.valid) {
        rejectedEndpoints.push({
          host: cleanHost,
          rule: portCheck.rule || 'ASAF-004',
          reason: portCheck.reason || 'Failed port boundary validation.'
        })
        continue
      }

      const assetId = `asset-${cleanHost.replace(/[^a-zA-Z0-9]/g, '-')}-${cleanPort}`
      const attestation = generatePqcAttestation(
        {
          assetId,
          host: cleanHost,
          port: cleanPort,
          os: ep.os,
          enclave: targetEnclave
        },
        targetEnclave
      )

      enrolledAssets.push({
        id: assetId,
        name: ep.hostname ? ep.hostname.split('.')[0].toUpperCase() : `NODE-${cleanHost.replace(/\./g, '-')}`,
        host: cleanHost,
        port: cleanPort,
        hostname: ep.hostname ? ep.hostname.trim() : `lab-host-${cleanHost.replace(/\./g, '-')}`,
        protocol: (ep.protocol || 'SSH').toUpperCase(),
        os: ep.os ? ep.os.trim() : 'Red Hat Enterprise Linux 9',
        deviceType: ep.deviceType || 'server',
        cmmcCategory: ep.cmmcCategory || 'cui',
        stigProfile: ep.stigProfile || 'RHEL-09-STIG-V1R3',
        enclave: targetEnclave,
        authMethod: ep.authMethod || 'SSH Key',
        username: ep.username || 'secops',
        status: 'ENROLLED',
        sprsImpact: ep.sprsImpact || 10,
        lastSeen: new Date().toISOString(),
        attestation
      })
    }

    // Persist to disk substrate
    const persistenceResult = addAssets(enrolledAssets)

    // Compute CMMC Scoping Summary
    const cuiCount = enrolledAssets.filter((a) => a.cmmcCategory === 'cui').length
    const secCount = enrolledAssets.filter((a) => a.cmmcCategory === 'security').length
    const crmCount = enrolledAssets.filter((a) => a.cmmcCategory === 'crm').length
    const totalSprsImpact = enrolledAssets.reduce((acc, a) => acc + (a.sprsImpact || 0), 0)

    const responsePayload = scrubSecrets({
      ok: true,
      totalRequested: endpoints.length,
      totalEnrolled: enrolledAssets.length,
      totalRejected: rejectedEndpoints.length,
      totalInDatabase: persistenceResult.total,
      enclave: targetEnclave,
      scopingSummary: {
        cuiAssets: cuiCount,
        securityProtectionAssets: secCount,
        contractorRiskManaged: crmCount,
        projectedSprsDeduction: totalSprsImpact
      },
      assets: enrolledAssets,
      rejected: rejectedEndpoints,
      message: `Successfully processed ${endpoints.length} endpoint(s): ${enrolledAssets.length} enrolled with ML-DSA-65 signatures into ${targetEnclave}.`
    })

    const { fingerprint } = generateSpectralFingerprint(responsePayload, 'asaf-bulk-enroll')

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'X-Sekhem-FP': fingerprint,
        'X-Sekhem-WAF': rejectedEndpoints.length > 0 ? 'PARTIAL_BLOCK' : 'PASS'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error during bulk enrollment' },
      { status: 500 }
    )
  }
}

/**
 * TRL 10 Hardened CSV Parser: Formula Injection & DDE Sanitization
 */
function parseAndSanitizeCsv(csvText: string): EndpointInput[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('#'))
  if (lines.length === 0) return []

  let startIndex = 0
  const header = lines[0].toLowerCase()
  const hasHeader = header.includes('host') || header.includes('ip')
  if (hasHeader) {
    startIndex = 1
  }

  const results: EndpointInput[] = []
  for (let i = startIndex; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map((c) => {
      let cell = c.trim().replace(/^["']|["']$/g, '')
      // TRL 10 Defense: Formula injection sanitization
      if (/^[=+\-@|]/.test(cell)) {
        cell = cell.replace(/^[=+\-@|]+/, '')
      }
      return cell
    })

    if (!rawCols[0]) continue

    results.push({
      host: rawCols[0],
      port: rawCols[1] ? Number(rawCols[1]) : 22,
      hostname: rawCols[2] || undefined,
      os: rawCols[3] || undefined,
      protocol: rawCols[4] || 'ssh',
      targetEnclave: rawCols[5] || undefined
    })
  }

  return results
}
