// Pre/post "app performance check" logic — personalization/change-tracking
// ONLY, never a clinical score.
//
// Invariants (documented in docs/OUTCOME_MEASUREMENT.md):
//   - There is NO total/aggregate cognitive score. Comparison is per domain.
//   - Change labels are limited to three transparent, deterministic phrases:
//     "higher on this app task", "about the same on this app task",
//     "lower on this app task". They never say improved/worsened clinically.
//   - Forms alternate A/B so the same stimulus set is never shown twice in a
//     row.
//   - The "take a post check now" suggestion is a neutral product milestone
//     (10 completed sessions OR 14 days), not a clinical recommendation.

import type {
  AssessmentForm,
  BaselineDomain,
  BaselineResult,
  DomainOutcome,
  FunctionalGoalRating,
  OutcomeAssessment,
  SessionRecord,
} from '../types';

/** The six scored domains (fatigue is reported separately). */
export type ScoredDomain = Exclude<BaselineDomain, 'fatigueTolerance'>;

export const SCORED_DOMAINS: ScoredDomain[] = [
  'orientation',
  'attention',
  'memory',
  'language',
  'visualScanning',
  'executive',
];

/** Preset functional-goal self-rating scale (5 = most independent). */
export const GOAL_RATING_CHOICES = [1, 2, 3, 4, 5] as const;

export const GOAL_RATING_LABELS: Record<number, string> = {
  1: 'I need a lot of help',
  2: 'I need quite a bit of help',
  3: 'I need a little help',
  4: 'I can mostly do it',
  5: 'I can do it on my own',
};

/** Proportion change (post − pre) that flips the label either way. */
export const COMPARISON_DELTA = 0.15;

/** Neutral post-check suggestion: completed sessions OR days since pre. */
export const POST_SUGGEST_SESSIONS = 10;
export const POST_SUGGEST_DAYS = 14;

export type DomainChangeLabel =
  | 'higher on this app task'
  | 'about the same on this app task'
  | 'lower on this app task';

export interface DomainComparison {
  domain: ScoredDomain;
  before: { correct: number; total: number };
  after: { correct: number; total: number };
  label: DomainChangeLabel;
}

export interface GoalRatingChange {
  goalId: string;
  before: number;
  after: number;
  delta: number;
}

export interface TrainingExposure {
  sessions: number;
  minutes: number;
  modules: string[];
  moduleCounts: Record<string, number>;
}

/**
 * Pick the next assessment form: 'A' for the first ever, then alternate from
 * the immediately prior assessment so the same stimulus set is never repeated
 * back-to-back.
 */
export function nextForm(prior: readonly OutcomeAssessment[]): AssessmentForm {
  if (prior.length === 0) return 'A';
  const last = prior[prior.length - 1];
  return last.form === 'A' ? 'B' : 'A';
}

export interface BuildOutcomeOptions {
  kind: OutcomeAssessment['kind'];
  form: AssessmentForm;
  id: string;
  completedAt: string;
  baseline: BaselineResult;
  /** Hints/assistance used per scored domain (default 0). */
  hints: Partial<Record<ScoredDomain, number>>;
  goalRatings: FunctionalGoalRating[];
}

/** Derive a structured OutcomeAssessment from the baseline tallies. */
export function buildOutcomeAssessment(
  options: BuildOutcomeOptions,
): OutcomeAssessment {
  const domains: DomainOutcome[] = SCORED_DOMAINS.map((domain) => {
    const b = options.baseline.domains.find((d) => d.domain === domain);
    if (!b || !b.completed || b.correct === null || b.total === null) {
      return { domain, correct: 0, total: 0, hints: 0, skipped: b?.skipped ?? false };
    }
    return {
      domain,
      correct: b.correct,
      total: b.total,
      hints: options.hints[domain] ?? 0,
      skipped: b.skipped,
    };
  });

  return {
    version: 1,
    id: options.id,
    kind: options.kind,
    form: options.form,
    completedAt: options.completedAt,
    domains,
    functionalGoalRatings: options.goalRatings,
    fatigue: options.baseline.fatigue,
    stoppedEarly: options.baseline.stoppedEarly,
  };
}

function ratio(d: DomainOutcome): number {
  if (d.total <= 0) return 0;
  return d.correct / d.total;
}

/**
 * Compare pre vs post PER DOMAIN only. Returns only domains assessed (total
 * > 0) in BOTH checks. There is deliberately no aggregate returned.
 */
export function compareDomains(
  pre: OutcomeAssessment,
  post: OutcomeAssessment,
): DomainComparison[] {
  const postByDomain = new Map(post.domains.map((d) => [d.domain, d]));
  const out: DomainComparison[] = [];
  for (const preD of pre.domains) {
    const postD = postByDomain.get(preD.domain);
    if (!postD || preD.total <= 0 || postD.total <= 0) continue;
    const delta = ratio(postD) - ratio(preD);
    let label: DomainChangeLabel;
    if (delta >= COMPARISON_DELTA) label = 'higher on this app task';
    else if (delta <= -COMPARISON_DELTA) label = 'lower on this app task';
    else label = 'about the same on this app task';
    out.push({
      domain: preD.domain,
      before: { correct: preD.correct, total: preD.total },
      after: { correct: postD.correct, total: postD.total },
      label,
    });
  }
  return out;
}

/** Compare functional-goal self-ratings (reported separately from domains). */
export function compareGoalRatings(
  pre: OutcomeAssessment,
  post: OutcomeAssessment,
): GoalRatingChange[] {
  const postByGoal = new Map(
    post.functionalGoalRatings.map((g) => [g.goalId, g.rating]),
  );
  const out: GoalRatingChange[] = [];
  for (const preG of pre.functionalGoalRatings) {
    const after = postByGoal.get(preG.goalId);
    if (after === undefined) continue;
    out.push({
      goalId: preG.goalId,
      before: preG.rating,
      after,
      delta: after - preG.rating,
    });
  }
  return out;
}

/** Whole days between two ISO timestamps (calendar days, not 24h windows). */
export function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.floor((b - a) / 86_400_000);
}

/** Neutral milestone: has the user done ≥10 sessions OR ≥14 days since pre? */
export function isPostSuggested(
  sessions: number,
  daysSincePre: number,
): boolean {
  return sessions >= POST_SUGGEST_SESSIONS || daysSincePre >= POST_SUGGEST_DAYS;
}

/** Summarise training exposure between assessments (sessions/minutes/modules). */
export function trainingExposure(records: readonly SessionRecord[]): TrainingExposure {
  const minutes = records.reduce((sum, r) => sum + (r.minutes || 0), 0);
  const moduleCounts: Record<string, number> = {};
  for (const r of records) {
    for (const id of r.modulesCompleted ?? []) {
      moduleCounts[id] = (moduleCounts[id] ?? 0) + 1;
    }
  }
  const modules = Object.keys(moduleCounts).sort();
  return {
    sessions: records.length,
    minutes,
    modules,
    moduleCounts,
  };
}
