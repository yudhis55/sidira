"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RiwayatPindah {
  id: number;
  ts: string;
  nama: string;
  kat: string;
  dari: string;
  ke: string;
  dari_name: string;
  ke_name: string;
  user_id: string;
  created_at: string;
}

export interface RiwayatFilter {
  start_date?: string;
  end_date?: string;
  room_id?: string;
  kategori?: string;
}

export async function getRiwayatList(filter?: RiwayatFilter): Promise<RiwayatPindah[]> {
  const supabase = await createClient();

  let query = supabase
    .from("riwayat_pindah")
    .select("*")
    .order("ts", { ascending: false });

  if (filter?.start_date) {
    query = query.gte("ts", filter.start_date);
  }
  if (filter?.end_date) {
    query = query.lte("ts", filter.end_date);
  }
  if (filter?.room_id) {
    query = query.or(`dari.eq.${filter.room_id},ke.eq.${filter.room_id}`);
  }
  if (filter?.kategori) {
    query = query.eq("kat", filter.kategori);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as RiwayatPindah[];
}

export async function createRiwayat(formData: FormData) {
  const supabase = await createClient();

  const nama = formData.get("nama") as string;
  const kat = formData.get("kat") as string;
  const dari = formData.get("dari") as string;
  const ke = formData.get("ke") as string;
  const dari_name = formData.get("dari_name") as string;
  const ke_name = formData.get("ke_name") as string;

  if (!nama || !kat || !dari || !ke) {
    return { error: "Semua field wajib diisi" };
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User tidak terautentikasi" };
  }

  const { error } = await supabase.from("riwayat_pindah").insert({
    ts: new Date().toISOString(),
    nama,
    kat,
    dari,
    ke,
    dari_name,
    ke_name,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating riwayat:", error);
    return { error: error.message };
  }

  revalidatePath("/riwayat");
  return { success: true };
}

export async function deleteRiwayat(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("riwayat_pindah").delete().eq("id", id);

  if (error) {
    console.error("Error deleting riwayat:", error);
    return { error: error.message };
  }

  revalidatePath("/riwayat");
  return { success: true };
}
