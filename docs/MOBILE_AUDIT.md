# Mobile Safari audit — iPhone & iPad (Playwright WebKit)

Generated from `npm run test:e2e` on 2026-09-25. This suite never modifies production code; every failure below is a defect in the app to be fixed in a separate task.

## Result summary

- **Pass:** 60  ·  **Fail:** 4  ·  **Skipped:** 4  ·  **Total:** 68
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
| tap-targets | FAIL | FAIL | FAIL | FAIL |
| text-scaling | PASS | PASS | PASS | PASS |
| horizontal-scroll | PASS | PASS | PASS | PASS |

## Defects (1)

### 1. [tap-targets] tap targets meet the 44×44px minimum on key screens

- **Repro:** Visit Home, Mood, Settings and Evidence at both Standard and Large text size; confirm every button, link and disclosure summary is at least 44×44 CSS px.
- **Evidence (per device/orientation):**
  - **iphone-13-portrait:** `undersized tap targets: a.evidence-sources "NICE NG236 — tailor sessions to mood and fatigue" 276.5×42.3 | a.evidence-sources "VA/DoD Stroke Rehabilitation CPG 2024 — mood screening and t" 271.1×42.3` — [screenshot](mobile-audit-screenshots/iphone-13-portrait-tap-targets-meet-the-44-44px-minimum-on-key-screens.png)
  - **iphone-13-landscape:** `undersized tap targets: a.evidence-sources "NICE NG236 — tailor sessions to mood and fatigue" 324.8×20 | a.evidence-sources "VA/DoD Stroke Rehabilitation CPG 2024 — mood screening and t" 472.3×20` — [screenshot](mobile-audit-screenshots/iphone-13-landscape-tap-targets-meet-the-44-44px-minimum-on-key-screens.png)
  - **ipad-pro-11-portrait:** `undersized tap targets: a.evidence-sources "NICE NG236 — tailor sessions to mood and fatigue" 324.8×20 | a.evidence-sources "VA/DoD Stroke Rehabilitation CPG 2024 — mood screening and t" 472.3×20` — [screenshot](mobile-audit-screenshots/ipad-pro-11-portrait-tap-targets-meet-the-44-44px-minimum-on-key-screens.png)
  - **ipad-pro-11-landscape:** `undersized tap targets: a.evidence-sources "NICE NG236 — tailor sessions to mood and fatigue" 324.8×20 | a.evidence-sources "VA/DoD Stroke Rehabilitation CPG 2024 — mood screening and t" 472.3×20` — [screenshot](mobile-audit-screenshots/ipad-pro-11-landscape-tap-targets-meet-the-44-44px-minimum-on-key-screens.png)

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
