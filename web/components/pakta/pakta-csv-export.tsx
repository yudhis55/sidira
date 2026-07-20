"use client";

import { useState } from "react";
import { Button } from "@/components/gas/button";
import { getMockPakta } from "@/lib/mock-data";
import type {
  Pakta,
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeCsv(v: string | number): string {
  const s = String(v ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build Pakta CSV from mock list (GAS paktaExportCSV parity). */
function buildPaktaCsv(list: Pakta[]): string {
  const header = [
    "No",
    "Nama",
    "NIP",
    "Jabatan",
    "Tanggal",
    "Hari",
    "Jenis Aset",
    "Merk/Type",
    "Tahun",
    "No Polisi/Seri",
    "Harga",
    "Keterangan",
  ];
  const rows: string[] = [header.join(",")];
  let no = 0;

  for (const p of list) {
    const kend = (p.aset_kendaraan || []).filter(
      (r: PaktaAsetKendaraan) => r && (r.merk || r.jenis),
    );
    const lapt = (p.aset_laptop || []).filter(
      (r: PaktaAsetLaptop) => r && (r.merk || r.type),
    );
    const alat = (p.aset_alat || []).filter(
      (r: PaktaAsetAlat) => r && (r.merk || r.type),
    );
    const total = kend.length + lapt.length + alat.length;
    const base = [
      escapeCsv(p.nama || ""),
      escapeCsv(p.nip || ""),
      escapeCsv(p.jabatan || ""),
      escapeCsv(fmtDate(p.tgl)),
      escapeCsv(p.hari || ""),
    ];

    if (total === 0) {
      no++;
      rows.push(
        [escapeCsv(no), ...base, "", "", "", "", "", ""].join(","),
      );
      continue;
    }
    for (const r of kend) {
      no++;
      rows.push(
        [
          escapeCsv(no),
          ...base,
          escapeCsv("Kendaraan"),
          escapeCsv(r.merk || r.jenis || ""),
          escapeCsv(r.tahun ?? ""),
          escapeCsv(r.nopol || ""),
          escapeCsv(r.harga || ""),
          escapeCsv(r.ket || ""),
        ].join(","),
      );
    }
    for (const r of lapt) {
      no++;
      rows.push(
        [
          escapeCsv(no),
          ...base,
          escapeCsv("Laptop"),
          escapeCsv([r.merk, r.type].filter(Boolean).join(" ") || ""),
          escapeCsv(r.tahun ?? ""),
          escapeCsv(r.seri || ""),
          escapeCsv(r.harga || ""),
          escapeCsv(r.ket || ""),
        ].join(","),
      );
    }
    for (const r of alat) {
      no++;
      rows.push(
        [
          escapeCsv(no),
          ...base,
          escapeCsv("Alat"),
          escapeCsv([r.merk, r.type].filter(Boolean).join(" ") || ""),
          escapeCsv(r.tahun ?? ""),
          escapeCsv(r.seri || ""),
          escapeCsv(r.harga || ""),
          escapeCsv(r.ket || ""),
        ].join(","),
      );
    }
  }

  return rows.join("\r\n");
}

/**
 * Client button — mock CSV download (no auth backend).
 * Matches GAS Export CSV label.
 */
export function PaktaCsvExport({
  className,
}: {
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    try {
      const csv = buildPaktaCsv(getMockPakta());
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
    } catch (error) {
      console.error("Gagal export CSV Pakta:", error);
      alert("Gagal mengekspor CSV");
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
    >
      {"\u{1F4E5}"} {loading ? "Mengekspor..." : "Export CSV"}
    </Button>
  );
}
