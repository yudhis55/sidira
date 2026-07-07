"use client";

import { UsulanFilterChips } from "./usulan-filter-chips";

const PRIORITAS_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "mendesak", label: "⚠ Mendesak" },
  { key: "penting", label: "Penting" },
  { key: "rencana", label: "Rencana" },
];

const STATUS_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "diajukan", label: "Diajukan" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
];

/**
 * Client filter chips for the usulan detail page. Updates URL searchParams
 * for `prioritas` and `status` so the server component can filter items.
 */
export function UsulanDetailFilters() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">Prioritas:</span>
        <UsulanFilterChips paramKey="prioritas" chips={PRIORITAS_CHIPS} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">Status:</span>
        <UsulanFilterChips paramKey="status" chips={STATUS_CHIPS} />
      </div>
    </div>
  );
}
