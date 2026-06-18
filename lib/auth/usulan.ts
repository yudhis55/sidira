"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface UsulanItem {
  nama: string;
  kategori: string;
  prioritas: "wajib" | "penting" | "pendukung";
  qty: number;
  satuan: string;
  harga: number;
  total: number;
  status: "pending" | "approved" | "rejected";
  keterangan?: string;
}

export interface UsulanPayload {
  items: UsulanItem[];
}

export interface Usulan {
  id: number;
  room_id: string;
  payload: UsulanPayload;
  created_at: string;
  updated_at: string;
  // Joined data
  rooms?: {
    name: string;
    icon: string;
  };
}

export async function getUsulanList() {
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

export async function getUsulanById(id: number) {
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

export async function getUsulanByRoom(roomId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("usulan")
    .select("*")
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

  const items = JSON.parse(itemsJson);

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

  const items = JSON.parse(itemsJson);

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
  status: "pending" | "approved" | "rejected"
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
