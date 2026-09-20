import { useEffect, useState } from 'react';
import { getStore } from '../lib/storage';

/**
 * Load and persist a value to local storage with a "ready" flag.
 * Used for small persisted settings (e.g. active reminder presets).
 */
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStore()
      .get<T>(key)
      .then((r) => {
        if (!mounted) return;
        if (r !== undefined) setValue(r);
        setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, [key]);

  useEffect(() => {
    if (ready) void getStore().set(key, value);
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}
