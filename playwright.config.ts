import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright WebKit test-runner for iPhone / iPad Safari parity checks.
 *
 * This is a QA harness, not part of the app. It builds the production bundle
 * (so the hand-rolled service worker registers) and serves it via `vite
 * preview`, then runs every spec against four WebKit device descriptors:
 * iPhone 13 and iPad Pro 11, each in portrait and landscape.
 *
 * Production code is never modified by this suite — failures here are defects
 * to be fixed in a separate task.
 *
 * The one exception is the offline round-trip (e2e/offline.spec.ts), which
 * runs on Chromium: WebKit's offline emulation rejects service-worker-served
 * navigation with "WebKit encountered an internal error" (microsoft/playwright
 * #42775). The service worker + cache logic under test is engine-agnostic.
 */

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const webkitProjects = [
  {
    name: 'iphone-13-portrait',
    use: { ...devices['iPhone 13'] },
  },
  {
    name: 'iphone-13-landscape',
    use: { ...devices['iPhone 13 landscape'] },
  },
  {
    name: 'ipad-pro-11-portrait',
    use: { ...devices['iPad Pro 11'] },
  },
  {
    name: 'ipad-pro-11-landscape',
    use: { ...devices['iPad Pro 11 landscape'] },
  },
].map((project) => ({ ...project, testIgnore: /offline\.spec\.ts/ }));

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    locale: 'en-US',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    ...webkitProjects,
    {
      name: 'chromium-offline',
      use: { browserName: 'chromium' },
      testMatch: /offline\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort --host 127.0.0.1',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
