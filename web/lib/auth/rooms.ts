"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type { Room } from "@/types/database";

/**
 * Daftar ruangan — di-cache 60 detik karena dibaca di hampir tiap navigasi
 * (sidebar, daftar, detail). Pakai admin client (tanpa cookies) agar
 * cacheable; isi identik untuk semua role (SELECT rooms terbuka).
 * Setiap mutasi di bawah memanggil revalidateTag("rooms", "default").
 */
export const getRooms = unstable_cache(
  async (): Promise<Room[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("name");

    if (error) throw error;
    return data as Room[];
  },
  ["rooms"],
  { revalidate: 60, tags: ["rooms"] }
);

export async function getRoomById(id: string): Promise<Room> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Room;
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
  revalidateTag("rooms", "default");
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
  revalidateTag("rooms", "default");
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
  revalidatePath(`/inventaris/${id}`);
  revalidateTag("rooms", "default");
  return { success: true };
}

// ══════════════════════════════════════════════════════════════════════
//  Inline edit actions (Fase 2A)
// ══════════════════════════════════════════════════════════════════════

/**
 * Update only the Penanggung Jawab (PJ) name of a room (inline edit).
 */
export async function updateRoomPj(roomId: string, pj: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("rooms")
    .update({ pj: pj || null })
    .eq("id", roomId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${roomId}`);
  revalidatePath("/inventaris");
  revalidateTag("rooms", "default");
  return { success: true };
}

/**
 * Update only the name of a room (inline edit).
 */
export async function updateRoomName(roomId: string, name: string) {
  if (!name.trim()) {
    return { error: "Nama ruangan tidak boleh kosong" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("rooms")
    .update({ name: name.trim() })
    .eq("id", roomId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventaris/${roomId}`);
  revalidatePath("/inventaris");
  revalidateTag("rooms", "default");
  return { success: true };
}
