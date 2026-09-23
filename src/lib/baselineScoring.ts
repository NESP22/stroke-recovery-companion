// Pure scoring helpers for the baseline check.
//
// The numbers produced here are APP-TASK performance/adherence signals used
// ONLY to pick practice focus areas and a starting level. They are not
// validated clinical scores and are never shown as "severity".

import type {
  BaselineDomain,
  BaselineDomainResult,
  BaselineResult,
} from '../types';

export interface DomainTally {
  domain: BaselineDomain;
  /** Number of correctly-answered items. */
  correct: number;
  /** Number of items presented (denominator). */
  total: number;
  /** True once the user chose to skip this whole domain. */
  skipped: boolean;
  /** True once at least one item in this domain was answered. */
  attempted: boolean;
}

export const BASELINE_DOMAINS: BaselineDomain[] = [
  'orientation',
  'attention',
  'memory',
  'language',
  'visualScanning',
  'executive',
  'fatigueTolerance',
];

/** The six domains that carry an app-task score (fatigue is handled apart). */
const SCORED_DOMAINS: Exclude<BaselineDomain, 'fatigueTolerance'>[] = [
  'orientation',
  'attention',
  'memory',
  'language',
  'visualScanning',
  'executive',
];

export function emptyTallies(): Record<BaselineDomain, DomainTally> {
  const out = {} as Record<BaselineDomain, DomainTally>;
  for (const domain of BASELINE_DOMAINS) {
    out[domain] = { domain, correct: 0, total: 0, skipped: false, attempted: false };
  }
  return out;
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/**
 * Turn raw per-domain tallies into a BaselineResult.
 *
 * Rules (matching the personalization layer's expectations):
 *  - A skipped domain is ineligible for personalization: skipped=true,
 *    correct/total=null.
 *  - A scored domain with at least one answered item is "completed" with
 *    clamped correct/total (0 <= correct <= total, total >= 0).
 *  - A scored domain never reached is not completed: correct/total=null.
 *  - Fatigue tolerance is reported from the `fatigue` rating itself (no
 *    "score"): completed when answered, otherwise not.
 */
export function buildBaselineResult(
  tallies: Record<BaselineDomain, DomainTally>,
  fatigue: number | null,
  stoppedEarly: boolean,
  completedAt: string,
): BaselineResult {
  const scored: BaselineDomainResult[] = SCORED_DOMAINS.map((domain) => {
    const t = tallies[domain];
    if (t.skipped) {
      return { domain, completed: false, correct: null, total: null, skipped: true };
    }
    if (!t.attempted || t.total <= 0) {
      return { domain, completed: false, correct: null, total: null, skipped: false };
    }
    return {
      domain,
      completed: true,
      correct: clampInt(t.correct, 0, t.total),
      total: clampInt(t.total, 0, Number.MAX_SAFE_INTEGER),
      skipped: false,
    };
  });

  scored.push({
    domain: 'fatigueTolerance',
    completed: fatigue !== null,
    correct: null,
    total: null,
    skipped: false,
  });

  return {
    version: 1,
    completedAt,
    domains: scored,
    fatigue: fatigue === null ? null : clampInt(fatigue, 0, 10),
    stoppedEarly,
  };
}
