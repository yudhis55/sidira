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

/**
 * Fetch all SBBK including their items JSONB. Used by the list page
 * which needs item counts and totals for the rekap/total nilai display.
 */
export async function getSbbkListFull(): Promise<Sbbk[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sbbk")
    .select("id, no, tgl, kepada, jenis, anggaran, ket_umum, items, created_at, updated_at")
    .order("tgl", { ascending: false });

  if (error) throw error;
  const rows = (data || []) as Array<Record<string, unknown>>;
  return rows.map((d) => ({
    id: d.id as string,
    no: d.no as string,
    tgl: d.tgl as string,
    kepada: d.kepada as string,
    jenis: (d.jenis as string) ?? undefined,
    anggaran: (d.anggaran as string) ?? undefined,
    ket_umum: (d.ket_umum as string) ?? undefined,
    items: Array.isArray(d.items) ? (d.items as SbbkItem[]) : [],
    created_at: d.created_at as string,
    updated_at: d.updated_at as string,
  })) as Sbbk[];
}

/**
 * Build a CSV string of all SBBK (one row per item). Fields are
 * properly escaped (quoted when they contain commas, quotes, or newlines).
 * The client triggers the download of the returned string.
 */
export async function exportSbbkCSV(): Promise<string> {
  const list = await getSbbkListFull();

  const header = [
    "No SBBK",
    "Tanggal",
    "Kepada",
    "Jenis",
    "Anggaran",
    "Nama Barang",
    "Merk",
    "Qty",
    "Satuan",
    "Harga Satuan",
    "Jumlah",
    "Keterangan",
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

  for (const d of list) {
    const items = d.items && d.items.length > 0 ? d.items : [];
    if (items.length === 0) {
      rows.push(
        [
          escape(d.no),
          escape(fmtDate(d.tgl)),
          escape(d.kepada),
          escape(d.jenis),
          escape(d.anggaran),
          escape(""),
          escape(""),
          escape(0),
          escape(""),
          escape(0),
          escape(0),
          escape(""),
        ].join(",")
      );
      continue;
    }
    for (const it of items) {
      rows.push(
        [
          escape(d.no),
          escape(fmtDate(d.tgl)),
          escape(d.kepada),
          escape(d.jenis),
          escape(d.anggaran),
          escape(it.nama),
          escape(it.merk),
          escape(it.qty),
          escape(it.satuan),
          escape(it.harga),
          escape(it.total),
          escape(""),
        ].join(",")
      );
    }
  }

  return rows.join("\r\n");
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

  const updateData: Record<string, unknown> = { ...sbbkWithoutItems };
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
