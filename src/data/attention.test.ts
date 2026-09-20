import { describe, expect, it } from 'vitest';
import { generateRound, isTarget } from './attention';

describe('attention round generation', () => {
  it('is deterministic for a given seed', () => {
    const a = generateRound('standard', 42);
    const b = generateRound('standard', 42);
    expect(a).toEqual(b);
  });

  it('places exactly one target within grid bounds', () => {
    for (const difficulty of ['gentle', 'standard', 'challenging'] as const) {
      for (let seed = 0; seed < 20; seed++) {
        const r = generateRound(difficulty, seed);
        expect(r.targetIndex).toBeGreaterThanOrEqual(0);
        expect(r.targetIndex).toBeLessThan(r.grid.length);
        const targets = r.grid.filter((s) => s === r.target);
        expect(targets).toHaveLength(1);
        expect(r.grid).toHaveLength(r.size * r.size);
      }
    }
  });

  it('checks the target index correctly', () => {
    const r = generateRound('gentle', 1);
    expect(isTarget(r, r.targetIndex)).toBe(true);
    expect(isTarget(r, (r.targetIndex + 1) % r.grid.length)).toBe(false);
  });
});
