# Contributing

Thanks for helping improve Stroke Recovery Companion.

## Ground rules

- This is an **adjunct** to clinician-directed rehabilitation. Never add
  language that implies the app diagnoses, treats, or replaces professional
  care. Keep the "not a medical device / not medical advice" framing everywhere.
- **Never claim efficacy beyond cited evidence.** Every clinical/behavioural
  claim must trace to a source in `docs/EVIDENCE.md`. If you change a module's
  behaviour, update its evidence mapping and flag uncertainty.
- **Privacy first.** Personal data stays on-device. Do not add server-side
  persistence, telemetry, analytics, or free-text inputs that could capture PHI
  in a public deployment. See `PRIVACY.md`.
- **Synthetic/demo data only.** Never commit real patient data, names, DOBs,
  medications or images.

## Development workflow

1. Open an issue first for anything non-trivial.
2. Use **conventional commits** (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
3. Branch from `main`; open a pull request.
4. Ensure `npm run verify` passes (lint, typecheck, test, PHI scan, build).
5. Add tests for new behaviour.

## Quality gates (run before every PR)

```bash
npm run lint        # ESLint
npm run typecheck   # strict tsc
npm test            # Vitest
npm run check:phi   # PHI pattern scan
npm run build       # production build
```

## Code style

- TypeScript, strict mode, no `any` where avoidable.
- Accessible-first: every interactive element is keyboard-operable and has a
  visible focus state; touch targets ≥48 px.
- One primary task per screen; plain language.

## License

By contributing you agree your work is licensed under the MIT License.
