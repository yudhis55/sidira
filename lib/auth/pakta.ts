"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface PaktaItem {
  item_id: number;
  nama: string;
  kategori: string;
  kondisi: string;
  keterangan?: string;
}

export interface Pakta {
  id: string;
  nomor: string;
  tanggal: string;
  pj_nama: string;
  pj_jabatan?: string;
  pj_nip?: string;
  lokasi?: string;
  items: PaktaItem[];
  created_at: string;
  updated_at: string;
}

export async function getPaktaList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pakta")
    .select("*")
    .order("tanggal", { ascending: false });

  if (error) throw error;
  return data as Pakta[];
}

export async function getPaktaById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pakta")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Pakta;
}

export async function createPakta(formData: FormData) {
  const supabase = await createClient();

  const id = `pakta-${Date.now()}`;
  const nomor = formData.get("nomor") as string;
  const tanggal = formData.get("tanggal") as string;
  const pj_nama = formData.get("pj_nama") as string;
  const pj_jabatan = formData.get("pj_jabatan") as string;
  const pj_nip = formData.get("pj_nip") as string;
  const lokasi = formData.get("lokasi") as string;
  const itemsJson = formData.get("items") as string;

  if (!nomor || !tanggal || !pj_nama || !itemsJson) {
    return { error: "Nomor, tanggal, penanggung jawab, dan daftar barang wajib diisi" };
  }

  const items = JSON.parse(itemsJson);

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Minimal satu barang harus ditambahkan" };
  }

  const { error } = await supabase.from("pakta").insert({
    id,
    nomor,
    tanggal,
    pj_nama,
    pj_jabatan,
    pj_nip,
    lokasi,
    items,
  });

  if (error) {
    console.error("Error creating pakta:", error);
    return { error: error.message };
  }

  revalidatePath("/pakta");
  redirect(`/pakta/${id}`);
}

export async function updatePakta(id: string, formData: FormData) {
  const supabase = await createClient();

  const nomor = formData.get("nomor") as string;
  const tanggal = formData.get("tanggal") as string;
  const pj_nama = formData.get("pj_nama") as string;
  const pj_jabatan = formData.get("pj_jabatan") as string;
  const pj_nip = formData.get("pj_nip") as string;
  const lokasi = formData.get("lokasi") as string;
  const itemsJson = formData.get("items") as string;

  if (!nomor || !tanggal || !pj_nama || !itemsJson) {
    return { error: "Nomor, tanggal, penanggung jawab, dan daftar barang wajib diisi" };
  }

  const items = JSON.parse(itemsJson);

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Minimal satu barang harus ditambahkan" };
  }

  const { error } = await supabase
    .from("pakta")
    .update({
      nomor,
      tanggal,
      pj_nama,
      pj_jabatan,
      pj_nip,
      lokasi,
      items,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating pakta:", error);
    return { error: error.message };
  }

  revalidatePath("/pakta");
  revalidatePath(`/pakta/${id}`);
  redirect(`/pakta/${id}`);
}

export async function deletePakta(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("pakta").delete().eq("id", id);

  if (error) {
    console.error("Error deleting pakta:", error);
    return { error: error.message };
  }

  revalidatePath("/pakta");
  redirect("/pakta");
}

export async function generatePaktaNumber() {
  const supabase = await createClient();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  // Get last pakta number for this month
  const { data } = await supabase
    .from("pakta")
    .select("nomor")
    .like("nomor", `PAKTA/${year}/${month}/%`)
    .order("created_at", { ascending: false })
    .limit(1);

  let sequence = 1;
  if (data && data.length > 0) {
    const lastNumber = data[0].nomor;
    const parts = lastNumber.split("/");
    if (parts.length === 4) {
      sequence = parseInt(parts[3]) + 1;
    }
  }

  return `PAKTA/${year}/${month}/${sequence}`;
}
