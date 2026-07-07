"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * Client button that fetches the CSV string from the server action
 * and triggers a browser download.
 */
export function SbbkCsvExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { exportSbbkCSV } = await import("@/lib/auth/sbbk");
      const csv = await exportSbbkCSV();
      // Prepend BOM so Excel reads UTF-8 correctly.
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "SBBK_Puskesmas_Baruharjo.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal export CSV SBBK:", error);
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
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Mengekspor..." : "Export CSV"}
    </Button>
  );
}
