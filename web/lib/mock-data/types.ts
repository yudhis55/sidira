// Types not present in database.ts but used by auth modules.
// Shapes inferred from web/lib/auth/*.ts return types.

import type { UtilMeta } from "@/types/database";

// ── Laporan (from lib/auth/laporan.ts) ──────────────────────────────

export interface LaporanFilter {
  bulan: number;
  tahun: number;
  room_id?: string;
  kategori?: string;
}

export interface LaporanSummary {
  total_rooms: number;
  total_items: number;
  total_baik: number;
  total_rr: number;
  total_rb: number;
  total_ta: number;
  percentage_baik: number;
  percentage_rr: number;
  percentage_rb: number;
  percentage_ta: number;
}

export interface LaporanRoom {
  room_id: string;
  room_name: string;
  room_icon: string;
  items: LaporanItem[];
  summary: {
    total: number;
    baik: number;
    rr: number;
    rb: number;
    ta: number;
  };
}

export interface LaporanItem {
  item_id: number;
  nama: string;
  kategori: string;
  kondisi_terbaru: string;
  tanggal_terbaru: string;
  riwayat_checklist: Array<{
    date_key: string;
    condition: string;
  }>;
}

// ── Utilitas Summary (from lib/auth/utilitas-summary.ts) ────────────

export interface UtilSummary {
  meta: UtilMeta;
  itemCount: number;
  doneThisMonth: number;
}

// ── Riwayat Filter (from lib/auth/riwayat.ts) ───────────────────────

export interface RiwayatFilter {
  start_date?: string;
  end_date?: string;
  room_id?: string;
  kategori?: string;
}
