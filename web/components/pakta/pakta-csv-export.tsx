"use client";

/**
 * Tombol Export CSV Pakta — port GAS `paktaExportCSV`
 * (gas-legacy/index.html 26044+).
 *
 * Bentuk CSV persis GAS: SATU BARIS PER PAKTA
 * (No, Nama, NIP, Jabatan, Alamat, Hari, Tanggal, JmlAset),
 * BOM UTF-8, nama file sama, guard kosong + toast sama.
 * Sumber data = daftar Supabase yang terlihat di tabel.
 */
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/gas/button";
import { getPaktaList } from "@/lib/auth/pakta";
import { countAset } from "@/lib/pakta-utils";
import type { Pakta } from "@/types/database";

function escapeCsv(v: string | number): string {
  const s = String(v ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Satu baris per pakta — kolom persis GAS (urutan + nama sama). */
function buildPaktaCsv(list: Pakta[]): string {
  const header = [
    "No",
    "Nama",
    "NIP",
    "Jabatan",
    "Alamat",
    "Hari",
    "Tanggal",
    "JmlAset",
  ];
  const rows: string[] = [header.join(",")];

  list.forEach((d, i) => {
    rows.push(
      [
        escapeCsv(i + 1),
        escapeCsv(d.nama || ""),
        escapeCsv(d.nip || ""),
        escapeCsv(d.jabatan || ""),
        escapeCsv(d.alamat || ""),
        escapeCsv(d.hari || ""),
        escapeCsv(d.tgl || ""),
        escapeCsv(countAset(d)),
      ].join(",")
    );
  });

  return rows.join("\r\n");
}

export function PaktaCsvExport({
  className,
  data,
}: {
  className?: string;
  /** Daftar dari Supabase (dioper dari halaman) — bila kosong, diambil sendiri. */
  data?: Pakta[];
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    // GAS: tolak saat kosong. Sumber = data Supabase yang terlihat di tabel.
    const list = data ?? (await getPaktaList().catch(() => [] as Pakta[]));
    if (list.length === 0) {
      toast.warning("Belum ada data Pakta");
      return;
    }
    setLoading(true);
    try {
      const csv = buildPaktaCsv(list);
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Pakta_Integritas_BMD_Puskesmas_Baruharjo.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV berhasil diunduh");
    } catch (error) {
      console.error("Gagal export CSV Pakta:", error);
      toast.error("Gagal mengekspor CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleExport}
      disabled={loading}
      className={className ?? "text-xs"}
      style={{ fontSize: "12px", cursor: "pointer" }}
    >
      {"\u{1F4E5}"} {loading ? "Mengekspor..." : "Export CSV"}
    </Button>
  );
}
