import { useEffect, useState } from 'react';
import { getStore } from '../lib/storage';
import { todayISO } from '../lib/time';

const KEY = 'adl.v1';

/** Daily ADL checklist completion, keyed by local date. */
type AdlMap = Record<string, string[]>;

export function useAdl() {
  const [map, setMap] = useState<AdlMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStore()
      .get<AdlMap>(KEY)
      .then((r) => {
        if (mounted) {
          setMap(r ?? {});
          setReady(true);
        }
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void getStore().set(KEY, map);
  }, [map, ready]);

  const today = todayISO();
  const doneToday = map[today] ?? [];

  const toggle = (itemKey: string) =>
    setMap((prev) => {
      const current = prev[today] ?? [];
      const next = current.includes(itemKey)
        ? current.filter((x) => x !== itemKey)
        : [...current, itemKey];
      return { ...prev, [today]: next };
    });

  const completedTodayCount = doneToday.length;

  return { ready, doneToday, completedTodayCount, toggle };
}
