"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageActions } from "@/components/gas/page-actions";
import { RiwayatModal } from "@/components/riwayat/riwayat-modal";
import { LaporanModal } from "@/components/laporan/laporan-modal";
import type { Item, RiwayatPindah } from "@/types/database";
import type { LaporanSummary, LaporanRoom } from "@/lib/mock-data/types";

export interface PageActionsHostProps {
  riwayatItems: RiwayatPindah[];
  laporanSummary: LaporanSummary;
  laporanRooms: LaporanRoom[];
  /** Border-top + padding like GAS .page-actions. Default true. */
  withDivider?: boolean;
  /** When set, export CSV uses these items (room scope). Else toast global mock. */
  exportItems?: Item[];
  roomName?: string;
}

function cleanModalQuery(
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>
) {
  const params = new URLSearchParams(searchParams.toString());
  if (!params.has("modal")) return;
  params.delete("modal");
  const qs = params.toString();
  router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Client host for page-actions: owns modal open state and
 * optionally soft-opens via `?modal=riwayat|laporan` (for T7 deprecation).
 *
 * Soft-open is captured during render (React-supported props→state adjust),
 * then URL is cleaned in an effect that only calls router.replace (no setState).
 *
 * Always wires all 7 GAS toolbar handlers so the full toolbar shows.
 */
export function PageActionsHost({
  riwayatItems,
  laporanSummary,
  laporanRooms,
  withDivider = true,
  exportItems,
  roomName,
}: PageActionsHostProps) {
  const [openLaporan, setOpenLaporan] = React.useState(false);
  const [openRiwayat, setOpenRiwayat] = React.useState(false);
  /** Captured soft-open target; survives URL clean until user closes. */
  const [softModal, setSoftModal] = React.useState<"riwayat" | "laporan" | null>(
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  const modalParam = searchParams.get("modal");

  // Capture soft-open when ?modal= appears (adjust state during render — not an effect).
  if (
    (modalParam === "riwayat" || modalParam === "laporan") &&
    softModal !== modalParam
  ) {
    setSoftModal(modalParam);
  }

  const showRiwayat = openRiwayat || softModal === "riwayat";
  const showLaporan = openLaporan || softModal === "laporan";

  // Clean ?modal= after soft-open so refresh doesn't re-open (router only — no setState).
  React.useEffect(() => {
    if (modalParam !== "riwayat" && modalParam !== "laporan") return;
    cleanModalQuery(searchParams, router);
  }, [modalParam, searchParams, router]);

  const closeRiwayat = () => {
    setOpenRiwayat(false);
    setSoftModal(null);
    cleanModalQuery(searchParams, router);
  };

  const closeLaporan = () => {
    setOpenLaporan(false);
    setSoftModal(null);
    cleanModalQuery(searchParams, router);
  };

  const handleExportCsv = () => {
    if (exportItems) {
      const rows: string[][] = [
        ["Nama", "Kategori", "Kondisi", "Jumlah", "Merk", "Tahun"],
        ...exportItems.map((it) => [
          it.name,
          it.category,
          it.condition,
          String(it.quantity ?? 0),
          it.merk ?? "",
          it.year != null ? String(it.year) : "",
        ]),
      ];
      const safeName = (roomName ?? "export")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
      downloadCsv(`inventaris-${safeName || "export"}.csv`, rows);
      toast.success("CSV berhasil diunduh");
      return;
    }
    toast.info("Export CSV (mock) — data global belum di-scope");
  };

  return (
    <>
      <PageActions
        onOpenLaporan={() => setOpenLaporan(true)}
        onOpenRiwayat={() => setOpenRiwayat(true)}
        onOpenRekap={() =>
          toast.info("Rekap Kondisi (mock) — modal rekap belum di-port")
        }
        onPrint={() => window.print()}
        onExportUsulan={() =>
          toast.success("Export Rekap Usulan (mock CSV)")
        }
        onExportCsv={handleExportCsv}
        onSimpan={() => toast.success("✓ Data berhasil disimpan!")}
        withDivider={withDivider}
      />
      <RiwayatModal
        key={showRiwayat ? "riwayat-open" : "riwayat-closed"}
        open={showRiwayat}
        onClose={closeRiwayat}
        items={riwayatItems}
      />
      <LaporanModal
        key={showLaporan ? "laporan-open" : "laporan-closed"}
        open={showLaporan}
        onClose={closeLaporan}
        summary={laporanSummary}
        rooms={laporanRooms}
      />
    </>
  );
}
