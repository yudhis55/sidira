import type { ItemCategory } from "@/types/database";

// ══════════════════════════════════════════════════════════════════════
//  Usulan shared types & display labels
//
//  This file is NOT a "use server" module so it can export non-function
//  values (types, label maps) that both server actions and client
//  components import.
// ══════════════════════════════════════════════════════════════════════
export type UsulanPrioritas = "mendesak" | "penting" | "rencana";
export type UsulanStatus = "diajukan" | "disetujui" | "ditolak";

export interface UsulanItem {
  nama: string;
  kategori: ItemCategory;
  prioritas: UsulanPrioritas;
  qty: number;
  satuan: string;
  harga: number;
  total: number;
  status: UsulanStatus;
  keterangan?: string;
}

export interface UsulanPayload {
  items: UsulanItem[];
}

export interface Usulan {
  id: number;
  room_id: string;
  payload: UsulanPayload;
  created_at: string;
  updated_at: string;
  // Joined data
  rooms?: {
    name: string;
    icon: string;
  };
}

// ══════════════════════════════════════════════════════════════════════
//  Display labels (shared by server + client components)
// ══════════════════════════════════════════════════════════════════════
export const USULAN_KATEGORI_LABELS: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

export const USULAN_PRIORITAS_LABELS: Record<UsulanPrioritas, string> = {
  mendesak: "⚠ Mendesak",
  penting: "Penting",
  rencana: "Rencana",
};

export const USULAN_STATUS_LABELS: Record<UsulanStatus, string> = {
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};
