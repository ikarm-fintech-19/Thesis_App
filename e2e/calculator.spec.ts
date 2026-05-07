import { test, expect } from '@playwright/test';

test.describe('Calculator Page', () => {
  test('should load calculator page', async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('main, [role="main"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display tabs', async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const tabs = page.locator('[role="tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display form inputs', async ({ page }) => {
    await page.goto('/calculator', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const inputFields = page.locator('input:not([type="hidden"])');
    await expect(inputFields.first()).toBeVisible({ timeout: 10000 });
  });
});