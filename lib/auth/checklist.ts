"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ChecklistPayload {
  status: "baik" | "rr" | "rb" | "ta";
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
  return data;
}

export async function deleteChecklistEntry(id: number, roomId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath(`/checklist`);
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

  data?.forEach((entry: any) => {
    if (!summary[entry.date_key]) {
      summary[entry.date_key] = { baik: 0, rr: 0, rb: 0, ta: 0 };
    }
    const status = entry.payload?.status as keyof typeof summary[string];
    if (status && status in summary[entry.date_key]) {
      summary[entry.date_key][status]++;
    }
  });

  return summary;
}
