# Mobile Safari audit — iPhone & iPad (Playwright WebKit)

Generated from `npm run test:e2e` on 2026-09-25. This suite never modifies production code; every failure below is a defect in the app to be fixed in a separate task.

## Result summary

- **Pass:** 69  ·  **Fail:** 0  ·  **Skipped:** 4  ·  **Total:** 73
- Devices/orientations: chromium-offline, ipad-pro-11-landscape, ipad-pro-11-portrait, iphone-13-landscape, iphone-13-portrait

## Pass/fail matrix (category × device/orientation)

| Category | chromium-offline | ipad-pro-11-landscape | ipad-pro-11-portrait | iphone-13-landscape | iphone-13-portrait |
| --- | --- | --- | --- | --- | --- |
| initial-load | — | PASS | PASS | PASS | PASS |
| client-side-navigation | — | PASS | PASS | PASS | PASS |
| forms | — | PASS | PASS | PASS | PASS |
| pwa-manifest | — | PASS | PASS | PASS | PASS |
| offline | PASS | SKIP | SKIP | SKIP | SKIP |
| add-to-home-screen | — | PASS | PASS | PASS | PASS |
| safe-area-insets | — | PASS | PASS | PASS | PASS |
| tap-targets | — | PASS | PASS | PASS | PASS |
| text-scaling | — | PASS | PASS | PASS | PASS |
| horizontal-scroll | — | PASS | PASS | PASS | PASS |

## Defects

No failing checks — the suite is green.
## Skipped checks (expected limitations, not app defects)

- **app shell serves offline after install** (offline): skipped

## Known test-environment limitations

- **Offline round-trip is skipped on WebKit, but is covered on Chromium.** Playwright/WebKit cannot emulate offline + service-worker navigation (microsoft/playwright#42775), so the WebKit offline test reports as skipped. The same engine-agnostic service-worker/cache path is asserted on the `chromium-offline` project (e2e/offline.spec.ts), which proves a fresh document loads offline. Service-worker registration and app-shell caching ARE also verified on WebKit; the real-device offline behaviour is additionally covered by the device checklist.
- **Read-aloud button is not rendered in headless WebKit.** `window.speechSynthesis` is undefined there, so the header "Listen" button (and any layout interaction it causes with long page titles) cannot be exercised in this harness. Confirm that interaction on a real device.

## Reproducing

```bash
npm install
npx playwright install webkit chromium
npm run test:e2e          # runs all four WebKit device/orientation profiles + the Chromium offline round-trip
npm run report:mobile     # regenerates this report from test-results/results.json
```
