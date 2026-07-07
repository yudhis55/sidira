import type {
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";

/**
 * Pure helpers untuk modul Pakta (tidak ada dependency DB/jaringan).
 * Dipisah dari file "use server" agar tetap dapat dipanggil sebagai
 * fungsi sinkron dari Server Component maupun Client Component.
 */

/** Hitung jumlah aset non-kosong di seluruh 3 sub-tabel (untuk badge daftar). */
export function countAset(pakta: {
  aset_kendaraan?: PaktaAsetKendaraan[] | null;
  aset_laptop?: PaktaAsetLaptop[] | null;
  aset_alat?: PaktaAsetAlat[] | null;
}): number {
  let n = 0;
  const kend = pakta.aset_kendaraan || [];
  for (const r of kend) {
    if (r && (r.merk || r.jenis)) n++;
  }
  const lapt = pakta.aset_laptop || [];
  for (const r of lapt) {
    if (r && (r.merk || r.type)) n++;
  }
  const alat = pakta.aset_alat || [];
  for (const r of alat) {
    if (r && (r.merk || r.type)) n++;
  }
  return n;
}
