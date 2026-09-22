// Baseline-check content — synthetic, preset, and non-sensitive only.
//
// SAFETY NOTE (personalization only): this "baseline check" is NOT a validated
// clinical or cognitive test. It is NOT the MoCA, MMSE, or any screening
// instrument, and nothing here is compared to a norm. The only thing its
// answers do is choose practice focus areas and a starting level inside this
// app. It must never label anyone as mildly/moderately/severely impaired, and
// it must never infer stroke location, recurrence, dementia, recovery
// probability, or clinical severity.
//
// Privacy: every item below is a preset choice. No names, dates of birth,
// addresses, medication names, or free-text health notes are collected.

export interface OrientationQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index of the single correct option. */
  correctIndex: number;
}

// Preset orientation questions with stable, non-personal, non-date-dependent
// answers, so results are deterministic and reproducible in tests.
export const ORIENTATION_QUESTIONS: OrientationQuestion[] = [
  {
    id: 'day-of-week',
    prompt: 'Which of these is a day of the week?',
    options: ['Monday', 'Table', 'Winter'],
    correctIndex: 0,
  },
  {
    id: 'season',
    prompt: 'Which of these is a season of the year?',
    options: ['Chair', 'Autumn', 'Dog'],
    correctIndex: 1,
  },
  {
    id: 'time-of-day',
    prompt: 'Which of these is a time of day?',
    options: ['Morning', 'River', 'Shoe'],
    correctIndex: 0,
  },
];

// Non-sensitive demo words for immediate and delayed recognition recall.
// Recognition (pick from a list) rather than free recall keeps this gentle
// and stroke-friendly; the words carry no personal meaning.
export const MEMORY_WORDS: readonly string[] = ['apple', 'table', 'river'];

// One distractor is added per recall phase. Choosing a distractor is neutral
// (never penalised): this is a practice-focus signal, not a scored test.
export const MEMORY_FOIL_IMMEDIATE = 'shoes';
export const MEMORY_FOIL_DELAYED = 'lamp';

export interface NamingQuestion {
  id: string;
  emoji: string;
  target: string;
  options: string[];
  correctIndex: number;
  /** Optional plain-language hint (a semantic cue), shown only if requested. */
  hint: string;
}

// Picture/category naming using synthetic emoji "pictures" (reusing the same
// visual language as the Language & words module). Options are preset words.
export const BASELINE_NAMING: NamingQuestion[] = [
  {
    id: 'cup',
    emoji: '☕',
    target: 'cup',
    options: ['cup', 'book', 'hat', 'key'],
    correctIndex: 0,
    hint: 'You drink tea or coffee from it',
  },
  {
    id: 'banana',
    emoji: '🍌',
    target: 'banana',
    options: ['flower', 'banana', 'watch', 'bed'],
    correctIndex: 1,
    hint: 'A long yellow fruit',
  },
  {
    id: 'cat',
    emoji: '🐱',
    target: 'cat',
    options: ['bird', 'dog', 'cat', 'milk'],
    correctIndex: 2,
    hint: 'A small animal that purrs',
  },
];

export interface SequencingQuestion {
  id: string;
  activity: string;
  /** The three steps in the correct order (documentation for reviewers). */
  steps: string[];
  /** Presented options in a fixed, non-order-preserving arrangement. */
  options: string[];
  /** Index (into `options`) of the FIRST step of the routine. */
  correctIndex: number;
  /** Optional plain-language hint, shown only if requested. */
  hint: string;
}

// Everyday sequencing using preset steps. Each question asks for the FIRST
// step of a familiar routine, which is a simple, low-risk sequencing signal.
// The options are deliberately not in the correct order.
export const SEQUENCING_QUESTIONS: SequencingQuestion[] = [
  {
    id: 'make-tea',
    activity: 'Making a cup of tea',
    steps: ['Fill the kettle with water', 'Boil the water', 'Pour the water over a tea bag'],
    options: ['Boil the water', 'Fill the kettle with water', 'Pour the water over a tea bag'],
    correctIndex: 1,
    hint: 'The first step is about the kettle',
  },
  {
    id: 'get-dressed',
    activity: 'Getting dressed',
    steps: ['Choose your clothes', 'Put them on', 'Put on your shoes'],
    options: ['Put on your shoes', 'Choose your clothes', 'Put them on'],
    correctIndex: 1,
    hint: 'The first step is about choosing clothes',
  },
  {
    id: 'make-call',
    activity: 'Making a phone call',
    steps: ['Find the phone', 'Find the number', 'Make the call'],
    options: ['Make the call', 'Find the phone', 'Find the number'],
    correctIndex: 1,
    hint: 'The first step is about the phone',
  },
];

// Simple left-to-right scanning line. The target sits toward the right so a
// complete left-to-right scan is encouraged, but no time pressure is applied.
const SCAN_SYMBOLS = ['●', '○', '◆', '◇', '▲', '△', '■', '□'];
export const SCAN_TARGET = '★';

export interface ScanTrial {
  row: string[];
  targetIndex: number;
}

export function makeScanTrial(seed: number): ScanTrial {
  const row = Array.from(
    { length: 8 },
    (_, i) => SCAN_SYMBOLS[(i + seed) % SCAN_SYMBOLS.length],
  );
  const index = 5 + (seed % 3); // 5..7, right-of-centre
  row[index] = SCAN_TARGET;
  return { row, targetIndex: index };
}

/** Human-readable labels for every baseline domain (screen + plan display). */
export const BASELINE_DOMAIN_LABELS: Record<string, string> = {
  orientation: 'Orientation',
  attention: 'Attention',
  memory: 'Memory',
  language: 'Language & words',
  visualScanning: 'Visual scanning',
  executive: 'Problem-solving',
  fatigueTolerance: 'Fatigue tolerance',
};
