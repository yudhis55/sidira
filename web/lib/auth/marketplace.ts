"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Barang,
  KategoriBarang,
  LacakPengajuan,
  LogStatusPengajuan,
  MutasiStok,
  PengajuanDetail,
  PengajuanHeader,
  PengajuanItem,
  PengajuanStatus,
  RiwayatPengajuanPublik,
  WhitelistPemohon,
} from "@/lib/marketplace-types";

// ══════════════════════════════════════════════════════════════════════
//  Marketplace — server actions
//
//  Alur pemohon TANPA LOGIN: submit / lacak / batal memakai fungsi
//  SECURITY DEFINER di database (lihat migrasi 20261120000000_marketplace).
//  Alur admin memakai user session biasa (RLS + cek role di dalam fungsi).
// ══════════════════════════════════════════════════════════════════════

function revalidateMarketplace() {
  revalidatePath("/katalog");
  revalidatePath("/pengajuan");
  revalidatePath("/admin/katalog");
  revalidatePath("/admin/pengajuan");
}

// ── Katalog (baca) ───────────────────────────────────────────────────

/** Urutan tampil kategori di etalase (bukan urutan id database). */
const URUTAN_KATEGORI = [
  "Alat Kesehatan",
  "Meubelair",
  "Elektronik",
  "Lainnya",
];

export async function getKategoriBarang(): Promise<KategoriBarang[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kategori_barang")
    .select("*")
    .order("nama", { ascending: true });

  if (error) throw error;

  const rank = (nama: string) => {
    const index = URUTAN_KATEGORI.indexOf(nama);
    return index === -1 ? URUTAN_KATEGORI.length : index;
  };

  return ((data ?? []) as KategoriBarang[]).sort(
    (a, b) => rank(a.nama) - rank(b.nama)
  );
}

/** Map id → nama kategori, untuk melengkapi daftar barang tanpa join. */
async function kategoriMap(): Promise<Map<number, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("kategori_barang").select("id, nama");
  return new Map(
    ((data ?? []) as Array<{ id: number; nama: string }>).map((k) => [
      k.id,
      k.nama,
    ])
  );
}

export async function getBarangList(): Promise<Barang[]> {
  const supabase = await createClient();
  const [{ data, error }, kat] = await Promise.all([
    supabase.from("barang").select("*").order("nama", { ascending: true }),
    kategoriMap(),
  ]);

  if (error) throw error;
  return ((data ?? []) as Barang[]).map((b) => ({
    ...b,
    kategori_nama: b.kategori_id ? kat.get(b.kategori_id) ?? null : null,
  }));
}

/** Katalog publik: hanya barang aktif (dipakai halaman /katalog). */
export async function getKatalogPublik(): Promise<Barang[]> {
  const supabase = await createClient();
  const [{ data, error }, kat] = await Promise.all([
    supabase
      .from("barang")
      .select(
        "id, kode, nama, kategori_id, satuan, foto, deskripsi, stok, stok_minimum, aktif"
      )
      .eq("aktif", true)
      .order("nama", { ascending: true }),
    kategoriMap(),
  ]);

  if (error) throw error;
  return ((data ?? []) as Barang[]).map((b) => ({
    ...b,
    kategori_nama: b.kategori_id ? kat.get(b.kategori_id) ?? null : null,
  }));
}

export async function getBarangById(id: number): Promise<Barang> {
  const supabase = await createClient();
  const [{ data, error }, kat] = await Promise.all([
    supabase.from("barang").select("*").eq("id", id).single(),
    kategoriMap(),
  ]);

  if (error) throw error;
  const barang = data as Barang;
  return {
    ...barang,
    kategori_nama: barang.kategori_id
      ? kat.get(barang.kategori_id) ?? null
      : null,
  };
}

// ── Pengajuan (pemohon tanpa login) ──────────────────────────────────

export interface SubmitPengajuanResult {
  error?: string;
  nomor?: string;
  id?: number;
}

