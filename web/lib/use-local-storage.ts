"use client";

import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

interface Entry {
  /** Raw string terakhir yang dibaca/ditulis ke localStorage. */
  raw: string | null;
  value: unknown;
  /** true bila penulisan ke localStorage gagal (kuota / private mode). */
  memoryOnly: boolean;
}

const cache = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  listeners.get(key)?.forEach((cb) => cb());
}

function subscribe(key: string, cb: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(cb);

  // Sinkron antar-tab: tulisan dari tab lain membatalkan cache.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== key) return;
    cache.delete(key);
    cb();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    set.delete(cb);
    if (set.size === 0) listeners.delete(key);
    window.removeEventListener("storage", onStorage);
  };
}

function read<T>(key: string, initial: T): T {
  const entry = cache.get(key);
  if (entry?.memoryOnly) return entry.value as T;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  // Cache wajib dipertahankan supaya getSnapshot mengembalikan referensi yang
  // sama selama isi localStorage tidak berubah (syarat useSyncExternalStore).
  if (entry && entry.raw === raw) return entry.value as T;

  let value = initial;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }
  cache.set(key, { raw, value, memoryOnly: false });
  return value;
}

function write<T>(key: string, next: T) {
  let raw: string | null = null;
  let memoryOnly = false;
  try {
    raw = JSON.stringify(next);
    window.localStorage.setItem(key, raw);
  } catch {
    memoryOnly = true;
  }
  cache.set(key, { raw, value: next, memoryOnly });
  emit(key);
}

/**
 * Baca nilai tersimpan dari luar komponen React.
 * Memakai cache yang sama dengan `useLocalStorageState`, jadi aman dipanggil
 * berdampingan dengan hook-nya.
 */
export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return read(key, fallback);
}

/**
 * Tulis nilai dari luar React — komponen yang sedang memakai kunci ini
 * ikut ter-render ulang lewat listener yang sama.
 */
export function writeLocalStorage<T>(key: string, next: T): void {
  if (typeof window === "undefined") return;
  write(key, next);
}

/**
 * State yang dipersist ke localStorage — meniru perilaku GAS
 * (roomsSaveToStorage / usulanSaveToStorage) selama fase mock.
 *
 * Render pertama (server dan hidrasi) selalu memakai `initial` supaya markup
 * cocok; nilai tersimpan menggantikannya tepat setelah hidrasi selesai.
 * Pada fase wiring Supabase, cukup tukar hook ini di titik pemanggilannya.
 */
export function useLocalStorageState<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  // Nilai awal dibekukan pada render pertama supaya identitasnya stabil.
  const initialRef = useRef(initial);

  const value = useSyncExternalStore(
    useCallback((cb: () => void) => subscribe(key, cb), [key]),
    useCallback(() => read(key, initialRef.current), [key]),
    useCallback(() => initialRef.current, [])
  );

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      const current = read(key, initialRef.current);
      const next =
        typeof action === "function"
          ? (action as (prev: T) => T)(current)
          : action;
      write(key, next);
    },
    [key]
  );

  return [value, setValue];
}
