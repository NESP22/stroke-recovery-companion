import { defineConfig, devices } from '@playwright/test';

// iPhone/iPad Safari checks — the reference platforms for this app.
//
// These run against the production build (npm run build) served by
// `vite preview`, so the service worker, manifest and Add-to-Home-Screen
// metadata are exactly what Craig will hit on a real device.
//
// Browser: WebKit (Safari's engine) for all four viewports. WebKit is the
// correct engine for iPhone/iPad because iOS mandates WebKit for browsers.
//
// The one exception is the offline round-trip (e2e/offline.spec.ts), which
// runs on Chromium: WebKit's offline emulation rejects service-worker-served
// navigation with "WebKit encountered an internal error" (microsoft/playwright
// #42775). The service worker + cache logic under test is engine-agnostic.

const baseURL = 'http://127.0.0.1:4173';

const webkitProjects = [
  {
    name: 'iphone-portrait',
    use: { ...devices['iPhone 13'] },
  },
  {
    name: 'iphone-landscape',
    use: { ...devices['iPhone 13 landscape'] },
  },
  {
    name: 'ipad-portrait',
    use: { ...devices['iPad Pro 11'] },
  },
  {
    name: 'ipad-landscape',
    use: { ...devices['iPad Pro 11 landscape'] },
  },
].map((project) => ({ ...project, testIgnore: /offline\.spec\.ts/ }));

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    ...webkitProjects,
    {
      name: 'chromium-offline',
      use: { browserName: 'chromium' },
      testMatch: /offline\.spec\.ts/,
    },
  ],
});
