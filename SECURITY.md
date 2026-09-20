# Security

Stroke Recovery Companion is a **local-first** application: it stores all data
in the user's browser and has no backend service, no user accounts, and no
server-side database. This is a deliberate security property, not an
afterthought.

## Data handling

- Personal data (goals, session records, check-ins, checklist ticks) is stored
  only in the user's browser (IndexedDB / localStorage).
- No data is transmitted to any server. The app makes no network calls
  (`scripts/check-phi.mjs` enforces this in CI).
- The app has no free-text input fields, so it cannot capture names, dates of
  birth, addresses or other free-text identifiers.
- All bundled content is synthetic/demo data.

## What this means

- There is no remote attack surface for data exfiltration, because no data
  leaves the device.
- The main residual risks are local (e.g. a shared device), and are mitigated
  by the "Clear all data on this device" control in Settings and by the fact
  that nothing personal is ever collected.

## Scope of a security report

Because the app has no backend and stores nothing server-side, security
reports are most useful when they concern:

- The static site and its dependencies (e.g. a vulnerable npm package).
- Client-side issues that could, for example, enable XSS via crafted input.
- The PWA service worker and caching behaviour.

## Reporting a vulnerability

Please **do not** open a public issue for a suspected vulnerability. Instead,
report it privately to the maintainers. We aim to acknowledge reports within
72 hours and to publish fixes as soon as possible.

## Dependencies

Dependency vulnerabilities are checked in CI with `npm audit`. Please keep
`package-lock.json` up to date and review audit output on every change.
