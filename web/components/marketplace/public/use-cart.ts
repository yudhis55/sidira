"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { KeranjangLine } from "@/lib/marketplace-types";

const STORAGE_KEY = "sidira.marketplace.cart";
const EMPTY: KeranjangLine[] = [];

function isKeranjangLine(value: unknown): value is KeranjangLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.barang_id === "number" &&
    typeof line.nama === "string" &&
    typeof line.satuan === "string" &&
    typeof line.jumlah === "number" &&
    Number.isFinite(line.jumlah) &&
    line.jumlah > 0
  );
}

let listeners: Array<() => void> = [];
let cached: KeranjangLine[] | null = null;
let cachedRaw: string | null = null;

function readCart(): KeranjangLine[] {
  if (typeof window === "undefined") return EMPTY;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }

  // getSnapshot harus mengembalikan referensi yang stabil selama isi sama.
  if (raw === cachedRaw && cached) return cached;

  cachedRaw = raw;
  if (!raw) {
    cached = EMPTY;
    return cached;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cached = Array.isArray(parsed) ? parsed.filter(isKeranjangLine) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function writeCart(lines: KeranjangLine[]) {
  cached = lines;
  cachedRaw = JSON.stringify(lines);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Penyimpanan lokal tidak tersedia — keranjang tetap hidup di memori.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cached = null;
    cachedRaw = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
    window.removeEventListener("storage", onStorage);
  };
}

export interface UseCartResult {
  lines: KeranjangLine[];
  count: number;
  addLine: (
    line: Omit<KeranjangLine, "jumlah">,
    max: number,
    qty?: number
  ) => void;
  setJumlah: (barangId: number, jumlah: number, max: number) => void;
  removeLine: (barangId: number) => void;
  clearCart: () => void;
}

/**
 * Keranjang publik — disimpan di localStorage (`sidira.marketplace.cart`)
 * agar bertahan saat halaman dimuat ulang. Satu keranjang global.
 *
 * Memakai useSyncExternalStore supaya server render & hidrasi konsisten
 * (server snapshot selalu kosong, lalu diganti isi localStorage di klien).
 */
export function useCart(): UseCartResult {
  const lines = useSyncExternalStore(subscribe, readCart, () => EMPTY);

  const addLine = useCallback(
    (line: Omit<KeranjangLine, "jumlah">, max: number, qty = 1) => {
      const prev = readCart();
      const limit = Math.max(1, Math.trunc(max));
      const jumlahBaru = Math.min(limit, Math.max(1, Math.trunc(qty)));
      const existing = prev.find((item) => item.barang_id === line.barang_id);
      const next = existing
        ? prev.map((item) =>
            item.barang_id === line.barang_id
              ? { ...item, jumlah: Math.min(limit, item.jumlah + jumlahBaru) }
              : item
          )
        : [...prev, { ...line, jumlah: jumlahBaru }];
      writeCart(next);
    },
    []
  );

  const setJumlah = useCallback(
    (barangId: number, jumlah: number, max: number) => {
      const limit = Math.max(1, Math.trunc(max));
      const next = Number.isFinite(jumlah) ? Math.trunc(jumlah) : 1;
      writeCart(
        readCart().map((item) =>
          item.barang_id === barangId
            ? { ...item, jumlah: Math.min(limit, Math.max(1, next)) }
            : item
        )
      );
    },
    []
  );

  const removeLine = useCallback((barangId: number) => {
    writeCart(readCart().filter((item) => item.barang_id !== barangId));
  }, []);

  const clearCart = useCallback(() => {
    writeCart(EMPTY);
  }, []);

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.jumlah, 0),
    [lines]
  );

  return { lines, count, addLine, setJumlah, removeLine, clearCart };
}
