"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getItems(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("room_id", roomId)
    .order("name");

  if (error) throw error;
  return data;
}

export async function createItem(formData: FormData) {
  const supabase = await createClient();

  const room_id = formData.get("room_id") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const merk = formData.get("merk") as string;
  const type = formData.get("model") as string;
  const year = formData.get("year") ? parseInt(formData.get("year") as string) : undefined;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const unit = formData.get("unit") as string || "unit";
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
      year,
      quantity,
      unit,
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
  const year = formData.get("year") ? parseInt(formData.get("year") as string) : undefined;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const unit = formData.get("unit") as string || "unit";
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
      year,
      quantity,
      unit,
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
