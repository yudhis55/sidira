"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ItemCondition } from "@/types/database";

export interface ChecklistPayload {
  status: ItemCondition;
  jenis_kerusakan?: string;
  uraian_kerusakan?: string;
  jenis_tindakan?: string;
  uraian_tindakan?: string;
  petugas?: string;
  no_laporan?: string;
}

export interface ChecklistEntry {
  id?: number;
  room_id: string;
  item_id: number;
  category: string;
  item_index: number;
  date_key: string;
  payload: ChecklistPayload;
  updated_at?: string;
}

export async function getChecklistEntries(roomId: string, startDate: string, endDate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist")
    .select(`
      id,
      room_id,
      item_id,
      category,
      item_index,
      date_key,
      payload,
      updated_at
    `)
    .eq("room_id", roomId)
    .gte("date_key", startDate)
    .lte("date_key", endDate)
    .order("date_key", { ascending: true });

  if (error) throw error;
  return data as ChecklistEntry[];
}

export async function saveChecklistEntry(entry: Omit<ChecklistEntry, "id" | "updated_at">) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist")
    .upsert({
      room_id: entry.room_id,
      item_id: entry.item_id,
      category: entry.category,
      item_index: entry.item_index,
      date_key: entry.date_key,
      payload: entry.payload,
    }, {
      onConflict: "room_id,category,item_index,date_key"
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/checklist`);
  revalidatePath(`/inventaris/${entry.room_id}`);
  return data;
}

/**
 * Typed upsert for a single checklist cell. Accepts a ChecklistPayload.
 * Revalidates /checklist and the room detail page.
 */
export async function saveChecklistPayload(
  roomId: string,
  itemId: number,
  category: string,
  itemIndex: number,
  dateKey: string,
  payload: ChecklistPayload
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist")
    .upsert(
      {
        room_id: roomId,
        item_id: itemId,
        category: category,
        item_index: itemIndex,
        date_key: dateKey,
        payload: payload,
      },
      {
        onConflict: "room_id,category,item_index,date_key",
      }
    )
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/checklist`);
  revalidatePath(`/inventaris/${roomId}`);
  return data;
}

/**
 * Bulk set all items in a room (optionally filtered by category/itemIds) to a
 * given condition for a specific date, a date range, or the whole month.
 *
 * opts:
 *   - date: a single YYYY-MM-DD
 *   - dateFrom / dateTo: an inclusive range (YYYY-MM-DD)
 *   - category: restrict to one item category
 *   - itemIds: restrict to a subset of item ids
 *
 * At least one date option must be provided.
 */
export async function bulkSetChecklist(
  roomId: string,
  condition: ItemCondition,
  opts: {
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    itemIds?: number[];
  }
) {
  const { date, dateFrom, dateTo, category, itemIds } = opts;

  // Resolve the list of target dates (YYYY-MM-DD).
  const targetDates: string[] = [];
  if (date) {
    targetDates.push(date);
  }
  if (dateFrom && dateTo) {
    const start = new Date(dateFrom + "T00:00:00");
    const end = new Date(dateTo + "T00:00:00");
    if (start > end) {
      throw new Error("Tanggal awal harus sebelum tanggal akhir");
    }
    const cursor = new Date(start);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      targetDates.push(`${y}-${m}-${d}`);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  if (targetDates.length === 0) {
    throw new Error("Tidak ada tanggal target untuk bulk set");
  }

  // Fetch the room's items (optionally filtered).
  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select("id, category, index_in_room, name")
    .eq("room_id", roomId)
    .order("index_in_room");

  if (category) {
    query = query.eq("category", category);
  }
  const { data: items, error: itemsError } = await query;
  if (itemsError) throw itemsError;

  let filteredItems = items ?? [];
  if (itemIds && itemIds.length > 0) {
    const idSet = new Set(itemIds);
    filteredItems = filteredItems.filter((it) => idSet.has(it.id));
  }

  if (filteredItems.length === 0) {
    return { count: 0, dates: targetDates.length };
  }

  // Build the upsert rows.
  const payload: ChecklistPayload = { status: condition };
  const rows = filteredItems.flatMap((it) =>
    targetDates.map((dateKey) => ({
      room_id: roomId,
      item_id: it.id,
      category: it.category,
      item_index: it.index_in_room ?? 0,
      date_key: dateKey,
      payload: payload,
    }))
  );

  const { error: upsertError } = await supabase
    .from("checklist")
    .upsert(rows, {
      onConflict: "room_id,category,item_index,date_key",
    });

  if (upsertError) throw upsertError;

  revalidatePath(`/checklist`);
  revalidatePath(`/inventaris/${roomId}`);

  return { count: rows.length, dates: targetDates.length };
}

export async function deleteChecklistEntry(id: number, roomId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath(`/checklist`);
  revalidatePath(`/inventaris/${roomId}`);
}

export async function getChecklistSummary(roomId: string, startDate: string, endDate: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist")
    .select(`
      date_key,
      payload,
      items:items(name)
    `)
    .eq("room_id", roomId)
    .gte("date_key", startDate)
    .lte("date_key", endDate)
    .order("date_key", { ascending: true });

  if (error) throw error;

  // Group by date
  const summary: Record<string, { baik: number; rr: number; rb: number; ta: number }> = {};

  data?.forEach((entry: { date_key: string; payload: ChecklistPayload | null }) => {
    if (!summary[entry.date_key]) {
      summary[entry.date_key] = { baik: 0, rr: 0, rb: 0, ta: 0 };
    }
    const status = entry.payload?.status as keyof typeof summary[string] | undefined;
    if (status && status in summary[entry.date_key]) {
      summary[entry.date_key][status]++;
    }
  });

  return summary;
}
