import { useEffect, useState } from 'react';
import { getStore } from '../lib/storage';
import type { CheckIn, SessionRecord } from '../types';

const RECORDS_KEY = 'records.v1';
const CHECKINS_KEY = 'checkins.v1';

/** Daily session records (adherence + fatigue + function signals). */
export function useRecords() {
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStore()
      .get<SessionRecord[]>(RECORDS_KEY)
      .then((r) => {
        if (mounted) {
          setRecords(r ?? []);
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
    if (ready) void getStore().set(RECORDS_KEY, records);
  }, [records, ready]);

  const addRecord = (r: SessionRecord) => setRecords((prev) => [r, ...prev]);
  const clearRecords = () => setRecords([]);

  return { records, ready, addRecord, clearRecords };
}

/** Standalone mood/fatigue check-ins. */
export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStore()
      .get<CheckIn[]>(CHECKINS_KEY)
      .then((r) => {
        if (mounted) {
          setCheckIns(r ?? []);
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
    if (ready) void getStore().set(CHECKINS_KEY, checkIns);
  }, [checkIns, ready]);

  const addCheckIn = (c: CheckIn) => setCheckIns((prev) => [c, ...prev]);

  return { checkIns, ready, addCheckIn };
}
