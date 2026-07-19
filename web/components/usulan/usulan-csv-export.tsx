"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getMockUsulan } from "@/lib/mock-data";
import {
  USULAN_KATEGORI_LABELS,
  USULAN_PRIORITAS_LABELS,
  USULAN_STATUS_LABELS,
} from "@/lib/usulan-types";

interface UsulanCsvExportProps {
  /** When provided, export only usulan for this room. */
  roomId?: string;
  /** Filename without extension. */
  filename?: string;
  size?: "default" | "sm" | "xs";
  variant?: "default" | "outline";
}

function buildCsv(roomId?: string): string {
  const list = getMockUsulan(roomId);
  const header = [
    "ID Usulan",
    "Ruangan",
    "Tanggal",
    "Nama Barang",
    "Kategori",
    "Prioritas",
    "Qty",
    "Satuan",
    "Harga",
    "Total",
    "Status",
    "Keterangan",
  ];
  const rows: string[][] = [header];

  for (const u of list) {
    const roomName = u.rooms?.name || u.room_id;
    const date = u.created_at?.slice(0, 10) || "";
    const items = u.payload?.items || [];
    if (items.length === 0) {
      rows.push([
        String(u.id),
        roomName,
        date,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      continue;
    }
    for (const item of items) {
      rows.push([
        String(u.id),
        roomName,
        date,
        item.nama,
        USULAN_KATEGORI_LABELS[item.kategori] || item.kategori,
        USULAN_PRIORITAS_LABELS[item.prioritas] || item.prioritas,
        String(item.qty),
        item.satuan,
        String(item.harga),
        String(item.total),
        USULAN_STATUS_LABELS[item.status] || item.status,
        item.keterangan || "",
      ]);
    }
  }

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
}

/**
 * Client button that builds CSV from mock usulan data
 * and triggers a browser download.
 */
export function UsulanCsvExport({
  roomId,
  filename,
  size = "sm",
  variant = "outline",
}: UsulanCsvExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = buildCsv(roomId);
      // Prepend BOM so Excel reads UTF-8 correctly.
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (filename || "Usulan_Pengadaan") + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal export CSV Usulan:", error);
      alert("Gagal mengekspor CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Export CSV
    </Button>
  );
}
