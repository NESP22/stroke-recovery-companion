// Real-life functional practice tasks — Goal–Plan–Do–Check, preset only.
//
// SAFETY: these are synthetic, everyday scenarios using preset choices only.
// There are NO medication names, addresses, appointment names, real names or
// free-text prompts. The completion/assistance recorded are structured enums,
// never a clinical independence score.

import type { ScoredDomain } from '../lib/outcome';

export interface FunctionalTask {
  id: string;
  title: string;
  emoji: string;
  /** Which practice focus area this task exercises (ties to the plan). */
  domain: ScoredDomain;
  situation: string;
  goal: string;
  planSteps: string[];
  doHint: string;
  checkPrompt: string;
}

export const FUNCTIONAL_TASKS: FunctionalTask[] = [
  {
    id: 'morning-routine',
    title: 'Morning routine',
    emoji: '🌅',
    domain: 'executive',
    situation: 'You have just woken up and want to get ready for the day.',
    goal: 'Get washed, dressed and have breakfast, in a sensible order.',
    planSteps: [
      'Sit on the edge of the bed for a moment before standing',
      'Wash and brush your teeth',
      'Get dressed',
      'Have breakfast',
    ],
    doHint: 'Do one step at a time. You can say each step out loud as you go.',
    checkPrompt: 'Did you finish your morning routine? Was any step missed?',
  },
  {
    id: 'simple-shopping-list',
    title: 'Simple shopping list',
    emoji: '🛒',
    domain: 'memory',
    situation: 'You need a few everyday things from the shop.',
    goal: 'Remember and get the items on a short list.',
    planSteps: [
      'Pick three everyday items you need (for example bread, milk and fruit)',
      'Write them down or keep them in mind',
      'Check the list as you collect each one',
    ],
    doHint: 'Three items is enough. Repeating them out loud can help.',
    checkPrompt: 'Did you get the items? Which one was easiest to remember?',
  },
  {
    id: 'appointment-preparation',
    title: 'Appointment preparation',
    emoji: '🗓️',
    domain: 'memory',
    situation: 'You have an appointment coming up and want to be ready.',
    goal: 'Be ready on time with everything you need.',
    planSteps: [
      'Note the day and time you need to leave',
      'Gather what you need the night before',
      'Set a reminder for the morning',
    ],
    doHint: 'Preparing the night before removes pressure in the morning.',
    checkPrompt: 'Were you ready on time? What helped most?',
  },
  {
    id: 'simple-recipe-sequence',
    title: 'Simple recipe sequence',
    emoji: '🍲',
    domain: 'executive',
    situation: 'You want to make a simple meal or snack.',
    goal: 'Follow the steps in order and finish safely.',
    planSteps: [
      'Gather all the ingredients first',
      'Follow the steps one at a time',
      'Turn everything off when finished',
    ],
    doHint: 'A gentle meal is fine — the practice is the step order.',
    checkPrompt: 'Did you follow the steps? Was anything forgotten?',
  },
  {
    id: 'calendar-phone-routine',
    title: 'Calendar & phone routine',
    emoji: '📅',
    domain: 'executive',
    situation: 'You want to check your plans and keep in touch.',
    goal: 'Check the day and make a simple call or message.',
    planSteps: [
      'Check what is planned for today',
      'Find the person to contact',
      'Make the call or send a short message',
    ],
    doHint: 'Keep the message short — a hello is enough.',
    checkPrompt: 'Did you check the day and make contact?',
  },
  {
    id: 'packing-short-outing',
    title: 'Packing for a short outing',
    emoji: '🎒',
    domain: 'visualScanning',
    situation: 'You are going out for a short while and need to pack.',
    goal: 'Pack the essentials for a short outing.',
    planSteps: [
      'Think about where you are going and for how long',
      'Gather essentials like keys, phone and a water bottle',
      'Check each item before you leave',
    ],
    doHint: 'Scan the room from left to right to spot what you need.',
    checkPrompt: 'Did you have everything? Was anything left behind?',
  },
];

/** Default task order (a gentle rotation, not a clinical prescription). */
export function tasksForFocus(focusDomains: readonly ScoredDomain[]): FunctionalTask[] {
  if (focusDomains.length === 0) return [...FUNCTIONAL_TASKS];
  const relevant = FUNCTIONAL_TASKS.filter((t) => focusDomains.includes(t.domain));
  const rest = FUNCTIONAL_TASKS.filter((t) => !focusDomains.includes(t.domain));
  return [...relevant, ...rest];
}
