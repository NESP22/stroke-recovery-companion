import { describe, expect, it } from 'vitest';
import {
  ASSISTANCE_LEVELS,
  COMPLETION_STATUSES,
  emptyLog,
  isAssistanceLevel,
  isCompletionStatus,
  recordAttempt,
  summarizeLog,
} from './functionalPractice';
import type { FunctionalPracticeLog } from '../types';

describe('functional practice — structured-only data', () => {
  it('only accepts the preset assistance enums', () => {
    expect(isAssistanceLevel('independent')).toBe(true);
    expect(isAssistanceLevel('with-prompts')).toBe(true);
    expect(isAssistanceLevel('with-help')).toBe(true);
    expect(isAssistanceLevel('fully-independent')).toBe(false);
    expect(isAssistanceLevel('')).toBe(false);
    expect(isAssistanceLevel('some help')).toBe(false);
  });

  it('only accepts the preset completion enums', () => {
    expect(isCompletionStatus('completed')).toBe(true);
    expect(isCompletionStatus('partially-completed')).toBe(true);
    expect(isCompletionStatus('not-completed')).toBe(true);
    expect(isCompletionStatus('passed')).toBe(false);
    expect(isCompletionStatus('failed')).toBe(false);
  });

  it('has no free-text option in the recorded enums', () => {
    // Every assistance/completion choice is a fixed, labelled enum value.
    const values = [
      ...ASSISTANCE_LEVELS.map((l) => l.value),
      ...COMPLETION_STATUSES.map((s) => s.value),
    ];
    expect(values.every((v) => typeof v === 'string' && v.length > 0)).toBe(true);
    // None is an open-ended "other" free-text field.
    expect(values).not.toContain('other');
  });
});

describe('recordAttempt / summarizeLog', () => {
  it('appends without mutating the original log', () => {
    const before: FunctionalPracticeLog = emptyLog();
    const after = recordAttempt(before, {
      taskId: 'morning-routine',
      completedAt: '2026-02-01T10:00:00.000Z',
      assistance: 'independent',
      completion: 'completed',
    });
    expect(before.attempts).toHaveLength(0);
    expect(after.attempts).toHaveLength(1);
  });

  it('summarises completion and assistance counts', () => {
    let log = emptyLog();
    log = recordAttempt(log, {
      taskId: 'a',
      completedAt: 'x',
      assistance: 'independent',
      completion: 'completed',
    });
    log = recordAttempt(log, {
      taskId: 'b',
      completedAt: 'x',
      assistance: 'with-prompts',
      completion: 'partially-completed',
    });
    log = recordAttempt(log, {
      taskId: 'c',
      completedAt: 'x',
      assistance: 'with-help',
      completion: 'not-completed',
    });

    const s = summarizeLog(log);
    expect(s.total).toBe(3);
    expect(s.completed).toBe(1);
    expect(s.partiallyCompleted).toBe(1);
    expect(s.notCompleted).toBe(1);
    expect(s.independent).toBe(1);
    expect(s.withPrompts).toBe(1);
    expect(s.withHelp).toBe(1);
  });
});
