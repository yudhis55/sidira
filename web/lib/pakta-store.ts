"use client";

/**
 * Pakta yang dibuat dari Rekap Pemegang Inventaris — port GAS `riBuatPakta` /
 * `riBuatSemuaPakta` (gas-legacy/index.html 26994+, 27087+).
 *
 * Fase mock-only (frontend-first): record tersimpan di localStorage seperti
 * room-store / sbbk-store. Saat wiring Supabase, ganti pembaca/penulis ini
 * dengan query tabel `pakta`.
 *
 * Builder pre-fill murni ada di `./pakta-prefill` (tanpa "use client")
 * agar bisa dipakai Server Component (`pakta/new?dari=`).
 */
import {
  readLocalStorage,
  useLocalStorageState,
  writeLocalStorage,
} from "@/lib/use-local-storage";
import type { Pakta } from "@/types/database";

export { buildPaktaFromPemegang } from "./pakta-prefill";

export const PAKTA_ADDED_KEY = "sidira_pakta_added";
export const PAKTA_HIDDEN_KEY = "sidira_pakta_hidden";

const EMPTY: Pakta[] = [];
const EMPTY_IDS: string[] = [];

export function useAddedPakta() {
  return useLocalStorageState<Pakta[]>(PAKTA_ADDED_KEY, EMPTY);
}

export function readAddedPakta(): Pakta[] {
  return readLocalStorage<Pakta[]>(PAKTA_ADDED_KEY, EMPTY);
}

/** Simpan record pakta mock (tanpa backend). */
export function addPaktaRecords(recs: Pakta[]): Pakta[] {
  const existing = readAddedPakta();
  const next = [...existing, ...recs];
  writeLocalStorage(PAKTA_ADDED_KEY, next);
  return next;
}

/**
 * Simpan sebagai overlay: timpa record se-id bila ada, tambah bila belum.
 * Dipakai edit modal & editor lampiran agar perubahan record bawaan pun
 * tersimpan (mock) — pola yang sama dengan room-store overrides.
 */
export function upsertAddedPakta(rec: Pakta): void {
  const existing = readAddedPakta();
  writeLocalStorage(
    PAKTA_ADDED_KEY,
    existing.some((p) => p.id === rec.id)
      ? existing.map((p) => (p.id === rec.id ? rec : p))
      : [...existing, rec]
  );
}

/** Hapus record milik store. Return true bila id ditemukan. */
export function deleteAddedPakta(id: string): boolean {
  const existing = readAddedPakta();
  if (!existing.some((p) => p.id === id)) return false;
  writeLocalStorage(
    PAKTA_ADDED_KEY,
    existing.filter((p) => p.id !== id)
  );
  return true;
}

/**
 * Record bawaan (static mock) tidak bisa dimutasi — penghapusan dicatat
 * sebagai id tersembunyi, pola yang sama dengan `deleted` di room-store.
 */
export function useHiddenPaktaIds() {
  return useLocalStorageState<string[]>(PAKTA_HIDDEN_KEY, EMPTY_IDS);
}

export function readHiddenPaktaIds(): string[] {
  return readLocalStorage<string[]>(PAKTA_HIDDEN_KEY, EMPTY_IDS);
}

export function hideStaticPakta(id: string): void {
  const existing = readHiddenPaktaIds();
  if (!existing.includes(id)) {
    writeLocalStorage(PAKTA_HIDDEN_KEY, [...existing, id]);
  }
}

/** Gabungan untuk daftar: overlay dulu, lalu bawaan yang tak disembunyikan. */
export function getMergedPakta(
  staticList: Pakta[],
  addedList: Pakta[] = readAddedPakta(),
  hiddenIds: string[] = readHiddenPaktaIds()
): Pakta[] {
  const addedIds = new Set(addedList.map((p) => p.id));
  const hidden = new Set(hiddenIds);
  return [
    ...addedList.filter((p) => !hidden.has(p.id)),
    ...staticList.filter((p) => !hidden.has(p.id) && !addedIds.has(p.id)),
  ];
}

/**
 * Cocokkan pakta dengan pemegang — GAS `riHasPakta(nama)` mencocokkan
 * berdasarkan NAMA (bukan id). Record tambahan (mock store) didahulukan.
 */
export function findPaktaForPemegang(
  nama: string,
  staticList: Pakta[],
  addedList: Pakta[] = readAddedPakta(),
  hiddenIds: string[] = readHiddenPaktaIds()
): Pakta | undefined {
  const key = (nama || "").trim().toLowerCase();
  if (!key) return undefined;
  const hidden = new Set(hiddenIds);
  const sameName = (p: Pakta) =>
    !hidden.has(p.id) && (p.nama || "").trim().toLowerCase() === key;
  return addedList.find(sameName) ?? staticList.find(sameName);
}
