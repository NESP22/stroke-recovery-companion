import { expect, test } from '@playwright/test';

test('manifest and PWA icons are served and well-formed', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const manifest = await res.json();

  expect(manifest.name).toBe('Stroke Recovery Companion');
  expect(manifest.short_name).toBe('SRC');
  expect(manifest.start_url).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.theme_color).toBe('#0b5d4e');
  expect(manifest.background_color).toBe('#f7f4ee');

  const icons = manifest.icons as Array<{ src: string; sizes: string; type: string }>;
  expect(icons.length).toBeGreaterThanOrEqual(3);
  for (const icon of icons) {
    const iconRes = await request.get(icon.src);
    expect(iconRes.ok(), `${icon.src} should return 200`).toBe(true);
    expect(iconRes.headers()['content-type']).toContain('image/png');
  }
  // A maskable icon must be present for Android installability; the app also
  // declares an apple-touch-icon separately in the HTML head.
  expect(icons.some((i) => i.purpose === 'maskable')).toBe(true);
});

test('apple-touch-icon resolves (no 404)', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(href).toBeTruthy();
  const res = await request.get(href!);
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('service worker registers, caches only same-origin assets, and the app loads offline', async ({
  page,
  context,
  baseURL,
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

  // Privacy contract: the SW cache holds ONLY same-origin URLs. Personal data
  // lives in IndexedDB and must never appear in the cache. The offline-relevant
  // hashed JS/CSS assets must also be present by now.
  const cachedUrls = await page.evaluate(async () => {
    const out: string[] = [];
    for (const key of await caches.keys()) {
      const cache = await caches.open(key);
      for (const req of await cache.keys()) out.push(req.url);
    }
    return out;
  });
  expect(cachedUrls.length).toBeGreaterThan(0);
  expect(
    cachedUrls.some((u) => u.includes('/assets/')),
    'hashed JS/CSS assets should be cached for offline use',
  ).toBe(true);
  for (const url of cachedUrls) {
    expect(url.startsWith(`${baseURL}/`), `cached URL must be same-origin: ${url}`).toBe(
      true,
    );
  }

  // Offline: the app shell must still render from cache.
  //
  // Note: Playwright's page.reload()/page.goto() throw "WebKit encountered an
  // internal error" when the context is offline, so we trigger the reload from
  // inside the page — the browser's own navigation exercises the service
  // worker's network-first → cache fallback the same way a real device does.
  await context.setOffline(true);
  await page.evaluate(() => window.location.reload());
  await page.waitForLoadState('load');
  await expect(page).toHaveTitle('Stroke Recovery Companion');
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('h1')).toBeVisible();
});
