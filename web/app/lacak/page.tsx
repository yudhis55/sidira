import { redirect } from "next/navigation";

/**
 * Halaman "Lacak" diganti menjadi Riwayat Pengajuan publik.
 * Rute lama dipertahankan sebagai alias agar tautan lama tetap bekerja.
 */
export default function LacakPage() {
  redirect("/riwayat-pengajuan");
}
