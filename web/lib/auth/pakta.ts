"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  Pakta,
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";

/**
 * Server actions untuk modul Pakta Integritas Pemanfaatan BMD.
 *
 * Struktur data mengikuti tabel `pakta` di DB + GAS legacy (3 sub-tabel
 * lampiran aset: Kendaraan Dinis / Laptop-PC / Alat Penunjang). Tidak ada
 * kolom `nomor`; nomor urut pada daftar dihitung dari indeks baris (001, 002...).
 */

/** Tipe payload create/update. aset arrays default ke []. */
export interface PaktaInput {
  hari?: string;
  tgl?: string;
  nama: string;
  nip?: string;
  jabatan?: string;
  alamat?: string;
  aset_kendaraan?: PaktaAsetKendaraan[];
  aset_laptop?: PaktaAsetLaptop[];
  aset_alat?: PaktaAsetAlat[];
}

// Catatan: helper sinkron `countAset` dipindahkan ke lib/pakta-utils.ts
// karena file "use server" hanya boleh mengekspor async function.

/** Ambil daftar seluruh pakta, urut tgl terbaru. */
export async function getPaktaList(): Promise<Pakta[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pakta")
    .select("*")
    .order("tgl", { ascending: false });

  if (error) throw error;
  return (data || []) as Pakta[];
}

/** Ambil satu pakta berdasarkan id. */
export async function getPaktaById(id: string): Promise<Pakta | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pakta")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // tidak ditemukan
    throw error;
  }
  return data as Pakta;
}

/** Buat pakta baru. Aset arrays default ke []. Redirect ke /pakta/[id]. */
export async function createPakta(data: PaktaInput): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = `pakta-${Date.now()}`;

  if (!data.nama || data.nama.trim() === "") {
    throw new Error("Nama pemegang wajib diisi");
  }

  const { error } = await supabase
    .from("pakta")
    .insert({
      id,
      hari: data.hari ?? null,
      tgl: data.tgl ?? null,
      nama: data.nama.trim(),
      nip: data.nip?.trim() || null,
      jabatan: data.jabatan?.trim() || null,
      alamat: data.alamat?.trim() || null,
      aset_kendaraan: data.aset_kendaraan ?? [],
      aset_laptop: data.aset_laptop ?? [],
      aset_alat: data.aset_alat ?? [],
    });

  if (error) {
    console.error("Error creating pakta:", error);
    throw error;
  }

  revalidatePath("/pakta");
  redirect(`/pakta/${id}`);
}

/** Update pakta. Redirect ke /pakta/[id]. */
export async function updatePakta(
  id: string,
  data: Partial<PaktaInput>,
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.hari !== undefined) updateData.hari = data.hari || null;
  if (data.tgl !== undefined) updateData.tgl = data.tgl || null;
  if (data.nama !== undefined) updateData.nama = data.nama.trim();
  if (data.nip !== undefined) updateData.nip = data.nip?.trim() || null;
  if (data.jabatan !== undefined) updateData.jabatan = data.jabatan?.trim() || null;
  if (data.alamat !== undefined) updateData.alamat = data.alamat?.trim() || null;
  if (data.aset_kendaraan !== undefined) updateData.aset_kendaraan = data.aset_kendaraan;
  if (data.aset_laptop !== undefined) updateData.aset_laptop = data.aset_laptop;
  if (data.aset_alat !== undefined) updateData.aset_alat = data.aset_alat;

  const { error } = await supabase
    .from("pakta")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating pakta:", error);
    throw error;
  }

  revalidatePath("/pakta");
  revalidatePath(`/pakta/${id}`);
  redirect(`/pakta/${id}`);
}

/** Hapus pakta. Redirect ke /pakta. */
export async function deletePakta(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("pakta").delete().eq("id", id);

  if (error) {
    console.error("Error deleting pakta:", error);
    throw error;
  }

  revalidatePath("/pakta");
  redirect("/pakta");
}

/**
 * Varian tanpa redirect untuk dipakai komponen client (modal identitas,
 * editor lampiran, tombol hapus di daftar). Mengembalikan bentuk
 * `{ success: true }` / `{ error: "<pesan Indonesia>" }` sehingga modal
 * bisa tetap terbuka saat gagal — pola yang sama dengan server actions lain.
 */
export async function createPaktaRecord(
  data: PaktaInput,
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Anda harus login untuk menyimpan pakta" };

    if (!data.nama || data.nama.trim() === "") {
      return { error: "Nama pemegang wajib diisi" };
    }

    const id = `pakta-${Date.now()}`;

    const { error } = await supabase.from("pakta").insert({
      id,
      hari: data.hari ?? null,
      tgl: data.tgl ?? null,
      nama: data.nama.trim(),
      nip: data.nip?.trim() || null,
      jabatan: data.jabatan?.trim() || null,
      alamat: data.alamat?.trim() || null,
      aset_kendaraan: data.aset_kendaraan ?? [],
      aset_laptop: data.aset_laptop ?? [],
      aset_alat: data.aset_alat ?? [],
    });

    if (error) {
      console.error("Error creating pakta:", error);
      return { error: "Gagal menyimpan Pakta Integritas" };
    }

    revalidatePath("/pakta");
    return { success: true, id };
  } catch (e) {
    console.error("Error creating pakta:", e);
    return { error: "Gagal menyimpan Pakta Integritas" };
  }
}

