import { test, expect } from '@playwright/test';
import { CATEGORY, annotate, gotoOnboarded } from './helpers';

test.describe('initial load', () => {
  test('renders the app shell without console errors', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.LOAD,
      'Open the app URL and wait for it to finish loading. Observe the page and the browser console.',
    );
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(String(err)));

    await gotoOnboarded(page);

    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('main#main')).not.toContainText('Loading…');
    // Home screen renders after onboarding is seeded.
    await expect(page.locator('h1')).toBeVisible();
    expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
  });

  test('first-run (no profile) redirects to onboarding', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.LOAD,
      'Open the app in a fresh browser with no stored profile; expect the /onboarding welcome screen.',
    );
    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator('main#main')).toContainText('This is your recovery companion');
  });

  test('document metadata is well-formed (title, lang, theme-color)', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.LOAD,
      'Inspect the document <head> on first load.',
    );
    await page.goto('/onboarding');
    await expect(page).toHaveTitle('Stroke Recovery Companion');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#0b5d4e',
    );
  });
});
