// Functional goal options for onboarding.
// These are preset choices (no free text) so the app never prompts for or
// stores personally identifying details.

export interface GoalOption {
  id: string;
  label: string;
  domain: string;
}

export const GOALS: GoalOption[] = [
  { id: 'move-home', label: 'Move around my home more safely', domain: 'Mobility' },
  { id: 'stairs', label: 'Manage stairs with more confidence', domain: 'Mobility' },
  { id: 'use-hand', label: 'Use my affected hand for everyday tasks', domain: 'Mobility' },
  { id: 'dress', label: 'Get dressed more independently', domain: 'Self-care' },
  { id: 'meal-prep', label: 'Prepare simple meals', domain: 'Self-care' },
  { id: 'bathroom', label: 'Use the bathroom independently', domain: 'Self-care' },
  { id: 'read', label: 'Read and follow text more easily', domain: 'Communication' },
  { id: 'find-words', label: 'Find words when I talk', domain: 'Communication' },
  { id: 'write', label: 'Write short messages', domain: 'Communication' },
  { id: 'meds', label: 'Remember to take my medication on time', domain: 'Memory' },
  { id: 'dates', label: 'Remember appointments and dates', domain: 'Memory' },
  { id: 'find-things', label: 'Remember where I put everyday things', domain: 'Memory' },
  { id: 'plan-day', label: 'Plan and follow my daily routine', domain: 'Thinking' },
  { id: 'shop', label: 'Shop for what I need', domain: 'Community' },
  { id: 'keep-in-touch', label: 'Keep in touch with friends and family', domain: 'Community' },
  { id: 'hobby', label: 'Return to a hobby I enjoy', domain: 'Leisure' },
];

export function goalLabel(id: string): string {
  return GOALS.find((g) => g.id === id)?.label ?? id;
}
