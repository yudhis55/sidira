"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getRoomById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRoom(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string || "🏥";

  if (!name) {
    return { error: "Nama ruangan harus diisi" };
  }

  const { error } = await supabase
    .from("rooms")
    .insert({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      icon,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inventaris");
  return { success: true };
}

export async function updateRoom(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string || "🏥";

  if (!name) {
    return { error: "Nama ruangan harus diisi" };
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      name,
      description,
      icon,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inventaris");
  return { success: true };
}

export async function deleteRoom(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inventaris");
  return { success: true };
}
