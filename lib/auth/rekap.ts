"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  PemegangInventaris,
  AsetPemegang,
  PemegangStatus,
  AsetPemegangJenis,
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";

/**
 * Server actions untuk modul Rekap Pemegang Inventaris.
 *
 * Diport dari GAS legacy `riBuild` / `riRenderTable`. Dua tabel:
 *   - pemegang_inventaris (orang pemegang aset)
 *   - aset_pemegang       (aset yang dipegang, 4 jenis: kendaraan/laptop/alat/rumah)
 *
 * Pakta matching: pemegang dianggap "sudah pakta" bila ada baris di tabel
 * `pakta` dengan nama yang sama (case-insensitive, trim).
 */

const HARI_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

// ══════════════════════════════════════════════════════════════════════
//  READ — Pemegang
// ══════════════════════════════════════════════════════════════════════

/** Ambil daftar seluruh pemegang, urut nama. */
export async function getPemegangList(): Promise<PemegangInventaris[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pemegang_inventaris")
    .select("*")
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data || []) as PemegangInventaris[];
}

/** Ambil satu pemegang berdasarkan id. */
export async function getPemegangById(
  id: string,
): Promise<PemegangInventaris | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pemegang_inventaris")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // tidak ditemukan
    throw error;
  }
  return data as PemegangInventaris;
}

// ══════════════════════════════════════════════════════════════════════
//  READ — Aset
// ══════════════════════════════════════════════════════════════════════

/** Ambil aset untuk satu pemegang, urut jenis. */
export async function getAsetByPemegang(
  pemegangId: string,
): Promise<AsetPemegang[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("aset_pemegang")
    .select("*")
    .eq("pemegang_id", pemegangId)
    .order("jenis", { ascending: true });

  if (error) throw error;
  return (data || []) as AsetPemegang[];
}

/**
 * Ambil seluruh aset_pemegang, kembalikan sebagai map pemegang_id → AsetPemegang[].
 * Dipakai oleh halaman daftar agar cukup satu query untuk seluruh baris.
 */
export async function getAllAsetGrouped(): Promise<
  Record<string, AsetPemegang[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("aset_pemegang")
    .select("*")
    .order("jenis", { ascending: true });

  if (error) throw error;

  const map: Record<string, AsetPemegang[]> = {};
  for (const row of data || []) {
    const r = row as AsetPemegang;
    if (!map[r.pemegang_id]) map[r.pemegang_id] = [];
    map[r.pemegang_id].push(r);
  }
  return map;
}

// ══════════════════════════════════════════════════════════════════════
//  WRITE — Pemegang
// ══════════════════════════════════════════════════════════════════════

export interface PemegangInput {
  nama: string;
  nip?: string;
  jabatan?: string;
  status: PemegangStatus;
}

/** Buat pemegang baru. Revalidate /rekap. Kembalikan record yang dibuat. */
export async function createPemegang(
  data: PemegangInput,
): Promise<PemegangInventaris> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");

  if (!data.nama || data.nama.trim() === "") {
    throw new Error("Nama pemegang wajib diisi");
  }
  if (data.status !== "PNS" && data.status !== "PPPK") {
    throw new Error("Status harus PNS atau PPPK");
  }

  const { data: inserted, error } = await supabase
    .from("pemegang_inventaris")
    .insert({
      nama: data.nama.trim(),
      nip: data.nip?.trim() || null,
      jabatan: data.jabatan?.trim() || null,
      status: data.status,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating pemegang:", error);
    throw error;
  }

  revalidatePath("/rekap");
  return inserted as PemegangInventaris;
}

/** Update pemegang. Revalidate /rekap + /rekap/[id]. */
export async function updatePemegang(
  id: string,
  data: Partial<PemegangInput>,
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.nama !== undefined) updateData.nama = data.nama.trim();
  if (data.nip !== undefined) updateData.nip = data.nip?.trim() || null;
  if (data.jabatan !== undefined)
    updateData.jabatan = data.jabatan?.trim() || null;
  if (data.status !== undefined) {
    if (data.status !== "PNS" && data.status !== "PPPK") {
      throw new Error("Status harus PNS atau PPPK");
    }
    updateData.status = data.status;
  }

  const { error } = await supabase
    .from("pemegang_inventaris")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating pemegang:", error);
    throw error;
  }

  revalidatePath("/rekap");
  revalidatePath(`/rekap/${id}`);
}

/** Hapus pemegang (aset terkait ter-cascade via FK). Redirect /rekap. */
export async function deletePemegang(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pemegang_inventaris")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting pemegang:", error);
    throw error;
  }

  revalidatePath("/rekap");
  redirect("/rekap");
}

// ══════════════════════════════════════════════════════════════════════
//  WRITE — Aset
// ══════════════════════════════════════════════════════════════════════

