import type { ModuleId } from '../types';

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  description: string;
  /** Rough estimated minutes for a single use — used to build a session plan. */
  estimateMinutes: number;
  /** Shown during a daily session (core practice). */
  inSession: boolean;
  /** Path for routing. */
  path: string;
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'orientation',
    title: 'Orientation',
    description: 'A calm reminder of the date, time, season and your daily routine.',
    estimateMinutes: 2,
    inSession: true,
    path: '/orientation',
  },
  {
    id: 'memory',
    title: 'Memory',
    description: 'Spaced retrieval, errorless-style practice and external reminder prompts.',
    estimateMinutes: 8,
    inSession: true,
    path: '/memory',
  },
  {
    id: 'attention',
    title: 'Attention',
    description: 'Gentle focus practice with reduced distractions and adjustable difficulty.',
    estimateMinutes: 6,
    inSession: true,
    path: '/attention',
  },
  {
    id: 'executive',
    title: 'Problem-solving',
    description: 'Goal–Plan–Do–Check steps for everyday tasks.',
    estimateMinutes: 8,
    inSession: true,
    path: '/executive',
  },
  {
    id: 'aphasia',
    title: 'Language & words',
    description: 'Word-finding and communication support. Adjunct to speech-language therapy.',
    estimateMinutes: 8,
    inSession: true,
    path: '/aphasia',
  },
  {
    id: 'neglect',
    title: 'Visual scanning',
    description: 'Practice looking to one side, with safety wording throughout.',
    estimateMinutes: 6,
    inSession: true,
    path: '/neglect',
  },
  {
    id: 'adl',
    title: 'Daily routines',
    description: 'Checklists for morning, meal and evening routines.',
    estimateMinutes: 4,
    inSession: true,
    path: '/adl',
  },
  {
    id: 'mood',
    title: 'Mood & fatigue',
    description: 'A simple self-check with signposting to support. Not a diagnosis.',
    estimateMinutes: 3,
    inSession: true,
    path: '/mood',
  },
  {
    id: 'caregiver',
    title: 'Caregiver support',
    description: 'Communication tips, self-care reminders and guidance for helpers.',
    estimateMinutes: 5,
    inSession: false,
    path: '/caregiver',
  },
];

export const SESSION_MODULES = MODULES.filter((m) => m.inSession);
