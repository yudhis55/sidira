"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LaporanSummary, LaporanRoom } from "@/lib/auth/laporan";

interface ExportButtonsProps {
  bulan: number;
  tahun: number;
  room_id?: string;
  kategori?: string;
  summary: LaporanSummary;
  rooms: LaporanRoom[];
}

export function ExportButtons({
  bulan,
  tahun,
  room_id,
  kategori,
  summary,
  rooms,
}: ExportButtonsProps) {
  const bulanNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const exportToCSV = () => {
    const headers = ["Ruangan", "Nama Barang", "Kategori", "Kondisi", "Tanggal"];
    const rows: string[][] = [];

    rooms.forEach((room) => {
      room.items.forEach((item) => {
        rows.push([
          room.room_name,
          item.nama,
          item.kategori,
          item.kondisi_terbaru,
          item.tanggal_terbaru || "-",
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan_inventaris_${bulanNames[bulan - 1]}_${tahun}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = {
      periode: `${bulanNames[bulan - 1]} ${tahun}`,
      summary,
      rooms,
    };

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan_inventaris_${bulanNames[bulan - 1]}_${tahun}.json`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="mr-2 h-4 w-4" />
          Export JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport}>
          <FileText className="mr-2 h-4 w-4" />
          Print / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