/**
 * Ajukan permintaan barang. `items` berisi [{ barang_id, jumlah }].
 * Nama pemohon harus terdaftar di whitelist (divalidasi di database).
 */
export async function submitPengajuan(input: {
  room_id: string;
  nama_pemohon: string;
  catatan?: string;
  items: Array<{ barang_id: number; jumlah: number }>;
}): Promise<SubmitPengajuanResult> {
  const nama = input.nama_pemohon?.trim() ?? "";
  if (!nama) return { error: "Nama lengkap pemohon wajib diisi" };
  if (!input.room_id) return { error: "Ruangan wajib dipilih" };
  if (!input.items?.length) return { error: "Keranjang masih kosong" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_pengajuan", {
    p_room_id: input.room_id,
    p_nama_pemohon: nama,
    p_catatan: input.catatan ?? "",
    p_items: input.items,
  });

  if (error) {
    return { error: error.message || "Gagal mengirim pengajuan" };
  }

  const payload = data as { id: number; nomor: string } | null;
  revalidateMarketplace();
  return { nomor: payload?.nomor, id: payload?.id };
}

export interface LacakResult {
  error?: string;
  data?: LacakPengajuan;
}

/** Lacak status pengajuan dengan nomor + nama pemohon. */
export async function lacakPengajuan(
  nomor: string,
  nama: string
): Promise<LacakResult> {
  if (!nomor?.trim() || !nama?.trim()) {
    return { error: "Nomor pengajuan dan nama pemohon wajib diisi" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lacak_pengajuan", {
    p_nomor: nomor.trim(),
    p_nama: nama.trim(),
  });

  if (error) {
    return { error: error.message || "Pengajuan tidak ditemukan" };
  }
  return { data: data as LacakPengajuan };
}

