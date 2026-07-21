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

/** GAS empty-sumber tips (lp-src-badge empty / empty table) */
const SUMBER_TIPS: Record<LaporanSumber, string> = {
  gabungan:
    "Tidak ada item bermasalah di inventaris maupun ceklist bulan ini. Rekap di bawah menampilkan ringkasan kondisi per ruangan (mock).",
  inventaris:
    "Semua item inventaris dalam kondisi Baik - atau data mock belum memuat item bermasalah. Rekap per ruangan tetap ditampilkan.",
  ceklist:
    "Tidak ada catatan kerusakan di ceklist untuk periode terpilih. Gunakan mode ✏️ Isi Manual di GAS untuk mengisi langsung; di mock, rekap ruangan tetap tampil.",
  manual:
    "Mode Isi Manual: di GAS baris dapat diedit langsung. Di mock, gunakan rekap per ruangan di bawah sebagai ringkasan kondisi.",
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

/** GAS `.laporan-select` classes (violet chrome) */
const SELECT_CLASS =
  "w-auto min-w-0 border-[1.5px] border-[#d8b4fe] rounded-lg px-3 py-[7px] text-[12.5px] font-semibold text-[#3b0764] bg-white focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_#7c3aed20]";

function buildTahunOptions(currentYear: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - 2 + i;
    return { value: String(y), label: String(y) };
  });
}

