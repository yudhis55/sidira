"use client";

import { toast } from "sonner";
import type { SBBK } from "@/types/database";

/**
 * Port GAS `sbbkExportCSV` (index.html 24956) — satu baris per barang,
 * diawali BOM agar Excel membaca UTF-8 dengan benar.
 */
const HEADER = [
  "No.SBBK",
  "Tanggal",
  "Kepada",
  "Jenis",
  "Anggaran",
  "NamaBarang",
  "Merk",
  "Qty",
  "Satuan",
  "HargaSatuan",
  "JumlahHarga",
  "Keterangan",
];

function q(v: string | undefined): string {
  return '"' + (v || "").replace(/"/g, '""') + '"';
}

const BOM = String.fromCharCode(0xfeff);

export interface SbbkCsvExportProps {
  sbbk: SBBK[];
  className?: string;
}

export function SbbkCsvExport({ sbbk, className }: SbbkCsvExportProps) {
  const handleExport = () => {
    if (sbbk.length === 0) {
      toast.warning("Belum ada data SBBK");
      return;
    }

    const rows = [HEADER.join(",")];
    for (const d of sbbk) {
      for (const it of d.items || []) {
        rows.push(
          [
            q(d.no),
            d.tgl || "",
            q(d.kepada),
            d.jenis || "",
            q(d.anggaran),
            q(it.nama),
            q(it.merk),
            it.qty || 0,
            it.satuan || "",
            it.harga || 0,
            it.total || 0,
            q(it.ket),
          ].join(",")
        );
      }
    }

    // BOM UTF-8 agar Excel tidak salah membaca karakter Indonesia.
    const blob = new Blob([BOM + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SBBK_Puskesmas_Baruharjo.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV berhasil diunduh");
  };

  return (
    <button type="button" onClick={handleExport} className={className}>
      📥 Export CSV
    </button>
  );
}
