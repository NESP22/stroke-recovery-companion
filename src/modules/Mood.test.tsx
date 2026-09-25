import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Mood from './Mood';
import { ProfileProvider } from '../context/ProfileContext';
import { memoryStore, setStore } from '../lib/storage';
import appStyles from '../index.css?raw';

beforeEach(() => setStore(memoryStore()));
afterEach(() => {
  cleanup();
  setStore(null);
});

describe('Mood escalation disclosures', () => {
  it('keeps every disclosure summary at the 44px touch-target minimum', () => {
    const style = document.createElement('style');
    style.textContent = appStyles;
    document.head.append(style);
    try {
      render(
        <MemoryRouter>
          <ProfileProvider>
            <Mood />
          </ProfileProvider>
        </MemoryRouter>,
      );
      // <summary> elements are disclosures; query them directly by tag.
      const all = document.querySelectorAll('summary');
      expect(all.length).toBeGreaterThan(0);
      for (const el of all) {
        const computed = window.getComputedStyle(el);
        expect(
          Number.parseFloat(computed.minHeight),
          `summary "${el.textContent?.trim()}" must be at least 44px tall`,
        ).toBeGreaterThanOrEqual(44);
      }
    } finally {
      style.remove();
    }
  });
});
