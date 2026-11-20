import Link from "next/link";
import {
  getBarangList,
  getKategoriBarang,
  getMutasiStok,
} from "@/lib/auth/marketplace";
import { getUser } from "@/lib/auth/utils";
import { KatalogAdminClient } from "@/components/marketplace/admin/katalog-admin-client";
import type {
  Barang,
  KategoriBarang,
  MutasiStok,
} from "@/lib/marketplace-types";

export default async function AdminKatalogPage() {
  const user = await getUser();

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-[560px] py-16 text-center">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
          Akses ditolak
        </h1>
        <p className="mt-2 text-[13px] text-text-2">
          Halaman ini hanya untuk admin.
        </p>
        <Link
          href="/pengajuan"
          className="mt-5 inline-flex h-9 items-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
        >
          Kembali ke Pengajuan
        </Link>
      </div>
    );
  }

  const [barang, kategori, ledger] = await Promise.all([
    getBarangList().catch((): Barang[] => []),
    getKategoriBarang().catch((): KategoriBarang[] => []),
    getMutasiStok().catch((): MutasiStok[] => []),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
          Kelola Katalog Barang
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          {barang.length} barang · {kategori.length} kategori
        </p>
      </div>

      <KatalogAdminClient
        barang={barang}
        kategori={kategori}
        ledger={ledger}
      />
    </div>
  );
}
