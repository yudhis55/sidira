"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SbbkItem {
  nama: string;
  merk: string;
  qty: number;
  satuan: string;
  harga: number;
  total: number;
}

export interface Sbbk {
  id: string;
  no: string;
  tgl: string;
  kepada: string;
  jenis?: string;
  anggaran?: string;
  ket_umum?: string;
  items: SbbkItem[];
  created_at: string;
  updated_at: string;
}

export async function getSbbkList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sbbk")
    .select(`
      id,
      no,
      tgl,
      kepada,
      jenis,
      anggaran,
      ket_umum,
      created_at,
      updated_at
    `)
    .order("tgl", { ascending: false });

  if (error) throw error;
  return data as Omit<Sbbk, "items">[];
}

export async function getSbbkById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sbbk")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  // Parse items JSONB
  const items = data.items || [];

  return {
    ...data,
    items,
  } as Sbbk;
}

export async function createSbbk(sbbkData: Omit<Sbbk, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Generate ID
  const id = `sbbk-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const { items, ...sbbkWithoutItems } = sbbkData;

  const { data, error } = await supabase
    .from("sbbk")
    .insert({
      id,
      no: sbbkWithoutItems.no,
      tgl: sbbkWithoutItems.tgl,
      kepada: sbbkWithoutItems.kepada,
      jenis: sbbkWithoutItems.jenis,
      anggaran: sbbkWithoutItems.anggaran,
      ket_umum: sbbkWithoutItems.ket_umum,
      items: items, // JSONB, tidak perlu stringify
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/sbbk");
  return data;
}

export async function updateSbbk(id: string, sbbkData: Partial<Omit<Sbbk, "id" | "created_at" | "updated_at">>) {
  const supabase = await createClient();

  const { items, ...sbbkWithoutItems } = sbbkData;

  const updateData: any = { ...sbbkWithoutItems };
  if (items) {
    updateData.items = items; // JSONB, tidak perlu stringify
  }

  const { data, error } = await supabase
    .from("sbbk")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/sbbk");
  revalidatePath(`/sbbk/${id}`);
  return data;
}

export async function deleteSbbk(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sbbk")
    .delete()
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/sbbk");
}

export async function generateSbbkNumber() {
  const supabase = await createClient();

  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  // Get last SBBK number for this month
  const { data } = await supabase
    .from("sbbk")
    .select("no")
    .like("no", `SBBK/${year}/${month}/%`)
    .order("no", { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = parseInt(data[0].no.split("/")[3]);
    nextNumber = lastNumber + 1;
  }

  return `SBBK/${year}/${month}/${String(nextNumber).padStart(4, "0")}`;
}
