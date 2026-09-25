import { expect, type Page, type TestInfo } from '@playwright/test';

/**
 * Shared helpers for the mobile Safari QA suite. These run in the Node/test
 * process (Playwright's runner), not in the browser page, except where noted.
 */

// ---------------------------------------------------------------------------
// Category taxonomy — maps 1:1 to the defect-report categories.
// ---------------------------------------------------------------------------
export const CATEGORY = {
  LOAD: 'initial-load',
  NAV: 'client-side-navigation',
  FORMS: 'forms',
  PWA: 'pwa-manifest',
  OFFLINE: 'offline',
  A2HS: 'add-to-home-screen',
  SAFE_AREA: 'safe-area-insets',
  TAP_TARGETS: 'tap-targets',
  TEXT_SCALING: 'text-scaling',
  H_SCROLL: 'horizontal-scroll',
} as const;

/** Tag a test with its report category and human-readable repro steps. */
export function annotate(
  info: TestInfo,
  category: string,
  repro: string,
): void {
  info.annotations.push({ type: 'category', description: category });
  info.annotations.push({ type: 'repro', description: repro });
}

// ---------------------------------------------------------------------------
// App state seeding (IndexedDB `profile.v1` — the local-first store the app
// reads on mount). We seed a fully-onboarded profile so the app renders its
// post-onboarding screens.
// ---------------------------------------------------------------------------
const SEEDED_PROFILE = {
  version: 1,
  goals: ['orientation', 'memory'],
  sessionMinutes: 15,
  restEveryMinutes: 10,
  difficulty: 'standard',
  fontSize: 'large',
  highContrast: false,
  reduceMotion: false,
  caregiverMode: false,
  clinicianConfigured: false,
  caregiverRole: 'No one',
  createdAt: '2026-09-25',
};

export async function seedOnboarded(page: Page): Promise<void> {
  await page.evaluate((profile) => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open('stroke-recovery-companion', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv', { keyPath: 'key' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put({ key: 'profile.v1', value: profile });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
  }, SEEDED_PROFILE);
}

/** Load the app, then seed an onboarded profile and reload so it takes effect. */
export async function gotoOnboarded(page: Page): Promise<void> {
  // Seed on a non-app document of the same origin (the favicon) so the app's
  // own first-mount default-profile write can never race our seed. Then load
  // the app, which reads the seeded profile and renders Home.
  await page.goto('/favicon.svg');
  await seedOnboarded(page);
  await page.goto('/');
  await page.waitForSelector('.home-hero', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Horizontal-scroll probe. Returns the overflow delta (px) and, when positive,
// a list of elements whose right edge exceeds the viewport.
// ---------------------------------------------------------------------------
export interface OverflowReport {
  overflowPx: number;
  offenders: string[];
}

export async function measureHorizontalOverflow(
  page: Page,
): Promise<OverflowReport> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const overflowPx = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const offenders: string[] = [];
    if (overflowPx > 1) {
      const vw = doc.clientWidth;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1) {
          const tag = el.tagName.toLowerCase();
          const cls =
            typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : '';
          const label = (el.textContent ?? '').trim().slice(0, 40);
          offenders.push(`${tag}${cls} "${label}"`);
          if (offenders.length >= 10) break;
        }
      }
    }
    return { overflowPx, offenders };
  });
}

/** Assert the document does not scroll horizontally (1px tolerance). */
export async function expectNoHorizontalScroll(
  page: Page,
  info: TestInfo,
): Promise<void> {
  const report = await measureHorizontalOverflow(page);
  const ok = report.overflowPx <= 1;
  if (!ok) {
    info.annotations.push({
      type: 'defect',
      description: `horizontal overflow ${report.overflowPx}px; offenders: ${report.offenders.join(' | ')}`,
    });
  }
  expect(
    report.overflowPx,
    `horizontal scroll of ${report.overflowPx}px detected (offenders: ${report.offenders.join(', ') || 'none'})`,
  ).toBeLessThanOrEqual(1);
}

// ---------------------------------------------------------------------------
// Tap-target probe. Enumerates primary interactive controls and returns the
// ones smaller than 44×44 CSS px in either dimension.
// ---------------------------------------------------------------------------
export interface TapTarget {
  tag: string;
  text: string;
  cls: string;
  context: string;
  width: number;
  height: number;
  min: number;
}

const TARGET_SELECTOR =
  'a[href], button, summary, select, [role="button"], [tabindex]:not([tabindex="-1"])';

export async function collectUndersizedTapTargets(
  page: Page,
): Promise<TapTarget[]> {
  return page.evaluate((selector) => {
    const out: Array<{ tag: string; text: string; cls: string; context: string; width: number; height: number; min: number }> = [];
    const seen = new Set<Element>();
    const nearestClass = (el: Element | null): string => {
      let n: Element | null = el;
      for (let i = 0; i < 4 && n && n !== document.body; i++) {
        const c = (n as HTMLElement).className;
        if (typeof c === 'string' && c.trim()) return `.${c.trim().split(/\s+/).join('.')}`;
        n = n.parentElement;
      }
      return '';
    };
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
      if (seen.has(el)) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (r.width === 0 || r.height === 0) continue;
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const width = Math.round(r.width * 10) / 10;
      const height = Math.round(r.height * 10) / 10;
      const min = Math.min(width, height);
      if (min < 44) {
        const text =
          el.getAttribute('aria-label') ||
          (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);
        const cls =
          typeof el.className === 'string'
            ? el.className.trim().split(/\s+/)[0]
            : '';
        out.push({ tag: el.tagName.toLowerCase(), text, cls, context: nearestClass(el.parentElement), width, height, min });
      }
    }
    return out;
  }, TARGET_SELECTOR);
}

/** Assert every primary control is ≥ 44px in its smallest dimension. */
export async function expectTapTargets(page: Page, info: TestInfo): Promise<void> {
  const undersized = await collectUndersizedTapTargets(page);
  if (undersized.length > 0) {
    const detail = undersized
      .map((t) => `${t.tag}${t.context} "${t.text}" ${t.width}×${t.height}`)
      .join(' | ');
    info.annotations.push({ type: 'defect', description: `undersized tap targets: ${detail}` });
  }
  expect(
    undersized.map((t) => `${t.tag}${t.context} "${t.text}" ${t.width}×${t.height}`),
    'tap targets below the 44×44px minimum',
  ).toEqual([]);
}
