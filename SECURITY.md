# Security Policy

## Scope

This is a client-side, local-first web app. The attack surface is the user's
browser and the static hosting. There is no server-side datastore for personal
data in the MVP, so a compromise of the hosting does not expose user health
data — but we still take issues seriously.

## Reporting a vulnerability

Do **not** open a public issue for a security vulnerability.

Email the maintainers privately with:
- a description of the issue,
- steps to reproduce,
- affected version(s),
- a suggested fix if you have one.

We will acknowledge within 5 business days and aim to publish a fix promptly.

## What we care about most

- **Privacy**: any path that could cause personal data to leave the device
  (telemetry, analytics, accidental server-side writes, third-party embeds).
- **Injection**: the app renders only bundled content and synthetic data, but
  any future user-generated content must be escaped/validated.
- **Supply chain**: dependency vulnerabilities. We run `npm audit` in CI.
- **Web security**: the deployment sets a strict CSP, `X-Frame-Options: DENY`,
  `Referrer-Policy`, and a restrictive `Permissions-Policy`. Changes to
  `public/_headers` should be reviewed carefully.

## Supported versions

Only the latest `main` release is supported.

## Known limitations (by design)

- The app does **not** implement authentication or server-side sync in the MVP;
  data is per-device and cleared by the user in Settings.
- This project does **not** claim HIPAA compliance; Cloudflare BAAs are
  Enterprise-only.
