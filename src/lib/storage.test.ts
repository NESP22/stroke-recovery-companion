import { describe, expect, it } from 'vitest';
import { localStorageStore, memoryStore } from './storage';

describe('memoryStore', () => {
  it('stores and retrieves values', async () => {
    const s = memoryStore();
    await s.set('k', { a: 1 });
    expect(await s.get('k')).toEqual({ a: 1 });
  });

  it('returns undefined for missing keys', async () => {
    const s = memoryStore();
    expect(await s.get('missing')).toBeUndefined();
  });

  it('removes and clears', async () => {
    const s = memoryStore();
    await s.set('a', 1);
    await s.set('b', 2);
    await s.remove('a');
    expect(await s.get('a')).toBeUndefined();
    expect(await s.get('b')).toBe(2);
    await s.clear();
    expect(await s.get('b')).toBeUndefined();
  });
});

describe('localStorageStore', () => {
  it('round-trips JSON values', async () => {
    const s = localStorageStore();
    await s.set('x', { list: [1, 2, 3] });
    expect(await s.get('x')).toEqual({ list: [1, 2, 3] });
  });
});
