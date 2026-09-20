// Memory-compensation practice content — synthetic only.
//
// Two evidence-informed techniques are implemented:
//  - Errorless learning (show the answer first, repeat, then fade the cue) —
//    recommended for moderate–severe memory difficulty.
//  - Spaced retrieval (recall at increasing intervals) — recommended as an
//    internal strategy for mild memory difficulty.

export interface ErrorlessItem {
  id: string;
  cue: string;
  target: string;
}

export const ERRORLESS_ITEMS: ErrorlessItem[] = [
  { id: 'door-key', cue: 'The thing I hang by the door is my…', target: 'keys' },
  { id: 'water-day', cue: 'I water the plant every…', target: 'Tuesday' },
  { id: 'news-time', cue: 'I watch the news at…', target: 'six o’clock' },
  { id: 'towel', cue: 'After a shower I dry with a…', target: 'towel' },
  { id: 'glasses', cue: 'I keep my reading glasses on the…', target: 'side table' },
  { id: 'front-door', cue: 'Before bed I check the front door is…', target: 'locked' },
];

export interface SpacedItem {
  id: string;
  prompt: string;
  answer: string;
}

export const SPACED_ITEMS: SpacedItem[] = [
  { id: 'bin-day', prompt: 'On which day do I put the bins out?', answer: 'Tuesday' },
  { id: 'tea-sugar', prompt: 'How many sugars do I like in my tea?', answer: 'one' },
  { id: 'key-spot', prompt: 'Where do I keep my keys?', answer: 'by the door' },
  { id: 'favourite-show', prompt: 'What time is my favourite TV show on?', answer: 'eight o’clock' },
  { id: 'front-door', prompt: 'What do I check before bed?', answer: 'the front door is locked' },
];

// External reminder prompts — preset-only (no free text), so nothing personal
// is ever typed into or stored by the app.
export interface ReminderPreset {
  id: string;
  label: string;
  timeHint: string;
}

export const REMINDER_PRESETS: ReminderPreset[] = [
  { id: 'morning-meds', label: 'Take morning medication', timeHint: 'morning' },
  { id: 'lunch-meds', label: 'Take lunchtime medication', timeHint: 'midday' },
  { id: 'evening-meds', label: 'Take evening medication', timeHint: 'evening' },
  { id: 'drink-water', label: 'Drink a glass of water', timeHint: 'afternoon' },
  { id: 'call-family', label: 'Call a family member', timeHint: 'evening' },
  { id: 'lock-door', label: 'Check the front door is locked', timeHint: 'night' },
];
