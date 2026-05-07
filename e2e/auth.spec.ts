import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('should have email input field', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('should have password input field', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
  });

  test('should have submit button', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard Page', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page).toHaveURL(/login|signin/, { timeout: 10000 });
  });
});