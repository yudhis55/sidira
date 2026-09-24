"use client";

/**
 * Mock store Pemegang Inventaris — pola yang sama dengan pakta-store /
 * room-store (localStorage overlay menunggu wiring Supabase).
 *
 * - Pemegang baru → record penuh di `sidira_pemegang_added`.
 * - Edit identitas pemegang bawaan → patch di `sidira_pemegang_overrides`
 *   (static mock tidak bisa dimutasi, seperti `deleted` di room-store).
 * - Edit identitas pemegang buatan → record tambahannya langsung diubah.
 */
import {
  readLocalStorage,
  useLocalStorageState,
  writeLocalStorage,
} from "@/lib/use-local-storage";
import type { PemegangInventaris, PemegangStatus } from "@/types/database";

export const PEMEGANG_ADDED_KEY = "sidira_pemegang_added";
export const PEMEGANG_OVERRIDE_KEY = "sidira_pemegang_overrides";

export interface PemegangIdentity {
  nama: string;
  nip: string;
  jabatan: string;
  status: PemegangStatus;
}

export type PemegangOverrides = Record<string, Partial<PemegangIdentity>>;

const EMPTY_LIST: PemegangInventaris[] = [];
const EMPTY_OVERRIDES: PemegangOverrides = {};

export function useAddedPemegang() {
  return useLocalStorageState<PemegangInventaris[]>(
    PEMEGANG_ADDED_KEY,
    EMPTY_LIST
  );
}

export function usePemegangOverrides() {
  return useLocalStorageState<PemegangOverrides>(
    PEMEGANG_OVERRIDE_KEY,
    EMPTY_OVERRIDES
  );
}

export function readAddedPemegang(): PemegangInventaris[] {
  return readLocalStorage<PemegangInventaris[]>(PEMEGANG_ADDED_KEY, EMPTY_LIST);
}

export function readPemegangOverrides(): PemegangOverrides {
  return readLocalStorage<PemegangOverrides>(
    PEMEGANG_OVERRIDE_KEY,
    EMPTY_OVERRIDES
  );
}

function now(): string {
  return new Date().toISOString();
}

/** Tambah pemegang baru. Return record yang tersimpan. */
export function addPemegang(values: PemegangIdentity): PemegangInventaris {
  const rec: PemegangInventaris = {
    id: `pemegang-${Date.now()}`,
    nama: values.nama.trim(),
    nip: values.nip.trim() || undefined,
    jabatan: values.jabatan.trim() || undefined,
    status: values.status,
    created_at: now(),
    updated_at: now(),
  };
  writeLocalStorage(PEMEGANG_ADDED_KEY, [...readAddedPemegang(), rec]);
  return rec;
}

/** Simpan edit identitas: record buatan diubah langsung, bawaan di-patch. */
export function savePemegangIdentity(
  id: string,
  values: PemegangIdentity
): void {
  const added = readAddedPemegang();
  if (added.some((p) => p.id === id)) {
    writeLocalStorage(
      PEMEGANG_ADDED_KEY,
      added.map((p) =>
        p.id === id
          ? {
              ...p,
              nama: values.nama.trim(),
              nip: values.nip.trim() || undefined,
              jabatan: values.jabatan.trim() || undefined,
              status: values.status,
              updated_at: now(),
            }
          : p
      )
    );
    return;
  }
  const overrides = readPemegangOverrides();
  writeLocalStorage(PEMEGANG_OVERRIDE_KEY, {
    ...overrides,
    [id]: {
      nama: values.nama.trim(),
      nip: values.nip.trim() || undefined,
      jabatan: values.jabatan.trim() || undefined,
      status: values.status,
    },
  });
}

/** Gabungan untuk daftar: tambahan dulu, lalu bawaan + patch identitas. */
export function getMergedPemegang(
  staticList: PemegangInventaris[],
  addedList: PemegangInventaris[] = readAddedPemegang(),
  overrides: PemegangOverrides = readPemegangOverrides()
): PemegangInventaris[] {
  const patched = staticList.map((p) => {
    const ov = overrides[p.id];
    return ov ? { ...p, ...ov } : p;
  });
  return [...addedList, ...patched];
}
