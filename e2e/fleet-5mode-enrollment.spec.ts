import { test, expect } from '@playwright/test'

test.describe('AdinKhepra ASAF — 5-Mode Fleet Management & Sovereign Agent E2E (TRL 10)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/compliance-graph')
    await expect(page.getByText('Compliance Graph UI')).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Connect Environment/i }).click()
    await expect(page.getByText(/Connect Assets — Enrollment Wizard/i)).toBeVisible()
  })

  test('Mode A: Subnet Sonar Sweep with SSRF Guard & Asset Enrollment', async ({ page }) => {
    // Mode A is the default tab
    await expect(page.getByRole('button', { name: /Mode A — Subnet/i })).toBeVisible()
    await expect(page.getByText('SEKHEM Sonar — Network Subnet Sweep')).toBeVisible()

    // Test input with valid CIDR
    const cidrInput = page.locator('input[value="10.200.1.0/24"]')
    await expect(cidrInput).toBeVisible()

    // Click Scan Subnet
    const scanBtn = page.getByRole('button', { name: /Scan Subnet/i })
    await scanBtn.click()

    // Expect scan completion feedback and discovered hosts table
    await expect(page.getByText(/Scan complete/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('10.200.1.10')).toBeVisible()

    // Verify Enroll Selected button
    const enrollSelectedBtn = page.getByRole('button', { name: /Enroll Selected/i })
    await expect(enrollSelectedBtn).toBeVisible()
    await enrollSelectedBtn.click()

    // Verify DAG attestation confirmation
    await expect(page.getByText(/Successfully enrolled/i)).toBeVisible({ timeout: 10000 })
  })

  test('Mode B: 25-Endpoint Groff Networks MSP Lab 1-Click Loading & Bulk DAG Enrollment', async ({ page }) => {
    // Navigate to Mode B
    await page.getByRole('button', { name: /Mode B — CSV/i }).click()
    await expect(page.getByText('Mode B — CSV Bulk Enrollment & MSP Lab Template')).toBeVisible()

    // Click "Load 25-Endpoint MSP Lab Sample"
    const loadSampleBtn = page.getByRole('button', { name: /Load 25-Endpoint MSP Lab Sample/i })
    await expect(loadSampleBtn).toBeVisible()
    await loadSampleBtn.click()

    // Verify success banner and CMMC Scoping cards appear
    await expect(page.getByText(/Enrolled all 25 MSP lab assets with ML-DSA-65 attestation/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('CUI Assets')).toBeVisible()
    await expect(page.getByText('Security Protection')).toBeVisible()
    await expect(page.getByText('Max SPRS Deduction')).toBeVisible()

    // Verify lab endpoints are visible in the preview table
    await expect(page.getByText('DC-PRIMARY-01')).toBeVisible()
    await expect(page.getByText('SQL-CUI-DATABASE')).toBeVisible()
    await expect(page.getByText('CORE-FW-PALOALTO')).toBeVisible()
  })

  test('Mode C: Sovereign Cloud Discovery with SEKHEM Blackhole VPN', async ({ page }) => {
    // Navigate to Mode C
    await page.getByRole('button', { name: /Mode C — Cloud/i }).click()
    await expect(page.getByText('Mode C — Sovereign Cloud Asset Discovery')).toBeVisible()

    // Check AWS GovCloud card
    await expect(page.getByText('AWS GovCloud (EC2)')).toBeVisible()
    await expect(page.getByText('GovCloud Region')).toBeVisible()

    // Click Discover & Enroll GovCloud VMs
    const discoverBtn = page.getByRole('button', { name: /Discover & Enroll GovCloud VMs/i })
    await expect(discoverBtn).toBeVisible()
    await discoverBtn.click()

    // Expect discovery confirmation and discovered VM table
    await expect(page.getByText(/Discovered and enrolled 3 sovereign VM/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('GOV-APP-CLUSTER-01')).toBeVisible()
    await expect(page.getByText('GOV-DB-ENCRYPTED-01')).toBeVisible()
  })

  test('Mode D: Direct Remote SSH Reachability Test & Asset Enrollment', async ({ page }) => {
    // Navigate to Mode D
    await page.getByRole('button', { name: /Mode D — Manual/i }).click()
    await expect(page.getByText('Manual Remote Asset Connection')).toBeVisible()

    // Target localhost:3000
    const hostInput = page.getByPlaceholder(/hostname or IP address/i)
    await hostInput.fill('127.0.0.1')

    const portInput = page.locator('input[value="22"]').first()
    await portInput.fill('3000')

    // Click Test Connection
    await page.getByRole('button', { name: /Test Connection/i }).click()
    await expect(page.getByText('Connection Verified')).toBeVisible({ timeout: 10000 })

    // Enroll Asset
    const enrollBtn = page.getByRole('button', { name: /Enroll Asset/i })
    await expect(enrollBtn).toBeEnabled()
    await enrollBtn.click()
    await expect(page.getByText(/successfully enrolled/i)).toBeVisible({ timeout: 5000 })
  })

  test('Mode E: Sovereign Agent (NouchiX-Fleet) Roster & Outbound Beacon Commands', async ({ page }) => {
    // Navigate to Mode E
    await page.getByRole('button', { name: /Mode E — Sovereign Agent/i }).click()
    await expect(page.getByText('Mode E — Sovereign Fleet Agent (NouchiX-Fleet)')).toBeVisible()

    // Verify Enrollment Secret token is visible
    await expect(page.getByText('sec-khepra-msp-lab-2026')).toBeVisible()

    // Verify one-liner deployment commands for Windows and Linux
    await expect(page.getByText(/Windows PowerShell \(One-Liner Install\)/i)).toBeVisible()
    await expect(page.getByText(/Linux \/ macOS Bash \(One-Liner Install\)/i)).toBeVisible()

    // Verify pre-seeded/active fleet agents in the live roster
    await expect(page.getByText('idm01.grofflab.internal')).toBeVisible()
    await expect(page.getByText('exec-ws01.grofflab.internal')).toBeVisible()
    await expect(page.getByText('k8s-node01.grofflab.internal')).toBeVisible()

    // Verify STIG Audit button triggers and updates
    const auditBtn = page.getByRole('button', { name: /Audit Fleet STIG/i })
    await expect(auditBtn).toBeVisible()
    await auditBtn.click()
  })
})
