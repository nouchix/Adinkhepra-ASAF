import { NextRequest, NextResponse } from 'next/server'

// ── SEKHEM Edge WAF — Next.js Middleware ─────────────────────────────────────
// Implements edge-layer equivalent of SEKHEM PQC-WAF for the Vercel deployment.
// Runs on Vercel Edge Runtime (no Node.js APIs).
//
// SecRed Knowledge Inc. d/b/a NouchiX — IP belongs to SOUHIMBOU DOH KONE LLC
// ────────────────────────────────────────────────────────────────────────────

// ── Rate limit store (edge-compatible in-memory, per-instance) ────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 120 // requests
const RATE_WINDOW = 60_000 // 60 seconds

// ── Injection signature patterns ──────────────────────────────────────────────
const INJECTION_PATTERNS = [
  // Directory traversal
  /\.\.\//g,
  /\.\.%2F/gi,
  // Prompt injection signatures
  /ignore\s+previous\s+instructions/gi,
  /you\s+are\s+now\s+in\s+developer\s+mode/gi,
  /system\s*:\s*you\s+are/gi,
  // Shell injection
  /[;&|`$(){}[\]]/g,
  // SQL injection basics
  /('\s*OR\s*'1'\s*=\s*'1)/gi,
  /UNION\s+SELECT/gi,
  // SSRF
  /169\.254\.169\.254/g,
  /metadata\.google\.internal/gi,
]

function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(input))
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  entry.count++
  if (entry.count > RATE_LIMIT) return false
  return true
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

export function middleware(request: NextRequest) {
  const ip = getIP(request)
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // ── 1. Rate limiting ───────────────────────────────────────────────────────
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-SEKHEM-Block': 'rate-limit',
      },
    })
  }

  // ── 2. Injection detection on URL path + query ─────────────────────────────
  const rawUrl = pathname + url.search
  if (detectInjection(rawUrl)) {
    return new NextResponse('Forbidden — SEKHEM WAF', {
      status: 403,
      headers: { 'X-SEKHEM-Block': 'injection' },
    })
  }

  // ── 3. Block common scanner/bot fingerprints ───────────────────────────────
  const ua = request.headers.get('user-agent') ?? ''
  const blockedBots = ['sqlmap', 'nikto', 'masscan', 'nmap', 'zgrab', 'python-requests/2']
  if (blockedBots.some(b => ua.toLowerCase().includes(b))) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'X-SEKHEM-Block': 'bot' },
    })
  }

  // ── 4. Build hardened response headers ─────────────────────────────────────
  const response = NextResponse.next()

  // Security headers
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://agent.souhimbou.ai https://mcp.souhimbou.ai wss://agent.souhimbou.ai",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  // KHEPRA post-quantum attestation headers
  response.headers.set('X-Khepra-Trust', 'Post-Quantum-Protected')
  response.headers.set('X-Khepra-Algorithm', 'ML-DSA-65+ML-KEM-1024')
  response.headers.set('X-Khepra-Version', '2.1.0')
  response.headers.set('X-NouchiX-Node', 'edge-sekhem')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)$).*)',
  ],
}
