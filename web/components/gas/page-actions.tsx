"use client";

import { cn } from "@/lib/utils";

export interface PageActionsProps {
  onOpenLaporan: () => void;
  onOpenRiwayat: () => void;
  /** Show 📦 Riwayat Pindah button. Default true. */
  showRiwayat?: boolean;
  /** Border-top + padding like GAS .page-actions. Default false. */
  withDivider?: boolean;
  className?: string;
}

/**
 * GAS `.page-actions` toolbar — Laporan Monitoring + Riwayat Pindah only.
 * Click handlers open modals (wired by parent); no navigation to /laporan or /riwayat.
 *
 * Density match GAS:
 * - gap 10px, justify flex-end
 * - margin-top 28px, padding-top 20px, border-top 1px var(--line)
 * - btn: padding 10px 22px, font 13px/700, gap 7px, radius var(--r2)
 * - Laporan: violet gradient (.btn-laporan)
 * - Riwayat: ghost (.btn-ghost)
 */
export function PageActions({
  onOpenLaporan,
  onOpenRiwayat,
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
        className="btn btn-laporan"
        style={{
          padding: "10px 22px",
          borderRadius: "var(--r2)",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          transition: "all 0.18s",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff",
        }}
      >
        📄 Laporan Monitoring
      </button>
      {showRiwayat ? (
        <button
          type="button"
          onClick={onOpenRiwayat}
          className="btn btn-ghost"
          style={{
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
            background: "#fff",
            border: "1.5px solid var(--line)",
            color: "var(--ink2)",
          }}
        >
          📦 Riwayat Pindah
        </button>
      ) : null}
    </div>
  );
}
