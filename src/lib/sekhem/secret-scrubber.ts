/**
 * SEKHEM Gateway Egress Secret Scrubber & Spectral Fingerprinter
 * (Product A — AdinKhepra ASAF)
 * Enforces Zero Credential Leakage on outbound responses, logs, and diagnostics.
 */

import crypto from 'crypto'

// Common high-entropy token patterns
const SECRET_PATTERNS = [
  // Private Keys (RSA, EC, OPENSSH, PGP)
  { regex: /-----BEGIN [A-Z0-9\s]+PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9\s]+PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  // AWS Access Key ID
  { regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, replacement: '[REDACTED_AWS_KEY]' },
  // Bearer Tokens / JWTs
  { regex: /Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, replacement: 'Bearer [REDACTED_JWT]' },
  // Generic password in connection string or JSON
  { regex: /(["']?(?:password|passphrase|secret|token|api_?key)["']?\s*[:=]\s*["'])([^"'\r\n]{3,})(["'])/gi, replacement: '$1••••••••$3' },
]

/**
 * Scrub all sensitive tokens and credentials from string or object
 */
export function scrubSecrets<T>(data: T): T {
  if (typeof data === 'string') {
    let result = data as string
    for (const pattern of SECRET_PATTERNS) {
      result = result.replace(pattern.regex, pattern.replacement)
    }
    return result as unknown as T
  }

  if (Array.isArray(data)) {
    return data.map((item) => scrubSecrets(item)) as unknown as T
  }

  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      if (['password', 'passphrase', 'secret', 'token', 'privatekey', 'apikey'].includes(lowerKey)) {
        cleaned[key] = '••••••••'
      } else {
        cleaned[key] = scrubSecrets(value)
      }
    }
    return cleaned as unknown as T
  }

  return data
}

/**
 * Generate Spectral Request Fingerprint (X-Sekhem-FP)
 * Anchors the request identity and hash for downstream verification and DAG attestation.
 */
export function generateSpectralFingerprint(payload: Record<string, any>, agentId = 'asaf-sovereign-node'): {
  fingerprint: string
  timestamp: string
  sha256: string
} {
  const timestamp = new Date().toISOString()
  const serialized = JSON.stringify({ agentId, timestamp, payload: scrubSecrets(payload) })
  const hash = crypto.createHash('sha256').update(serialized).digest('hex')
  const fingerprint = `v1:${agentId}:${timestamp}:${hash.slice(0, 16)}`

  return {
    fingerprint,
    timestamp,
    sha256: hash
  }
}
