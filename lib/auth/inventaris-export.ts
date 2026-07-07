"use server";

import { createClient } from "@/lib/supabase/server";
import type { Item, Room } from "@/types/database";

const KAT_LABEL: Record<string, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

const KONDISI_LABEL: Record<string, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

const PRIO_LABEL: Record<string, string> = {
  wajib: "Wajib",
  penting: "Penting",
  pendukung: "Pendukung",
};

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/**
 * Export all inventory items across all rooms as CSV.
 * Mirrors GAS exportCSV() — one row per item, columns mirror the GAS
 * item table (ruangan, kategori, nama, spec, merek, noreg, jml, std, prio, kondisi, tahun, catatan).
 */
export async function exportInventarisCSV(): Promise<string> {
  const supabase = await createClient();

  const [roomsRes, itemsRes] = await Promise.all([
    supabase.from("rooms").select("id, name").order("order_index", { ascending: true }),
    supabase.from("items").select("*"),
  ]);

  const roomMap = new Map<string, string>();
  for (const r of (roomsRes.data ?? []) as Pick<Room, "id" | "name">[]) {
    roomMap.set(r.id, r.name);
  }

  const items = (itemsRes.data ?? []) as Item[];
  // Sort by room order then index_in_room
  items.sort((a, b) => {
    const ra = roomMap.get(a.room_id) ?? "";
    const rb = roomMap.get(b.room_id) ?? "";
    if (ra !== rb) return ra < rb ? -1 : 1;
    return (a.index_in_room ?? 0) - (b.index_in_room ?? 0);
  });

  const headers = [
    "Ruangan",
    "Kategori",
    "Nama",
    "Spesifikasi",
    "Merek",
    "No. Registrasi",
    "Jumlah",
    "Standar",
    "Satuan",
    "Prioritas",
    "Kondisi",
    "Tahun",
    "Catatan",
  ];

  const rows = items.map((it) =>
    [
      roomMap.get(it.room_id) ?? it.room_id,
      KAT_LABEL[it.category] ?? it.category,
      it.name,
      it.spec ?? it.bahan ?? "",
      it.merk ?? "",
      it.noreg ?? it.kode_barang ?? "",
      it.quantity,
      it.std ?? "",
      it.unit,
      it.prio ? PRIO_LABEL[it.prio] ?? it.prio : "",
      KONDISI_LABEL[it.condition] ?? it.condition,
      it.year ?? "",
      it.notes ?? "",
    ]
      .map(esc)
      .join(",")
  );

  return [headers.map(esc).join(","), ...rows].join("\n");
}
