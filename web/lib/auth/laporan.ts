"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChecklistPayload } from "@/types/database";

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

export interface LaporanChecklistEntry {
  date_key: string;
  condition: string;
  /** Payload mentah entri ceklist (uraian kerusakan/tindakan, petugas, …). */
  payload?: ChecklistPayload | null;
}

/** Kolom inventaris pendukung baris dokumen sumber "inventaris". */
export interface LaporanItemDetail {
  merk?: string | null;
  type?: string | null;
  year?: number | null;
  quantity?: number | null;
  unit?: string | null;
  notes?: string | null;
  no_seri?: string | null;
  kode_barang?: string | null;
  bahan?: string | null;
}

export interface LaporanItem {
  item_id: number;
  nama: string;
  kategori: string;
  kondisi_terbaru: string;
  tanggal_terbaru: string;
  /** Kondisi inventaris saat ini (kolom items.condition). */
  kondisi_item: string;
  detail: LaporanItemDetail;
  riwayat_checklist: LaporanChecklistEntry[];
}

export async function getLaporanSummary(filter: LaporanFilter): Promise<LaporanSummary> {
  const supabase = await createClient();

  // Get date range for the month
  const startDate = `${filter.tahun}-${String(filter.bulan).padStart(2, "0")}-01`;
  const endDate = new Date(filter.tahun, filter.bulan, 0).toISOString().split("T")[0];

  // Query rooms
  let roomsQuery = supabase.from("rooms").select("id");
  if (filter.room_id) {
    roomsQuery = roomsQuery.eq("id", filter.room_id);
  }
  const { data: rooms, error: roomsError } = await roomsQuery;
  if (roomsError) throw roomsError;
  const roomIds = rooms?.map((r) => r.id) || [];

  // Query items (condition ikut diambil sebagai fallback bila tak ada ceklist)
  let itemsQuery = supabase
    .from("items")
    .select("id, room_id, name, category, condition");
  if (filter.room_id) {
    itemsQuery = itemsQuery.eq("room_id", filter.room_id);
  }
  if (filter.kategori) {
    itemsQuery = itemsQuery.eq("category", filter.kategori);
  }
  const { data: items, error: itemsError } = await itemsQuery;
  if (itemsError) throw itemsError;

  // Query checklist for the period — filter by room_id + date range
  // (bukan .in(item_id, [...]) agar URL tak membengkak saat item banyak)
  const checklistQuery = supabase
    .from("checklist")
    .select("item_id, date_key, payload")
    .in("room_id", roomIds.length > 0 ? roomIds : ["__none__"])
    .gte("date_key", startDate)
    .lte("date_key", endDate);
  const { data: checklists, error: checklistError } = await checklistQuery;
  if (checklistError) throw checklistError;

  // Kelompokkan checklist per item + cari kondisi terbaru sekali jalan
  const latestByItem = new Map<number, { date_key: string; status: string }>();
  for (const c of checklists ?? []) {
    const status = c.payload?.status || "baik";
    const prev = latestByItem.get(c.item_id);
    if (!prev || c.date_key.localeCompare(prev.date_key) > 0) {
      latestByItem.set(c.item_id, { date_key: c.date_key, status });
    }
  }

  // Calculate summary — kondisi terbaru ceklist periode ini, fallback ke
  // kondisi inventaris saat ini (jujur saat checklist masih kosong).
  let total_baik = 0;
  let total_rr = 0;
  let total_rb = 0;
  let total_ta = 0;

  items?.forEach((item) => {
    const latest = latestByItem.get(item.id);
    const condition = latest ? latest.status : item.condition || "baik";

    if (condition === "baik") total_baik++;
    else if (condition === "rr") total_rr++;
    else if (condition === "rb") total_rb++;
    else if (condition === "ta") total_ta++;
  });

  const total_items = items?.length || 0;

  return {
    total_rooms: roomIds.length,
    total_items,
    total_baik,
    total_rr,
    total_rb,
    total_ta,
    percentage_baik: total_items > 0 ? Math.round((total_baik / total_items) * 100) : 0,
    percentage_rr: total_items > 0 ? Math.round((total_rr / total_items) * 100) : 0,
    percentage_rb: total_items > 0 ? Math.round((total_rb / total_items) * 100) : 0,
    percentage_ta: total_items > 0 ? Math.round((total_ta / total_items) * 100) : 0,
  };
}

