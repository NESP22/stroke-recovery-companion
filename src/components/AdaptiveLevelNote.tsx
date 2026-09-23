import type { Difficulty, TrainableModuleId } from '../types';

const LABEL: Record<Difficulty, string> = {
  gentle: 'Gentle',
  standard: 'Standard',
  challenging: 'Challenging',
};

const AREA: Record<TrainableModuleId, string> = {
  memory: 'Memory',
  attention: 'Attention',
  executive: 'Problem-solving',
  aphasia: 'Language & words',
  neglect: 'Visual scanning',
};

interface Props {
  domain: TrainableModuleId;
  level: Difficulty | null;
}

/**
 * A small, non-intrusive note surfacing the adaptive engine's current
 * recommendation for this domain. Informational only — never a clinical label.
 */
export function AdaptiveLevelNote({ domain, level }: Props) {
  if (!level) return null;
  return (
    <p className="muted adaptive-note" role="note">
      Suggested level for {AREA[domain]}: <strong>{LABEL[level]}</strong>. This
      is a gentle suggestion from your recent practice — you can ignore it.
    </p>
  );
}
