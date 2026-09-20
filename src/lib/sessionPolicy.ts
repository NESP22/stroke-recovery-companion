// Session-length policy — derived from 01-guidelines-dose.md and
// 04-digital-safety-privacy.md. This is deliberately small and explicit so it
// can be audited against the evidence.
//
// Evidence position (see evidence.ts -> 'session-policy'):
//   - No guideline specifies an app/screen session length.
//   - A 20–30 minute session is defensible only as a tolerability/feasibility
//     default, NOT an efficacy optimum (LOW / exploratory evidence).
//   - Fatigue affects ~38–77% of stroke survivors and is effort-induced, so
//     sessions should be short, fatigue-aware and user-stoppable.
//   - We never exceed the evidence-supported ceiling without a
//     clinician/carer-configured override.

/** Default session length — deliberately SHORT, not the ceiling. */
export const DEFAULT_SESSION_MINUTES = 15;

/** Evidence-supported ceiling for self-configured sessions. */
export const SESSION_CAP_MINUTES = 30;

/** Upper ceiling only reachable with a clinician/carer-configured override. */
export const SESSION_CAP_WITH_OVERRIDE_MINUTES = 60;

/** Standard (no-override) session-length choices. */
export const STANDARD_SESSION_OPTIONS = [10, 15, 20, 30] as const;

/** Extended choices added only when a clinician/carer has configured setup. */
export const OVERRIDE_SESSION_OPTIONS = [45, 60] as const;

/** Allowed session lengths for a profile, honouring the override gate. */
export function allowedSessionOptions(
  clinicianConfigured: boolean,
): number[] {
  const base: number[] = [...STANDARD_SESSION_OPTIONS];
  if (clinicianConfigured) {
    base.push(...OVERRIDE_SESSION_OPTIONS);
  }
  return base;
}

/** Clamp a requested session length into the allowed range for the profile. */
export function clampSessionMinutes(
  requested: number,
  clinicianConfigured: boolean,
): number {
  const cap = clinicianConfigured
    ? SESSION_CAP_WITH_OVERRIDE_MINUTES
    : SESSION_CAP_MINUTES;
  const options = allowedSessionOptions(clinicianConfigured);
  const allowed = new Set(options);
  if (allowed.has(requested)) return requested;
  // Snap to nearest allowed option, then enforce the hard cap.
  const nearest = options.reduce((best, cur) =>
    Math.abs(cur - requested) < Math.abs(best - requested) ? cur : best,
  );
  return Math.min(nearest, cap);
}
