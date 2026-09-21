import type { ModuleId } from '../types';

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  /** Emoji icon — rendered aria-hidden (decorative), text remains the label. */
  icon: string;
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
    icon: '🕐',
    description: 'A calm reminder of the date, time, season and your daily routine.',
    estimateMinutes: 2,
    inSession: true,
    path: '/orientation',
  },
  {
    id: 'memory',
    title: 'Memory',
    icon: '🧠',
    description: 'Spaced retrieval, errorless-style practice and external reminder prompts.',
    estimateMinutes: 8,
    inSession: true,
    path: '/memory',
  },
  {
    id: 'attention',
    title: 'Attention',
    icon: '🎯',
    description: 'Gentle focus practice with reduced distractions and adjustable difficulty.',
    estimateMinutes: 6,
    inSession: true,
    path: '/attention',
  },
  {
    id: 'executive',
    title: 'Problem-solving',
    icon: '🧩',
    description: 'Goal–Plan–Do–Check steps for everyday tasks.',
    estimateMinutes: 8,
    inSession: true,
    path: '/executive',
  },
  {
    id: 'aphasia',
    title: 'Language & words',
    icon: '💬',
    description: 'Word-finding and communication support. Adjunct to speech-language therapy.',
    estimateMinutes: 8,
    inSession: true,
    path: '/aphasia',
  },
  {
    id: 'neglect',
    title: 'Visual scanning',
    icon: '👀',
    description: 'Practice looking to one side, with safety wording throughout.',
    estimateMinutes: 6,
    inSession: true,
    path: '/neglect',
  },
  {
    id: 'adl',
    title: 'Daily routines',
    icon: '✅',
    description: 'Checklists for morning, meal and evening routines.',
    estimateMinutes: 4,
    inSession: true,
    path: '/adl',
  },
  {
    id: 'mood',
    title: 'Mood & fatigue',
    icon: '😊',
    description: 'A simple self-check with signposting to support. Not a diagnosis.',
    estimateMinutes: 3,
    inSession: true,
    path: '/mood',
  },
  {
    id: 'caregiver',
    title: 'Caregiver support',
    icon: '🤝',
    description: 'Communication tips, self-care reminders and guidance for helpers.',
    estimateMinutes: 5,
    inSession: false,
    path: '/caregiver',
  },
];

export const SESSION_MODULES = MODULES.filter((m) => m.inSession);
