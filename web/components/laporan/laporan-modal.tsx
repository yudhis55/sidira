"use client";

import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import { Button } from "@/components/gas/button";
import { Select } from "@/components/gas/select";
import { StatCard } from "@/components/gas/stat-card";
import { Table, type TableColumn } from "@/components/gas/table";
import { Card } from "@/components/gas/card";
import type { LaporanSummary, LaporanRoom } from "@/lib/mock-data/types";

export type LaporanSumber = "gabungan" | "inventaris" | "ceklist" | "manual";

export interface LaporanModalProps {
  open: boolean;
  onClose: () => void;
  summary: LaporanSummary;
  rooms: LaporanRoom[];
}

const BULAN_OPTIONS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** GAS `lp-sel-sumber` options 1:1 */
const SUMBER_OPTIONS: { value: LaporanSumber; label: string }[] = [
  { value: "gabungan", label: "🔗 Gabungan (Inventaris + Ceklist)" },
  { value: "inventaris", label: "📋 Kondisi Inventaris per Ruangan" },
  { value: "ceklist", label: "📅 Data Ceklist Harian" },
  { value: "manual", label: "✏️ Isi Manual" },
];

const SUMBER_BADGE: Record<
  LaporanSumber,
  { emoji: string; text: string; className: string }
> = {
  gabungan: {
    emoji: "🔗",
    text: "Sumber: Gabungan (Inventaris + Ceklist)",
    className: "bg-violet2 text-violet border-violet3",
  },
  inventaris: {
    emoji: "📋",
    text: "Sumber: Kondisi Inventaris per Ruangan",
    className: "bg-blue2 text-blue border-blue3",
  },
  ceklist: {
    emoji: "📅",
    text: "Sumber: Data Ceklist Harian",
    className: "bg-teal3 text-teal border-teal4",
  },
  manual: {
    emoji: "✏️",
    text: "Sumber: Isi Manual",
    className: "bg-amber2 text-amber border-amber3",
  },
};

const ROOM_COLUMNS: TableColumn[] = [
  { key: "no", label: "No", align: "center", width: "40px" },
  { key: "ruangan", label: "Ruangan" },
  { key: "total", label: "Total", align: "center" },
  { key: "baik", label: "Baik", align: "center" },
  { key: "rr", label: "Rusak Ringan", align: "center" },
  { key: "rb", label: "Rusak Berat", align: "center" },
  { key: "ta", label: "Tidak Ada", align: "center" },
];

function buildTahunOptions(currentYear: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - 2 + i;
    return { value: String(y), label: String(y) };
  });
}

/**
 * GAS `#laporanModal` parity — violet head, filters Bulan/Tahun/Sumber,
 * summary + rekap per ruangan. Mock props only; client-side print.
 */
function defaultLaporanFilters() {
  const d = new Date();
  return {
    bulan: d.getMonth() + 1,
    tahun: d.getFullYear(),
    sumber: "gabungan" as LaporanSumber,
  };
}

