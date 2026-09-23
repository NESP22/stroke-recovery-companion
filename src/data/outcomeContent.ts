// Alternate-form content for the pre/post "app performance check".
//
// Form A reuses the existing baseline content; Form B is a separate, equivalent
// set (same task structure, different synthetic stimuli). The app always
// alternates A/B so the same stimulus set is never shown twice in a row.
//
// All content is synthetic and non-sensitive. Nothing here is a validated or
// proprietary instrument.

import {
  BASELINE_NAMING,
  MEMORY_FOIL_DELAYED,
  MEMORY_FOIL_IMMEDIATE,
  MEMORY_WORDS,
  ORIENTATION_QUESTIONS,
  SCAN_TARGET,
  SEQUENCING_QUESTIONS,
  makeScanTrial,
  type NamingQuestion,
  type OrientationQuestion,
  type SequencingQuestion,
} from './baseline';
import type { AssessmentForm } from '../types';

export interface AssessmentFormContent {
  form: AssessmentForm;
  orientation: OrientationQuestion[];
  memoryWords: readonly string[];
  memoryFoilImmediate: string;
  memoryFoilDelayed: string;
  naming: NamingQuestion[];
  sequencing: SequencingQuestion[];
  /** Offset added to the scan-trial seed so forms produce different layouts. */
  scanSeedOffset: number;
}

const FORM_B_ORIENTATION: OrientationQuestion[] = [
  {
    id: 'month-of-year',
    prompt: 'Which of these is a month of the year?',
    options: ['March', 'Chair', 'Sock'],
    correctIndex: 0,
  },
  {
    id: 'season-b',
    prompt: 'Which of these is a season of the year?',
    options: ['Lamp', 'Summer', 'Fish'],
    correctIndex: 1,
  },
  {
    id: 'time-of-day-b',
    prompt: 'Which of these is a time of day?',
    options: ['Afternoon', 'Window', 'Shoe'],
    correctIndex: 0,
  },
];

const FORM_B_NAMING: NamingQuestion[] = [
  {
    id: 'key-b',
    emoji: '🔑',
    target: 'key',
    options: ['key', 'shoe', 'moon', 'cup'],
    correctIndex: 0,
    hint: 'It opens a door',
  },
  {
    id: 'apple-b',
    emoji: '🍎',
    target: 'apple',
    options: ['star', 'apple', 'boat', 'leaf'],
    correctIndex: 1,
    hint: 'A round fruit that can be red or green',
  },
  {
    id: 'bird-b',
    emoji: '🐦',
    target: 'bird',
    options: ['fish', 'car', 'bird', 'hat'],
    correctIndex: 2,
    hint: 'An animal that flies and sings',
  },
];

const FORM_B_SEQUENCING: SequencingQuestion[] = [
  {
    id: 'make-sandwich',
    activity: 'Making a simple sandwich',
    steps: ['Get the bread', 'Add the filling', 'Put it on a plate'],
    options: ['Add the filling', 'Get the bread', 'Put it on a plate'],
    correctIndex: 1,
    hint: 'The first step is about the bread',
  },
  {
    id: 'wash-hands',
    activity: 'Washing your hands',
    steps: ['Turn on the tap', 'Use soap', 'Dry your hands'],
    options: ['Use soap', 'Turn on the tap', 'Dry your hands'],
    correctIndex: 1,
    hint: 'The first step is about the tap',
  },
  {
    id: 'going-to-bed',
    activity: 'Going to bed',
    steps: ['Change into night clothes', 'Brush your teeth', 'Get into bed'],
    options: ['Brush your teeth', 'Change into night clothes', 'Get into bed'],
    correctIndex: 1,
    hint: 'The first step is about clothes',
  },
];

export const FORM_A_CONTENT: AssessmentFormContent = {
  form: 'A',
  orientation: ORIENTATION_QUESTIONS,
  memoryWords: MEMORY_WORDS,
  memoryFoilImmediate: MEMORY_FOIL_IMMEDIATE,
  memoryFoilDelayed: MEMORY_FOIL_DELAYED,
  naming: BASELINE_NAMING,
  sequencing: SEQUENCING_QUESTIONS,
  scanSeedOffset: 0,
};

export const FORM_B_CONTENT: AssessmentFormContent = {
  form: 'B',
  orientation: FORM_B_ORIENTATION,
  memoryWords: ['clock', 'garden', 'apple'],
  memoryFoilImmediate: 'door',
  memoryFoilDelayed: 'book',
  naming: FORM_B_NAMING,
  sequencing: FORM_B_SEQUENCING,
  scanSeedOffset: 2,
};

export function contentForForm(form: AssessmentForm): AssessmentFormContent {
  return form === 'A' ? FORM_A_CONTENT : FORM_B_CONTENT;
}

export { makeScanTrial, SCAN_TARGET };
