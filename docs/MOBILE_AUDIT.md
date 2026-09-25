# Mobile Safari audit — iPhone & iPad (Playwright WebKit)

Generated from `npm run test:e2e` on 2026-09-25. This suite never modifies production code; every failure below is a defect in the app to be fixed in a separate task.

## Result summary

- **Pass:** 68  ·  **Fail:** 0  ·  **Skipped:** 4  ·  **Total:** 72
- Devices/orientations: ipad-pro-11-landscape, ipad-pro-11-portrait, iphone-13-landscape, iphone-13-portrait

## Pass/fail matrix (category × device/orientation)

| Category | ipad-pro-11-landscape | ipad-pro-11-portrait | iphone-13-landscape | iphone-13-portrait |
| --- | --- | --- | --- | --- |
| initial-load | PASS | PASS | PASS | PASS |
| client-side-navigation | PASS | PASS | PASS | PASS |
| forms | PASS | PASS | PASS | PASS |
| pwa-manifest | PASS | PASS | PASS | PASS |
| offline | SKIP | SKIP | SKIP | SKIP |
| add-to-home-screen | PASS | PASS | PASS | PASS |
| safe-area-insets | PASS | PASS | PASS | PASS |
| tap-targets | PASS | PASS | PASS | PASS |
| text-scaling | PASS | PASS | PASS | PASS |
| horizontal-scroll | PASS | PASS | PASS | PASS |

## Defects

No failing checks — the suite is green.
## Skipped checks (expected limitations, not app defects)

- **app shell serves offline after install** (offline): skipped

## Known test-environment limitations

- **Offline round-trip is skipped on WebKit.** Playwright/WebKit cannot emulate offline + service-worker navigation (microsoft/playwright#42775). Service-worker registration and app-shell caching ARE verified on WebKit; the offline reload itself is covered on a real device (see the device checklist).
- **Read-aloud button is not rendered in headless WebKit.** `window.speechSynthesis` is undefined there, so the header "Listen" button (and any layout interaction it causes with long page titles) cannot be exercised in this harness. Confirm that interaction on a real device.

## Reproducing

```bash
npm install
npx playwright install webkit
npm run test:e2e          # runs all four WebKit device/orientation profiles
npm run report:mobile     # regenerates this report from test-results/results.json
```
