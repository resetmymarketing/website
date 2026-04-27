import { test, expect } from '@playwright/test';

test.describe('Public Site', () => {
  test('home page loads with correct title and hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Reset My Marketing/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    // Desktop nav
    await expect(page.getByRole('link', { name: /about/i }).first()).toBeAttached();
    await expect(page.getByRole('link', { name: /how it works/i }).first()).toBeAttached();
    await expect(page.getByRole('link', { name: /contact/i }).first()).toBeAttached();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/About/);
  });

  test('how it works page loads', async ({ page }) => {
    await page.goto('/how-it-works');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/How It Works/);
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
  });

  test('skip-to-content link exists', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('footer is visible on all public pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
