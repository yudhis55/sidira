"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Item,
  ItemCategory,
  ItemCondition,
} from "@/types/database";
import { createRiwayatRecord } from "@/lib/auth/riwayat";

export async function getItems(roomId: string): Promise<Item[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("room_id", roomId)
    .order("name");

  if (error) throw error;
  return data as Item[];
}

/**
 * Semua item lintas ruangan (untuk rekap/laporan global).
 * Dibatasi 2000 baris — volume kini 762.
 */
export async function getAllItems(): Promise<Item[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("room_id")
    .order("name")
    .limit(2000);

  if (error) throw error;
  return data as Item[];
}

export async function createItem(formData: FormData) {
  const supabase = await createClient();

  const room_id = formData.get("room_id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const merk = formData.get("merk") as string;
  const type = formData.get("model") as string;
  const spec = formData.get("spec") as string;
  const noreg = formData.get("noreg") as string;
  const year = formData.get("year") ? parseInt(formData.get("year") as string) : undefined;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const unit = formData.get("unit") as string || "unit";
  const std = formData.get("std") ? parseInt(formData.get("std") as string) : 0;
  const prio = (formData.get("prio") as string) || null;
  const condition = formData.get("condition") as string || "baik";
  const notes = formData.get("notes") as string;
  const index_in_room = parseInt(formData.get("index_in_room") as string) || 0;

  if (!room_id || !name || !category) {
    return { error: "Ruangan, nama, dan kategori harus diisi" };
  }

  const { error } = await supabase
    .from("items")
    .insert({
      room_id,
      name,
      category,
      merk,
      type,
      spec,
      noreg,
      year,
      quantity,
      unit,
      std,
      prio,
      condition,
      notes,
      index_in_room,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${room_id}`);
  return { success: true };
}

export async function updateItem(id: number, formData: FormData) {
  const supabase = await createClient();

  const room_id = formData.get("room_id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const merk = formData.get("merk") as string;
  const type = formData.get("model") as string;
  const spec = formData.get("spec") as string;
  const noreg = formData.get("noreg") as string;
  const year = formData.get("year") ? parseInt(formData.get("year") as string) : undefined;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const unit = formData.get("unit") as string || "unit";
  const std = formData.get("std") ? parseInt(formData.get("std") as string) : 0;
  const prio = (formData.get("prio") as string) || null;
  const condition = formData.get("condition") as string || "baik";
  const notes = formData.get("notes") as string;
  const index_in_room = parseInt(formData.get("index_in_room") as string) || 0;

  if (!name || !category) {
    return { error: "Nama dan kategori harus diisi" };
  }

  const { error } = await supabase
    .from("items")
    .update({
      name,
      category,
      merk,
      type,
      spec,
      noreg,
      year,
      quantity,
      unit,
      std,
      prio,
      condition,
      notes,
      index_in_room,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${room_id}`);
  return { success: true };
}

export async function deleteItem(id: number, roomId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${roomId}`);
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════
//  Inline edit / condition / bulk actions (Fase 2A)
// ══════════════════════════════════════════════════════════════════════

/**
 * Update only the condition field of a single item.
 */
export async function updateItemCondition(
  itemId: number,
  roomId: string,
  condition: ItemCondition
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("items")
    .update({ condition })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${roomId}`);
  return { success: true };
}

/**
 * Bulk-set condition for all items in a room, optionally filtered by category.
 */
export async function bulkSetCondition(
  roomId: string,
  condition: ItemCondition,
  category?: ItemCategory
) {
  const supabase = await createClient();

  let query = supabase
    .from("items")
    .update({ condition })
    .eq("room_id", roomId);

  if (category) {
    query = query.eq("category", category);
  }

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${roomId}`);
  return { success: true };
}

/**
 * Generic single-field update for inline edits.
 * Only allows a curated set of fields to prevent mass-assignment.
 */
export async function updateItemField(
  itemId: number,
  roomId: string,
  field: string,
  value: string | number
) {
  // Map of fields allowed for generic single-field inline edits.
  // Frontend field name -> DB column name.
  // (Defined inside the function so the "use server" module only exports
  // async functions, per Next.js App Router requirement.)
  const ALLOWED_FIELDS: Record<string, string> = {
    year: "year",
    merk: "merk",
    noreg: "noreg",
    quantity: "quantity",
    notes: "notes",
    spec: "spec",
    std: "std",
    prio: "prio",
    condition: "condition",
    unit: "unit",
  };

  const dbField = ALLOWED_FIELDS[field];
  if (!dbField) {
    return { error: `Field "${field}" tidak diizinkan untuk diupdate` };
  }

  const supabase = await createClient();

  // Coerce numeric fields to numbers; empty strings -> null for nullable cols.
  let dbValue: string | number | null = value;
  if (["year", "quantity", "std"].includes(dbField)) {
    if (value === "" || value === null) {
      dbValue = ["quantity"].includes(dbField) ? 0 : null;
    } else {
      dbValue = typeof value === "number" ? value : parseInt(value, 10);
      if (Number.isNaN(dbValue as number)) {
        dbValue = ["quantity"].includes(dbField) ? 0 : null;
      }
    }
  } else if (dbField === "prio" || dbField === "condition") {
    dbValue = value === "" ? null : value;
  } else {
    dbValue = value === "" ? null : value;
  }

  const { error } = await supabase
    .from("items")
    .update({ [dbField]: dbValue })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${roomId}`);
  return { success: true };
}