/** Batalkan pengajuan (hanya status "diajukan"). */
export async function batalPengajuan(
  nomor: string,
  nama: string
): Promise<{ error?: string; success?: boolean }> {
  if (!nomor?.trim() || !nama?.trim()) {
    return { error: "Nomor pengajuan dan nama pemohon wajib diisi" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("batal_pengajuan", {
    p_nomor: nomor.trim(),
    p_nama: nama.trim(),
  });

  if (error) return { error: error.message || "Gagal membatalkan pengajuan" };

  revalidateMarketplace();
  return { success: true };
}

/** Riwayat pengajuan untuk halaman publik — hanya ruangan, tanpa nama. */
export async function getRiwayatPengajuanPublik(
  limit = 100
): Promise<RiwayatPengajuanPublik[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("riwayat_pengajuan_publik", {
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as RiwayatPengajuanPublik[];
}

// ── Pengajuan (baca untuk area admin) ────────────────────────────────

export async function getPengajuanList(): Promise<PengajuanHeader[]> {
  const supabase = await createClient();
  const [
    { data, error },
    { data: rooms },
    { data: itemRows },
  ] = await Promise.all([
    supabase
      .from("pengajuan")
      .select("*")
      .order("diajukan_at", { ascending: false }),
    supabase.from("rooms").select("id, name, icon"),
    supabase.from("pengajuan_item").select("pengajuan_id"),
  ]);

  if (error) throw error;

  const roomMap = new Map(
    ((rooms ?? []) as Array<{ id: string; name: string; icon: string | null }>).map(
      (r) => [r.id, r]
    )
  );

  const itemCount = new Map<number, number>();
  for (const row of (itemRows ?? []) as Array<{ pengajuan_id: number }>) {
    itemCount.set(row.pengajuan_id, (itemCount.get(row.pengajuan_id) ?? 0) + 1);
  }

  return ((data ?? []) as PengajuanHeader[]).map((p) => {
    const room = p.room_id ? roomMap.get(p.room_id) : undefined;
    return {
      ...p,
      room_name: room?.name ?? null,
      room_icon: room?.icon ?? null,
      item_count: itemCount.get(p.id) ?? 0,
    };
  });
}

export async function getPengajuanDetail(
  id: number
): Promise<PengajuanDetail> {
  const supabase = await createClient();

  const [{ data: header, error: headerError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("pengajuan").select("*").eq("id", id).single(),
      supabase
        .from("pengajuan_item")
        .select("*")
        .eq("pengajuan_id", id)
        .order("id", { ascending: true }),
    ]);

  if (headerError) throw headerError;
  if (itemsError) throw itemsError;

  const row = header as PengajuanHeader;
  let roomName: string | null = null;
  let roomIcon: string | null = null;
  if (row.room_id) {
    const { data: room } = await supabase
      .from("rooms")
      .select("name, icon")
      .eq("id", row.room_id)
      .maybeSingle();
    if (room) {
      const r = room as { name: string; icon: string | null };
      roomName = r.name;
      roomIcon = r.icon;
    }
  }

  return {
    ...row,
    room_name: roomName,
    room_icon: roomIcon,
    items: (items ?? []) as PengajuanItem[],
  };
}

export async function getLogStatusPengajuan(
  pengajuanId: number
): Promise<LogStatusPengajuan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("log_status_pengajuan")
    .select("*")
    .eq("pengajuan_id", pengajuanId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as LogStatusPengajuan[];
}

// ── Approval (admin) ─────────────────────────────────────────────────

/**
 * Putuskan pengajuan. `decisions` berisi [{ item_id, jumlah_disetujui }].
 * Item yang tidak disertakan dianggap disetujui 0. Stok dipotong atomik.
 */
export async function approvePengajuan(input: {
  id: number;
  decisions: Array<{ item_id: number; jumlah_disetujui: number }>;
  catatan?: string;
}): Promise<{ error?: string; status?: PengajuanStatus }> {
  if (!input.decisions?.length) {
    return { error: "Tidak ada item yang diputuskan" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("approve_pengajuan", {
    p_id: input.id,
    p_items: input.decisions,
    p_catatan: input.catatan ?? "",
  });

  if (error) return { error: error.message || "Gagal memproses pengajuan" };

  revalidateMarketplace();
  const payload = data as { status: PengajuanStatus } | null;
  return { status: payload?.status };
}

export async function serahkanPengajuan(
  id: number,
  diterimaOleh: string
): Promise<{ error?: string; success?: boolean }> {
  if (!diterimaOleh?.trim()) return { error: "Nama penerima wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("serahkan_pengajuan", {
    p_id: id,
    p_diterima_oleh: diterimaOleh.trim(),
  });

  if (error) return { error: error.message || "Gagal menyerahkan barang" };

  revalidateMarketplace();
  return { success: true };
}

// ── Whitelist pemohon (admin) ────────────────────────────────────────

export async function getWhitelist(): Promise<WhitelistPemohon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whitelist_pemohon")
    .select("*")
    .order("nama", { ascending: true });

  if (error) throw error;
  return (data ?? []) as WhitelistPemohon[];
}

export async function addWhitelist(formData: FormData) {
  const nama = (formData.get("nama") as string)?.trim();
  const keterangan = (formData.get("keterangan") as string)?.trim();

  if (!nama) return { error: "Nama wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_pemohon")
    .insert({ nama, keterangan: keterangan || null });

  if (error) {
    if (error.code === "23505") {
      return { error: `Nama "${nama}" sudah ada di whitelist` };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/whitelist");
  return { success: true };
}

export async function updateWhitelist(id: number, formData: FormData) {
  const nama = (formData.get("nama") as string)?.trim();
  const keterangan = (formData.get("keterangan") as string)?.trim();

  if (!nama) return { error: "Nama wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_pemohon")
    .update({ nama, keterangan: keterangan || null })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: `Nama "${nama}" sudah ada di whitelist` };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/whitelist");
  return { success: true };
}

export async function setWhitelistAktif(
  id: number,
  aktif: boolean
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_pemohon")
    .update({ aktif })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/whitelist");
  return { success: true };
}

export async function deleteWhitelist(
  id: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_pemohon")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/whitelist");
  return { success: true };
}

// ── Barang (admin) ───────────────────────────────────────────────────

function parseBarangForm(formData: FormData) {
  const kategoriRaw = formData.get("kategori_id") as string;
  return {
    kode: (formData.get("kode") as string)?.trim(),
    nama: (formData.get("nama") as string)?.trim(),
    kategori_id: kategoriRaw ? Number(kategoriRaw) : null,
    satuan: ((formData.get("satuan") as string)?.trim() || "Pcs"),
    deskripsi: (formData.get("deskripsi") as string)?.trim() || null,
    stok_minimum: Number(formData.get("stok_minimum") ?? 0) || 0,
    aktif: formData.get("aktif") !== "false",
  };
}

export async function createBarang(formData: FormData) {
  const values = parseBarangForm(formData);
  if (!values.kode) return { error: "Kode barang wajib diisi" };
  if (!values.nama) return { error: "Nama barang wajib diisi" };

  const stok = Number(formData.get("stok") ?? 0) || 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barang")
    .insert({ ...values, stok })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `Kode "${values.kode}" sudah dipakai` };
    }
    return { error: error.message };
  }

  // Catat saldo awal sebagai mutasi agar ledger konsisten sejak awal.
  if (stok > 0) {
    await supabase.rpc("koreksi_stok", {
      p_barang_id: (data as { id: number }).id,
      p_stok_baru: stok,
      p_keterangan: "Saldo awal",
    });
  }

  revalidateMarketplace();
  return { success: true, id: (data as { id: number }).id };
}

export async function updateBarang(id: number, formData: FormData) {
  const values = parseBarangForm(formData);
  if (!values.kode) return { error: "Kode barang wajib diisi" };
  if (!values.nama) return { error: "Nama barang wajib diisi" };

  const supabase = await createClient();
  const { error } = await supabase.from("barang").update(values).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: `Kode "${values.kode}" sudah dipakai` };
    }
    return { error: error.message };
  }

  revalidateMarketplace();
  return { success: true };
}

