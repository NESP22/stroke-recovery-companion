import { describe, expect, it } from 'vitest';
import { MODULES, SESSION_MODULES } from './modules';

describe('module catalog', () => {
  it('covers all MVP modules', () => {
    const ids = MODULES.map((m) => m.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'orientation',
        'memory',
        'attention',
        'executive',
        'aphasia',
        'neglect',
        'adl',
        'mood',
        'caregiver',
      ]),
    );
    expect(MODULES).toHaveLength(9);
  });

  it('marks session modules consistently', () => {
    expect(SESSION_MODULES.length).toBeLessThanOrEqual(MODULES.length);
    expect(SESSION_MODULES.every((m) => m.inSession)).toBe(true);
  });

  it('has unique paths', () => {
    const paths = MODULES.map((m) => m.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
