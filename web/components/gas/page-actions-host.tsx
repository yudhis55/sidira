"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageActions } from "@/components/gas/page-actions";
import { RiwayatModal } from "@/components/riwayat/riwayat-modal";
import { LaporanModal } from "@/components/laporan/laporan-modal";
import type { RiwayatPindah } from "@/types/database";
import type { LaporanSummary, LaporanRoom } from "@/lib/mock-data/types";

export interface PageActionsHostProps {
  riwayatItems: RiwayatPindah[];
  laporanSummary: LaporanSummary;
  laporanRooms: LaporanRoom[];
  /** Border-top + padding like GAS .page-actions. Default true. */
  withDivider?: boolean;
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

/**
 * Client host for dashboard page-actions: owns modal open state and
 * optionally soft-opens via `?modal=riwayat|laporan` (for T7 deprecation).
 *
 * Soft-open is captured during render (React-supported props→state adjust),
 * then URL is cleaned in an effect that only calls router.replace (no setState).
 */
export function PageActionsHost({
  riwayatItems,
  laporanSummary,
  laporanRooms,
  withDivider = true,
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

  return (
    <>
      <PageActions
        onOpenLaporan={() => setOpenLaporan(true)}
        onOpenRiwayat={() => setOpenRiwayat(true)}
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