export interface AsetInput {
  jenis: AsetPemegangJenis;
  merk?: string;
  type?: string;
  tahun?: string;
  nopol?: string;
  harga?: string;
  ket?: string;
}

/** Tambah aset ke pemegang. Revalidate /rekap + /rekap/[id]. */
export async function addAset(
  pemegangId: string,
  data: AsetInput,
): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");

  const validJenis: AsetPemegangJenis[] = [
    "kendaraan",
    "laptop",
    "alat",
    "rumah",
  ];
  if (!validJenis.includes(data.jenis)) {
    throw new Error("Jenis aset tidak valid");
  }

  const { error } = await supabase.from("aset_pemegang").insert({
    pemegang_id: pemegangId,
    jenis: data.jenis,
    merk: data.merk?.trim() || null,
    type: data.type?.trim() || null,
    tahun: data.tahun?.trim() || null,
    nopol: data.nopol?.trim() || null,
    harga: data.harga?.trim() || null,
    ket: data.ket?.trim() || null,
  });

  if (error) {
    console.error("Error adding aset:", error);
    throw error;
  }

  revalidatePath("/rekap");
  revalidatePath(`/rekap/${pemegangId}`);
}

/** Update aset. Revalidate /rekap + /rekap/[pemegangId]. */
export async function updateAset(
  asetId: number,
  data: Partial<AsetInput>,
  pemegangId?: string,
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.jenis !== undefined) updateData.jenis = data.jenis;
  if (data.merk !== undefined) updateData.merk = data.merk?.trim() || null;
  if (data.type !== undefined) updateData.type = data.type?.trim() || null;
  if (data.tahun !== undefined) updateData.tahun = data.tahun?.trim() || null;
  if (data.nopol !== undefined) updateData.nopol = data.nopol?.trim() || null;
  if (data.harga !== undefined) updateData.harga = data.harga?.trim() || null;
  if (data.ket !== undefined) updateData.ket = data.ket?.trim() || null;

  const { error } = await supabase
    .from("aset_pemegang")
    .update(updateData)
    .eq("id", asetId);

  if (error) {
    console.error("Error updating aset:", error);
    throw error;
  }

  revalidatePath("/rekap");
  if (pemegangId) revalidatePath(`/rekap/${pemegangId}`);
}

/** Hapus aset. Revalidate /rekap + /rekap/[pemegangId]. */
export async function deleteAset(
  asetId: number,
  pemegangId?: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("aset_pemegang")
    .delete()
    .eq("id", asetId);

  if (error) {
    console.error("Error deleting aset:", error);
    throw error;
  }

  revalidatePath("/rekap");
  if (pemegangId) revalidatePath(`/rekap/${pemegangId}`);
}

// ══════════════════════════════════════════════════════════════════════
//  PAKTA MATCHING
// ══════════════════════════════════════════════════════════════════════

/** Cek apakah ada pakta dengan nama yang cocok (case-insensitive, trim). */
export async function hasPakta(nama: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pakta")
    .select("id, nama")
    .ilike("nama", nama.trim());

  if (error) throw error;
  return (data || []).some(
    (p) =>
      (p.nama || "").toLowerCase().trim() === nama.toLowerCase().trim(),
  );
}

export interface PaktaStatus {
  hasPakta: boolean;
  paktaId: string | null;
}

/**
 * Bangun map pemegang_id → { hasPakta, paktaId }.
 * Pendekatan efisien: ambil seluruh pakta (id+nama) + seluruh pemegang,
 * lalu cocokkan nama di JS (case-insensitive, trim).
 */
export async function getPaktaStatusMap(): Promise<
  Record<string, PaktaStatus>
> {
  const supabase = await createClient();

  const [{ data: paktaRows, error: paktaErr }, { data: pemegangRows, error: pemegangErr }] =
    await Promise.all([
      supabase.from("pakta").select("id, nama"),
      supabase.from("pemegang_inventaris").select("id, nama"),
    ]);

  if (paktaErr) throw paktaErr;
  if (pemegangErr) throw pemegangErr;

  // Index pakta by normalized nama → id (first match wins)
  const paktaIndex = new Map<string, string>();
  for (const p of paktaRows || []) {
    const key = (p.nama || "").toLowerCase().trim();
    if (key && !paktaIndex.has(key)) {
      paktaIndex.set(key, p.id as string);
    }
  }

  const map: Record<string, PaktaStatus> = {};
  for (const pem of pemegangRows || []) {
    const key = (pem.nama || "").toLowerCase().trim();
    const paktaId = paktaIndex.get(key) ?? null;
    map[pem.id as string] = {
      hasPakta: paktaId !== null,
      paktaId,
    };
  }
  return map;
}

