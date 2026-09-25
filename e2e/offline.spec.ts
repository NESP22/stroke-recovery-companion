import { expect, test } from '@playwright/test';

// This file is pinned to the Chromium project in playwright.config.ts and
// ignored by the WebKit projects. Reason: WebKit's offline emulation has an
// open bug (microsoft/playwright#42775, reproduced on WebKit 26.6 / Playwright
// 1.63.0) where `context.setOffline(true)` rejects any service-worker-served
// navigation with "WebKit encountered an internal error" — even when the
// worker returns a cached or literal Response with no network access at all.
// Chromium and Firefox emulate offline correctly, so the offline round-trip
// (which tests the engine-agnostic service worker + cache logic) runs here.
// Every other iPhone/iPad check stays on WebKit in app.spec.ts / pwa.spec.ts.

test('the app shell loads fully offline from the service worker cache', async ({
  page,
  context,
}) => {
  // First visit: SW installs and activates (skipWaiting + clients.claim).
  await page.goto('/');
  await page.waitForFunction(
    () => navigator.serviceWorker && !!navigator.serviceWorker.controller,
    undefined,
    { timeout: 20_000 },
  );

  // Second load under SW control so the hashed JS/CSS are lazily cached by the
  // fetch handler. (The very first load happens before the SW takes control, so
  // its assets are fetched directly — the standard "visit once, then offline on
  // the next visit" PWA model.)
  await page.reload();
  await page.waitForLoadState('load');

  // Wait until the hashed assets have actually been written to the cache
  // (rather than a fixed sleep, which is flaky on slow CI runners).
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          for (const key of await caches.keys()) {
            const cache = await caches.open(key);
            for (const req of await cache.keys()) {
              if (req.url.includes('/assets/')) return true;
            }
          }
          return false;
        }),
      { timeout: 15_000 },
    )
    .toBe(true);

  // Go offline and reload from inside the page — the browser's own navigation
  // exercises the service worker's network-first → cache fallback the same way
  // a real device does.
  await context.setOffline(true);

  // Prove a *new* document actually loaded, not just that `load` fired on the
  // old one: set an in-memory marker before reloading, then require it to be
  // gone. A navigation that silently failed (or the old document merely
  // re-firing `load`) would leave the marker intact and fail the test.
  await page.evaluate(() => {
    (window as { __preReload?: number }).__preReload = 1;
    window.location.reload();
  });
  await page.waitForFunction(
    () => (window as { __preReload?: number }).__preReload === undefined,
    undefined,
    { timeout: 20_000 },
  );

  await expect(page).toHaveTitle('Stroke Recovery Companion');
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('h1')).toBeVisible();
});
