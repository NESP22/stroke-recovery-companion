#!/usr/bin/env node
/**
 * Generate a categorized mobile-audit report from the Playwright JSON output.
 *
 * Usage (after `npm run test:e2e`):
 *   npm run report:mobile
 *
 * Reads  test-results/results.json  (emitted by the `json` reporter in
 * playwright.config.ts) and writes  docs/MOBILE_AUDIT.md  plus copies failure
 * screenshots into  docs/mobile-audit-screenshots/  so the fix task has visual
 * evidence for every defect.
 */
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS = join(ROOT, 'test-results', 'results.json');
const OUT = join(ROOT, 'docs', 'MOBILE_AUDIT.md');
const SHOTS_DIR = join(ROOT, 'docs', 'mobile-audit-screenshots');

const STATUS_LABEL = {
  expected: 'PASS',
  unexpected: 'FAIL',
  skipped: 'SKIP',
  flaky: 'FLAKY',
  timedOut: 'FAIL',
  interrupted: 'FAIL',
};

function collectTests(json) {
  const tests = [];
  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node.specs)) {
      for (const spec of node.specs) {
        // In the JSON reporter the test *title* lives on the spec object; the
        // per-project `tests[]` entries inherit it.
        if (Array.isArray(spec.tests)) {
          for (const t of spec.tests) tests.push({ ...t, title: spec.title });
        }
      }
    }
    if (node.suites) for (const c of node.suites) walk(c);
  };
  for (const s of json.suites) walk(s);
  return tests;
}

