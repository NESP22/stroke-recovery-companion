// Transparent, conservative per-domain adaptive engine.
//
// SAFETY / DESIGN RULES (documented so they can be audited):
//   - This engine only nudges an app-task starting level (gentle / standard /
//     challenging) inside this app. It is NOT a medical or clinical decision,
//     and it never decides treatment, severity or recovery.
//   - Changes are conservative: one level at a time, and only after enough
//     non-skipped observations have accumulated.
//   - A skipped attempt NEVER counts as failure: skips are excluded from the
//     accuracy denominator and from the observation gate.
//   - Fatigue can only hold or lower the level (never raise it).
//
// Thresholds are deliberately plain and deterministic:
//   ADAPTIVE_MIN_OBSERVATIONS = 3   — non-skipped attempts needed in the
//                                      recent window before any change.
//   ADAPTIVE_UP_THRESHOLD   = 0.85  — recent accuracy at/above this moves up.
//   ADAPTIVE_DOWN_THRESHOLD = 0.50  — recent accuracy at/below this moves down.
//   ADAPTIVE_FATIGUE_HOLD   = 7     — at/above this fatigue, never move up.
//   ADAPTIVE_FATIGUE_DOWN   = 8     — at/above this fatigue, move down one.
//   ADAPTIVE_RECENT_WINDOW  = 10    — accuracy is computed over the last N
//                                      observations.

import type {
  AdaptiveObservation,
  Difficulty,
  DomainAdaptiveState,
  TrainableModuleId,
} from '../types';

export const ADAPTIVE_MIN_OBSERVATIONS = 3;
export const ADAPTIVE_RECENT_WINDOW = 10;
export const ADAPTIVE_UP_THRESHOLD = 0.85;
export const ADAPTIVE_DOWN_THRESHOLD = 0.5;
export const ADAPTIVE_FATIGUE_HOLD = 7;
export const ADAPTIVE_FATIGUE_DOWN = 8;

export const DIFFICULTY_ORDER: Difficulty[] = [
  'gentle',
  'standard',
  'challenging',
];

export type AdaptiveAction = 'up' | 'down' | 'hold';

export interface AdaptiveRecommendation {
  nextLevel: Difficulty;
  action: AdaptiveAction;
  reason: string;
}

/** Move one step (never more than one) along the difficulty axis. */
function shift(level: Difficulty, dir: 1 | -1): Difficulty {
  const i = DIFFICULTY_ORDER.indexOf(level);
  const next = Math.min(
    DIFFICULTY_ORDER.length - 1,
    Math.max(0, i + dir),
  );
  return DIFFICULTY_ORDER[next];
}

export function emptyAdaptiveState(
  domain: TrainableModuleId,
  level: Difficulty = 'standard',
  updatedAt = new Date().toISOString(),
): DomainAdaptiveState {
  return {
    domain,
    level,
    recent: [],
    observations: 0,
    skipCount: 0,
    lastFatigue: null,
    updatedAt,
  };
}

/**
 * Recommend the next level for one domain.
 *
 * Order of rules (documented above):
 *   1. Severe fatigue (>= 8) → down one level (or hold if already gentle).
 *   2. High fatigue (>= 7) → hold (never raise when fatigued).
 *   3. Too few non-skipped observations → hold.
 *   4. Accuracy high → up one level (or hold at the top).
 *   5. Accuracy low → down one level (or hold at the bottom).
 *   6. Otherwise → hold.
 */
export function recommendLevel(
  state: Pick<DomainAdaptiveState, 'level' | 'recent'>,
  fatigue: number | null,
): AdaptiveRecommendation {
  const recent = state.recent.filter((o) => !o.skipped);

  if (fatigue !== null && fatigue >= ADAPTIVE_FATIGUE_DOWN) {
    const next = shift(state.level, -1);
    if (next === state.level) {
      return {
        nextLevel: state.level,
        action: 'hold',
        reason: 'fatigue high (already at the gentlest level)',
      };
    }
    return { nextLevel: next, action: 'down', reason: 'fatigue high' };
  }

  if (fatigue !== null && fatigue >= ADAPTIVE_FATIGUE_HOLD) {
    return { nextLevel: state.level, action: 'hold', reason: 'fatigue' };
  }

  if (recent.length < ADAPTIVE_MIN_OBSERVATIONS) {
    return {
      nextLevel: state.level,
      action: 'hold',
      reason: 'not enough observations yet',
    };
  }

  const correct = recent.filter((o) => o.correct).length;
  const ratio = correct / recent.length;

  if (ratio >= ADAPTIVE_UP_THRESHOLD) {
    const next = shift(state.level, 1);
    if (next === state.level) {
      return {
        nextLevel: state.level,
        action: 'hold',
        reason: 'accuracy high (already at the top level)',
      };
    }
    return { nextLevel: next, action: 'up', reason: 'accuracy high' };
  }

  if (ratio <= ADAPTIVE_DOWN_THRESHOLD) {
    const next = shift(state.level, -1);
    if (next === state.level) {
      return {
        nextLevel: state.level,
        action: 'hold',
        reason: 'accuracy low (already at the gentlest level)',
      };
    }
    return { nextLevel: next, action: 'down', reason: 'accuracy low' };
  }

  return {
    nextLevel: state.level,
    action: 'hold',
    reason: 'accuracy within the neutral range',
  };
}

/**
 * Append one observation to a domain's state and recompute the level.
 * Skips are stored (for transparency) but never affect accuracy or the
 * observation gate. Returns a new state object.
 */
export function applyObservation(
  state: DomainAdaptiveState,
  observation: Omit<AdaptiveObservation, 'at'>,
  fatigue: number | null,
  updatedAt = new Date().toISOString(),
): DomainAdaptiveState {
  const withAt: AdaptiveObservation = { ...observation, at: updatedAt };
  const recent = [...state.recent, withAt].slice(-ADAPTIVE_RECENT_WINDOW);
  const skipped = observation.skipped;
  const nextCounts = {
    observations: state.observations + (skipped ? 0 : 1),
    skipCount: state.skipCount + (skipped ? 1 : 0),
  };
  const recommendation = recommendLevel(
    { level: state.level, recent },
    fatigue,
  );
  return {
    ...state,
    level: recommendation.nextLevel,
    recent,
    observations: nextCounts.observations,
    skipCount: nextCounts.skipCount,
    lastFatigue: fatigue,
    updatedAt,
  };
}