/**
 * Move a single item to another room and log the movement to riwayat_pindah.
 */
export async function moveItem(
  itemId: number,
  fromRoomId: string,
  toRoomId: string,
  itemName: string,
  category: string,
  user?: { id?: string }
) {
  if (fromRoomId === toRoomId) {
    return { error: "Ruangan asal dan tujuan sama" };
  }

  const supabase = await createClient();

  // Fetch room names for the audit record.
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name")
    .in("id", [fromRoomId, toRoomId]);

  const fromName = rooms?.find((r) => r.id === fromRoomId)?.name || fromRoomId;
  const toName = rooms?.find((r) => r.id === toRoomId)?.name || toRoomId;

  const { error } = await supabase
    .from("items")
    .update({ room_id: toRoomId })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  await createRiwayatRecord({
    nama: itemName,
    kat: category,
    dari: fromRoomId,
    ke: toRoomId,
    dari_name: fromName,
    ke_name: toName,
    user_id: user?.id,
  });

  revalidatePath(`/inventaris/${fromRoomId}`);
  revalidatePath(`/inventaris/${toRoomId}`);
  return { success: true };
}

/**
 * Batch-move multiple items to another room. Each moved item is logged.
 */
export async function moveItems(
  itemIds: number[],
  fromRoomId: string,
  toRoomId: string,
  user?: { id?: string }
) {
  if (fromRoomId === toRoomId) {
    return { error: "Ruangan asal dan tujuan sama" };
  }
  if (itemIds.length === 0) {
    return { error: "Tidak ada item dipilih" };
  }

  const supabase = await createClient();

  // Fetch the items being moved (for audit names) before updating.
  const { data: items } = await supabase
    .from("items")
    .select("id, name, category")
    .in("id", itemIds)
    .eq("room_id", fromRoomId);

  const { error } = await supabase
    .from("items")
    .update({ room_id: toRoomId })
    .in("id", itemIds)
    .eq("room_id", fromRoomId);

  if (error) {
    return { error: error.message };
  }

  // Fetch room names once.
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name")
    .in("id", [fromRoomId, toRoomId]);
  const fromName = rooms?.find((r) => r.id === fromRoomId)?.name || fromRoomId;
  const toName = rooms?.find((r) => r.id === toRoomId)?.name || toRoomId;

  // Log each moved item.
  if (items && items.length > 0) {
    const records = items.map((it) => ({
      ts: new Date().toISOString(),
      nama: it.name,
      kat: it.category,
      dari: fromRoomId,
      ke: toRoomId,
      dari_name: fromName,
      ke_name: toName,
      user_id: user?.id || null,
    }));
    await supabase.from("riwayat_pindah").insert(records);
  }

  revalidatePath(`/inventaris/${fromRoomId}`);
  revalidatePath(`/inventaris/${toRoomId}`);
  return { success: true };
}