/**
 * GAS `#laporanModal` parity - violet head, filters Bulan/Tahun/Sumber,
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

function CondCell({
  value,
  tone,
}: {
  value: number;
  tone: "baik" | "rr" | "rb" | "ta";
}) {
  const tones = {
    baik: "bg-teal4 text-teal",
    rr: "bg-amber2 text-amber",
    rb: "bg-red2 text-red",
    ta: "bg-slate2 text-slate",
  } as const;
  return (
    <span
      className={`inline-flex min-w-[28px] items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold font-mono tabular-nums ${tones[tone]}`}
    >
      {value}
    </span>
  );
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
  const tip = SUMBER_TIPS[sumber];

  // Mock data is static by period - still render controls + badge for parity
  const roomRows = rooms.map((room, idx) => ({
    no: <span className="font-mono text-[12px] font-bold">{idx + 1}</span>,
    ruangan: (
      <span className="flex items-center gap-2">
        <span className="text-base leading-none" aria-hidden>
          {room.room_icon}
        </span>
        <span className="text-[13px] font-semibold">{room.room_name}</span>
      </span>
    ),
    total: (
      <span className="font-mono text-[12px] font-bold tabular-nums">
        {room.summary.total}
      </span>
    ),
    baik: <CondCell value={room.summary.baik} tone="baik" />,
    rr: <CondCell value={room.summary.rr} tone="rr" />,
    rb: <CondCell value={room.summary.rb} tone="rb" />,
    ta: <CondCell value={room.summary.ta} tone="ta" />,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      zIndex={3100}
      panelClassName="max-w-[920px] rounded-2xl shadow-[0_28px_72px_rgba(0,0,0,0.28)]"
      overlayClassName="items-start justify-center overflow-y-auto px-4 py-7 bg-[rgba(8,18,40,0.65)]"
    >
      {/* Head - GAS .laporan-modal-head */}
      <div
        className="flex shrink-0 items-center gap-3.5 px-6 py-[18px]"
        style={{
          background: "linear-gradient(135deg, #3b0764, #7c3aed)",
        }}
      >
        <div className="shrink-0 text-[28px] leading-none" aria-hidden>
          📄
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[16px] font-extrabold leading-tight text-white">
            Laporan Monitoring Pemeliharaan Sarpras &amp; Alkes
          </h2>
          <p className="m-0 mt-0.5 text-[11.5px] leading-snug text-white/65">
            Bukti Pelaksanaan Monitoring, Tindak Lanjut dan Evaluasi · Puskesmas
            Baruharjo
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 rounded-lg border border-white/20 bg-white/12 px-[13px] py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/22"
          aria-label="Tutup modal laporan"
        >
          ✕ Tutup
        </button>
      </div>

      {/* Options bar - GAS .laporan-options (inline labels, violet selects) */}
      <div className="flex shrink-0 flex-wrap items-end gap-3.5 border-b border-[#e2e8ef] bg-[#faf5ff] px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="lp-sel-bulan"
            className="min-w-[60px] whitespace-nowrap text-[11.5px] font-bold text-[#374151]"
          >
            Bulan:
          </label>
          <Select
            id="lp-sel-bulan"
            value={String(bulan)}
            onChange={(e) => setBulan(parseInt(e.target.value, 10))}
            options={BULAN_OPTIONS}
            className={`${SELECT_CLASS} w-40`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="lp-sel-tahun"
            className="min-w-[60px] whitespace-nowrap text-[11.5px] font-bold text-[#374151]"
          >
            Tahun:
          </label>
          <Select
            id="lp-sel-tahun"
            value={String(tahun)}
            onChange={(e) => setTahun(parseInt(e.target.value, 10))}
            options={tahunOptions}
            className={`${SELECT_CLASS} w-[7.5rem]`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="lp-sel-sumber"
            className="min-w-[60px] whitespace-nowrap text-[11.5px] font-bold text-[#374151]"
          >
            Sumber:
          </label>
          <Select
            id="lp-sel-sumber"
            value={sumber}
            onChange={(e) => setSumber(e.target.value as LaporanSumber)}
            options={SUMBER_OPTIONS}
            className={`${SELECT_CLASS} min-w-[240px]`}
          />
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-[22px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-[#6d28d9]"
        >
          🖨️ Cetak / PDF
        </button>
      </div>

      {/* Preview body - GAS .laporan-preview */}
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
        {/* Sumber badge - GAS .lp-src-badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-[10.5px] font-semibold ${badge.className}`}
        >
          <span aria-hidden>{badge.emoji}</span>
          <span>{badge.text}</span>
          <span className="font-normal text-ink3">· {periodLabel}</span>
        </div>

        {/* Tip panel - GAS .lp-source-panel */}
        <div className="rounded-lg border border-[#ddd6fe] bg-[#f5f3ff] px-3 py-3 text-xs leading-relaxed text-[#4c1d95]">
          {tip}
        </div>

        {/* Summary stats - denser grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            emoji="🏥"
            value={summary.total_rooms}
            label="Total Ruangan"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="📦"
            value={summary.total_items}
            label="Total Barang"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="✅"
            value={summary.total_baik}
            label={`Baik (${summary.percentage_baik}%)`}
            variant="teal"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="⚠️"
            value={summary.total_rr}
            label={`RR (${summary.percentage_rr}%)`}
            variant="amber"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="❌"
            value={summary.total_rb}
            label={`RB (${summary.percentage_rb}%)`}
            variant="red"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="➖"
            value={summary.total_ta}
            label={`TA (${summary.percentage_ta}%)`}
            variant="slate"
            className="p-2.5 gap-2.5"
          />
        </div>

        {/* Room breakdown - denser table chrome */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-2 border-b border-line bg-[#faf5ff] px-3.5 py-2.5">
            <h3 className="m-0 text-[12px] font-extrabold uppercase tracking-wide text-[#3b0764]">
              Rekap Per Ruangan
            </h3>
            <span className="text-[10.5px] font-semibold text-ink3">
              {rooms.length} ruangan · {periodLabel}
            </span>
          </div>
          <Table
            columns={ROOM_COLUMNS}
            rows={roomRows}
            striped
            emptyMessage="Belum ada data ruangan"
            className="text-[12.5px]"
          />
        </Card>

        {/* Print note - GAS has full #laporanDoc; mock keeps room rekap + window.print */}
        <p className="m-0 text-[10.5px] leading-snug text-ink3">
          🖨️ Cetak / PDF memakai pratinjau browser. Dokumen formal (kop surat +
          TTD) di GAS diisi lewat{" "}
          <code className="rounded bg-line2 px-1 font-mono text-[10px]">
            #laporanDoc
          </code>
          ; di mock data rekap ruangan di atas yang dicetak.
        </p>
      </div>
    </Dialog>
  );
}
