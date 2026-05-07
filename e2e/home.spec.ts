import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });

  test('should display content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);
    const heading = page.locator('h1, h2, [class*="text-"]').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);
    const header = page.locator('header');
    await expect(header).toBeVisible({ timeout: 10000 });
  });
});