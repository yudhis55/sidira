"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface UtilMeta {
  util_id: string;
  label: string;
  icon: string;
  warna: string;
  bg: string;
  custom: boolean;
  order_no: number;
  created_at: string;
  updated_at: string;
}

export interface UtilItem {
  id: number;
  util_id: string;
  items: Array<{
    nama: string;
    ket?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface UtilState {
  id: number;
  kind: "check" | "note";
  util_id: string;
  item_index?: string;
  state_key: string;
  value?: string;
  updated_at: string;
  updated_by?: string;
}

export async function getUtilMetaList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("util_meta")
    .select("*")
    .order("order_no");

  if (error) throw error;
  return data as UtilMeta[];
}

export async function getUtilMetaById(utilId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("util_meta")
    .select("*")
    .eq("util_id", utilId)
    .single();

  if (error) throw error;
  return data as UtilMeta;
}

export async function getUtilItems(utilId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("util_items")
    .select("*")
    .eq("util_id", utilId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found, return empty
      return { items: [] };
    }
    throw error;
  }
  return data as UtilItem;
}

export async function getUtilState(utilId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("util_state")
    .select("*")
    .eq("util_id", utilId)
    .order("updated_at", { ascending: false });

  if (startDate) {
    query = query.gte("updated_at", startDate);
  }
  if (endDate) {
    query = query.lte("updated_at", endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as UtilState[];
}

export async function createUtilMeta(formData: FormData) {
  const supabase = await createClient();

  const util_id = formData.get("util_id") as string;
  const label = formData.get("label") as string;
  const icon = formData.get("icon") as string;
  const warna = formData.get("warna") as string;
  const bg = formData.get("bg") as string;
  const order_no = parseInt(formData.get("order_no") as string) || 0;

  if (!util_id || !label || !icon) {
    return { error: "ID, label, dan icon wajib diisi" };
  }

  const { error } = await supabase.from("util_meta").insert({
    util_id,
    label,
    icon,
    warna: warna || "#0e7c6b",
    bg: bg || "#d4f0eb",
    custom: true,
    order_no,
  });

  if (error) {
    console.error("Error creating util meta:", error);
    return { error: error.message };
  }

  revalidatePath("/utilitas");
  redirect(`/utilitas/${util_id}`);
}

export async function updateUtilMeta(utilId: string, formData: FormData) {
  const supabase = await createClient();

  const label = formData.get("label") as string;
  const icon = formData.get("icon") as string;
  const warna = formData.get("warna") as string;
  const bg = formData.get("bg") as string;
  const order_no = parseInt(formData.get("order_no") as string) || 0;

  if (!label || !icon) {
    return { error: "Label dan icon wajib diisi" };
  }

  const { error } = await supabase
    .from("util_meta")
    .update({
      label,
      icon,
      warna: warna || "#0e7c6b",
      bg: bg || "#d4f0eb",
      order_no,
      updated_at: new Date().toISOString(),
    })
    .eq("util_id", utilId);

  if (error) {
    console.error("Error updating util meta:", error);
    return { error: error.message };
  }

  revalidatePath("/utilitas");
  revalidatePath(`/utilitas/${utilId}`);
  redirect(`/utilitas/${utilId}`);
}

export async function deleteUtilMeta(utilId: string) {
  const supabase = await createClient();

  // Delete related data first
  await supabase.from("util_state").delete().eq("util_id", utilId);
  await supabase.from("util_items").delete().eq("util_id", utilId);

  const { error } = await supabase.from("util_meta").delete().eq("util_id", utilId);

  if (error) {
    console.error("Error deleting util meta:", error);
    return { error: error.message };
  }

  revalidatePath("/utilitas");
  redirect("/utilitas");
}

export async function updateUtilItems(utilId: string, items: Array<{ nama: string; ket?: string }>) {
  const supabase = await createClient();

  // Check if exists
  const { data: existing } = await supabase
    .from("util_items")
    .select("id")
    .eq("util_id", utilId)
    .single();

  if (existing) {
    // Update
    const { error } = await supabase
      .from("util_items")
      .update({
        items,
        updated_at: new Date().toISOString(),
      })
      .eq("util_id", utilId);

    if (error) {
      console.error("Error updating util items:", error);
      return { error: error.message };
    }
  } else {
    // Insert
    const { error } = await supabase.from("util_items").insert({
      util_id: utilId,
      items,
    });

    if (error) {
      console.error("Error creating util items:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/utilitas/${utilId}`);
  return { success: true };
}

export async function updateUtilState(
  utilId: string,
  kind: "check" | "note",
  stateKey: string,
  value: string,
  itemIndex?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Use upsert with the unique constraint
  const { error } = await supabase.from("util_state").upsert(
    {
      util_id: utilId,
      kind,
      state_key: stateKey,
      value,
      item_index: itemIndex,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "util_id,kind,item_index,state_key",
    }
  );

  if (error) {
    console.error("Error updating util state:", error);
    return { error: error.message };
  }

  revalidatePath(`/utilitas/${utilId}`);
  return { success: true };
}

export async function deleteUtilState(id: number, utilId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("util_state").delete().eq("id", id);

  if (error) {
    console.error("Error deleting util state:", error);
    return { error: error.message };
  }

  revalidatePath(`/utilitas/${utilId}`);
  return { success: true };
}

/**
 * Fetch util_state for a specific month: all 'check' rows whose state_key falls
 * in [year-month-01 .. year-month-lastDay], plus the per-month 'note' row
 * (state_key = `${utilId}_${year}_${month0}`).
 *
 * month is 0-based (0 = Jan) to match JS Date conventions used by the matrix.
 */
export async function getUtilStateForMonth(utilId: string, year: number, month: number) {
  const supabase = await createClient();

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDate = `${year}-${pad2(month + 1)}-01`;
  const endDate = `${year}-${pad2(month + 1)}-${pad2(daysInMonth)}`;
  const noteKey = `${utilId}_${year}_${month}`;

  // Fetch check rows for the date range. state_key holds a YYYY-MM-DD string.
  const { data: checkRows, error: checkErr } = await supabase
    .from("util_state")
    .select("*")
    .eq("util_id", utilId)
    .eq("kind", "check")
    .gte("state_key", startDate)
    .lte("state_key", endDate);

  if (checkErr) throw checkErr;

  // Fetch the note row for this month (if any).
  const { data: noteRow, error: noteErr } = await supabase
    .from("util_state")
    .select("*")
    .eq("util_id", utilId)
    .eq("kind", "note")
    .eq("state_key", noteKey)
    .maybeSingle();

  if (noteErr) throw noteErr;

  return {
    checks: (checkRows ?? []) as UtilState[],
    note: noteRow?.value ?? "",
  };
}

/**
 * Toggle a single check cell. When `done` is true, upsert a check row
 * (value='1'); when false, delete the matching row.
 */
export async function toggleUtilCheck(
  utilId: string,
  itemIndex: number,
  dateKey: string,
  done: boolean
) {
  const supabase = await createClient();
  const idxStr = String(itemIndex);

  if (done) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("util_state").upsert(
      {
        util_id: utilId,
        kind: "check",
        item_index: idxStr,
        state_key: dateKey,
        value: "1",
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
      },
      { onConflict: "util_id,kind,item_index,state_key" }
    );

    if (error) {
      console.error("Error upserting util check:", error);
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("util_state")
      .delete()
      .eq("util_id", utilId)
      .eq("kind", "check")
      .eq("item_index", idxStr)
      .eq("state_key", dateKey);

    if (error) {
      console.error("Error deleting util check:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/utilitas/${utilId}`);
  return { success: true };
}

/**
 * Bulk-set ALL items done (kind='check', value='1') for a given date, a date
 * range, or a whole month. Fetches util_items to know every item index.
 *
 * opts:
 *   - date: a single YYYY-MM-DD
 *   - dateFrom / dateTo: an inclusive range (YYYY-MM-DD)
 *
 * At least one date option must be provided. For "whole month" the caller
 * should pass dateFrom=monthStart, dateTo=monthEnd.
 */
export async function bulkSetUtilCheck(
  utilId: string,
  opts: { date?: string; dateFrom?: string; dateTo?: string }
) {
  const { date, dateFrom, dateTo } = opts;

  const targetDates: string[] = [];
  if (date) targetDates.push(date);
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

  const supabase = await createClient();
  const { data: itemsRow, error: itemsErr } = await supabase
    .from("util_items")
    .select("items")
    .eq("util_id", utilId)
    .single();

  if (itemsErr) {
    if (itemsErr.code === "PGRST116") {
      return { count: 0, dates: targetDates.length, items: 0 };
    }
    throw itemsErr;
  }

  const items: Array<{ nama: string; ket?: string }> =
    (itemsRow as { items?: Array<{ nama: string; ket?: string }> })?.items ?? [];

  if (items.length === 0) {
    return { count: 0, dates: targetDates.length, items: 0 };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const nowIso = new Date().toISOString();
  const rows = items.flatMap((_, idx) =>
    targetDates.map((dateKey) => ({
      util_id: utilId,
      kind: "check" as const,
      item_index: String(idx),
      state_key: dateKey,
      value: "1",
      updated_by: user?.id,
      updated_at: nowIso,
    }))
  );

  const { error: upsertErr } = await supabase
    .from("util_state")
    .upsert(rows, { onConflict: "util_id,kind,item_index,state_key" });

  if (upsertErr) throw upsertErr;

  revalidatePath(`/utilitas/${utilId}`);
  return { count: rows.length, dates: targetDates.length, items: items.length };
}

/**
 * Save the per-month note (keyed by `${utilId}_${year}_${month0}`).
 */
export async function saveUtilNote(
  utilId: string,
  year: number,
  month: number,
  noteText: string
) {
  const stateKey = `${utilId}_${year}_${month}`;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("util_state").upsert(
    {
      util_id: utilId,
      kind: "note",
      item_index: null,
      state_key: stateKey,
      value: noteText,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "util_id,kind,item_index,state_key" }
  );

  if (error) {
    console.error("Error saving util note:", error);
    return { error: error.message };
  }

  // Note changes don't need a hard revalidate of the path data, but keep it for
  // consistency so server-rendered note text refreshes.
  revalidatePath(`/utilitas/${utilId}`);
  return { success: true };
}

/**
 * Rename a utilitas's label only (inline edit). Does not redirect.
 */
export async function renameUtil(utilId: string, label: string) {
  const supabase = await createClient();

  if (!label?.trim()) {
    return { error: "Label tidak boleh kosong" };
  }

  const { error } = await supabase
    .from("util_meta")
    .update({ label: label.trim(), updated_at: new Date().toISOString() })
    .eq("util_id", utilId);

  if (error) {
    console.error("Error renaming util:", error);
    return { error: error.message };
  }

  revalidatePath("/utilitas");
  revalidatePath(`/utilitas/${utilId}`);
  return { success: true };
}
