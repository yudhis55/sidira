"use client";

/**
 * Penyimpanan SBBK selama fase mock — port GAS `sbbkSaveToStorage`.
 *
 * Daftar dasar tetap datang dari mock server-side, jadi yang dipersist hanya
 * selisihnya: SBBK baru (`sidira_sbbk_added`) serta hasil sunting/hapus atas
 * SBBK bawaan (`sidira_sbbk_override`). Fase wiring Supabase cukup menukar
 * pembacanya dengan query tabel `sbbk`.
 */
import { useMemo } from "react";
import {
  readLocalStorage,
  useLocalStorageState,
  writeLocalStorage,
} from "@/lib/use-local-storage";
import type { SBBK } from "@/types/database";

export const SBBK_ADDED_KEY = "sidira_sbbk_added";
export const SBBK_OVERRIDE_KEY = "sidira_sbbk_override";

export interface SbbkOverride {
  /** Rekaman hasil sunting yang menggantikan versi mock. */
  data?: SBBK;
  deleted?: boolean;
}

export type SbbkOverrides = Record<string, SbbkOverride>;

const EMPTY_OVERRIDES: SbbkOverrides = {};
const EMPTY_ADDED: SBBK[] = [];

export function useSbbkOverrides() {
  return useLocalStorageState<SbbkOverrides>(
    SBBK_OVERRIDE_KEY,
    EMPTY_OVERRIDES
  );
}

export function useAddedSbbk() {
  return useLocalStorageState<SBBK[]>(SBBK_ADDED_KEY, EMPTY_ADDED);
}

/** GAS `sbbkGenId` — cukup unik untuk data lokal. */
export function newSbbkId(): string {
  return `sbbk_${Date.now()}`;
}

/** Rekaman lokal (bukan bawaan mock) dikenali dari prefiks id-nya. */
export function isLocalSbbk(id: string): boolean {
  return id.startsWith("sbbk_");
}

/**
 * Daftar SBBK siap tampil: bawaan yang dihapus dibuang, yang disunting
 * diganti, lalu SBBK baru ditambahkan. Urutan mengikuti GAS: tanggal terbaru
 * di atas.
 */
export function mergeSbbkList(
  base: SBBK[],
  added: SBBK[],
  overrides: SbbkOverrides
): SBBK[] {
  const merged = base
    .filter((d) => overrides[d.id]?.deleted !== true)
    .map((d) => overrides[d.id]?.data ?? d)
    .concat(added);

  return [...merged].sort((a, b) => (a.tgl < b.tgl ? 1 : a.tgl > b.tgl ? -1 : 0));
}

export function useSbbkList(base: SBBK[]): SBBK[] {
  const [overrides] = useSbbkOverrides();
  const [added] = useAddedSbbk();
  return useMemo(
    () => mergeSbbkList(base, added, overrides),
    [base, added, overrides]
  );
}

/** GAS `sbbkSave` — rekaman baru di-push, rekaman lama ditimpa. */
export function saveSbbkRecord(record: SBBK): void {
  if (isLocalSbbk(record.id)) {
    const added = readLocalStorage<SBBK[]>(SBBK_ADDED_KEY, EMPTY_ADDED);
    const idx = added.findIndex((d) => d.id === record.id);
    const next =
      idx === -1
        ? [...added, record]
        : added.map((d) => (d.id === record.id ? record : d));
    writeLocalStorage(SBBK_ADDED_KEY, next);
    return;
  }

  const overrides = readLocalStorage<SbbkOverrides>(
    SBBK_OVERRIDE_KEY,
    EMPTY_OVERRIDES
  );
  writeLocalStorage(SBBK_OVERRIDE_KEY, {
    ...overrides,
    [record.id]: { ...overrides[record.id], data: record },
  });
}

/** GAS `sbbkDelete`. */
export function deleteSbbkRecord(id: string): void {
  if (isLocalSbbk(id)) {
    const added = readLocalStorage<SBBK[]>(SBBK_ADDED_KEY, EMPTY_ADDED);
    writeLocalStorage(
      SBBK_ADDED_KEY,
      added.filter((d) => d.id !== id)
    );
    return;
  }

  const overrides = readLocalStorage<SbbkOverrides>(
    SBBK_OVERRIDE_KEY,
    EMPTY_OVERRIDES
  );
  writeLocalStorage(SBBK_OVERRIDE_KEY, {
    ...overrides,
    [id]: { ...overrides[id], deleted: true },
  });
}
