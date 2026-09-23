import { useEffect, useState } from 'react';
import {
  loadAdaptiveStates,
  recordAdaptiveAttempt as record,
} from '../lib/outcomeStorage';
import type {
  AdaptiveObservation,
  Difficulty,
  TrainableModuleId,
} from '../types';

/**
 * Load the recommended starting level for one domain and expose a recorder
 * for new observations. The level is a transparent suggestion only — modules
 * may let the user override it. Fatigue is read from the caller where known.
 */
export function useAdaptive(domain: TrainableModuleId) {
  const [level, setLevel] = useState<Difficulty | null>(null);

  useEffect(() => {
    let mounted = true;
    loadAdaptiveStates().then((states) => {
      if (mounted) setLevel(states[domain]?.level ?? null);
    });
    return () => {
      mounted = false;
    };
  }, [domain]);

  const recordAttempt = (
    observation: Omit<AdaptiveObservation, 'at'>,
    fatigue: number | null = null,
  ) => {
    void record(domain, observation, fatigue).then((states) =>
      setLevel(states[domain]?.level ?? null),
    );
  };

  return { level, recordAttempt };
}
