"use client";

import type { ReactNode } from "react";
import {
  ArrowsLeftRight,
  ChartBar,
  ClipboardText,
  DownloadSimple,
  FileText,
  FloppyDisk,
  Printer,
} from "@phosphor-icons/react";
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

/** Tombol sekunder: putih, border 1px, hover permukaan lembut. */
function SecondaryButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 max-md:w-full"
    >
      <span aria-hidden className="text-text-3">
        {icon}
      </span>
      {children}
    </button>
  );
}

/**
 * Toolbar aksi halaman. Satu aksi primer (teal solid) — sisanya sekunder.
 * Ikon Phosphor (bukan emoji), tanpa gradient/shadow.
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
      className={cn(
        "page-actions flex flex-wrap justify-end gap-2.5 max-md:flex-col max-md:items-stretch",
        className
      )}
      style={
        withDivider
          ? {
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border)",
            }
          : undefined
      }
    >
      <SecondaryButton onClick={onOpenLaporan} icon={<FileText size={15} />}>
        Laporan Monitoring
      </SecondaryButton>

      {onOpenRekap && (
        <SecondaryButton onClick={onOpenRekap} icon={<ChartBar size={15} />}>
          Rekap Kondisi Sarana &amp; Alkes
        </SecondaryButton>
      )}

      {onPrint && (
        <SecondaryButton onClick={onPrint} icon={<Printer size={15} />}>
          Cetak
        </SecondaryButton>
      )}

      {showRiwayat && (
        <SecondaryButton
          onClick={onOpenRiwayat}
          icon={<ArrowsLeftRight size={15} />}
        >
          Riwayat Pindah
        </SecondaryButton>
      )}

      {onExportUsulan && (
        <SecondaryButton
          onClick={onExportUsulan}
          icon={<ClipboardText size={15} />}
        >
          Export Rekap Usulan
        </SecondaryButton>
      )}

      {onExportCsv && (
        <SecondaryButton
          onClick={onExportCsv}
          icon={<DownloadSimple size={15} />}
        >
          Export CSV
        </SecondaryButton>
      )}

      {onSimpan && (
        <button
          type="button"
          onClick={onSimpan}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 max-md:w-full"
        >
          <FloppyDisk size={15} aria-hidden />
          Simpan Data
        </button>
      )}
    </div>
  );
}
