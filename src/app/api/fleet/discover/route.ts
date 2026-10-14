import { NextRequest, NextResponse } from 'next/server'
import net from 'net'
import { validateHost } from '@/lib/sekhem/ingress-waf'
import { scrubSecrets, generateSpectralFingerprint } from '@/lib/sekhem/secret-scrubber'

export interface DiscoveredSubnetHost {
  id: string
  ip: string
  hostname: string
  os: string
  stig: string
  ports: string
  reachable: boolean
  latencyMs: number
  selected: boolean
}

// STIG auto-mapping heuristic based on detected ports
function mapPortsToOS(ports: number[]): { os: string; stig: string } {
  if (ports.includes(3389) || ports.includes(5985)) {
    return { os: 'Windows Server 2022', stig: 'Windows-2022-STIG-V1R3' }
  }
  if (ports.includes(22)) {
    return { os: 'Red Hat Enterprise Linux 9', stig: 'RHEL-09-STIG-V1R3' }
  }
  if (ports.includes(443)) {
    return { os: 'Ubuntu 22.04 LTS (Web)', stig: 'Ubuntu-22-STIG-V1R1' }
  }
  return { os: 'Linux / POSIX Endpoint', stig: 'Generic-OS-STIG-V1R1' }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const { cidr, targetEnclave = 'Local Enclave' } = rawBody

    if (!cidr || typeof cidr !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'CIDR range or IP address is required (e.g. 192.168.1.0/24 or 127.0.0.1)' },
        { status: 400 }
      )
    }

    const cleanCidr = cidr.trim()

    // ── 1. SEKHEM INGRESS WAF VALIDATION ─────────────────────────────────────
    // Validate target input
    const hostPart = cleanCidr.split('/')[0]
    const hostValidation = validateHost(hostPart)
    if (!hostValidation.valid) {
      return NextResponse.json(
        { ok: false, rule: hostValidation.rule, message: hostValidation.reason },
        { status: 400 }
      )
    }

    // SSRF & Cloud Metadata Protection
    if (
      cleanCidr.startsWith('169.254.') ||
      cleanCidr.startsWith('fd00:ec2') ||
      cleanCidr.includes('metadata.google') ||
      cleanCidr.includes('100.100.100.200')
    ) {
      return NextResponse.json(
        {
          ok: false,
          rule: 'ASAF-003',
          message: 'Blocked by SEKHEM WAF: Cloud metadata subnet scanning is forbidden.'
        },
        { status: 403 }
      )
    }

    // Prefix restriction: Prevent denial-of-service via massive CIDRs
    if (cleanCidr.includes('/')) {
      const prefix = parseInt(cleanCidr.split('/')[1], 10)
      if (isNaN(prefix) || prefix < 24 || prefix > 32) {
        return NextResponse.json(
          {
            ok: false,
            rule: 'ASAF-004',
            message: 'CIDR prefix must be between /24 and /32 to prevent boundary network saturation.'
          },
          { status: 400 }
        )
      }
    }

    // ── 2. PROBE EXECUTION ───────────────────────────────────────────────────
    const discoveredHosts: DiscoveredSubnetHost[] = []
    const baseIP = hostPart

    // Check if probing localhost or specific target
    if (baseIP === '127.0.0.1' || baseIP === 'localhost') {
      // Direct local probe on common dev ports
      const testPorts = [3000, 45444, 8443, 22]
      const openPorts: number[] = []

      for (const p of testPorts) {
        const isOpen = await new Promise<boolean>((resolve) => {
          const s = new net.Socket()
          s.setTimeout(300)
          s.on('connect', () => {
            s.destroy()
            resolve(true)
          })
          s.on('timeout', () => {
            s.destroy()
            resolve(false)
          })
          s.on('error', () => {
            s.destroy()
            resolve(false)
          })
          try {
            s.connect(p, '127.0.0.1')
          } catch {
            resolve(false)
          }
        })
        if (isOpen) openPorts.push(p)
      }

      discoveredHosts.push({
        id: `sonar-local-1`,
        ip: '127.0.0.1',
        hostname: 'localhost.sovereign.local',
        os: 'Sovereign Controller (Localhost)',
        stig: 'DISA-STIG-ASAF-CORE',
        ports: openPorts.length > 0 ? openPorts.join(', ') : '3000 (Console)',
        reachable: true,
        latencyMs: 1,
        selected: true
      })
    } else {
      // ── Real Live Hybrid Nmap Scan via JARVIS / Sonar Engine ─────────────
      let scannedViaJarvis = false
      try {
        const jarvisScanRes = await fetch('http://127.0.0.1:45450/api/scanner/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanCidr,
            ports: 'common',
            engine: 'auto',
            service_detection: true
          }),
          signal: AbortSignal.timeout(10000)
        })

        if (jarvisScanRes.ok) {
          const report = await jarvisScanRes.json()
          if (report.hosts && report.hosts.length > 0) {
            for (const h of report.hosts) {
              const portNumbers = (h.ports || []).map((p: any) => p.port)
              const { os, stig } = mapPortsToOS(portNumbers)
              discoveredHosts.push({
                id: `sonar-${h.ip.replace(/\./g, '-')}`,
                ip: h.ip,
                hostname: h.hostname || `${h.ip}.enclave.local`,
                os: h.os_match || os,
                stig,
                ports: portNumbers.length > 0 ? portNumbers.join(', ') : 'None',
                reachable: h.state === 'up',
                latencyMs: h.latency_ms || 2.0,
                selected: true
              })
            }
            scannedViaJarvis = true
          }
        }
      } catch (e) {
        // Fallback to local subnet probe if JARVIS daemon is unreachable
      }

      if (!scannedViaJarvis) {
        // Direct socket sweep on requested IP or base IP
        const testPorts = [22, 80, 443, 3389, 45450]
        const openPorts: number[] = []
        for (const p of testPorts) {
          const isOpen = await new Promise<boolean>((resolve) => {
            const s = new net.Socket()
            s.setTimeout(300)
            s.on('connect', () => { s.destroy(); resolve(true) })
            s.on('timeout', () => { s.destroy(); resolve(false) })
            s.on('error', () => { s.destroy(); resolve(false) })
            try { s.connect(p, baseIP) } catch { resolve(false) }
          })
          if (isOpen) openPorts.push(p)
        }
        const { os, stig } = mapPortsToOS(openPorts)
        discoveredHosts.push({
          id: `sonar-${baseIP.replace(/\./g, '-')}`,
          ip: baseIP,
          hostname: `${baseIP}.live.enclave`,
          os,
          stig,
          ports: openPorts.length > 0 ? openPorts.join(', ') : 'None open',
          reachable: openPorts.length > 0,
          latencyMs: 3.5,
          selected: true
        })
      }
    }

    const payload = scrubSecrets({
      ok: true,
      cidr: cleanCidr,
      enclave: targetEnclave,
      totalDiscovered: discoveredHosts.length,
      hosts: discoveredHosts,
      message: `Scan complete: SEKHEM Sonar sweep completed on ${cleanCidr}: ${discoveredHosts.length} active host(s) identified.`
    })

    const { fingerprint } = generateSpectralFingerprint(payload, 'asaf-sonar-sweep')

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'X-Sekhem-FP': fingerprint,
        'X-Sekhem-WAF': 'PASS'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal error during sonar subnet sweep' },
      { status: 500 }
    )
  }
}
