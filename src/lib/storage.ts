// Local-first storage abstraction.
//
// Privacy contract: personal (health-adjacent) data is stored ONLY in the
// user's own browser. There is no server-side persistence and no telemetry.
// This module provides three interchangeable backends (IndexedDB, localStorage,
// in-memory) behind one async interface.

export interface KVStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** In-memory backend — used in tests and as a final fallback. */
export function memoryStore(): KVStore {
  const map = new Map<string, unknown>();
  return {
    async get<T>(key: string) {
      return map.get(key) as T | undefined;
    },
    async set<T>(key: string, value: T) {
      map.set(key, value);
    },
    async remove(key: string) {
      map.delete(key);
    },
    async clear() {
      map.clear();
    },
  };
}

/** localStorage backend — synchronous storage wrapped in promises. */
export function localStorageStore(): KVStore {
  const prefix = 'src:v1:';
  const k = (key: string) => prefix + key;
  return {
    async get<T>(key: string) {
      const raw = localStorage.getItem(k(key));
      return raw === null ? undefined : (JSON.parse(raw) as T);
    },
    async set<T>(key: string, value: T) {
      localStorage.setItem(k(key), JSON.stringify(value));
    },
    async remove(key: string) {
      localStorage.removeItem(k(key));
    },
    async clear() {
      Object.keys(localStorage)
        .filter((x) => x.startsWith(prefix))
        .forEach((x) => localStorage.removeItem(x));
    },
  };
}

/** IndexedDB backend — preferred for structured data in the browser. */
function idbStore(): KVStore {
  const DB_NAME = 'stroke-recovery-companion';
  const STORE = 'kv';
  let dbPromise: Promise<IDBDatabase> | null = null;

  const open = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  };

  const tx = <T>(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> =>
    open().then(
      (db) =>
        new Promise<T>((resolve, reject) => {
          const t = db.transaction(STORE, mode);
          const req = fn(t.objectStore(STORE));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        }),
    );

  return {
    async get<T>(key: string) {
      const row = await tx('readonly', (s) =>
        s.get(key) as IDBRequest<{ key: string; value: T } | undefined>,
      );
      return row?.value;
    },
    async set<T>(key: string, value: T) {
      await tx('readwrite', (s) => s.put({ key, value }));
    },
    async remove(key: string) {
      await tx('readwrite', (s) => s.delete(key));
    },
    async clear() {
      await tx('readwrite', (s) => s.clear());
    },
  };
}

let override: KVStore | null = null;

/** Inject a store (used by tests). Pass null to reset to auto-detection. */
export function setStore(store: KVStore | null): void {
  override = store;
}

/** Pick the best available backend. Never a server. */
export function getStore(): KVStore {
  if (override) return override;
  if (typeof indexedDB !== 'undefined' && indexedDB) return idbStore();
  if (typeof localStorage !== 'undefined') return localStorageStore();
  return memoryStore();
}
