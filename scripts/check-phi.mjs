#!/usr/bin/env node
// PHI / privacy string scan — part of the quality gate (npm run check:phi).
//
// Stroke Recovery Companion is local-first and stores no personal health
// information. This script enforces three invariants:
//   1. No network-call APIs in src/ (nothing ever leaves the device).
//   2. No free-text input fields (no name/DOB/address/medication capture).
//   3. No PHI-shaped literals (emails, phone numbers, SSNs, real medication
//      names) anywhere in the repository text.
//
// Exit 0 = clean. Exit 1 = violations found.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SCAN_DIRS = ['src', 'public', 'docs', 'scripts'];
const SCAN_FILES = ['index.html', 'README.md', 'PRIVACY.md'];
const SKIP = new Set([
  'node_modules',
  'dist',
  'dev-dist',
  '.git',
  '.wrangler',
  'coverage',
]);

const TEXT_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.md',
  '.html',
  '.css',
  '.svg',
  '.txt',
]);

const violations = [];

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (TEXT_EXT.has(ext(name))) out.push(full);
  }
}

function ext(p) {
  const i = p.lastIndexOf('.');
  return i >= 0 ? p.slice(i).toLowerCase() : '';
}

function readAll() {
  const files = [];
  for (const d of SCAN_DIRS) walk(join(ROOT, d), files);
  for (const f of SCAN_FILES) {
    const p = join(ROOT, f);
    try {
      if (statSync(p).isFile()) files.push(p);
    } catch {
      /* optional file */
    }
  }
  return files;
}

// --- Check 1: no network-call APIs in source (data never leaves the device)
const NETWORK_RE =
  /\b(fetch\s*\(|XMLHttpRequest|axios\b|WebSocket\s*\(|sendBeacon\s*\(|EventSource\s*\()/;
function checkNoNetwork(files) {
  for (const f of files) {
    if (!f.includes(`${join('', 'src', '')}`) && !relative(ROOT, f).startsWith('src')) continue;
    const rel = relative(ROOT, f);
    if (!rel.startsWith('src')) continue;
    const text = readFileSync(f, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      if (NETWORK_RE.test(line)) {
        violations.push(
          `[network] ${rel}:${i + 1} — network call found (local-first policy): ${line.trim()}`,
        );
      }
    });
  }
}

// --- Check 2: no free-text input fields (no name/DOB/address/med capture)
const FREETEXT_RE =
  /<textarea\b|<input\b(?![^>]*\btype\s*=\s*["']checkbox["'])[^>]*\btype\s*=\s*["'](text|email|tel|url|password|search|number|date|datetime|month|week|time)["']/i;
function checkNoFreeText(files) {
  for (const f of files) {
    const rel = relative(ROOT, f);
    if (!rel.startsWith('src')) continue;
    const text = readFileSync(f, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      if (FREETEXT_RE.test(line)) {
        violations.push(
          `[free-text-input] ${rel}:${i + 1} — free-text input field (PHI capture risk): ${line.trim()}`,
        );
      }
    });
  }
}

// --- Check 3: no PHI-shaped literals anywhere in text
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
// Formatted phone numbers only (unformatted 10-digit runs are common in code:
// IDs, constants, hashes). Real phone data in source is almost always written
// with separators or parentheses.
const PHONE_RE = /(?<!\d)(?:\(\d{3}\)\s?|\d{3}[-.\s])\d{3}[-.\s]\d{4}(?!\d)/;
const SSN_RE = /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/;
// A representative list of common post-stroke / cardiovascular medications.
// The app must refer to "medication" generically, never by a specific drug.
const MEDS_RE =
  /\b(aspirin|warfarin|coumadin|clopidogrel|plavix|apixaban|eliquis|rivaroxaban|xarelto|dabigatran|pradaxa|lisinopril|atorvastatin|lipitor|simvastatin|metformin|sertraline|fluoxetine|citalopram|omeprazole|levothyroxine|amlodipine|metoprolol|furosemide)\b/i;
function checkNoPhi(files) {
  for (const f of files) {
    // Skip the scanner itself (it necessarily contains the medication-name list).
    if (f.endsWith('check-phi.mjs')) continue;
    const rel = relative(ROOT, f);
    const text = readFileSync(f, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      const t = line;
      if (EMAIL_RE.test(t)) {
        violations.push(`[phi:email] ${rel}:${i + 1}: ${t.trim()}`);
      }
      if (PHONE_RE.test(t)) {
        violations.push(`[phi:phone] ${rel}:${i + 1}: ${t.trim()}`);
      }
      if (SSN_RE.test(t)) {
        violations.push(`[phi:ssn] ${rel}:${i + 1}: ${t.trim()}`);
      }
      if (MEDS_RE.test(t)) {
        violations.push(`[phi:medication-name] ${rel}:${i + 1}: ${t.trim()}`);
      }
    });
  }
}

const files = readAll();
checkNoNetwork(files);
checkNoFreeText(files);
checkNoPhi(files);

if (violations.length > 0) {
  console.error(`PHI scan failed — ${violations.length} violation(s):\n`);
  for (const v of violations) console.error(`  ${v}`);
  console.error(
    '\nIf a match is a legitimate synthetic/demo value or a generic term, fix the ' +
      'source so it no longer looks like personal data (do not add it to a whitelist).',
  );
  process.exit(1);
}

console.log(
  `PHI scan clean — scanned ${files.length} files; no network calls, no free-text ` +
    'inputs, no PHI-shaped literals.',
);
process.exit(0);
