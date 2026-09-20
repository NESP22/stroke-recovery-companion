// Goal–Plan–Do–Check (metacognitive) scenarios.
// These are reflection prompts, not scored tests — the practice is the
// metacognitive process, per cognitive-rehabilitation guidance.

export interface GpdcScenario {
  id: string;
  title: string;
  situation: string;
  goalHint: string;
  planOptions: string[];
  checkPrompt: string;
}

export const SCENARIOS: GpdcScenario[] = [
  {
    id: 'meds-lunch',
    title: 'Remembering medication at lunch',
    situation: 'You need to take your lunchtime medication at 12:30. Right now it is 11:45.',
    goalHint: 'The goal is to take the medication at the right time.',
    planOptions: [
      'Check the clock and set a reminder',
      'Place the medication where I will see it at lunch',
      'Ask someone to remind me',
    ],
    checkPrompt: 'Did I take the medication at 12:30? What would I do differently next time?',
  },
  {
    id: 'make-lunch',
    title: 'Making a simple lunch',
    situation: 'You want to make a sandwich for lunch.',
    goalHint: 'The goal is to make and eat a sandwich safely.',
    planOptions: [
      'Gather the bread, filling and a plate',
      'Make the sandwich slowly, one step at a time',
      'Sit down to eat it',
    ],
    checkPrompt: 'Did I make the sandwich? Was anything missing? What helped?',
  },
  {
    id: 'go-out',
    title: 'Preparing to go out',
    situation: 'You are going to a friend’s house this afternoon.',
    goalHint: 'The goal is to be ready with everything you need.',
    planOptions: [
      'Check the time I need to leave',
      'Gather keys, phone and anything else I need',
      'Put on comfortable shoes',
    ],
    checkPrompt: 'Did I have everything I needed? Was I ready on time?',
  },
  {
    id: 'call-someone',
    title: 'Calling a friend',
    situation: 'You want to phone a friend to say hello.',
    goalHint: 'The goal is to make the call and have a short chat.',
    planOptions: [
      'Find the phone and their number',
      'Find a quiet room',
      'Make the call',
    ],
    checkPrompt: 'Did the call go well? What would make it easier next time?',
  },
  {
    id: 'tidy-room',
    title: 'Tidying one small area',
    situation: 'The table next to your chair is cluttered.',
    goalHint: 'The goal is to clear the table, one step at a time.',
    planOptions: [
      'Pick one thing at a time',
      'Put each thing where it belongs',
      'Stop when I feel tired',
    ],
    checkPrompt: 'Is the table clearer? How did breaking it into steps feel?',
  },
  {
    id: 'plan-visit',
    title: 'Planning a visit',
    situation: 'A relative is visiting tomorrow morning.',
    goalHint: 'The goal is to be ready for the visit.',
    planOptions: [
      'Think about what time they arrive',
      'Decide what to prepare',
      'Plan a rest before they arrive',
    ],
    checkPrompt: 'Was I ready? What went well and what could be easier?',
  },
];
