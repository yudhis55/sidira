"use server";

import { createClient } from "@/lib/supabase/server";
import type { Item, ItemCategory, Room } from "@/types/database";

export interface InventarisStats {
  totalItem: number; // sum of quantity across all items
  totalItemRows: number; // count of item rows
  totalRooms: number;
  alkes: number;
  meubelair: number;
  elektronik: number;
  lainnya: number;
  perluPerhatian: number; // items where condition != baik (count rows)
  usulanAktif: number; // usulan items not yet ditolak/realised
}

const KAT_KEYS: ItemCategory[] = ["alkes", "meubelair", "elektronik", "lainnya"];

/**
 * Aggregate inventory stats across all rooms + items + usulan.
 * Mirrors the GAS global stats bar (gs-total, gs-alkes, gs-meub, ...).
 */
export async function getInventarisStats(): Promise<InventarisStats> {
  const supabase = await createClient();

  const [roomsRes, itemsRes, usulanRes] = await Promise.all([
    supabase.from("rooms").select("id"),
    supabase.from("items").select("category, quantity, condition"),
    supabase.from("usulan").select("payload"),
  ]);

  const totalRooms = roomsRes.data?.length ?? 0;

  const items = (itemsRes.data ?? []) as Pick<
    Item,
    "category" | "quantity" | "condition"
  >[];

  const byKat: Record<ItemCategory, number> = {
    alkes: 0,
    meubelair: 0,
    elektronik: 0,
    lainnya: 0,
  };
  let totalItem = 0;
  let perluPerhatian = 0;

  for (const it of items) {
    const qty = Number(it.quantity) || 0;
    totalItem += qty;
    if (KAT_KEYS.includes(it.category)) byKat[it.category] += qty;
    if (it.condition && it.condition !== "baik") perluPerhatian += 1;
  }

  // Usulan aktif = usulan items whose status is diajukan or disetujui
  // (not ditolak). GAS "Usulan Aktif" counts pending proposals.
  let usulanAktif = 0;
  for (const u of usulanRes.data ?? []) {
    const payload = (u as { payload?: { items?: { status?: string }[] } }).payload;
    const list = payload?.items ?? [];
    for (const it of list) {
      if (it.status === "diajukan" || it.status === "disetujui") usulanAktif += 1;
    }
  }

  return {
    totalItem,
    totalItemRows: items.length,
    totalRooms,
    alkes: byKat.alkes,
    meubelair: byKat.meubelair,
    elektronik: byKat.elektronik,
    lainnya: byKat.lainnya,
    perluPerhatian,
    usulanAktif,
  };
}

/**
 * Per-room summary for listing cards: item count, per-category counts,
 * and "perlu perhatian" count.
 */
export interface RoomSummary {
  room: Room;
  total: number;
  alkes: number;
  meubelair: number;
  elektronik: number;
  lainnya: number;
  perluPerhatian: number;
}

export async function getRoomSummaries(): Promise<RoomSummary[]> {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("order_index", { ascending: true });

  if (!rooms) return [];

  const { data: items } = await supabase
    .from("items")
    .select("room_id, category, quantity, condition");

  const itemList = (items ?? []) as Pick<
    Item,
    "room_id" | "category" | "quantity" | "condition"
  >[];

  return (rooms as Room[]).map((room) => {
    const roomItems = itemList.filter((i) => i.room_id === room.id);
    let total = 0;
    let perluPerhatian = 0;
    const byKat: Record<ItemCategory, number> = {
      alkes: 0,
      meubelair: 0,
      elektronik: 0,
      lainnya: 0,
    };
    for (const it of roomItems) {
      const qty = Number(it.quantity) || 0;
      total += qty;
      if (KAT_KEYS.includes(it.category)) byKat[it.category] += qty;
      if (it.condition && it.condition !== "baik") perluPerhatian += 1;
    }
    return {
      room,
      total,
      alkes: byKat.alkes,
      meubelair: byKat.meubelair,
      elektronik: byKat.elektronik,
      lainnya: byKat.lainnya,
      perluPerhatian,
    };
  });
}
