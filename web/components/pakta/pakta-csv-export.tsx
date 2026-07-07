"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * Client button yang memanggil server action exportPaktaCSV lalu
 * memicu unduhan CSV di browser.
 */
export function PaktaCsvExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { exportPaktaCSV } = await import("@/lib/auth/pakta");
      const csv = await exportPaktaCSV();
      // Prepend BOM agar Excel membaca UTF-8 dengan benar.
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
      variant="outline"
      onClick={handleExport}
      disabled={loading}
    >
      <Download className="h-4 w-4 mr-1" />
      {loading ? "Mengekspor..." : "Export CSV"}
    </Button>
  );
}
