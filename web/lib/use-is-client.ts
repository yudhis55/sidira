"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

/**
 * Deteksi apakah render sudah berjalan di klien — tanpa `setState` di dalam
 * effect (dilarang oleh react-hooks/set-state-in-effect).
 *
 * Dipakai komponen yang datanya baru tersedia setelah hidrasi (localStorage,
 * `document.body` untuk portal) supaya markup awal server dan klien cocok.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}
