import { describe, expect, it } from 'vitest';
import { FUNCTIONAL_TASKS, tasksForFocus } from './functionalTasks';
import type { ScoredDomain } from '../lib/outcome';

// Patterns matching the same PHI shapes the repo-wide scan rejects. Functional
// tasks must never contain these.
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(?<!\d)(?:\(\d{3}\)\s?|\d{3}[-.\s])\d{3}[-.\s]\d{4}(?!\d)/;
// Proprietary/validated instruments the app must never reproduce item text from.
const PROPRIETARY_RE = /\b(MoCA|MMSE|NIHSS|Barthel|FIM|PROMIS)\b/i;

function allTaskText(): string {
  return FUNCTIONAL_TASKS.flatMap((t) => [
    t.title,
    t.situation,
    t.goal,
    ...t.planSteps,
    t.doHint,
    t.checkPrompt,
  ]).join('\n');
}

describe('functional tasks (preset, synthetic, non-sensitive)', () => {
  it('contains the six required everyday scenarios', () => {
    const titles = FUNCTIONAL_TASKS.map((t) => t.title.toLowerCase());
    for (const expected of [
      'morning routine',
      'shopping list',
      'appointment',
      'recipe',
      'calendar & phone',
      'outing',
    ]) {
      expect(titles.some((t) => t.includes(expected))).toBe(true);
    }
    expect(FUNCTIONAL_TASKS).toHaveLength(6);
  });

  it('contains no PHI-shaped content (email, phone) or proprietary instrument items', () => {
    const text = allTaskText();
    expect(EMAIL_RE.test(text)).toBe(false);
    expect(PHONE_RE.test(text)).toBe(false);
    expect(PROPRIETARY_RE.test(text)).toBe(false);
  });

  it('every task is fully preset (string fields only, no free-text input)', () => {
    for (const t of FUNCTIONAL_TASKS) {
      expect(typeof t.id).toBe('string');
      expect(typeof t.title).toBe('string');
      expect(typeof t.situation).toBe('string');
      expect(typeof t.goal).toBe('string');
      expect(Array.isArray(t.planSteps)).toBe(true);
      expect(t.planSteps.every((s) => typeof s === 'string')).toBe(true);
      expect(typeof t.doHint).toBe('string');
      expect(typeof t.checkPrompt).toBe('string');
    }
  });

  it('ties every task to one of the six scored practice domains', () => {
    const valid: ScoredDomain[] = [
      'orientation',
      'attention',
      'memory',
      'language',
      'visualScanning',
      'executive',
    ];
    for (const t of FUNCTIONAL_TASKS) {
      expect(valid).toContain(t.domain);
    }
  });
});

describe('tasksForFocus', () => {
  it('orders focus-relevant tasks first', () => {
    const ordered = tasksForFocus(['memory']);
    expect(ordered[0].domain).toBe('memory');
    expect(ordered).toHaveLength(FUNCTIONAL_TASKS.length);
  });

  it('returns the full list when no focus is provided', () => {
    expect(tasksForFocus([])).toEqual(FUNCTIONAL_TASKS);
  });
});
