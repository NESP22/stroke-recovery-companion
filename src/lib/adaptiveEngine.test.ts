import { describe, expect, it } from 'vitest';
import {
  ADAPTIVE_MIN_OBSERVATIONS,
  ADAPTIVE_RECENT_WINDOW,
  applyObservation,
  emptyAdaptiveState,
  recommendLevel,
  type AdaptiveRecommendation,
} from './adaptiveEngine';
import type { AdaptiveObservation, Difficulty } from '../types';

const NOW = '2026-02-01T10:00:00.000Z';

function obs(
  correct: boolean,
  extra: { skipped?: boolean; assisted?: boolean } = {},
): AdaptiveObservation {
  return {
    correct,
    assisted: extra.assisted ?? false,
    skipped: extra.skipped ?? false,
    at: NOW,
  };
}

/** Directly exercise the decision rule with a fixed level + recent window. */
function rec(
  level: Difficulty,
  recent: AdaptiveObservation[],
  fatigue: number | null = null,
): AdaptiveRecommendation {
  return recommendLevel({ level, recent }, fatigue);
}

describe('recommendLevel', () => {
  it('holds when there are fewer than the minimum observations', () => {
    const r = rec('standard', [obs(true), obs(true)]);
    expect(r.action).toBe('hold');
    expect(r.nextLevel).toBe('standard');
    expect(r.reason).toMatch(/not enough/i);
  });

  it('moves up exactly one level after enough high accuracy', () => {
    const r = rec('gentle', [obs(true), obs(true), obs(true), obs(true)]);
    expect(r.action).toBe('up');
    // one level at a time: gentle -> standard, never straight to challenging
    expect(r.nextLevel).toBe('standard');
  });

  it('moves down exactly one level after enough low accuracy', () => {
    const r = rec('challenging', [obs(false), obs(false), obs(false), obs(false)]);
    expect(r.action).toBe('down');
    expect(r.nextLevel).toBe('standard');
  });

  it('holds for mid-range accuracy', () => {
    const r = rec('standard', [obs(true), obs(false), obs(true), obs(true)]);
    expect(r.action).toBe('hold');
    expect(r.nextLevel).toBe('standard');
  });

  it('never raises the level when fatigue is high', () => {
    const r = rec(
      'standard',
      [obs(true), obs(true), obs(true), obs(true)],
      7,
    );
    expect(r.action).toBe('hold');
    expect(r.nextLevel).toBe('standard');
  });

  it('downshifts on severe fatigue even with perfect accuracy', () => {
    const r = rec('standard', [obs(true), obs(true), obs(true)], 8);
    expect(r.action).toBe('down');
    expect(r.nextLevel).toBe('gentle');
  });

  it('holds at the gentlest level when fatigue is high', () => {
    const r = rec('gentle', [], 8);
    expect(r.action).toBe('hold');
    expect(r.nextLevel).toBe('gentle');
  });

  it('holds at the top level even with perfect accuracy', () => {
    const r = rec('challenging', [obs(true), obs(true), obs(true)]);
    expect(r.action).toBe('hold');
    expect(r.nextLevel).toBe('challenging');
  });

  it('excludes skipped observations from accuracy and the observation gate', () => {
    // 2 real correct + 2 skips still = fewer than the minimum (skips ignored).
    const r = rec('standard', [
      obs(true),
      obs(true),
      obs(false, { skipped: true }),
      obs(false, { skipped: true }),
    ]);
    expect(r.action).toBe('hold');
    expect(r.reason).toMatch(/not enough/i);
  });
});

describe('applyObservation', () => {
  it('a skip never counts as an observation or a failure', () => {
    const s = applyObservation(
      emptyAdaptiveState('memory', 'standard', NOW),
      { correct: false, assisted: false, skipped: true },
      null,
      NOW,
    );
    expect(s.observations).toBe(0);
    expect(s.skipCount).toBe(1);
    expect(recommendLevel(s, null).reason).toBe('not enough observations yet');
  });

  it('counts observations and keeps the recent window bounded', () => {
    let s = emptyAdaptiveState('attention', 'standard', NOW);
    for (let i = 0; i < 15; i++) {
      s = applyObservation(
        s,
        { correct: i % 2 === 0, assisted: false, skipped: false },
        null,
        NOW,
      );
    }
    expect(s.observations).toBe(15);
    expect(s.recent.length).toBeLessThanOrEqual(ADAPTIVE_RECENT_WINDOW);
  });

  it('is deterministic for the same inputs', () => {
    const a = applyObservation(
      emptyAdaptiveState('aphasia', 'standard', NOW),
      { correct: true, assisted: false, skipped: false },
      null,
      NOW,
    );
    const b = applyObservation(
      emptyAdaptiveState('aphasia', 'standard', NOW),
      { correct: true, assisted: false, skipped: false },
      null,
      NOW,
    );
    expect(a).toEqual(b);
  });

  it('exposes the minimum-observations constant used by the gate', () => {
    expect(ADAPTIVE_MIN_OBSERVATIONS).toBe(3);
  });
});
