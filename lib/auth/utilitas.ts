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