export async function deleteBarang(
  id: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.from("barang").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateMarketplace();
  return { success: true };
}

// ── Stok (admin) ─────────────────────────────────────────────────────

export async function tambahStok(input: {
  barang_id: number;
  jumlah: number;
  keterangan?: string;
}): Promise<{ error?: string; stok?: number }> {
  if (!input.jumlah || input.jumlah <= 0) {
    return { error: "Jumlah harus lebih dari 0" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tambah_stok", {
    p_barang_id: input.barang_id,
    p_jumlah: input.jumlah,
    p_keterangan: input.keterangan ?? "",
  });

  if (error) return { error: error.message };

  revalidateMarketplace();
  return { stok: data as number };
}

export async function koreksiStok(input: {
  barang_id: number;
  stok_baru: number;
  keterangan?: string;
}): Promise<{ error?: string; stok?: number }> {
  if (input.stok_baru === undefined || input.stok_baru < 0) {
    return { error: "Stok baru tidak valid" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("koreksi_stok", {
    p_barang_id: input.barang_id,
    p_stok_baru: input.stok_baru,
    p_keterangan: input.keterangan ?? "",
  });

  if (error) return { error: error.message };

  revalidateMarketplace();
  return { stok: data as number };
}

export async function getMutasiStok(barangId?: number): Promise<MutasiStok[]> {
  const supabase = await createClient();
  let query = supabase
    .from("mutasi_stok")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (barangId) query = query.eq("barang_id", barangId);

  const [{ data, error }, { data: barang }] = await Promise.all([
    query,
    supabase.from("barang").select("id, nama, satuan"),
  ]);

  if (error) throw error;

  const map = new Map(
    ((barang ?? []) as Array<{ id: number; nama: string; satuan: string }>).map(
      (b) => [b.id, b]
    )
  );

  return ((data ?? []) as MutasiStok[]).map((m) => {
    const b = map.get(m.barang_id);
    return {
      ...m,
      barang_nama: b?.nama ?? null,
      barang_satuan: b?.satuan ?? null,
    };
  });
}
