import { test, expect } from '@playwright/test';
import {
  CATEGORY,
  annotate,
  expectEvidenceSourceTapTargets,
  expectNoHorizontalScroll,
  expectTapTargets,
  gotoOnboarded,
} from './helpers';

test.describe('Apple mobile accessibility & viewport', () => {
  test('Add-to-Home-Screen meta tags are present', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.A2HS,
      'Inspect the document head for apple-mobile-web-app-* tags, the apple-touch-icon link, the manifest link and theme-color.',
    );
    await page.goto('/onboarding');

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
      /apple-touch-icon-180\.png$/,
    );
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/manifest.webmanifest',
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#0b5d4e',
    );
  });

  test('viewport uses viewport-fit=cover and CSS applies safe-area insets', async ({
    page,
    request,
  }) => {
    annotate(
      test.info(),
      CATEGORY.SAFE_AREA,
      'Confirm the viewport meta includes viewport-fit=cover and the built CSS uses env(safe-area-inset-*) on the page shell, banner and disclaimer.',
    );
    await page.goto('/onboarding');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /viewport-fit=cover/,
    );

    const cssHref = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
      return links[0]?.href ?? null;
    });
    expect(cssHref, 'app stylesheet is linked').toBeTruthy();

    const css = await (await request.get(cssHref as string)).text();
    for (const side of ['top', 'right', 'bottom', 'left']) {
      expect(css, `CSS uses env(safe-area-inset-${side})`).toContain(
        `env(safe-area-inset-${side})`,
      );
    }
  });

  test('tap targets meet the 44×44px minimum on key screens', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.TAP_TARGETS,
      'Visit Home, Mood, Settings and Evidence at both Standard and Large text size; confirm every button, link and disclosure summary is at least 44×44 CSS px.',
    );
    await gotoOnboarded(page);

    for (const route of ['/', '/mood', '/settings', '/evidence']) {
      await page.goto(route);
      await expect(page.locator('main#main h1, main#main h2').first()).toBeVisible();
      for (const fontSize of ['standard', 'large']) {
        await page.evaluate((f) => {
          document.documentElement.dataset.fontSize = f;
        }, fontSize);
        await expectTapTargets(page, test.info());
      }
    }
  });

  test('evidence-source citation links meet the 44×44px tap minimum', async ({
    page,
  }) => {
    annotate(
      test.info(),
      CATEGORY.TAP_TARGETS,
      'Open the Evidence screen "Sources" list and the "Why this is here" disclosure on a module screen; confirm every .evidence-sources citation link is at least 44×44 CSS px.',
    );
    await gotoOnboarded(page);

    // Evidence screen: the "Sources" section lists every unique citation as a link.
    await page.goto('/evidence');
    await expect(page.locator('main#main h1').first()).toBeVisible();
    await expectEvidenceSourceTapTargets(page, test.info());

    // Module screen: the EvidenceLink disclosure renders the same citation links
    // inline, so the fix must hold here too.
    await page.goto('/orientation');
    await expect(page.locator('main#main h1').first()).toBeVisible();
    await page.locator('details.evidence-link summary').click();
    await expect(page.locator('.evidence-sources a').first()).toBeVisible();
    await expectEvidenceSourceTapTargets(page, test.info());
  });

  test('text scaling increases root font size and stays scroll-free', async ({ page }) => {
    annotate(
      test.info(),
      CATEGORY.TEXT_SCALING,
      'Switch between Standard, Large and Extra large text sizes and confirm the root font size grows, with no horizontal overflow at the largest size.',
    );
    await gotoOnboarded(page);

    const readRootSize = () =>
      page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));

    await page.evaluate(() => {
      document.documentElement.dataset.fontSize = 'standard';
    });
    const standard = await readRootSize();

    await page.evaluate(() => {
      document.documentElement.dataset.fontSize = 'large';
    });
    const large = await readRootSize();

    await page.evaluate(() => {
      document.documentElement.dataset.fontSize = 'xl';
    });
    const xl = await readRootSize();

    expect(large, 'large > standard').toBeGreaterThan(standard);
    expect(xl, 'xl > large').toBeGreaterThan(large);

    await expectNoHorizontalScroll(page, test.info());
  });

  test('no horizontal scroll across representative screens at max text size', async ({
    page,
  }) => {
    annotate(
      test.info(),
      CATEGORY.H_SCROLL,
      'At Extra large text, visit Home, Onboarding, Mood, Settings, Evidence, Orientation, Attention, Neglect and Dashboard; confirm the page never scrolls horizontally.',
    );
    await gotoOnboarded(page);

    const routes = [
      '/',
      '/onboarding',
      '/mood',
      '/settings',
      '/evidence',
      '/orientation',
      '/attention',
      '/neglect',
      '/dashboard',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('main#main h1, main#main h2').first()).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.dataset.fontSize = 'xl';
      });
      await expectNoHorizontalScroll(page, test.info());
    }
  });
});
