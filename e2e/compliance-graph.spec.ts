import { test, expect } from '@playwright/test'

test.describe('AdinKhepra ASAF — Compliance Graph & Mode D Enrollment E2E', () => {
  test('should load compliance graph page with controls', async ({ page }) => {
    await page.goto('/compliance-graph')
    await expect(page.getByText('Compliance Graph UI')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Connect Environment/i })).toBeVisible()
    await expect(page.getByText('SOVEREIGN DAG', { exact: true })).toBeVisible()
  })

  test('should open Enrollment Wizard and navigate to Mode D Manual Add', async ({ page }) => {
    await page.goto('/compliance-graph')
    await page.getByRole('button', { name: /Connect Environment/i }).click()

    // Verify wizard modal opens
    await expect(page.getByText('Connect Assets — Enrollment Wizard')).toBeVisible()

    // Switch to Mode D
    await page.getByRole('button', { name: /Mode D — Manual/i }).click()
    await expect(page.getByText('Manual Asset Add')).toBeVisible()

    // Verify form inputs exist
    const hostInput = page.getByPlaceholder(/hostname or IP address/i)
    await expect(hostInput).toBeVisible()

    const testBtn = page.getByRole('button', { name: /Test Connection/i })
    const enrollBtn = page.getByRole('button', { name: /Enroll Asset/i })
    await expect(testBtn).toBeVisible()
    await expect(enrollBtn).toBeVisible()
    await expect(enrollBtn).toBeDisabled()
  })

  test('should test connection successfully on reachable host and unlock enrollment', async ({ page }) => {
    await page.goto('/compliance-graph')
    await page.getByRole('button', { name: /Connect Environment/i }).click()
    await page.getByRole('button', { name: /Mode D — Manual/i }).click()

    // Target localhost:3000 (Next.js server is actively listening here)
    const hostInput = page.getByPlaceholder(/hostname or IP address/i)
    await hostInput.fill('127.0.0.1')

    // Find port input and set to 3000
    const portInput = page.locator('input[value="22"]').first()
    await portInput.fill('3000')

    // Click Test Connection
    await page.getByRole('button', { name: /Test Connection/i }).click()

    // Expect connection verification feedback
    await expect(page.getByText('Connection Verified')).toBeVisible({ timeout: 10000 })

    // Enroll Asset button should now be enabled
    const enrollBtn = page.getByRole('button', { name: /Enroll Asset/i })
    await expect(enrollBtn).toBeEnabled()

    // Click Enroll Asset
    await enrollBtn.click()

    // Verify enrollment feedback
    await expect(page.getByText(/successfully enrolled/i)).toBeVisible({ timeout: 5000 })
  })

  test('should handle unreachable host gracefully with diagnostic feedback', async ({ page }) => {
    await page.goto('/compliance-graph')
    await page.getByRole('button', { name: /Connect Environment/i }).click()
    await page.getByRole('button', { name: /Mode D — Manual/i }).click()

    // Target a non-listening test IP
    const hostInput = page.getByPlaceholder(/hostname or IP address/i)
    await hostInput.fill('192.0.2.1')

    const portInput = page.locator('input[value="22"]').first()
    await portInput.fill('9999')

    // Click Test Connection
    await page.getByRole('button', { name: /Test Connection/i }).click()

    // Expect failure feedback
    await expect(page.getByText('Connection Check Failed')).toBeVisible({ timeout: 10000 })

    // Enroll button must remain disabled
    const enrollBtn = page.getByRole('button', { name: /Enroll Asset/i })
    await expect(enrollBtn).toBeDisabled()
  })
})
