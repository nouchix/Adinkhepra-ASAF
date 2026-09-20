/**
 * SEKHEM Gateway Ingress WAF Membrane (Product A — AdinKhepra ASAF)
 * Enforces Bilateral Rules ASAF-001 through ASAF-008
 * Inspired by STIGViewer MCP Server 5-Battery Testing Methodology
 */

export interface WAFValidationResult {
  valid: boolean
  rule?: string
  reason?: string
}

// Prohibited shell injection metacharacters (ASAF-001)
const SHELL_INJECTION_REGEX = /[;&|`$><\\!{}[\]\0\r\n]/

// Prohibited path traversal sequences (ASAF-002)
const PATH_TRAVERSAL_REGEX = /(?:\.\.[\\/]|%2e%2e[\\/]|(?:^|[\\/])(?:etc|windows|system32|proc|sys)[\\/])/i

// Prohibited SSRF Cloud Metadata & Internal addresses (ASAF-003)
const SSRF_TARGETS = [
  '169.254.169.254',             // AWS / Azure / OpenStack metadata
  'metadata.google.internal',     // GCP metadata
  '169.254.169.253',             // AWS DNS
  'fd00:ec2::254',               // AWS IPv6 metadata
  'instance-data',               // Legacy EC2
  '100.100.100.100',             // Alibaba Cloud metadata
]

/**
 * ASAF-001: Validate Host against Command Injection & Shell Metacharacters
 * ASAF-003: Validate Host against SSRF to Cloud Metadata Endpoints
 */
export function validateHost(host: unknown): WAFValidationResult {
  if (typeof host !== 'string' || !host.trim()) {
    return { valid: false, rule: 'ASAF-004', reason: 'Host must be a non-empty string.' }
  }

  const cleanHost = host.trim()

  // ASAF-001: Shell Metacharacters
  if (SHELL_INJECTION_REGEX.test(cleanHost)) {
    return {
      valid: false,
      rule: 'ASAF-001',
      reason: 'Rejected by SEKHEM-WAF (ASAF-001): Shell metacharacters or command injection patterns detected in host string.'
    }
  }

  // ASAF-002: Path Traversal in Host
  if (PATH_TRAVERSAL_REGEX.test(cleanHost)) {
    return {
      valid: false,
      rule: 'ASAF-002',
      reason: 'Rejected by SEKHEM-WAF (ASAF-002): Path traversal sequence detected in host string.'
    }
  }

  // ASAF-003: SSRF Metadata Target Guard
  const lower = cleanHost.toLowerCase()
  for (const metadataTarget of SSRF_TARGETS) {
    if (lower === metadataTarget || lower.includes(metadataTarget)) {
      return {
        valid: false,
        rule: 'ASAF-003',
        reason: `Rejected by SEKHEM-WAF (ASAF-003): SSRF protection blocked attempt to target cloud metadata address (${cleanHost}).`
      }
    }
  }

  // Length sanity check
  if (cleanHost.length > 253) {
    return { valid: false, rule: 'ASAF-004', reason: 'Host string exceeds maximum allowable length (253 chars).' }
  }

  return { valid: true }
}

/**
 * ASAF-004: Validate Port boundary limits [1..65535]
 */
export function validatePort(port: unknown): WAFValidationResult {
  const num = typeof port === 'number' ? port : parseInt(String(port), 10)

  if (isNaN(num) || num < 1 || num > 65535) {
    return {
      valid: false,
      rule: 'ASAF-004',
      reason: `Rejected by SEKHEM-WAF (ASAF-004): Port out of valid boundary limits (must be 1-65535, received: ${port}).`
    }
  }

  return { valid: true }
}

/**
 * ASAF-002: Validate SSH Key Path or local file path against Path Traversal
 */
export function validateFilePath(filePath: unknown): WAFValidationResult {
  if (!filePath) return { valid: true } // optional
  if (typeof filePath !== 'string') {
    return { valid: false, rule: 'ASAF-004', reason: 'File path must be a string.' }
  }

  if (PATH_TRAVERSAL_REGEX.test(filePath)) {
    return {
      valid: false,
      rule: 'ASAF-002',
      reason: 'Rejected by SEKHEM-WAF (ASAF-002): Path traversal or sensitive root directory reference detected.'
    }
  }

  return { valid: true }
}

/**
 * ASAF-005: Indirect Prompt Injection & Adversarial Text Sanitization
 */
export function sanitizePromptText(text: string): string {
  if (!text) return ''
  // Strip control characters, neutralise markdown exfiltration links
  return text
    .replace(/!\[.*?\]\(https?:\/\/.*?\)/gi, '[EXFILTRATION_LINK_REDACTED]')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}
