"use client";

/**
 * Utilitas tambahan yang dibuat dari UI — port GAS `utilAddNew`.
 *
 * Sama seperti ruangan: daftar dasarnya masih mock server-side, yang disimpan
 * di localStorage hanyalah utilitas buatan pengguna (GAS menandainya
 * `custom: true`).
 */
import { useMemo } from "react";
import {
  readLocalStorage,
  useLocalStorageState,
  writeLocalStorage,
} from "@/lib/use-local-storage";
import type { UtilMeta } from "@/types/database";

export const UTIL_ADDED_KEY = "sidira_util_added";

const EMPTY_UTIL: UtilMeta[] = [];

export function useAddedUtilitas() {
  return useLocalStorageState<UtilMeta[]>(UTIL_ADDED_KEY, EMPTY_UTIL);
}

/** GAS `utilAddNew` — util_id `custom_<timestamp>`, warna tetap teal. */
export function addUtilitas(input: { label: string; icon: string }): UtilMeta {
  const now = new Date().toISOString();
  const existing = readLocalStorage<UtilMeta[]>(UTIL_ADDED_KEY, EMPTY_UTIL);
  const meta: UtilMeta = {
    util_id: `custom_${Date.now()}`,
    label: input.label,
    icon: input.icon,
    warna: "#0e7c6b",
    bg: "#d4f0eb",
    custom: true,
    order_no: existing.length,
    created_at: now,
    updated_at: now,
  };
  writeLocalStorage(UTIL_ADDED_KEY, [...existing, meta]);
  return meta;
}

/** Daftar utilitas final untuk komponen klien: mock + tambahan. */
export function useUtilitasList(base: UtilMeta[]): UtilMeta[] {
  const [added] = useAddedUtilitas();
  return useMemo(() => [...base, ...added], [base, added]);
}
