"use client";

/**
 * Tombol 📜 Pakta pada Rekap Pemegang — port GAS `riBuatPakta`
 * (gas-legacy/index.html 26994+).
 *
 * GAS tidak membuka form kosong: bila pemegang sudah punya pakta → konfirmasi
 * lalu buka lampiran yang ada; bila belum → record dibuat pre-filled dari data
 * pemegang + asetnya, lalu lampirannya langsung dibuka.
 *
 * Di SIDIRA v4 (multi-route) keduanya berakhir di panel Pakta dengan panel
 * lampiran terbuka — `/pakta?lampiran=<id>` (daftar pakta membaca query itu).
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMockPakta } from "@/lib/mock-data";
import {
  addPaktaRecords,
  buildPaktaFromPemegang,
  findPaktaForPemegang,
  useAddedPakta,
  useHiddenPaktaIds,
} from "@/lib/pakta-store";
import type { AsetPemegang, PemegangInventaris } from "@/types/database";

export function RekapPaktaButton({
  pemegang,
  asetList,
}: {
  pemegang: PemegangInventaris;
  asetList: AsetPemegang[];
}) {
  const router = useRouter();
  const [added] = useAddedPakta();
  const [hidden] = useHiddenPaktaIds();
  const staticPakta = React.useMemo(() => getMockPakta(), []);

  function handle() {
    const existing = findPaktaForPemegang(
      pemegang.nama,
      staticPakta,
      added,
      hidden
    );

    if (existing) {
      // GAS `riBuatPakta` (26999-27013): tawarkan lampiran yang sudah ada.
      if (
        !confirm(
          `Pakta untuk ${pemegang.nama} sudah ada.\nBuka lampiran yang sudah ada?`
        )
      )
        return;
      router.push(`/pakta?lampiran=${existing.id}`);
      return;
    }

    // GAS 27058-27084: susun record + lampiran otomatis, simpan, lalu buka.
    const rec = buildPaktaFromPemegang(
      pemegang,
      asetList,
      `pakta-${Date.now()}`
    );
    addPaktaRecords([rec]);
    toast.success(
      `✅ Pakta + lampiran untuk ${pemegang.nama} dibuat otomatis`
    );
    router.push(`/pakta?lampiran=${rec.id}`);
  }

  return (
    <button
      type="button"
      onClick={handle}
      title={
        "Buat pakta pre-filled dari data pemegang ini, atau buka yang sudah ada"
      }
      className="py-1 px-2.5 rounded-md border-[1.5px] border-line text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-[#1e40af] hover:text-[#1e40af]"
    >
      {"\uD83D\uDCDC"} Pakta
    </button>
  );
}