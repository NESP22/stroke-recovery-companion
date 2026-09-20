// Attention practice stimulus generator — deterministic (seeded) so tests and
// sessions are reproducible. The environment is intentionally low-distraction:
// one target symbol among identical distractors, no timer by default.

import type { Difficulty } from '../types';

export interface AttentionRound {
  /** Flattened grid of symbols, row-major. */
  grid: string[];
  /** Number of columns (and rows). */
  size: number;
  target: string;
  distractor: string;
  targetIndex: number;
}

// Small seeded PRNG (mulberry32) for reproducible rounds.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

const TARGETS = ['★', '●', '▲', '■', '✦'];
const DISTRACTORS = ['○', '△', '□', '◇', '·'];

function gridSizeFor(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'gentle':
      return 3;
    case 'challenging':
      return 6;
    default:
      return 4;
  }
}

export function generateRound(difficulty: Difficulty, seed: number): AttentionRound {
  const rand = mulberry32(seed);
  const size = gridSizeFor(difficulty);
  const target = TARGETS[Math.floor(rand() * TARGETS.length)];
  let distractor = DISTRACTORS[Math.floor(rand() * DISTRACTORS.length)];
  if (distractor === target) distractor = DISTRACTORS[0];
  const total = size * size;
  const targetIndex = Math.floor(rand() * total);
  const grid: string[] = [];
  for (let i = 0; i < total; i++) {
    grid.push(i === targetIndex ? target : distractor);
  }
  return { grid, size, target, distractor, targetIndex };
}

/** Simple, honest success check — index within grid bounds. */
export function isTarget(round: AttentionRound, index: number): boolean {
  return index === round.targetIndex;
}