export function LaporanModal({
  open,
  onClose,
  summary,
  rooms,
}: LaporanModalProps) {
  // Filters init once; parent remounts with key when re-opening to reset (GAS openLaporanModal).
  const initial = React.useMemo(() => defaultLaporanFilters(), []);
  const [bulan, setBulan] = React.useState(initial.bulan);
  const [tahun, setTahun] = React.useState(initial.tahun);
  const [sumber, setSumber] = React.useState<LaporanSumber>(initial.sumber);

  const tahunOptions = React.useMemo(
    () => buildTahunOptions(initial.tahun),
    [initial.tahun]
  );

  const periodLabel = `${BULAN_NAMES[bulan - 1]} ${tahun}`;
  const badge = SUMBER_BADGE[sumber];

  // Mock data is static by period — still render controls + badge for parity
  const roomRows = rooms.map((room, idx) => ({
    no: <span className="font-mono font-bold">{idx + 1}</span>,
    ruangan: (
      <span className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          {room.room_icon}
        </span>
        <span className="font-semibold">{room.room_name}</span>
      </span>
    ),
    total: (
      <span className="font-mono font-bold tabular-nums">
        {room.summary.total}
      </span>
    ),
    baik: (
      <span className="inline-flex items-center justify-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold bg-teal4 text-teal font-mono tabular-nums">
        {room.summary.baik}
      </span>
    ),
    rr: (
      <span className="inline-flex items-center justify-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold bg-amber2 text-amber font-mono tabular-nums">
        {room.summary.rr}
      </span>
    ),
    rb: (
      <span className="inline-flex items-center justify-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold bg-red2 text-red font-mono tabular-nums">
        {room.summary.rb}
      </span>
    ),
    ta: (
      <span className="inline-flex items-center justify-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold bg-slate2 text-slate font-mono tabular-nums">
        {room.summary.ta}
      </span>
    ),
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} size="xl" zIndex={3100}>
      {/* Head — GAS .laporan-modal-head violet gradient */}
      <div
        className="flex items-center gap-3.5 px-6 py-[18px] shrink-0"
        style={{
          background: "linear-gradient(135deg, #3b0764, #7c3aed)",
        }}
      >
        <div className="text-[28px] leading-none shrink-0" aria-hidden>
          📄
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[16px] font-extrabold text-white leading-tight">
            Laporan Monitoring
          </h2>
          <p className="m-0 mt-0.5 text-[11.5px] text-white/65 leading-snug">
            Pemeliharaan Sarpras &amp; Alkes · {periodLabel} · Puskesmas
            Baruharjo
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 rounded-lg border border-white/20 bg-white/12 px-[13px] py-1.5 text-xs font-bold text-white hover:bg-white/22 transition-colors"
          aria-label="Tutup modal laporan"
        >
          ✕ Tutup
        </button>
      </div>

      {/* Options bar — GAS .laporan-options */}
      <div className="flex flex-wrap items-end gap-3.5 border-b border-line bg-[#faf5ff] px-6 py-4 shrink-0">
        <Select
          label="Bulan"
          value={String(bulan)}
          onChange={(e) => setBulan(parseInt(e.target.value, 10))}
          options={BULAN_OPTIONS}
          className="w-40 border-[#d8b4fe] text-[#3b0764] font-semibold focus:border-[#7c3aed]"
        />
        <Select
          label="Tahun"
          value={String(tahun)}
          onChange={(e) => setTahun(parseInt(e.target.value, 10))}
          options={tahunOptions}
          className="w-28 border-[#d8b4fe] text-[#3b0764] font-semibold focus:border-[#7c3aed]"
        />
        <Select
          label="Sumber"
          value={sumber}
          onChange={(e) => setSumber(e.target.value as LaporanSumber)}
          options={SUMBER_OPTIONS}
          className="min-w-[220px] border-[#d8b4fe] text-[#3b0764] font-semibold focus:border-[#7c3aed]"
        />
        <Button
          type="button"
          onClick={handlePrint}
          className="ml-auto bg-[#7c3aed] text-white hover:bg-[#6d28d9] hover:opacity-100 px-[22px] py-[9px] gap-2"
        >
          🖨️ Cetak / PDF
        </Button>
      </div>

      {/* Body — summary + room table */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Sumber badge (GAS .lp-src-badge) */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-[10.5px] font-semibold ${badge.className}`}
        >
          <span aria-hidden>{badge.emoji}</span>
          <span>{badge.text}</span>
          <span className="text-ink3 font-normal">· {periodLabel}</span>
        </div>

        {/* Summary stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            emoji="🏥"
            value={summary.total_rooms}
            label="Total Ruangan"
          />
          <StatCard
            emoji="📦"
            value={summary.total_items}
            label="Total Barang"
          />
          <StatCard
            emoji="✅"
            value={summary.total_baik}
            label={`Baik (${summary.percentage_baik}%)`}
            variant="teal"
          />
          <StatCard
            emoji="⚠️"
            value={summary.total_rr}
            label={`RR (${summary.percentage_rr}%)`}
            variant="amber"
          />
          <StatCard
            emoji="❌"
            value={summary.total_rb}
            label={`RB (${summary.percentage_rb}%)`}
            variant="red"
          />
          <StatCard
            emoji="➖"
            value={summary.total_ta}
            label={`TA (${summary.percentage_ta}%)`}
            variant="slate"
          />
        </div>

        {/* Room breakdown */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wide m-0">
              Rekap Per Ruangan
            </h3>
          </div>
          <Table
            columns={ROOM_COLUMNS}
            rows={roomRows}
            striped
            emptyMessage="Belum ada data ruangan"
          />
        </Card>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2.5 border-t border-line px-6 py-3.5 shrink-0 bg-white">
        <Button type="button" variant="modal-cancel" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </Dialog>
  );
}
