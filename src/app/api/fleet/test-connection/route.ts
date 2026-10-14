import { NextRequest, NextResponse } from 'next/server'
import net from 'net'
import { validateHost, validatePort, validateFilePath } from '@/lib/sekhem/ingress-waf'
import { scrubSecrets, generateSpectralFingerprint } from '@/lib/sekhem/secret-scrubber'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const { protocol = 'ssh', host, port = 22, authMethod, username, password, sshKeyPath } = rawBody

    // ─── SEKHEM INGRESS WAF MEMBRANE ──────────────────────────────────────────
    // ASAF-001 (Command Injection) & ASAF-003 (SSRF Metadata Protection)
    const hostValidation = validateHost(host)
    if (!hostValidation.valid) {
      return NextResponse.json(
        {
          ok: false,
          rule: hostValidation.rule,
          error: hostValidation.reason,
          message: hostValidation.reason
        },
        { status: 400 }
      )
    }

    // ASAF-004 (Port Boundary Limits)
    const portValidation = validatePort(port)
    if (!portValidation.valid) {
      return NextResponse.json(
        {
          ok: false,
          rule: portValidation.rule,
          error: portValidation.reason,
          message: portValidation.reason
        },
        { status: 400 }
      )
    }

    // ASAF-002 (Path Traversal Protection)
    const pathValidation = validateFilePath(sshKeyPath)
    if (!pathValidation.valid) {
      return NextResponse.json(
        {
          ok: false,
          rule: pathValidation.rule,
          error: pathValidation.reason,
          message: pathValidation.reason
        },
        { status: 400 }
      )
    }

    const portNum = parseInt(String(port), 10)
    const targetHost = String(host).trim()

    // Generate Spectral Request Fingerprint (X-Sekhem-FP)
    const { fingerprint } = generateSpectralFingerprint(
      { targetHost, portNum, protocol, username: username || 'root' },
      'asaf-ingress-membrane'
    )

    // ─── ENCAPSULATED PROBE EXECUTION ─────────────────────────────────────────
    const startTime = Date.now()
    const probeResult = await new Promise<{ ok: boolean; banner?: string; latencyMs: number; error?: string }>((resolve) => {
      const socket = new net.Socket()
      let banner = ''
      let resolved = false
      let bannerTimer: NodeJS.Timeout | null = null

      const cleanup = () => {
        if (bannerTimer) clearTimeout(bannerTimer)
        if (!socket.destroyed) {
          socket.destroy()
        }
      }

      socket.setTimeout(4500)

      socket.on('connect', () => {
        bannerTimer = setTimeout(() => {
          if (!resolved) {
            resolved = true
            cleanup()
            resolve({
              ok: true,
              banner: banner.trim() || 'TCP Handshake OK (Port open)',
              latencyMs: Date.now() - startTime
            })
          }
        }, 1200)
      })

      socket.on('data', (chunk) => {
        banner += chunk.toString('utf-8')
        if (banner.length > 0 && !resolved) {
          resolved = true
          cleanup()
          resolve({
            ok: true,
            banner: banner.trim().split('\n')[0],
            latencyMs: Date.now() - startTime
          })
        }
      })

      socket.on('timeout', () => {
        if (!resolved) {
          resolved = true
          cleanup()
          resolve({ ok: false, error: 'Connection timed out after 4500ms.', latencyMs: Date.now() - startTime })
        }
      })

      socket.on('error', (err: any) => {
        if (!resolved) {
          resolved = true
          cleanup()
          resolve({ ok: false, error: err.message || 'Connection refused or unreachable', latencyMs: Date.now() - startTime })
        }
      })

      try {
        socket.connect(portNum, targetHost)
      } catch (e: any) {
        resolved = true
        cleanup()
        resolve({ ok: false, error: e.message, latencyMs: Date.now() - startTime })
      }
    })

    // ─── SEKHEM EGRESS SECRET SCRUBBER ────────────────────────────────────────
    if (!probeResult.ok) {
      const errorResponse = scrubSecrets({
        ok: false,
        host: targetHost,
        port: portNum,
        protocol,
        latencyMs: probeResult.latencyMs,
        error: probeResult.error,
        message: `Connection to ${targetHost}:${portNum} failed: ${probeResult.error}. Verify network path, firewall, or VPN configuration.`
      })

      const res = NextResponse.json(errorResponse)
      res.headers.set('X-Sekhem-FP', fingerprint)
      return res
    }

    const successResponse = scrubSecrets({
      ok: true,
      host: targetHost,
      port: portNum,
      protocol: protocol.toUpperCase(),
      banner: probeResult.banner || 'TCP Handshake OK',
      latencyMs: probeResult.latencyMs,
      message: `Verified reachability to ${targetHost}:${portNum} (${probeResult.banner || 'Port open'}, latency: ${probeResult.latencyMs}ms). Ready for enrollment.`
    })

    const res = NextResponse.json(successResponse)
    res.headers.set('X-Sekhem-FP', fingerprint)
    return res
  } catch (error: any) {
    const errPayload = scrubSecrets({
      ok: false,
      error: error.message || 'Internal server error during connection test'
    })
    return NextResponse.json(errPayload, { status: 500 })
  }
}
