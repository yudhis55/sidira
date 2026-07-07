"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

/**
 * Auto-triggers window.print() on mount and renders a small manual
 * "Cetak" button for accessibility. Placed inside the print page.
 */
export function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="print:hidden flex justify-center pb-4">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm hover:bg-neutral-100"
      >
        <Printer className="h-4 w-4" />
        Cetak / Simpan PDF
      </button>
    </div>
  );
}
