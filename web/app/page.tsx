import type { Metadata } from "next";
import {
  getKatalogPublik,
  getKategoriBarang,
} from "@/lib/auth/marketplace";
import { getRooms } from "@/lib/auth/rooms";
import { Storefront } from "@/components/marketplace/public/storefront";
import { PublicShell } from "@/components/marketplace/public/public-shell";
import type { Barang, KategoriBarang } from "@/lib/marketplace-types";
import type { Room } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog Barang",
  description:
    "Katalog barang habis pakai (BMHP) UPTD Puskesmas Baruharjo. Ajukan permintaan tanpa perlu masuk.",
};

/**
 * Landing publik (route `/`).
 *
 * Menampilkan katalog barang langsung seperti marketplace: pengunjung bisa
 * menelusuri katalog, mengisi keranjang, dan mengirim permintaan tanpa login.
 * Pengelolaan (katalog, pengajuan, whitelist) tetap di dalam dashboard.
 */
export default async function LandingPage() {
  const [barang, kategori, rooms] = await Promise.all([
    getKatalogPublik().catch((): Barang[] => []),
    getKategoriBarang().catch((): KategoriBarang[] => []),
    getRooms().catch((): Room[] => []),
  ]);

  return (
    <PublicShell active="katalog">
      <Storefront barang={barang} kategori={kategori} rooms={rooms} />
    </PublicShell>
  );
}
