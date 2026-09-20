// Shared data types.
// NOTE: All persisted data is structured (numbers/enums/preset-choice IDs)
// with no free text, so the public deployment cannot accidentally store
// personally identifiable health information server-side. Nothing here is
// uploaded anywhere — it stays in the user's browser.

export type Difficulty = 'gentle' | 'standard' | 'challenging';
export type FontSize = 'standard' | 'large' | 'xl';

export type ModuleId =
  | 'orientation'
  | 'memory'
  | 'attention'
  | 'executive'
  | 'aphasia'
  | 'neglect'
  | 'adl'
  | 'mood'
  | 'caregiver';

export interface Profile {
  version: 1;
  /** Chosen functional goals (preset IDs only — no free text). */
  goals: string[];
  /** Target session length in minutes, capped at 30. */
  sessionMinutes: number;
  /** Offer a rest prompt every N minutes. */
  restEveryMinutes: number;
  difficulty: Difficulty;
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  caregiverMode: boolean;
  /** Whether a clinician/caregiver helped set this up (behaviour flag only). */
  clinicianConfigured: boolean;
  /** Role of the helper (e.g. "Family member"), never a real name. */
  caregiverRole: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  /** Local date, YYYY-MM-DD. */
  dateISO: string;
  minutes: number;
  /** 0–10, higher = more tired. */
  fatigueBefore: number;
  /** 0–10, higher = more tired. */
  fatigueAfter: number;
  /** Module IDs visited during the session. */
  modulesCompleted: string[];
  /** Number of ADL checklist items ticked during the session. */
  checklistCompleted: number;
  /** 0–10 mood, higher = better; null if not answered. */
  mood: number | null;
}

export interface CheckIn {
  id: string;
  dateISO: string;
  /** 0–10, higher = better. */
  mood: number;
  /** 0–10, higher = more tired. */
  fatigue: number;
}

export const DEFAULT_PROFILE: Profile = {
  version: 1,
  goals: [],
  sessionMinutes: 30,
  restEveryMinutes: 10,
  difficulty: 'standard',
  fontSize: 'large',
  highContrast: false,
  reduceMotion: false,
  caregiverMode: false,
  clinicianConfigured: false,
  caregiverRole: '',
  createdAt: '',
};
