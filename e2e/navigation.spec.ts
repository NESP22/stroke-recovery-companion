import { test, expect } from '@playwright/test';
import { CATEGORY, annotate, gotoOnboarded, measureHorizontalOverflow } from './helpers';

// Routes that render independent of stored data (safe to deep-link).
const ROUTES = [
  '/onboarding',
  '/orientation',
  '/memory',
  '/attention',
  '/executive',
  '/aphasia',
  '/neglect',
  '/adl',
  '/mood',
  '/caregiver',
  '/dashboard',
  '/settings',
  '/install',
  '/evidence',
  '/plan',
  '/functional',
];

test.describe('client-side navigation', () => {
  test('deep-link to every route renders content (no full-page 404)', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.NAV,
      'Open each app route by URL directly and confirm the SPA renders its screen without a server 404 or horizontal overflow.',
    );
    await gotoOnboarded(page);

    for (const route of ROUTES) {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`${route}: ${m.text()}`);
      });

      await page.goto(route);
      // A rendered screen always exposes at least one heading.
      await expect(page.locator('main#main h1, main#main h2').first()).toBeVisible();
      await expect(page.locator('main#main')).not.toContainText('Loading…');

      const overflow = await measureHorizontalOverflow(page);
      expect(
        overflow.overflowPx,
        `${route} scrolls horizontally by ${overflow.overflowPx}px`,
      ).toBeLessThanOrEqual(1);
      expect(errors, `${route} console errors: ${errors.join(' | ')}`).toEqual([]);
    }
  });

  test('clicking a module card navigates client-side and Back returns home', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.NAV,
      'From Home, tap a "Practice areas" card, confirm the URL changes to that module, then tap Back and confirm you return Home.',
    );
    await gotoOnboarded(page);

    await expect(page.locator('.module-card').first()).toBeVisible();
    const firstCardTitle = await page.locator('.module-card-title').first().innerText();
    await page.locator('.module-card').first().click();

    // URL moved off "/" to the module's own route.
    await expect(page).not.toHaveURL(/\/onboarding$/);
    await expect(page.locator('main#main h1')).toBeVisible();
    expect((await page.locator('main#main h1').innerText()).toLowerCase()).toContain(
      firstCardTitle.toLowerCase().split(' ')[0],
    );

    await page.locator('.back-link').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.home-hero')).toBeVisible();
  });
});
