# Privacy

Stroke Recovery Companion is a **local-first** app. This page explains what
data exists, where it lives, and what the app does (and does not) claim.

## What the app stores

All data is stored **only on your device**, in your browser's local storage
(IndexedDB / localStorage). Nothing is uploaded to a server.

The app stores a small amount of structured, non-identifying data:

- Your chosen goals (from a fixed list of presets — no free text).
- Session records (date, minutes practised, fatigue and mood scores).
- Mood and fatigue check-ins (0–10 scores).
- Daily checklist ticks.
- Your settings (text size, contrast, session length, difficulty, read-aloud
  voice identifier and speed). Voice choices stay in localStorage; if storage
  is blocked, they work for the current visit only.

Read-aloud uses only English voices that the browser reports as on-device
(`localService`). Remote voices are not offered or used, including as a
fallback. If no local English voice is available yet, the app does not send
text to the browser's unspecified default voice. No network TTS service is
used, and read-aloud text or audio is not saved by the app.

## What the app does NOT collect

- No names, dates of birth, addresses, phone numbers or email addresses.
- No medication details (the app only refers to "medication (if prescribed)").
- No free-text input at all — the app has no text fields.
- No location, device identifiers, analytics or advertising identifiers.
- No data is transmitted to any server.

## Not a HIPAA-covered service

This app is **not** HIPAA-compliant and does **not** claim to be. It is a
general-wellness/rehabilitation adjunct, not a covered healthcare service and
not a medical device. It does not diagnose, treat or replace professional
care.

## Regulatory posture

- The app positions itself as a **general-wellness** tool and avoids
  disease-treatment / function-restoration claims (see the FDA General
  Wellness guidance).
- As a health-adjacent app outside HIPAA, it takes the FTC Health Breach
  Notification Rule seriously: because it does not collect individually
  identifiable health information in the first place, there is nothing to
  breach or notify.

## Deleting your data

Open **Settings → Clear all data on this device** to remove everything the app
has stored. Because data never leaves your device, deletion is complete and
immediate.

## Changes

Because no data is collected, there is no account and no way for us to contact
you about policy changes. This document lives in the repository and changes
with the code.
