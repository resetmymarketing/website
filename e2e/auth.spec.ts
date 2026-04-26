import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  // NOTE: This test requires local PostgreSQL with marketing_reset database.
  // Without it, the login API hangs on DB connection and never returns a response.
  // The test is valid -- it passes when the DB is available.
  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword123');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });

  test('pipeline page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/pipeline');
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });
});
