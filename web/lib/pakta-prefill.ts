/**
 * Susun record Pakta pre-filled dari data pemegang + asetnya —
 * replika GAS `riBuatPakta` (gas-legacy/index.html 26994+).
 *
 * File ini SENGAJA tanpa `"use client"` agar bisa dipakai Server
 * Component (`pakta/new?dari=`) maupun klien (`pakta-store`, rekap).
 */
import type {
  AsetPemegang,
  Pakta,
  PaktaAsetAlat,
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PemegangInventaris,
} from "@/types/database";

const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * - kendaraan → {jenis, merk, tahun, nopol, harga, ket}
 * - laptop/alat → {merk, type, tahun, seri, harga, ket}
 * - "rumah" (rumah dinas) tidak dipetakan — dokumen Pakta hanya punya
 *   3 lampiran, sama seperti GAS yang mengabaikan d.rumah.
 * - PemegangInventaris tidak punya alamat → dikosongkan, diisi di modal.
 */
export function buildPaktaFromPemegang(
  pemegang: PemegangInventaris,
  asetList: AsetPemegang[],
  id?: string
): Pakta {
  const today = new Date();
  const now = today.toISOString();

  const asetKendaraan: PaktaAsetKendaraan[] = asetList
    .filter((a) => a.jenis === "kendaraan")
    .map((a) => ({
      jenis:
        (a.type || "").toLowerCase().includes("mobil") ? "mobil" : "motor",
      merk: a.merk || "",
      tahun: a.tahun || "",
      nopol: a.nopol || "",
      harga: a.harga || "",
      ket: a.ket || "",
    }));

  const toNonKendaraan = (
    a: AsetPemegang
  ): PaktaAsetLaptop | PaktaAsetAlat => ({
    merk: a.merk || "",
    type: a.type || "",
    tahun: a.tahun || "",
    seri: "",
    harga: a.harga || "",
    ket: a.ket || "",
  });

  const asetLaptop: PaktaAsetLaptop[] = asetList
    .filter((a) => a.jenis === "laptop")
    .map(toNonKendaraan);
  const asetAlat: PaktaAsetAlat[] = asetList
    .filter((a) => a.jenis === "alat")
    .map(toNonKendaraan);

  return {
    id: id ?? `pakta-${Date.now()}`,
    hari: HARI_ID[today.getDay()],
    tgl: now.split("T")[0],
    nama: pemegang.nama,
    nip: pemegang.nip || "",
    jabatan: pemegang.jabatan || "",
    alamat: "",
    aset_kendaraan: asetKendaraan.length ? asetKendaraan : [{}],
    aset_laptop: asetLaptop.length ? asetLaptop : [{}],
    aset_alat: asetAlat.length ? asetAlat : [{}],
    created_at: now,
    updated_at: now,
  };
}
