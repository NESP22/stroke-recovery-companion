import { describe, expect, it } from 'vitest';
import {
  BASELINE_DOMAINS,
  buildBaselineResult,
  emptyTallies,
  type DomainTally,
} from './baselineScoring';

const CREATED_AT = '2026-02-01T10:00:00.000Z';

function tally(
  domain: keyof ReturnType<typeof emptyTallies>,
  patch: Partial<DomainTally> = {},
): ReturnType<typeof emptyTallies> {
  const t = emptyTallies();
  t[domain] = { domain, correct: 0, total: 0, skipped: false, attempted: false, ...patch };
  return t;
}

describe('buildBaselineResult', () => {
  it('marks a fully-attempted domain completed with clamped correct/total', () => {
    const tallies = tally('memory', { correct: 2, total: 6, attempted: true });
    const result = buildBaselineResult(tallies, null, false, CREATED_AT);

    const memory = result.domains.find((d) => d.domain === 'memory')!;
    expect(memory.completed).toBe(true);
    expect(memory.skipped).toBe(false);
    expect(memory.correct).toBe(2);
    expect(memory.total).toBe(6);
  });

  it('clamps correct into [0, total] and fatigue into [0, 10]', () => {
    const tallies = tally('attention', { correct: 99, total: 3, attempted: true });
    const result = buildBaselineResult(tallies, 42, false, CREATED_AT);

    const attention = result.domains.find((d) => d.domain === 'attention')!;
    expect(attention.correct).toBe(3);
    expect(attention.total).toBe(3);
    expect(result.fatigue).toBe(10);
  });

  it('renders a skipped domain ineligible with null scores', () => {
    const tallies = tally('language', { skipped: true });
    const result = buildBaselineResult(tallies, null, false, CREATED_AT);

    const language = result.domains.find((d) => d.domain === 'language')!;
    expect(language.skipped).toBe(true);
    expect(language.completed).toBe(false);
    expect(language.correct).toBeNull();
    expect(language.total).toBeNull();
  });

  it('renders an unreached domain not completed', () => {
    const result = buildBaselineResult(emptyTallies(), null, false, CREATED_AT);
    for (const d of result.domains) {
      expect(d.completed).toBe(false);
      expect(d.correct).toBeNull();
      expect(d.total).toBeNull();
    }
  });

  it('emits all seven domains in stable order', () => {
    const result = buildBaselineResult(emptyTallies(), null, true, CREATED_AT);
    expect(result.domains.map((d) => d.domain)).toEqual(BASELINE_DOMAINS);
    expect(result.stoppedEarly).toBe(true);
  });

  it('preserves a null fatigue score', () => {
    const result = buildBaselineResult(emptyTallies(), null, false, CREATED_AT);
    expect(result.fatigue).toBeNull();
  });
});
