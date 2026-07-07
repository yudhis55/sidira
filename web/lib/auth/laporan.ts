"use server";

import { createClient } from "@/lib/supabase/server";

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
  const { data: rooms } = await roomsQuery;
  const roomIds = rooms?.map((r) => r.id) || [];

  // Query items
  let itemsQuery = supabase.from("items").select("id, room_id, name, category");
  if (filter.room_id) {
    itemsQuery = itemsQuery.eq("room_id", filter.room_id);
  }
  if (filter.kategori) {
    itemsQuery = itemsQuery.eq("category", filter.kategori);
  }
  const { data: items } = await itemsQuery;

  // Query checklist for the period
  const { data: checklists } = await supabase
    .from("checklist")
    .select("item_id, date_key, payload")
    .in("item_id", items?.map((i) => i.id) || [])
    .gte("date_key", startDate)
    .lte("date_key", endDate);

  // Calculate summary
  let total_baik = 0;
  let total_rr = 0;
  let total_rb = 0;
  let total_ta = 0;

  items?.forEach((item) => {
    const itemChecklists = checklists?.filter((c) => c.item_id === item.id) || [];

    if (itemChecklists.length === 0) {
      // No checklist, assume baik
      total_baik++;
    } else {
      // Get latest condition
      const latest = itemChecklists.sort((a, b) => b.date_key.localeCompare(a.date_key))[0];
      const condition = latest.payload?.status || "baik";

      if (condition === "baik") total_baik++;
      else if (condition === "rr") total_rr++;
      else if (condition === "rb") total_rb++;
      else if (condition === "ta") total_ta++;
    }
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

  const { data: rooms } = await roomsQuery;

  const result: LaporanRoom[] = [];

  for (const room of rooms || []) {
    // Get items for this room
    let itemsQuery = supabase
      .from("items")
      .select("id, name, category")
      .eq("room_id", room.id);

    if (filter.kategori) {
      itemsQuery = itemsQuery.eq("category", filter.kategori);
    }

    const { data: items } = await itemsQuery;

    // Get checklist for these items
    const { data: checklists } = await supabase
      .from("checklist")
      .select("item_id, date_key, payload")
      .in("item_id", items?.map((i) => i.id) || [])
      .gte("date_key", startDate)
      .lte("date_key", endDate);

    let baik = 0;
    let rr = 0;
    let rb = 0;
    let ta = 0;

    const laporanItems: LaporanItem[] = (items || []).map((item) => {
      const itemChecklists = checklists?.filter((c) => c.item_id === item.id) || [];

      let kondisi_terbaru = "baik";
      let tanggal_terbaru = "";

      if (itemChecklists.length > 0) {
        const latest = itemChecklists.sort((a, b) => b.date_key.localeCompare(a.date_key))[0];
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
        riwayat_checklist: itemChecklists.map((c) => ({
          date_key: c.date_key,
          condition: c.payload?.status || "baik",
        })),
      };
    });

    result.push({
      room_id: room.id,
      room_name: room.name,
      room_icon: room.icon,
      items: laporanItems,
      summary: {
        total: items?.length || 0,
        baik,
        rr,
        rb,
        ta,
      },
    });
  }

  return result;
}
