import { clampSessionMinutes } from './sessionPolicy';
import type {
  BaselineDomain,
  BaselineDomainResult,
  BaselineResult,
  Difficulty,
  ModuleId,
  PersonalizedFocus,
  PersonalizedPlan,
  Profile,
} from '../types';

type FocusDomain = Exclude<BaselineDomain, 'fatigueTolerance'>;

const TIE_ORDER: FocusDomain[] = [
  'memory',
  'language',
  'attention',
  'executive',
  'visualScanning',
  'orientation',
];

const GOAL_DOMAIN: Record<string, FocusDomain | undefined> = {
  meds: 'memory',
  dates: 'memory',
  'find-things': 'memory',
  read: 'language',
  'find-words': 'language',
  write: 'language',
  'keep-in-touch': 'language',
  'plan-day': 'executive',
  'meal-prep': 'executive',
  dress: 'executive',
  bathroom: 'executive',
  shop: 'executive',
};

const DOMAIN_MODULE: Record<FocusDomain, ModuleId> = {
  orientation: 'orientation',
  attention: 'attention',
  memory: 'memory',
  language: 'aphasia',
  visualScanning: 'neglect',
  executive: 'executive',
};

const GOAL_REASON = 'Matches a practice goal you selected.';
const TASK_REASON =
  'This task felt harder during setup, so it is a useful practice focus.';

interface Candidate {
  domain: FocusDomain;
  ratio: number;
  goalMatched: boolean;
  tieIndex: number;
}

function eligible(result: BaselineDomainResult | undefined): result is BaselineDomainResult {
  return Boolean(
    result &&
      result.completed &&
      !result.skipped &&
      result.correct !== null &&
      result.total !== null &&
      result.total > 0,
  );
}

function ratioFor(result: BaselineDomainResult): number {
  return Math.min(1, Math.max(0, result.correct! / result.total!));
}

function difficultyFor(ratio: number): Difficulty {
  if (ratio <= 0.5) return 'gentle';
  if (ratio <= 0.8) return 'standard';
  return 'challenging';
}

function goalMatches(goals: readonly string[], domain: FocusDomain): boolean {
  return goals.some((goal) => GOAL_DOMAIN[goal] === domain);
}

function goalDomains(goals: readonly string[]): FocusDomain[] {
  const mapped = new Set(
    goals
      .map((goal) => GOAL_DOMAIN[goal])
      .filter((domain): domain is FocusDomain => domain !== undefined),
  );
  return TIE_ORDER.filter((domain) => mapped.has(domain));
}
export function createPersonalizedPlan(
  baseline: BaselineResult,
  profile: Pick<Profile, 'goals' | 'sessionMinutes' | 'clinicianConfigured'>,
  createdAt: string = new Date().toISOString(),
): PersonalizedPlan {
  const candidates: Candidate[] = [];

  TIE_ORDER.forEach((domain, tieIndex) => {
    const result = baseline.domains.find((item) => item.domain === domain);
    if (!eligible(result)) return;
    candidates.push({
      domain,
      ratio: ratioFor(result),
      goalMatched: goalMatches(profile.goals, domain),
      tieIndex,
    });
  });

  candidates.sort((a, b) => {
    const aScore = a.ratio - (a.goalMatched ? 0.15 : 0);
    const bScore = b.ratio - (b.goalMatched ? 0.15 : 0);
    if (aScore !== bScore) return aScore - bScore;
    return a.tieIndex - b.tieIndex;
  });

  let focus: PersonalizedFocus[];
  if (candidates.length > 0) {
    focus = candidates.slice(0, 3).map((candidate) => ({
      domain: candidate.domain,
      difficulty: difficultyFor(candidate.ratio),
      reason: candidate.goalMatched ? GOAL_REASON : TASK_REASON,
    }));
  } else {
    focus = goalDomains(profile.goals)
      .slice(0, 3)
      .map((domain) => ({
        domain,
        difficulty: 'standard',
        reason: GOAL_REASON,
      }));
  }

  const modules: ModuleId[] = focus.map((item) => DOMAIN_MODULE[item.domain]);
  const requested = clampSessionMinutes(
    profile.sessionMinutes,
    profile.clinicianConfigured,
  );
  const fatigueCap =
    baseline.fatigue !== null && baseline.fatigue >= 7
      ? 10
      : baseline.fatigue !== null && baseline.fatigue >= 5
        ? 15
        : requested;
  const sessionMinutes = clampSessionMinutes(
    Math.min(requested, fatigueCap),
    profile.clinicianConfigured,
  );

  return {
    version: 1,
    createdAt,
    focus,
    sessionMinutes,
    modules,
  };
}
