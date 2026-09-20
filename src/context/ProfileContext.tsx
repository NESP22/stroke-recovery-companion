/* eslint-disable react-refresh/only-export-components -- context and hook are
   intentionally co-located; splitting them would hurt discoverability. */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getStore } from '../lib/storage';
import { DEFAULT_PROFILE, type Profile } from '../types';

const KEY = 'profile.v1';

interface ProfileCtx {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  ready: boolean;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStore()
      .get<Profile>(KEY)
      .then((saved) => {
        if (!mounted) return;
        if (saved && saved.version === 1) {
          setProfile({ ...DEFAULT_PROFILE, ...saved });
        }
        setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void getStore().set(KEY, profile);
  }, [profile, ready]);

  // Apply accessibility preferences to the document root so CSS can respond.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontSize = profile.fontSize;
    root.dataset.highContrast = profile.highContrast ? 'true' : 'false';
    root.dataset.reduceMotion = profile.reduceMotion ? 'true' : 'false';
  }, [profile.fontSize, profile.highContrast, profile.reduceMotion]);

  const update = (patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  return <Ctx.Provider value={{ profile, update, ready }}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