function anno(t, type) {
  return t.annotations?.find((a) => a.type === type)?.description ?? '';
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

if (!existsSync(RESULTS)) {
  console.error(`No results found at ${relative(ROOT, RESULTS)}. Run \`npm run test:e2e\` first.`);
  process.exit(1);
}

const json = JSON.parse(readFileSync(RESULTS, 'utf8'));
const tests = collectTests(json);

// Clear and recreate the screenshot directory so the report never references
// stale images from a previous run.
const { rmSync } = await import('node:fs');
rmSync(SHOTS_DIR, { recursive: true, force: true });
mkdirSync(SHOTS_DIR, { recursive: true });

const projects = [...new Set(tests.map((t) => t.projectName))].sort();
const categories = [
  'initial-load',
  'client-side-navigation',
  'forms',
  'pwa-manifest',
  'offline',
  'add-to-home-screen',
  'safe-area-insets',
  'tap-targets',
  'text-scaling',
  'horizontal-scroll',
];

// Map of project -> category -> status.
const matrix = {};
for (const p of projects) {
  matrix[p] = {};
  for (const c of categories) matrix[p][c] = [];
}
for (const t of tests) {
  const cat = anno(t, 'category') || 'uncategorized';
  const status = STATUS_LABEL[t.status] ?? t.status;
  (matrix[t.projectName][cat] ??= []).push(status);
}

function cellSummary(p, c) {
  const list = matrix[p][c];
  if (!list || list.length === 0) return '—';
  const allPass = list.every((s) => s === 'PASS');
  if (allPass) return 'PASS';
  const hasFail = list.includes('FAIL');
  const hasSkip = list.includes('SKIP');
  if (hasFail) return 'FAIL';
  if (hasSkip) return 'SKIP';
  return list.join('/');
}

// Build defect entries: group FAILED tests by (category + test title) so a
// single root cause that fails on every device/orientation is reported once,
// with per-device evidence underneath.
const failures = tests.filter((t) => STATUS_LABEL[t.status] === 'FAIL');
const defectGroups = [];
for (const f of failures) {
  const cat = anno(f, 'category') || 'uncategorized';
  const key = `${cat}::${f.title}`;
  let group = defectGroups.find((g) => g.key === key);
  if (!group) {
    group = { key, category: cat, title: f.title, repro: anno(f, 'repro'), entries: [] };
    defectGroups.push(group);
  }
  const detail = anno(f, 'defect') || (f.results?.[0]?.error?.message ?? 'unknown').split('\n')[0];
  const shot = f.results?.[0]?.attachments?.find((a) => a.name === 'screenshot');
  let shotName = null;
  if (shot?.path) {
    shotName = `${slug(f.projectName)}-${slug(f.title)}.png`;
    copyFileSync(shot.path, join(SHOTS_DIR, shotName));
  }
  group.entries.push({ device: f.projectName, detail, shot: shotName });
}

// Skipped tests (expected limitations, e.g. WebKit offline emulation), deduped by title.
const skipByTitle = new Map();
for (const t of tests.filter((t) => STATUS_LABEL[t.status] === 'SKIP')) {
  if (!skipByTitle.has(t.title)) {
    skipByTitle.set(t.title, {
      title: t.title,
      cat: anno(t, 'category') || 'uncategorized',
      why: (t.results?.[0]?.error?.message ?? 'skipped').split('\n')[0],
    });
  }
}
const skipNotes = [...skipByTitle.values()];

const total = tests.length;
const failed = failures.length;
const skippedCount = tests.filter((t) => STATUS_LABEL[t.status] === 'SKIP').length;
const passed = total - failed - skippedCount;

const lines = [];
lines.push('# Mobile Safari audit — iPhone & iPad (Playwright WebKit)');
lines.push('');
lines.push(
  `Generated from \`npm run test:e2e\` on ${new Date().toISOString().slice(0, 10)}. ` +
    'This suite never modifies production code; every failure below is a defect in the app ' +
    'to be fixed in a separate task.',
);
lines.push('');
lines.push('## Result summary');
lines.push('');
lines.push(`- **Pass:** ${passed}  ·  **Fail:** ${failed}  ·  **Skipped:** ${skippedCount}  ·  **Total:** ${total}`);
lines.push(`- Devices/orientations: ${projects.join(', ')}`);
lines.push('');
lines.push('## Pass/fail matrix (category × device/orientation)');
lines.push('');
lines.push('| Category | ' + projects.join(' | ') + ' |');
lines.push('| --- | ' + projects.map(() => '---').join(' | ') + ' |');
for (const c of categories) {
  lines.push(`| ${c} | ` + projects.map((p) => cellSummary(p, c)).join(' | ') + ' |');
}
lines.push('');

if (defectGroups.length === 0) {
  lines.push('## Defects');
  lines.push('');
  lines.push('No failing checks — the suite is green.');
} else {
  lines.push(`## Defects (${defectGroups.length})`);
  lines.push('');
  defectGroups.forEach((g, i) => {
    lines.push(`### ${i + 1}. [${g.category}] ${g.title}`);
    lines.push('');
    lines.push(`- **Repro:** ${g.repro}`);
    lines.push('- **Evidence (per device/orientation):**');
    for (const e of g.entries) {
      const shotRef = e.shot ? ` — [screenshot](mobile-audit-screenshots/${e.shot})` : '';
      lines.push(`  - **${e.device}:** \`${e.detail}\`${shotRef}`);
    }
    lines.push('');
  });
}

lines.push('## Skipped checks (expected limitations, not app defects)');
lines.push('');
if (skipNotes.length === 0) {
  lines.push('None.');
} else {
  for (const s of skipNotes) {
    lines.push(`- **${s.title}** (${s.cat}): ${s.why}`);
  }
}
lines.push('');
lines.push('## Known test-environment limitations');
lines.push('');
lines.push(
  '- **Offline round-trip is skipped on WebKit.** Playwright/WebKit cannot emulate offline + ' +
    'service-worker navigation (microsoft/playwright#42775). Service-worker registration and ' +
    'app-shell caching ARE verified on WebKit; the offline reload itself is covered on a ' +
    'real device (see the device checklist).',
);
lines.push(
  '- **Read-aloud button is not rendered in headless WebKit.** `window.speechSynthesis` is ' +
    'undefined there, so the header "Listen" button (and any layout interaction it causes with ' +
    'long page titles) cannot be exercised in this harness. Confirm that interaction on a real ' +
    'device.',
);
lines.push('');
lines.push('## Reproducing');
lines.push('');
lines.push('```bash');
lines.push('npm install');
lines.push('npx playwright install webkit');
lines.push('npm run test:e2e          # runs all four WebKit device/orientation profiles');
lines.push('npm run report:mobile     # regenerates this report from test-results/results.json');
lines.push('```');
lines.push('');

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`Wrote ${relative(ROOT, OUT)} (${total} tests: ${passed} pass / ${failed} fail / ${skippedCount} skip).`);
