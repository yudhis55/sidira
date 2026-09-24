"use client";

import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import { Select } from "@/components/gas/select";
import { StatCard } from "@/components/gas/stat-card";
import { Table, type TableColumn } from "@/components/gas/table";
import { Card } from "@/components/gas/card";
import { LaporanDoc } from "./laporan-doc";
import type { LaporanSumber } from "@/lib/laporan-collect";
import {
  getLaporanPerRoom,
  getLaporanSummary,
  type LaporanRoom,
  type LaporanSummary,
} from "@/lib/auth/laporan";
import { toast } from "sonner";
import { useActiveYear } from "@/lib/year-store";

export type { LaporanSumber };

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

/** GAS empty-sumber tips (lp-src-badge empty / empty table) */
const SUMBER_TIPS: Record<LaporanSumber, string> = {
  gabungan:
    "Tidak ada item bermasalah di inventaris maupun ceklist bulan ini. Rekap di bawah menampilkan ringkasan kondisi per ruangan.",
  inventaris:
    "Semua item inventaris dalam kondisi Baik. Rekap per ruangan tetap ditampilkan.",
  ceklist:
    "Tidak ada catatan kerusakan di ceklist untuk periode terpilih. Gunakan mode ✏️ Isi Manual untuk mengisi langsung; rekap ruangan tetap tampil di bawah.",
  manual:
    "Mode Isi Manual: baris dapat diedit langsung. Gunakan rekap per ruangan di bawah sebagai ringkasan kondisi.",
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
  // Tahun awal mengikuti tahun KIR global (bukan hari ini) — select lokal tetap bisa diubah.
  const [activeYear] = useActiveYear();
  const initial = React.useMemo(() => defaultLaporanFilters(), []);
  const [bulan, setBulan] = React.useState(initial.bulan);
  const [tahun, setTahun] = React.useState<number>(activeYear);
  const [sumber, setSumber] = React.useState<LaporanSumber>(initial.sumber);

  const tahunOptions = React.useMemo(
    () => buildTahunOptions(activeYear),
    [activeYear]
  );

  const periodLabel = `${BULAN_NAMES[bulan - 1]} ${tahun}`;
  const tip = SUMBER_TIPS[sumber];

  // Data live Supabase — props hanya nilai awal; diambil ulang tiap
  // modal dibuka / periode berubah. Gagal → toast + pertahankan data lama.
  const [live, setLive] = React.useState<{
    summary: LaporanSummary;
    rooms: LaporanRoom[];
  } | null>(null);
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [s, r] = await Promise.all([
          getLaporanSummary({ bulan, tahun }),
          getLaporanPerRoom({ bulan, tahun }),
        ]);
        if (!cancelled) setLive({ summary: s, rooms: r });
      } catch {
        if (!cancelled)
          toast.error("Gagal memuat data laporan. Menampilkan data terakhir.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, bulan, tahun]);

  const viewSummary = live?.summary ?? summary;
  const viewRooms = live?.rooms ?? rooms;

  const roomRows = viewRooms.map((room, idx) => ({
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
    // GAS cetakLaporan(): isolasi cetak lewat class di <body>.
    document.body.classList.add("printing-laporan");
    window.print();
    window.setTimeout(
      () => document.body.classList.remove("printing-laporan"),
      1200
    );
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
        {/* Tip panel - GAS .lp-source-panel (tidak ikut tercetak) */}
        <div className="rounded-lg border border-[#ddd6fe] bg-[#f5f3ff] px-3 py-3 text-xs leading-relaxed text-[#4c1d95] print:hidden">
          {tip}
        </div>

        {/* Dokumen formal siap cetak - GAS #laporanDoc */}
        <LaporanDoc bulanIdx={bulan - 1} tahun={tahun} sumber={sumber} rooms={viewRooms} />

        {/* Ringkasan tambahan (layar saja, bukan bagian dokumen GAS) */}
        <div className="space-y-3 border-t border-line pt-4 print:hidden">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            emoji="🏥"
            value={viewSummary.total_rooms}
            label="Total Ruangan"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="📦"
            value={viewSummary.total_items}
            label="Total Barang"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="✅"
            value={viewSummary.total_baik}
            label={`Baik (${viewSummary.percentage_baik}%)`}
            variant="teal"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="⚠️"
            value={viewSummary.total_rr}
            label={`RR (${viewSummary.percentage_rr}%)`}
            variant="amber"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="❌"
            value={viewSummary.total_rb}
            label={`RB (${viewSummary.percentage_rb}%)`}
            variant="red"
            className="p-2.5 gap-2.5"
          />
          <StatCard
            emoji="➖"
            value={viewSummary.total_ta}
            label={`TA (${viewSummary.percentage_ta}%)`}
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
          🖨️ Cetak / PDF hanya mencetak dokumen di atas (kop surat, tabel, dan
          blok tanda tangan). Ringkasan ini hanya tampil di layar.
        </p>
        </div>
      </div>
    </Dialog>
  );
}
