import { expect, test, type Page } from '@playwright/test';
import {
  completeOnboarding,
  expectNoHorizontalScroll,
  expectNoUndersizedTapTargets,
} from './helpers';

// Screens exercised by the navigation/horizontal-scroll sweep. Every module
// plus the cross-cutting screens, hit directly by URL (routes are not guarded
// except "/", which redirects to onboarding until setup is complete).
const ROUTES = [
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
  '/evidence',
  '/settings',
  '/install',
  '/baseline',
  '/plan',
  '/functional',
  '/outcome-report',
  '/session',
];

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

test('app shell loads with correct title and Add-to-Home-Screen metadata', async ({
  page,
}) => {
  const errors = collectPageErrors(page);
  await page.goto('/');

  await expect(page).toHaveTitle('Stroke Recovery Companion');
  await expect(page.locator('#root')).not.toBeEmpty();

  // Add-to-Home-Screen / Apple metadata.
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/manifest.webmanifest',
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    'content',
    '#0b5d4e',
  );
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
    'content',
    'yes',
  );
  await expect(
    page.locator('meta[name="apple-mobile-web-app-status-bar-style"]'),
  ).toHaveAttribute('content', 'default');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
    'content',
    'Stroke Recovery',
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/icons/apple-touch-icon-180.png',
  );

  // Safe-area support: viewport-fit=cover in the viewport meta tag, and the
  // stylesheet must actually use env(safe-area-inset-*).
  const viewportContent = await page
    .locator('meta[name="viewport"]')
    .getAttribute('content');
  expect(viewportContent).toContain('viewport-fit=cover');

  const safeAreaUsed = await page.evaluate(() => {
    const walk = (rules: CSSRuleList | CSSRule[]): boolean => {
      for (const rule of Array.from(rules)) {
        const css = rule as CSSStyleRule & { cssRules?: CSSRuleList };
        if (css.cssText && css.cssText.includes('safe-area-inset')) return true;
        if (css.cssRules && walk(css.cssRules)) return true;
      }
      return false;
    };
    return Array.from(document.styleSheets).some((sheet) => {
      try {
        return walk(sheet.cssRules);
      } catch {
        return false;
      }
    });
  });
  expect(safeAreaUsed, 'expected env(safe-area-inset-*) rules in the stylesheet').toBe(
    true,
  );

  expect(errors).toEqual([]);
});

test('onboarding form completes end-to-end', async ({ page }) => {
  const errors = collectPageErrors(page);
  await completeOnboarding(page);
  // Landing on Home (not redirected back to onboarding) is the completion signal.
  await expect(page.getByRole('link', { name: 'Start today’s session' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('every screen renders without horizontal scroll or runtime errors', async ({
  page,
}) => {
  const errors = collectPageErrors(page);
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.loading')).toHaveCount(0);
    await expectNoHorizontalScroll(page);
  }
  expect(errors).toEqual([]);
});

test('tap targets meet the 44px minimum on every screen at the smallest text size', async ({
  page,
}) => {
  // The smallest ("standard") text size is the worst case: rem-based control
  // padding shrinks with the root font, so if every control clears 44px here it
  // clears at the larger sizes too.
  const screens = ['/onboarding', ...ROUTES];
  for (const route of screens) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.dataset.fontSize = 'standard';
    });
    await expectNoUndersizedTapTargets(page);
  }
});

test('text size scales up and the layout still fits', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/settings');

  const before = await page.evaluate(() => getComputedStyle(document.body).fontSize);

  await page.getByRole('button', { name: 'Extra large' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-font-size', 'xl');

  const after = await page.evaluate(() => getComputedStyle(document.body).fontSize);
  expect(parseFloat(after)).toBeGreaterThan(parseFloat(before));
  expect(after).toBe('22px');

  // The larger text must not introduce horizontal overflow.
  await expectNoHorizontalScroll(page);

  // The choice is persisted and reflected on reload.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-font-size', 'xl');
  expect(errors).toEqual([]);
});
