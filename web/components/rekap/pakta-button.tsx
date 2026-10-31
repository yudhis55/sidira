"use client";

/**
 * Tombol 📜 Pakta pada Rekap Pemegang — port GAS `riBuatPakta`.
 *
 * Opsi B: record pakta dibuat LANGSUNG di database dengan `pegawai_id`
 * (FK ke master pegawai), bukan lagi dititipkan di localStorage.
 * Alur:
 *   - Sudah punya pakta → tawarkan buka lampiran yang ada.
 *   - Belum → server action `buatPaktaDariPemegang` membuat record + lampiran
 *     pre-filled dari aset pemegang, lalu panel lampiran dibuka.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buatPaktaDariPemegang } from "@/lib/auth/rekap";
import { getPaktaList } from "@/lib/auth/pakta";
import type { PemegangInventaris } from "@/types/database";

export function RekapPaktaButton({
  pemegang,
}: {
  pemegang: PemegangInventaris;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handle() {
    if (busy) return;
    setBusy(true);
    try {
      // Cari pakta yang sudah ada — prioritas FK pegawai_id, fallback nama
      // untuk baris lama yang belum punya pegawai_id.
      const list = await getPaktaList().catch(() => []);
      const key = (pemegang.nama || "").trim().toLowerCase();
      const existing =
        (pemegang.pegawai_id
          ? list.find((p) => p.pegawai_id === pemegang.pegawai_id)
          : undefined) ??
        list.find((p) => (p.nama || "").trim().toLowerCase() === key);

      if (existing) {
        if (
          !window.confirm(
            `Pakta untuk ${pemegang.nama} sudah ada.\nBuka lampiran yang sudah ada?`,
          )
        ) {
          return;
        }
        router.push(`/pakta?lampiran=${existing.id}`);
        return;
      }

      const paktaId = await buatPaktaDariPemegang(pemegang.id);
      toast.success(
        `✅ Pakta + lampiran untuk ${pemegang.nama} dibuat otomatis`,
      );
      router.push(`/pakta?lampiran=${paktaId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal membuat pakta",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      title={
        "Buat pakta pre-filled dari data pemegang ini, atau buka yang sudah ada"
      }
      className="py-1 px-2.5 rounded-md border-[1.5px] border-line text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-[#1e40af] hover:text-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "⏳ Membuat…" : "📜 Pakta"}
    </button>
  );
}
