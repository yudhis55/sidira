"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  Usulan,
  UsulanItem,
  UsulanPayload,
  UsulanStatus,
} from "@/lib/usulan-types";
import {
  USULAN_KATEGORI_LABELS,
  USULAN_PRIORITAS_LABELS,
  USULAN_STATUS_LABELS,
} from "@/lib/usulan-types";

// ══════════════════════════════════════════════════════════════════════
//  Types & labels live in @/lib/usulan-types (not a "use server" file)
//  because "use server" modules can only export async functions.
//  Import types/labels from "@/lib/usulan-types" directly.
// ══════════════════════════════════════════════════════════════════════

export async function getUsulanList(): Promise<Usulan[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("usulan")
    .select(`
      *,
      rooms (
        name,
        icon
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Usulan[];
}

export async function getUsulanById(id: number): Promise<Usulan> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("usulan")
    .select(`
      *,
      rooms (
        name,
        icon
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Usulan;
}

export async function getUsulanByRoom(roomId: string): Promise<Usulan[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("usulan")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Usulan[];
}

/**
 * Fetch all usulan for a room joined with the room's name & icon.
 * Used by the inventaris room detail page's per-room usulan section.
 */
export async function getUsulanByRoomWithRoomInfo(
  roomId: string
): Promise<Usulan[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("usulan")
    .select(`
      *,
      rooms (
        name,
        icon
      )
    `)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Usulan[];
}

export async function createUsulan(formData: FormData) {
  const supabase = await createClient();

  const room_id = formData.get("room_id") as string;
  const itemsJson = formData.get("items") as string;

  if (!room_id || !itemsJson) {
    return { error: "Ruangan dan daftar barang wajib diisi" };
  }

  const items: UsulanItem[] = JSON.parse(itemsJson);

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Minimal satu barang harus ditambahkan" };
  }

  const payload: UsulanPayload = { items };

  const { error } = await supabase.from("usulan").insert({
    room_id,
    payload,
  });

  if (error) {
    console.error("Error creating usulan:", error);
    return { error: error.message };
  }

  revalidatePath("/usulan");
  redirect("/usulan");
}

export async function updateUsulan(id: number, formData: FormData) {
  const supabase = await createClient();

  const room_id = formData.get("room_id") as string;
  const itemsJson = formData.get("items") as string;

  if (!room_id || !itemsJson) {
    return { error: "Ruangan dan daftar barang wajib diisi" };
  }

  const items: UsulanItem[] = JSON.parse(itemsJson);

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Minimal satu barang harus ditambahkan" };
  }

  const payload: UsulanPayload = { items };

  const { error } = await supabase
    .from("usulan")
    .update({
      room_id,
      payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating usulan:", error);
    return { error: error.message };
  }

  revalidatePath("/usulan");
  revalidatePath(`/usulan/${id}`);
  redirect(`/usulan/${id}`);
}

export async function deleteUsulan(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("usulan").delete().eq("id", id);

  if (error) {
    console.error("Error deleting usulan:", error);
    return { error: error.message };
  }

  revalidatePath("/usulan");
  redirect("/usulan");
}

export async function updateItemStatus(
  usulanId: number,
  itemIndex: number,
  status: UsulanStatus
) {
  const supabase = await createClient();

  // Get current usulan
  const usulan = await getUsulanById(usulanId);
  if (!usulan) return { error: "Usulan tidak ditemukan" };

  // Update specific item status
  const newItems = [...usulan.payload.items];
  if (newItems[itemIndex]) {
    newItems[itemIndex].status = status;
  }

  const payload: UsulanPayload = { items: newItems };

  const { error } = await supabase
    .from("usulan")
    .update({
      payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usulanId);

  if (error) {
    console.error("Error updating item status:", error);
    return { error: error.message };
  }

  revalidatePath("/usulan");
  revalidatePath(`/usulan/${usulanId}`);
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════
//  CSV export — one row per item, optionally filtered by room.
// ══════════════════════════════════════════════════════════════════════
/**
 * Build a CSV string of usulan (one row per item). Fields are properly
 * escaped (quoted when they contain commas, quotes, or newlines).
 * When `roomId` is provided, only usulan for that room are included.
 */
export async function exportUsulanCSV(roomId?: string): Promise<string> {
  const list = roomId
    ? await getUsulanByRoomWithRoomInfo(roomId)
    : await getUsulanList();

  const header = [
    "Ruangan",
    "Nama Barang",
    "Kategori",
    "Jumlah",
    "Satuan",
    "Prioritas",
    "Status",
    "Harga Satuan",
    "Total",
    "Keterangan",
    "Tgl Diajukan",
  ];

  const escape = (val: unknown): string => {
    const s = val == null ? "" : String(val);
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const fmtDate = (iso: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const rows: string[] = [header.join(",")];

  for (const u of list) {
    const roomName = u.rooms?.name || u.room_id || "";
    const items = u.payload?.items || [];
    for (const it of items) {
      rows.push(
        [
          escape(roomName),
          escape(it.nama),
          escape(USULAN_KATEGORI_LABELS[it.kategori] || it.kategori),
          escape(it.qty),
          escape(it.satuan),
          escape(USULAN_PRIORITAS_LABELS[it.prioritas] || it.prioritas),
          escape(USULAN_STATUS_LABELS[it.status] || it.status),
          escape(it.harga),
          escape(it.total),
          escape(it.keterangan || ""),
          escape(fmtDate(u.created_at)),
        ].join(",")
      );
    }
  }

  return rows.join("\r\n");
}
