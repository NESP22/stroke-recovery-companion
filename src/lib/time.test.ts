import { describe, expect, it } from 'vitest';
import { dayOfWeek, formatTime, partOfDay, season, todayISO } from './time';

describe('time helpers', () => {
  it('formats a date to YYYY-MM-DD', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('names the day of the week', () => {
    // 2026-09-20 is a Sunday.
    expect(dayOfWeek(new Date(2026, 8, 20))).toBe('Sunday');
  });

  it('formats time with AM/PM', () => {
    expect(formatTime(new Date(2026, 0, 1, 9, 5))).toBe('9:05 AM');
    expect(formatTime(new Date(2026, 0, 1, 15, 0))).toBe('3:00 PM');
    expect(formatTime(new Date(2026, 0, 1, 0, 30))).toBe('12:30 AM');
  });

  it('identifies part of day and season', () => {
    expect(partOfDay(new Date(2026, 0, 1, 8))).toBe('morning');
    expect(partOfDay(new Date(2026, 0, 1, 13))).toBe('afternoon');
    expect(partOfDay(new Date(2026, 0, 1, 18))).toBe('evening');
    expect(partOfDay(new Date(2026, 0, 1, 22))).toBe('night');
    expect(season(new Date(2026, 0, 15))).toBe('winter');
    expect(season(new Date(2026, 6, 15))).toBe('summer');
  });
});