/** Varian update tanpa redirect — untuk modal identitas & editor lampiran. */
export async function updatePaktaRecord(
  id: string,
  data: Partial<PaktaInput>,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient();

    if (data.nama !== undefined && data.nama.trim() === "") {
      return { error: "Nama pemegang wajib diisi" };
    }

    const updateData: Record<string, unknown> = {};
    if (data.hari !== undefined) updateData.hari = data.hari || null;
    if (data.tgl !== undefined) updateData.tgl = data.tgl || null;
    if (data.nama !== undefined) updateData.nama = data.nama.trim();
    if (data.nip !== undefined) updateData.nip = data.nip?.trim() || null;
    if (data.jabatan !== undefined)
      updateData.jabatan = data.jabatan?.trim() || null;
    if (data.alamat !== undefined)
      updateData.alamat = data.alamat?.trim() || null;
    if (data.aset_kendaraan !== undefined)
      updateData.aset_kendaraan = data.aset_kendaraan;
    if (data.aset_laptop !== undefined)
      updateData.aset_laptop = data.aset_laptop;
    if (data.aset_alat !== undefined) updateData.aset_alat = data.aset_alat;

    const { error } = await supabase
      .from("pakta")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating pakta:", error);
      return { error: "Gagal menyimpan perubahan Pakta Integritas" };
    }

    revalidatePath("/pakta");
    return { success: true };
  } catch (e) {
    console.error("Error updating pakta:", e);
    return { error: "Gagal menyimpan perubahan Pakta Integritas" };
  }
}

/** Varian hapus tanpa redirect — untuk tombol hapus di daftar. */
export async function deletePaktaRecord(
  id: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("pakta").delete().eq("id", id);

    if (error) {
      console.error("Error deleting pakta:", error);
      return { error: "Gagal menghapus Pakta Integritas" };
    }

    revalidatePath("/pakta");
    return { success: true };
  } catch (e) {
    console.error("Error deleting pakta:", e);
    return { error: "Gagal menghapus Pakta Integritas" };
  }
}

/**
 * Build CSV string seluruh pakta. Satu baris per aset item.
 * Kolom: No, Nama, NIP, Jabatan, Tanggal, Hari, Jenis Aset, Merk/Type,
 * Tahun, No Polisi/Seri, Harga, Keterangan.
 */
export async function exportPaktaCSV(): Promise<string> {
  const list = await getPaktaList();

  const BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const fmtDate = (iso?: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  };

  const escape = (val: unknown): string => {
    const s = val == null ? "" : String(val);
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const header = [
    "No",
    "Nama",
    "NIP",
    "Jabatan",
    "Tanggal",
    "Hari",
    "Jenis Aset",
    "Merk/Type",
    "Tahun",
    "No Polisi/Seri",
    "Harga",
    "Keterangan",
  ];

  const rows: string[] = [header.join(",")];

  let no = 0;
  for (const p of list) {
    const kend = (p.aset_kendaraan || []).filter(
      (r) => r && (r.merk || r.jenis),
    );
    const lapt = (p.aset_laptop || []).filter(
      (r) => r && (r.merk || r.type),
    );
    const alat = (p.aset_alat || []).filter(
      (r) => r && (r.merk || r.type),
    );
    const total = kend.length + lapt.length + alat.length;

    const baseCols = [
      "",
      escape(p.nama || ""),
      escape(p.nip || ""),
      escape(p.jabatan || ""),
      escape(fmtDate(p.tgl)),
      escape(p.hari || ""),
    ];

    if (total === 0) {
      no++;
      rows.push([escape(no), ...baseCols.slice(1), escape(""), escape(""), escape(""), escape(""), escape(""), escape("")].join(","));
      continue;
    }

    for (const r of kend) {
      no++;
      rows.push(
        [
          escape(no),
          ...baseCols.slice(1),
          escape("Kendaraan"),
          escape(r.merk || r.jenis || ""),
          escape(r.tahun ?? ""),
          escape(r.nopol || ""),
          escape(r.harga || ""),
          escape(r.ket || ""),
        ].join(","),
      );
    }
    for (const r of lapt) {
      no++;
      rows.push(
        [
          escape(no),
          ...baseCols.slice(1),
          escape("Laptop"),
          escape([r.merk, r.type].filter(Boolean).join(" ") || ""),
          escape(r.tahun ?? ""),
          escape(r.seri || ""),
          escape(r.harga || ""),
          escape(r.ket || ""),
        ].join(","),
      );
    }
    for (const r of alat) {
      no++;
      rows.push(
        [
          escape(no),
          ...baseCols.slice(1),
          escape("Alat"),
          escape([r.merk, r.type].filter(Boolean).join(" ") || ""),
          escape(r.tahun ?? ""),
          escape(r.seri || ""),
          escape(r.harga || ""),
          escape(r.ket || ""),
        ].join(","),
      );
    }
  }

  return rows.join("\r\n");
}
