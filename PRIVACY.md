# Privacy Policy

**Last updated:** 2026-09-20

Stroke Recovery Companion ("the app") is designed to be private by default.
This policy explains what data the app handles and how.

## Summary

- **Everything stays on your device.** The app stores your goals, sessions,
  mood/fatigue check-ins and checklist activity only in your browser
  (IndexedDB / localStorage). It does **not** upload this data to any server.
- **No accounts, no analytics, no telemetry.** We do not collect identifying
  information about you.
- **No free-text health data.** Onboarding and reminders use preset choices, so
  the app does not prompt you to type names, dates of birth, medications or
  other personal details.

## What the app stores locally

| Data | Where | Purpose |
|------|-------|---------|
| Functional goal choices (preset) | On-device | Personalise your plan |
| Session length / rest / difficulty settings | On-device | Configure sessions |
| Accessibility preferences | On-device | Text size, contrast, motion |
| Session records (dates, minutes, fatigue/mood ratings) | On-device | Show your progress dashboard |
| Mood/fatigue check-ins | On-device | Show recent trends |
| ADL checklist ticks | On-device | Show today's routine |

All of this is **structured** (numbers, dates and preset-choice IDs) — there is
no free text, so personal health information is not stored.

## What is NOT stored or sent

- The app has **no server-side database**. The public deployment serves only
  static files (HTML, JavaScript, CSS, icons).
- The app makes **no network requests** for your data.
- The service worker caches only the app's own static files, never your data.

## Deleting your data

Use **Settings → "Clear all data on this device"** to remove everything the app
stored locally. Clearing your browser's site data also removes it.

## Compliance notes

- **HIPAA.** This project does **not** claim HIPAA compliance. Cloudflare (the
  static host) only offers Business Associate Agreements (BAAs) to Enterprise
  customers. If you deploy this app where it would hold protected health
  information, you are responsible for your own compliance review and for
  obtaining any required agreements.
- **Medical device.** The app is **not a medical device** and **not medical
  advice**. It does not diagnose or treat any condition.

## Children

The app is intended for adults (16+) who have had a stroke, and their carers.
It does not knowingly collect data from children.

## Changes

Changes to this policy will be published in this file and in release notes.

## Contact

Open an issue in the repository for privacy questions.