// ══════════════════════════════════════════════════════════════════════
//  BUAT PAKTA DARI PEMEGANG
// ══════════════════════════════════════════════════════════════════════

/** Ekstrak tahun 4-digit dari string spek (port dari riExtrakTahun GAS). */
function extractTahun(s?: string): string {
  if (!s) return "";
  const m = String(s).match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : "";
}

/** Ekstrak merk (kata pertama) dari string spek (port dari riExtrakMerk). */
function extractMerk(s?: string): string {
  if (!s) return "";
  return String(s).split(" ")[0] || "";
}

/**
 * Buat satu pakta dari data pemegang + asetnya.
 * Mapping aset_pemegang → lampiran pakta:
 *   - jenis 'kendaraan' → aset_kendaraan  (jenis=ket||merk, merk=merk, tahun, nopol, harga)
 *   - jenis 'laptop'    → aset_laptop     (merk, type, tahun)
 *   - jenis 'alat'      → aset_alat       (nama=ket||merk, merk, type, tahun)
 *   - jenis 'rumah'     → (tidak ada kolom lampiran; diabaikan)
 * Revalidate /rekap. Kembalikan id pakta yang dibuat.
 */
export async function buatPaktaDariPemegang(
  pemegangId: string,
): Promise<string> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");

  const pemegang = await getPemegangById(pemegangId);
  if (!pemegang) {
    throw new Error("Pemegang tidak ditemukan");
  }

  // Cek duplikat — bila sudah ada pakta untuk nama ini, lewati (tidak error)
  const sudah = await hasPakta(pemegang.nama);
  if (sudah) {
    throw new Error(
      `Pakta untuk ${pemegang.nama} sudah ada. Buka lampiran yang sudah ada.`,
    );
  }

  const asetList = await getAsetByPemegang(pemegangId);

  const asetKendaraan: PaktaAsetKendaraan[] = asetList
    .filter((a) => a.jenis === "kendaraan")
    .map((a) => ({
      jenis: a.ket || a.merk || "",
      merk: a.merk || "",
      tahun: extractTahun(a.tahun) || a.tahun || "",
      nopol: a.nopol || "",
      harga: a.harga || "",
      ket: "",
    }));
  if (asetKendaraan.length === 0) asetKendaraan.push({});

  const asetLaptop: PaktaAsetLaptop[] = asetList
    .filter((a) => a.jenis === "laptop")
    .map((a) => ({
      merk: extractMerk(a.merk) || a.merk || "",
      type: a.type || a.merk || "",
      tahun: extractTahun(a.tahun) || a.tahun || "",
      seri: "",
      harga: a.harga || "",
      ket: "",
    }));
  if (asetLaptop.length === 0) asetLaptop.push({});

  const asetAlat: PaktaAsetAlat[] = asetList
    .filter((a) => a.jenis === "alat")
    .map((a) => ({
      merk: extractMerk(a.merk) || a.merk || "",
      type: a.type || a.merk || "",
      tahun: extractTahun(a.tahun) || a.tahun || "",
      seri: "",
      harga: a.harga || "",
      ket: "",
    }));
  if (asetAlat.length === 0) asetAlat.push({});

  const today = new Date();
  const hariStr = HARI_ID[today.getDay()];
  const tglStr = today.toISOString().split("T")[0];
  const paktaId = `pakta-${Date.now()}`;

  const { error } = await supabase.from("pakta").insert({
    id: paktaId,
    hari: hariStr,
    tgl: tglStr,
    nama: pemegang.nama.trim(),
    nip: pemegang.nip?.trim() || null,
    jabatan: pemegang.jabatan?.trim() || null,
    alamat: null,
    aset_kendaraan: asetKendaraan,
    aset_laptop: asetLaptop,
    aset_alat: asetAlat,
  });

  if (error) {
    console.error("Error creating pakta from pemegang:", error);
    throw error;
  }

  revalidatePath("/rekap");
  revalidatePath("/pakta");
  return paktaId;
}

/**
 * Buat pakta untuk semua pemegang yang belum punya pakta.
 * Kembalikan jumlah pakta yang berhasil dibuat.
 */
export async function buatPaktaSemuaBelum(): Promise<number> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");

  const pemegangList = await getPemegangList();
  const statusMap = await getPaktaStatusMap();

  let created = 0;
  for (const pem of pemegangList) {
    const status = statusMap[pem.id];
    if (status && status.hasPakta) continue;
    try {
      await buatPaktaDariPemegang(pem.id);
      created++;
    } catch (err) {
      // Lanjut ke pemegang berikutnya; log error tapi jangan batalkan batch
      console.error(`Gagal buat pakta untuk ${pem.nama}:`, err);
    }
  }

  revalidatePath("/rekap");
  revalidatePath("/pakta");
  return created;
}