export async function getLaporanPerRoom(filter: LaporanFilter): Promise<LaporanRoom[]> {
  const supabase = await createClient();

  const startDate = `${filter.tahun}-${String(filter.bulan).padStart(2, "0")}-01`;
  const endDate = new Date(filter.tahun, filter.bulan, 0).toISOString().split("T")[0];

  // Get rooms
  let roomsQuery = supabase
    .from("rooms")
    .select("id, name, icon")
    .order("name");

  if (filter.room_id) {
    roomsQuery = roomsQuery.eq("id", filter.room_id);
  }

  const { data: rooms, error: roomsError } = await roomsQuery;
  if (roomsError) throw roomsError;
  const roomList = rooms || [];
  const roomIds = roomList.map((r) => r.id);

  // Batch: semua item + checklist diambil dalam 2 query (bukan 2N+1),
  // lalu dikelompokkan di JS. Checklist difilter room_id + rentang
  // tanggal agar URL tak membengkak oleh .in(item_id, [...]).
  let itemsQuery = supabase
    .from("items")
    .select(
      "id, room_id, name, category, condition, merk, type, year, quantity, unit, notes, no_seri, kode_barang, bahan",
    )
    .in("room_id", roomIds.length > 0 ? roomIds : ["__none__"]);

  if (filter.kategori) {
    itemsQuery = itemsQuery.eq("category", filter.kategori);
  }

  const { data: items, error: itemsError } = await itemsQuery;
  if (itemsError) throw itemsError;

  const { data: checklists, error: checklistError } = await supabase
    .from("checklist")
    .select("item_id, date_key, payload")
    .in("room_id", roomIds.length > 0 ? roomIds : ["__none__"])
    .gte("date_key", startDate)
    .lte("date_key", endDate);
  if (checklistError) throw checklistError;

  const itemsByRoom = new Map<string, typeof items>();
  for (const item of items ?? []) {
    const list = itemsByRoom.get(item.room_id);
    if (list) list.push(item);
    else itemsByRoom.set(item.room_id, [item]);
  }

  const checksByItem = new Map<number, typeof checklists>();
  for (const c of checklists ?? []) {
    const list = checksByItem.get(c.item_id);
    if (list) list.push(c);
    else checksByItem.set(c.item_id, [c]);
  }

  const result: LaporanRoom[] = [];

  for (const room of roomList) {
    const roomItems = itemsByRoom.get(room.id) ?? [];

    let baik = 0;
    let rr = 0;
    let rb = 0;
    let ta = 0;

    const laporanItems: LaporanItem[] = roomItems.map((item) => {
      const itemChecklists = checksByItem.get(item.id) ?? [];

      // Fallback jujur: tanpa ceklist periode ini, pakai kondisi inventaris.
      let kondisi_terbaru = item.condition || "baik";
      let tanggal_terbaru = "";

      if (itemChecklists.length > 0) {
        let latest = itemChecklists[0];
        for (const c of itemChecklists) {
          if (c.date_key.localeCompare(latest.date_key) > 0) latest = c;
        }
        kondisi_terbaru = latest.payload?.status || "baik";
        tanggal_terbaru = latest.date_key;
      }

      if (kondisi_terbaru === "baik") baik++;
      else if (kondisi_terbaru === "rr") rr++;
      else if (kondisi_terbaru === "rb") rb++;
      else if (kondisi_terbaru === "ta") ta++;

      return {
        item_id: item.id,
        nama: item.name,
        kategori: item.category,
        kondisi_terbaru,
        tanggal_terbaru,
        kondisi_item: item.condition || "baik",
        detail: {
          merk: item.merk,
          type: item.type,
          year: item.year,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
          no_seri: item.no_seri,
          kode_barang: item.kode_barang,
          bahan: item.bahan,
        },
        riwayat_checklist: itemChecklists.map((c) => ({
          date_key: c.date_key,
          condition: c.payload?.status || "baik",
          payload: (c.payload ?? null) as ChecklistPayload | null,
        })),
      };
    });

    result.push({
      room_id: room.id,
      room_name: room.name,
      room_icon: room.icon,
      items: laporanItems,
      summary: {
        total: roomItems.length,
        baik,
        rr,
        rb,
        ta,
      },
    });
  }

  return result;
}
