import { test, expect } from '@playwright/test'

test.describe('KTOS Product Surfaces & 4-Tier Commercial Model E2E', () => {
  test('should render 4-tier commercial pricing cards on landing page', async ({ page }) => {
    await page.goto('/')
    
    // Check main headline
    await expect(page.locator('text=KTOS').first()).toBeVisible({ timeout: 10000 })
    
    // Verify Community Tier ($0 / 500 Credits)
    await expect(page.getByText('500 Tokenomics credits').first()).toBeVisible()
    
    // Verify Platform Tier ($499 / 3,000 Credits)
    await expect(page.getByText('$499').first()).toBeVisible()
    await expect(page.getByText('3,000 Tokenomics credits').first()).toBeVisible()
    
    // Verify Enterprise Tier ($2,999 / 15,000 Credits)
    await expect(page.getByText('$2,999').first()).toBeVisible()
    await expect(page.getByText('15,000 Tokenomics credits').first()).toBeVisible()
    
    // Verify Sovereign Tier ($45K–$250K / 100,000+ Credits)
    await expect(page.getByText('$45K').first()).toBeVisible()
    await expect(page.getByText('100,000+ Tokenomics credits').first()).toBeVisible()
  })

  test('should show KHEPRA Trust OS product family on pricing', async ({ page }) => {
    await page.goto('/#pricing')
    await expect(page.getByRole('heading', { name: /KHEPRA Trust OS \(KTOS\) Pricing/ })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('USPTO #73565085').first()).toBeVisible()

    const cmmc = page.locator('#product-cmmc')
    await expect(cmmc.getByRole('heading', { name: 'KTOS CMMC Hub & Fleet Engine' })).toBeVisible()
    await expect(cmmc.getByText('Can I prove what I attested?')).toBeVisible()
    await expect(cmmc.getByText('$2,999')).toBeVisible()
    await expect(cmmc.getByText('$45K')).toBeVisible()

    const soc = page.locator('#product-soc')
    await expect(soc.getByRole('heading', { name: 'KTOS Agentic SOC' })).toBeVisible()
    await expect(soc.getByText('What did my AI agents do, and can I prove it?')).toBeVisible()
    await expect(soc.getByText('$499')).toBeVisible()

    const mcp = page.locator('#product-mcp')
    await expect(mcp.getByRole('heading', { name: 'KTOS-MCP Master-Kernel' })).toBeVisible()

    // Legacy names must be gone from pricing
    await expect(page.locator('#pricing').getByText('SaaS KHEPRA Blackhole')).toHaveCount(0)
  })

  test('should navigate to /docs and render 4-tier authentication architecture', async ({ page }) => {
    await page.goto('/docs')
    
    // Click Authentication & Licensing in sidebar
    await page.getByRole('button', { name: /Authentication & Licensing/i }).click()
    
    // Wait for authentication layout
    await expect(page.getByText('Authentication & Licensing Architecture')).toBeVisible({ timeout: 10000 })
    
    // Verify 4-tier model table in docs
    await expect(page.getByText('The 4-Tier Commercial & Sovereign Model')).toBeVisible()
    await expect(page.getByText('kphr_com_...').first()).toBeVisible()
    await expect(page.getByText('kphr_platform_... / kphr_pro_...').first()).toBeVisible()
    await expect(page.getByText('kphr_enterprise_...').first()).toBeVisible()
    await expect(page.getByText('kphr_sov_... / kphr_sovereign_...').first()).toBeVisible()
    
    // Verify Product Surfaces 1, 2, 3 (KTOS + function naming)
    await expect(page.getByRole('heading', { name: 'KTOS CMMC Hub & Fleet Engine' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'KTOS Agentic SOC' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'KTOS-MCP Master-Kernel' })).toBeVisible()
  })

  test('should switch sections in /docs to Cross-Deployment Matrix and TC-25 Manual', async ({ page }) => {
    await page.goto('/docs')
    
    // Click Cross-Deployment Matrix in sidebar
    await page.getByRole('button', { name: /Cross-Deployment Matrix/i }).click()
    await expect(page.getByText('Release Matrix v4.2.0 · 10 Execution Targets')).toBeVisible()
    await expect(page.getByText('ktos-mcp-windows-amd64.exe').first()).toBeVisible()
    await expect(page.getByText('ktos-mcp-linux-amd64').first()).toBeVisible()
    
    // Click TC-25 Manual in sidebar
    await page.getByRole('button', { name: /TC-25 Technical Operator Manual/i }).click()
    await expect(page.getByText(/Training Circular No\. 25-KTOS-001/i)).toBeVisible()
    await expect(page.getByText(/Four-Layer Sovereign Architecture/i).first()).toBeVisible()
    
    // Click Developer Runbook in sidebar
    await page.getByRole('button', { name: /Developer & IDE Setup Runbook/i }).click()
    await expect(page.getByText('Developer & IDE Runbook')).toBeVisible()
    await expect(page.getByText('Universal 1-Liner Installation')).toBeVisible()
  })

  test('should render Dual-Engine Pentest results (CyberStryke 30/30 + AgentHound 28/28 = 58/58) on home and docs', async ({ page }) => {
    // 1. Landing Page Verification
    await page.goto('/')
    await expect(page.getByText('58 / 58').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Dual-Engine Pentest Verification · 58/58 Attacks Neutralized')).toBeVisible()
    await expect(page.getByText('Engine 1: CyberStryke Automated Assault')).toBeVisible()
    await expect(page.getByText('Engine 2: AgentHound Offensive Security Framework')).toBeVisible()
    await expect(page.getByText('MCP Tool Description Poisoning & Shadowing')).toBeVisible()

    // 2. Docs Portal Verification
    await page.goto('/docs')
    // Check CyberStryke
    await page.getByRole('button', { name: /CyberStryke 100% Neutralization/i }).click()
    await expect(page.getByRole('heading', { name: /CyberStryke Automated Assault Verification/i })).toBeVisible()
    await expect(page.getByText('30 / 30').first()).toBeVisible()

    // Check AgentHound
    await page.getByRole('button', { name: /AgentHound Offensive Defense/i }).click()
    await expect(page.getByRole('heading', { name: /AgentHound Offensive Security Framework Defense Benchmark/i })).toBeVisible()
    await expect(page.getByText('28 / 28').first()).toBeVisible()
    await expect(page.getByText('POISONED_DESCRIPTION').first()).toBeVisible()
    await expect(page.getByText('CAN_IMPERSONATE').first()).toBeVisible()
  })

  test('should render Proof Over Promises hero headline and 10-vendor comparison matrix', async ({ page }) => {
    await page.goto('/')
    
    // Check Proof Over Promises hero
    await expect(page.getByRole('heading', { name: /Proof Over Promises/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('The Cryptographic Proof & Execution Gate for AI Agents')).toBeVisible()

    // Check Honest Competitive Matrix
    await expect(page.getByText('Honest Competitive Matrix')).toBeVisible()
    const vendors = ['KTOS', 'Lineation', 'Palo Alto', 'SentinelOne', 'Snyk', 'Wiz', 'SteelCloud', 'Vanta / Drata', 'Patero', 'NVIDIA']
    for (const vendor of vendors) {
      await expect(page.getByRole('columnheader', { name: new RegExp(vendor, 'i') })).toBeVisible()
    }
  })
})


