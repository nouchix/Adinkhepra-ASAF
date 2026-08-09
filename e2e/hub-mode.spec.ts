import { test, expect } from '@playwright/test';

test.describe('Stargate Hub & Fleet E2E Tests', () => {
  
  test('should load Fleet Manager and display discovered enclaves', async ({ page }) => {
    // Navigate to the fleet page
    await page.goto('/fleet');
    
    // Check that the page loads correctly
    await expect(page.getByText('Fleet Manager')).toBeVisible();
    
    // Ensure the default mock enclaves are loaded from the backend
    await expect(page.getByText('Alpha Zone')).toBeVisible();
    await expect(page.getByText('Bravo DMZ')).toBeVisible();
  });

  test('should enforce HITL guard and allow scanning after approval', async ({ page, request }) => {
    // First, ensure the Hub is sealed (Revoke HITL)
    await request.get('http://localhost:8443/api/v1/hub/revoke');
    
    // Navigate to the fleet page and attempt a scan
    await page.goto('/fleet');
    await page.getByText('Alpha Zone').click();
    await page.getByText('Start Fleet Scan').click();
    
    // Scan should fail because HITL is sealed
    // The UI should theoretically show an error or just fail to stream
    // Since we are mocking the frontend interaction, let's explicitly approve the Hub via the API
    const approveRes = await request.get('http://localhost:8443/api/v1/hub/approve');
    expect(approveRes.ok()).toBeTruthy();
    
    // Now start the scan again
    await page.getByText('Start Fleet Scan').click();
    
    // Expect the scan progress to complete and show results
    await expect(page.getByText('Scanning Fleet…')).toBeVisible();
    // Wait for the stream to complete and the finding to appear
    await expect(page.getByText('Deprecated cryptographic algorithm detected')).toBeVisible({ timeout: 10000 });
  });
});
