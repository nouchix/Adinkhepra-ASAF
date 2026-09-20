import { NextRequest, NextResponse } from 'next/server'
import net from 'net'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { protocol = 'ssh', host, port = 22, authMethod, username, password, sshKeyPath } = body

    if (!host || typeof host !== 'string') {
      return NextResponse.json(
        { ok: false, message: 'Host / IP address is required.' },
        { status: 400 }
      )
    }

    const portNum = parseInt(String(port), 10) || 22
    const targetHost = host.trim()

    // Perform real TCP probe with banner grab
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
        // TCP Handshake succeeded! Wait briefly for SSH banner if available
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

    if (!probeResult.ok) {
      return NextResponse.json({
        ok: false,
        host: targetHost,
        port: portNum,
        protocol,
        latencyMs: probeResult.latencyMs,
        error: probeResult.error,
        message: `Connection to ${targetHost}:${portNum} failed: ${probeResult.error}. Verify network path, firewall, or VPN configuration.`
      })
    }

    return NextResponse.json({
      ok: true,
      host: targetHost,
      port: portNum,
      protocol: protocol.toUpperCase(),
      banner: probeResult.banner || 'TCP Handshake OK',
      latencyMs: probeResult.latencyMs,
      message: `Verified reachability to ${targetHost}:${portNum} (${probeResult.banner || 'Port open'}, latency: ${probeResult.latencyMs}ms). Ready for enrollment.`
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error during connection test' },
      { status: 500 }
    )
  }
}
