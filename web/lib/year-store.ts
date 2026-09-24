"use client";

/**
 * Tahun inventaris aktif (KIR) — filter global baru SIDIRA v4.
 *
 * Catatan jujur vs GAS: GAS TIDAK punya filter tahun global — chip
 * "KIR 2026 — Aktif" di sana label statis, dan tahun hanya dipilih lokal
 * (stepper tahun di modal checklist, select tahun di modal laporan).
 * Store ini mengangkat konsep itu menjadi default global frontend-only:
 * checklist & laporan menjadikannya tahun awal, prestig lain (inventaris,
 * SBBK, rekap) adalah kondisi terkini sehingga tidak mengenal dimensi tahun
 * sampai backend (Supabase) menyediakannya.
 */
import { useLocalStorageState } from "@/lib/use-local-storage";
import { readLocalStorage } from "@/lib/use-local-storage";

/** Sama seperti pilihan tahun di modal laporan GAS (`lp-sel-tahun`). */
export const AVAILABLE_YEARS = [2024, 2025, 2026, 2027] as const;
export type InventoryYear = (typeof AVAILABLE_YEARS)[number];

/** Default GAS: KIR berjalan 2026. */
export const DEFAULT_YEAR: InventoryYear = 2026;

export const ACTIVE_YEAR_KEY = "sidira_active_year";

function normalizeYear(v: unknown): InventoryYear {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return (AVAILABLE_YEARS as readonly number[]).includes(n)
    ? (n as InventoryYear)
    : DEFAULT_YEAR;
}

export function readActiveYear(): InventoryYear {
  return normalizeYear(readLocalStorage<unknown>(ACTIVE_YEAR_KEY, DEFAULT_YEAR));
}

/** [tahunAktif, gantiTahun] — tersimpan di localStorage, reaktif global. */
export function useActiveYear(): [
  InventoryYear,
  (y: InventoryYear) => void,
] {
  const [raw, setRaw] = useLocalStorageState<InventoryYear>(
    ACTIVE_YEAR_KEY,
    DEFAULT_YEAR
  );
  const year = normalizeYear(raw);
  const setYear = (y: InventoryYear) => setRaw(normalizeYear(y));
  return [year, setYear];
}
