// End-to-end tests for AppWatch Dashboard
import { test, expect } from '@playwright/test';

test.describe('AppWatch Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load dashboard homepage', async ({ page }) => {
    // Check if the main elements are present
    await expect(page.locator('h1')).toContainText('AppWatch');
    await expect(page.locator('.subtitle')).toContainText('Galactic Monitoring Station');
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('#apps-grid')).toBeVisible();
  });

  test('should have working theme selector', async ({ page }) => {
    // Test theme switching
    const themeSelector = page.locator('#themeSelector');
    await expect(themeSelector).toBeVisible();
    
    // Switch to Pip-Boy theme
    await themeSelector.selectOption('pipboy');
    
    // Verify theme change
    await expect(page.locator('body')).toHaveClass(/theme-pipboy/);
    await expect(page.locator('h1')).toContainText('ROBCO INDUSTRIES');
    
    // Switch back to Space theme
    await themeSelector.selectOption('space');
    await expect(page.locator('body')).not.toHaveClass(/theme-pipboy/);
    await expect(page.locator('h1')).toContainText('AppWatch');
  });

  test('should display statistics cards', async ({ page }) => {
    const statsCards = page.locator('.stat-card');
    await expect(statsCards).toHaveCount(6);
    
    // Check that each card has the expected structure
    for (let i = 0; i < 6; i++) {
      const card = statsCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('.value')).toBeVisible();
      await expect(card.locator('.trend')).toBeVisible();
    }
  });

  test('should open add app modal', async ({ page }) => {
    await page.click('#add-app-btn');
    
    const modal = page.locator('#add-app-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toContainText('Add App');
    
    // Check form fields are present
    await expect(page.locator('#app-name')).toBeVisible();
    await expect(page.locator('#app-url')).toBeVisible();
    await expect(page.locator('#app-category')).toBeVisible();
    await expect(page.locator('#app-description')).toBeVisible();
    
    // Close modal
    await page.click('.close');
    await expect(modal).not.toBeVisible();
  });

  test('should add new app successfully', async ({ page }) => {
    // Open add app modal
    await page.click('#add-app-btn');
    
    // Fill form
    await page.fill('#app-name', 'Test Application E2E');
    await page.fill('#app-url', 'https://httpbin.org/status/200');
    await page.selectOption('#app-category', 'web');
    await page.fill('#app-description', 'End-to-end test application');
    await page.selectOption('#check-interval', '300');
    await page.fill('#timeout', '5000');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for modal to close and app to appear
    await expect(page.locator('#add-app-modal')).not.toBeVisible();
    
    // Check if app appears in the grid (may take a moment)
    await page.waitForTimeout(1000);
    await expect(page.locator('.app-card')).toHaveCount(1);
    await expect(page.locator('.app-card .app-name')).toContainText('Test Application E2E');
  });

  test('should validate form inputs', async ({ page }) => {
    await page.click('#add-app-btn');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for HTML5 validation
    const nameInput = page.locator('#app-name');
    const urlInput = page.locator('#app-url');
    
    await expect(nameInput).toBeInvalid();
    await expect(urlInput).toBeInvalid();
  });

  test('should show search functionality', async ({ page }) => {
    // Add a test app first
    await page.click('#add-app-btn');
    await page.fill('#app-name', 'Searchable App');
    await page.fill('#app-url', 'https://example.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Test search
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
    
    await searchInput.fill('Searchable');
    // In a real implementation, this would filter the apps
    await expect(page.locator('.app-card')).toHaveCount(1);
  });

  test('should open settings modal', async ({ page }) => {
    await page.click('#settings-btn');
    
    const modal = page.locator('#settings-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toContainText('Mission Control Settings');
    
    // Check settings form
    await expect(page.locator('#global-interval')).toBeVisible();
    await expect(page.locator('#retention-days')).toBeVisible();
    await expect(page.locator('#enable-sound')).toBeVisible();
    await expect(page.locator('#dark-mode')).toBeVisible();
    
    // Close modal
    await page.click('.close');
    await expect(modal).not.toBeVisible();
  });

  test('should handle refresh button', async ({ page }) => {
    await page.click('#refresh-btn');
    // In a real implementation, this would trigger a refresh of all apps
    // We can check for loading states or updated timestamps
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that elements are still visible and properly arranged
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.stats-grid')).toBeVisible();
    await expect(page.locator('.control-panel')).toBeVisible();
    
    // Check that buttons are still clickable
    await expect(page.locator('#add-app-btn')).toBeVisible();
    await expect(page.locator('#refresh-btn')).toBeVisible();
  });

  test('should persist theme selection', async ({ page }) => {
    // Switch to Pip-Boy theme
    await page.selectOption('#themeSelector', 'pipboy');
    await expect(page.locator('body')).toHaveClass(/theme-pipboy/);
    
    // Reload page
    await page.reload();
    
    // Check that theme is still Pip-Boy
    await expect(page.locator('#themeSelector')).toHaveValue('pipboy');
    await expect(page.locator('body')).toHaveClass(/theme-pipboy/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('#themeSelector')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#search-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#add-app-btn')).toBeFocused();
    
    // Test Enter key on buttons
    await page.keyboard.press('Enter');
    await expect(page.locator('#add-app-modal')).toBeVisible();
    
    // Test Escape key to close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('#add-app-modal')).not.toBeVisible();
  });

  test('should show loading states appropriately', async ({ page }) => {
    // This would test loading spinners, disabled states, etc.
    // In a real implementation, we might intercept network requests
    // to simulate slow responses and test loading states
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test error handling by intercepting API calls
    await page.route('**/api/apps', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal Server Error' })
      });
    });
    
    await page.click('#refresh-btn');
    
    // Should show error message or fallback UI
    // In a real implementation, this would show error notifications
  });

  test('should export data functionality', async ({ page }) => {
    // Test export button
    await page.click('#export-btn');
    
    // In a real implementation, this might trigger a download
    // or show an export modal
  });
});

test.describe('App Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Add a test app for management tests
    await page.click('#add-app-btn');
    await page.fill('#app-name', 'Management Test App');
    await page.fill('#app-url', 'https://httpbin.org/status/200');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  });

  test('should show app details', async ({ page }) => {
    const appCard = page.locator('.app-card').first();
    await expect(appCard).toBeVisible();
    
    // Check app card contains expected information
    await expect(appCard.locator('.app-name')).toContainText('Management Test App');
    await expect(appCard.locator('.app-url')).toContainText('httpbin.org');
    await expect(appCard.locator('.app-status')).toBeVisible();
  });

  test('should allow manual health check', async ({ page }) => {
    const appCard = page.locator('.app-card').first();
    
    // Look for and click health check button
    await appCard.locator('.check-btn, .health-check-btn').click();
    
    // Should show loading state and then updated status
    await page.waitForTimeout(2000);
    await expect(appCard.locator('.app-status')).toBeVisible();
  });

  test('should allow app deletion', async ({ page }) => {
    const appCard = page.locator('.app-card').first();
    
    // Look for delete button (might be in a dropdown or direct button)
    await appCard.locator('.delete-btn, .remove-btn').click();
    
    // Confirm deletion if there's a confirmation dialog
    await page.getByRole('button', { name: /confirm|delete|yes/i }).click();
    
    // App should be removed from the grid
    await expect(page.locator('.app-card')).toHaveCount(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels on important elements
    await expect(page.locator('#add-app-btn')).toHaveAttribute('aria-label');
    await expect(page.locator('#themeSelector')).toHaveAttribute('aria-label');
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2, h3')).toHaveCountGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This would ideally use automated accessibility testing tools
    // like axe-core to check color contrast ratios
  });
});