"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface PageActionsProps {
  onOpenLaporan: () => void;
  onOpenRiwayat: () => void;
  onOpenRekap?: () => void;
  onPrint?: () => void;
  onExportUsulan?: () => void;
  onExportCsv?: () => void;
  onSimpan?: () => void;
  /** Show 📦 Riwayat Pindah button. Default true. */
  showRiwayat?: boolean;
  /** Border-top + padding like GAS .page-actions. Default false. */
  withDivider?: boolean;
  className?: string;
}

const btnBase: CSSProperties = {
  padding: "10px 22px",
  borderRadius: "var(--r2)",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  transition: "all 0.18s",
};

/**
 * GAS `.page-actions` toolbar — full 7-button set.
 * Optional handlers keep older call sites backward-compatible.
 *
 * Density match GAS:
 * - gap 10px, justify flex-end
 * - margin-top 28px, padding-top 20px, border-top 1px var(--line)
 * - btn: padding 10px 22px, font 13px/700, gap 7px, radius var(--r2)
 */
export function PageActions({
  onOpenLaporan,
  onOpenRiwayat,
  onOpenRekap,
  onPrint,
  onExportUsulan,
  onExportCsv,
  onSimpan,
  showRiwayat = true,
  withDivider = false,
  className,
}: PageActionsProps) {
  return (
    <div
      className={cn("page-actions", className)}
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        ...(withDivider
          ? {
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid var(--line)",
            }
          : {}),
      }}
    >
      <button
        type="button"
        onClick={onOpenLaporan}
        style={{
          ...btnBase,
          border: "none",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff",
        }}
      >
        📄 Laporan Monitoring
      </button>
      {onOpenRekap && (
        <button
          type="button"
          onClick={onOpenRekap}
          style={{
            ...btnBase,
            border: "none",
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            color: "#fff",
          }}
        >
          📊 Rekap Kondisi Sarana & Alkes
        </button>
      )}
      {onPrint && (
        <button
          type="button"
          onClick={onPrint}
          style={{
            ...btnBase,
            background: "#fff",
            border: "1.5px solid var(--line)",
            color: "var(--ink2)",
          }}
        >
          🖨️ Cetak
        </button>
      )}
      {showRiwayat && (
        <button
          type="button"
          onClick={onOpenRiwayat}
          style={{
            ...btnBase,
            background: "#fff",
            border: "1.5px solid var(--line)",
            color: "var(--ink2)",
          }}
        >
          📦 Riwayat Pindah
        </button>
      )}
      {onExportUsulan && (
        <button
          type="button"
          onClick={onExportUsulan}
          style={{
            ...btnBase,
            background: "#fff",
            border: "1.5px solid var(--line)",
            color: "var(--ink2)",
          }}
        >
          📋 Export Rekap Usulan
        </button>
      )}
      {onExportCsv && (
        <button
          type="button"
          onClick={onExportCsv}
          style={{
            ...btnBase,
            background: "#fff",
            border: "1.5px solid var(--line)",
            color: "var(--ink2)",
          }}
        >
          📥 Export CSV
        </button>
      )}
      {onSimpan && (
        <button
          type="button"
          onClick={onSimpan}
          style={{
            ...btnBase,
            border: "none",
            background: "linear-gradient(135deg, var(--teal2), var(--teal))",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(14, 124, 107, 0.28)",
          }}
        >
          💾 Simpan Data
        </button>
      )}
    </div>
  );
}
