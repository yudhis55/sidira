import { Suspense } from "react";
import { getMockLaporanSummary, getMockLaporanRooms } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/page-elements";
import { Card } from "@/components/gas/card";
import { StatCard } from "@/components/gas/stat-card";
import { Table, type TableColumn } from "@/components/gas/table";
import { Select } from "@/components/gas/select";
import { Button } from "@/components/gas/button";

interface LaporanPageProps {
  searchParams: Promise<{
    bulan?: string;
    tahun?: string;
  }>;
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
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function LaporanLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="h-6 w-48 bg-line2 animate-pulse" />
        <div className="mt-4 space-y-4">
          <div className="h-32 w-full bg-line2 animate-pulse" />
          <div className="h-32 w-full bg-line2 animate-pulse" />
        </div>
      </Card>
    </div>
  );
}

const ROOM_COLUMNS: TableColumn[] = [
  { key: "no", label: "No", align: "center", width: "40px" },
  { key: "ruangan", label: "Ruangan" },
  { key: "total", label: "Total", align: "center" },
  { key: "baik", label: "Baik", align: "center" },
  { key: "rr", label: "Rusak Ringan", align: "center" },
  { key: "rb", label: "Rusak Berat", align: "center" },
  { key: "ta", label: "Tidak Ada", align: "center" },
];

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;
  const now = new Date();

  const bulan = params.bulan ? parseInt(params.bulan) : now.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : now.getFullYear();

  const summary = getMockLaporanSummary();
  const laporanRooms = getMockLaporanRooms();

  const currentYear = now.getFullYear();
  const tahunOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - 2 + i),
    label: String(currentYear - 2 + i),
  }));

  const roomRows = laporanRooms.map((room, idx) => ({
    no: <span className="font-mono font-bold">{idx + 1}</span>,
    ruangan: (
      <span className="flex items-center gap-2">
        <span className="text-lg">{room.room_icon}</span>
        <span className="font-semibold">{room.room_name}</span>
      </span>
    ),
    total: (
      <span className="font-mono font-bold tabular-nums">{room.summary.total}</span>
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon="📈"
        title="Laporan Inventaris"
        subtitle={`Rekap kondisi inventaris per ruangan — ${BULAN_NAMES[bulan - 1]} ${tahun}`}
      />

      {/* ── Filter bulan/tahun ── */}
      <Card>
        <form action="/laporan" method="get" className="flex flex-wrap items-end gap-4">
          <Select
            name="bulan"
            label="Bulan"
            defaultValue={String(bulan)}
            options={BULAN_OPTIONS}
            className="w-40"
          />
          <Select
            name="tahun"
            label="Tahun"
            defaultValue={String(tahun)}
            options={tahunOptions}
            className="w-28"
          />
          <Button type="submit" size="sm">
            Terapkan
          </Button>
        </form>
      </Card>

      <Suspense fallback={<LaporanLoading />}>
        {/* ── Summary cards ── */}
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

        {/* ── Room-by-room breakdown table ── */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-line">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wide">
              Rekap Per Ruangan
            </h2>
          </div>
          <Table
            columns={ROOM_COLUMNS}
            rows={roomRows}
            striped
            emptyMessage="Belum ada data ruangan"
          />
        </Card>
      </Suspense>
    </div>
  );
}
