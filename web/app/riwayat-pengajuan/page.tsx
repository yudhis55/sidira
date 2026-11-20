import type { Metadata } from "next";
import { getRiwayatPengajuanPublik } from "@/lib/auth/marketplace";
import { RiwayatClient } from "@/components/marketplace/public/riwayat-client";
import { PublicShell } from "@/components/marketplace/public/public-shell";
import type { RiwayatPengajuanPublik } from "@/lib/marketplace-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riwayat Pengajuan",
  description:
    "Riwayat permintaan barang habis pakai UPTD Puskesmas Baruharjo per ruangan.",
};

/**
 * Halaman publik riwayat pengajuan.
 * Menggantikan halaman "Lacak" — tidak meminta nomor/nama, dan tidak
 * menampilkan identitas pemohon (hanya ruangan).
 */
export default async function RiwayatPengajuanPage() {
  const rows = await getRiwayatPengajuanPublik().catch(
    (): RiwayatPengajuanPublik[] => []
  );

  return (
    <PublicShell active="riwayat">
      <RiwayatClient rows={rows} />
    </PublicShell>
  );
}
