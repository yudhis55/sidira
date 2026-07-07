"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportUsulanCSV } from "@/lib/auth/usulan";

interface UsulanCsvExportProps {
  /** When provided, export only usulan for this room. */
  roomId?: string;
  /** Filename without extension. */
  filename?: string;
  size?: "default" | "sm" | "xs";
  variant?: "default" | "outline";
}

/**
 * Client button that fetches the CSV string from the server action
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
      const csv = await exportUsulanCSV(roomId);
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
