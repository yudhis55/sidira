"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Tulis satu baris util_state via RPC `upsert_util_state` (SECURITY DEFINER).
 *
 * JANGAN pakai PostgREST `.upsert(..., { onConflict })` di tabel ini:
 * constraint uniknya adalah expression index
 * `(util_id, kind, COALESCE(item_index,''), state_key)` sehingga PostgREST
 * selalu 42P10. RPC menangani konfliknya dengan benar di sisi server.
 */
async function rpcUpsertUtilState(args: {
  utilId: string;
  kind: "check" | "note";
  itemIndex: string | null;
  stateKey: string;
  value: string;
}): Promise<{ error?: string }> {
  await requireRole(["admin", "editor"]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.rpc("upsert_util_state", {
    p_util_id: args.utilId,
    p_kind: args.kind,
    p_item_index: args.itemIndex,
    p_state_key: args.stateKey,
    p_value: args.value,
    p_user_id: user?.id ?? null,
  });
  if (error) {
    console.error("Error upsert util state:", error);
    return { error: error.message };
  }
  revalidatePath(`/utilitas/${args.utilId}`);
  return {};
}

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
  // Via RPC (lihat rpcUpsertUtilState) — onConflict langsung 42P10.
  const res = await rpcUpsertUtilState({
    utilId,
    kind,
    itemIndex: itemIndex ?? null,
    stateKey,
    value,
  });
  if (res.error) return { error: res.error };

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
    const res = await rpcUpsertUtilState({
      utilId,
      kind: "check",
      itemIndex: idxStr,
      stateKey: dateKey,
      value: "1",
    });

    if (res.error) {
      return { error: res.error };
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

  // Via RPC per baris (lihat rpcUpsertUtilState) — PostgREST onConflict
  // langsung 42P10 di tabel ini. Diparalel karena jumlah baris kecil
  // (item × tanggal; panggil dengan rentang wajar dari UI).
  await requireRole(["admin", "editor"]);
  const jobs: Promise<{ error?: string }>[] = [];
  for (let idx = 0; idx < items.length; idx++) {
    for (const dateKey of targetDates) {
      jobs.push(
        rpcUpsertUtilState({
          utilId,
          kind: "check",
          itemIndex: String(idx),
          stateKey: dateKey,
          value: "1",
        })
      );
    }
  }
  const results = await Promise.all(jobs);
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(failed.error);

  revalidatePath(`/utilitas/${utilId}`);
  return {
    count: jobs.length,
    dates: targetDates.length,
    items: items.length,
  };
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

  // Via RPC (lihat rpcUpsertUtilState) — onConflict langsung 42P10,
  // apalagi item_index NULL tak pernah cocok sebagai konflik.
  const res = await rpcUpsertUtilState({
    utilId,
    kind: "note",
    itemIndex: null,
    stateKey,
    value: noteText,
  });
  if (res.error) return { error: res.error };

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
