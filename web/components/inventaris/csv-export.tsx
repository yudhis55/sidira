"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportInventarisCSV } from "@/lib/auth/inventaris-export";
import { exportUsulanCSV } from "@/lib/auth/usulan";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export all inventory items across rooms (GAS exportCSV). */
export function InventarisCsvExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await exportInventarisCSV();
      downloadCsv(csv, "Inventaris_Puskesmas_Baruharjo.csv");
    } catch (error) {
      console.error("Gagal export CSV inventaris:", error);
      alert("Gagal mengekspor CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleExport} disabled={loading}>
      {"📥"} {loading ? "Mengekspor..." : "Export CSV"}
    </Button>
  );
}

/** Export recap of all usulan across rooms (GAS exportAllUsulanCSV). */
export function UsulanRekapCsvExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await exportUsulanCSV();
      downloadCsv(csv, "Rekap_Usulan_Puskesmas_Baruharjo.csv");
    } catch (error) {
      console.error("Gagal export CSV usulan:", error);
      alert("Gagal mengekspor CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleExport} disabled={loading}>
      {"📥"} {loading ? "Mengekspor..." : "Export Rekap Usulan"}
    </Button>
  );
}
