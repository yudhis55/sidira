"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Favorite {
  id: number;
  user_id: string;
  room_id: string;
  position: number;
  created_at: string;
}

export async function getFavorites(): Promise<Favorite[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return data as Favorite[];
}

export async function addFavorite(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Get current max position
  const { data: existing } = await supabase
    .from("user_favorites")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("user_favorites").insert({
    user_id: user.id,
    room_id: roomId,
    position: nextPosition,
  });

  if (error) {
    console.error("Error adding favorite:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeFavorite(roomId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("room_id", roomId);

  if (error) {
    console.error("Error removing favorite:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function reorderFavorites(orderedRoomIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Update position for each room in order
  const updates = orderedRoomIds.map((roomId, index) => ({
    user_id: user.id,
    room_id: roomId,
    position: index,
  }));

  const { error } = await supabase.from("user_favorites").upsert(updates, {
    onConflict: "user_id,room_id",
  });

  if (error) {
    console.error("Error reordering favorites:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
