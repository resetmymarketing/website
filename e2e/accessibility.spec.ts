import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  const publicPages = ['/', '/about', '/how-it-works', '/contact', '/login'];

  for (const path of publicPages) {
    test(`${path} has proper heading hierarchy`, async ({ page }) => {
      await page.goto(path);
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });

    test(`${path} has lang attribute`, async ({ page }) => {
      await page.goto(path);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('en');
    });

    test(`${path} has main landmark`, async ({ page }) => {
      await page.goto(path);
      const main = page.locator('main, [role="main"]');
      await expect(main.first()).toBeAttached();
    });
  }

  test('login form inputs have labels', async ({ page }) => {
    await page.goto('/login');
    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');
    await expect(emailLabel).toBeAttached();
    await expect(passwordLabel).toBeAttached();
  });
});
