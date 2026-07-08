import { Suspense } from "react";
import { getMockRooms, getMockRiwayat } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Table } from "@/components/gas/table";
import type { TableColumn } from "@/components/gas/table";
import { Input } from "@/components/gas/input";
import { Select } from "@/components/gas/select";
import { PageHeader } from "@/components/shared/page-elements";
import type { RiwayatPindah } from "@/types/database";

interface RiwayatPageProps {
  searchParams: Promise<{
    start_date?: string;
    end_date?: string;
    room_id?: string;
    kategori?: string;
  }>;
}

const KATEGORI_OPTIONS = [
  { value: "", label: "Semua Kategori" },
  { value: "alkes", label: "🩺 Alkes" },
  { value: "meubelair", label: "🪑 Meubelair" },
  { value: "elektronik", label: "💻 Elektronik" },
  { value: "lainnya", label: "📦 Lainnya" },
];

const KAT_ICON: Record<string, string> = {
  alkes: "🩺",
  meubelair: "🪑",
  elektronik: "💻",
  lainnya: "📦",
};

const KAT_BG: Record<string, string> = {
  alkes: "#ccfbf1",
  meubelair: "#fef3c7",
  elektronik: "#dbeafe",
  lainnya: "#f3f4f6",
};

function formatTs(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

function RiwayatLoading() {
  return (
    <Card>
      <div className="space-y-4">
        <div className="h-16 w-full bg-line2 animate-pulse rounded" />
        <div className="h-16 w-full bg-line2 animate-pulse rounded" />
        <div className="h-16 w-full bg-line2 animate-pulse rounded" />
      </div>
    </Card>
  );
}

export default async function RiwayatPage({ searchParams }: RiwayatPageProps) {
  const params = await searchParams;
  const rooms = getMockRooms();
  const allRiwayat = getMockRiwayat();

  // ── Client-side filtering via searchParams ──
  let filtered = allRiwayat;

  if (params.start_date) {
    filtered = filtered.filter((r) => r.ts >= params.start_date!);
  }
  if (params.end_date) {
    const end = new Date(params.end_date);
    end.setDate(end.getDate() + 1);
    const endIso = end.toISOString();
    filtered = filtered.filter((r) => r.ts < endIso);
  }
  if (params.room_id) {
    filtered = filtered.filter(
      (r) => r.dari === params.room_id || r.ke === params.room_id
    );
  }
  if (params.kategori) {
    filtered = filtered.filter((r) => r.kat === params.kategori);
  }

  // ── Table columns ──
  const columns: TableColumn[] = [
    { key: "ts", label: "Waktu", width: "160px" },
    { key: "nama", label: "Nama Barang" },
    { key: "dari", label: "Dari Ruangan" },
    { key: "ke", label: "Ke Ruangan" },
    { key: "user", label: "User", width: "120px" },
  ];

  const rows = filtered.map((r: RiwayatPindah) => {
    const kat = r.kat ?? "lainnya";
    return {
      ts: (
        <span className="text-ink3 whitespace-nowrap">{formatTs(r.ts)}</span>
      ),
      nama: (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded text-sm shrink-0"
            style={{ background: KAT_BG[kat] ?? "#f3f4f6" }}
          >
            {KAT_ICON[kat] ?? "📦"}
          </span>
          <span className="font-medium">{r.nama}</span>
        </div>
      ),
      dari: (
        <span className="text-ink2">📍 {r.dari_name ?? r.dari ?? "—"}</span>
      ),
      ke: <span className="text-ink2">→ {r.ke_name ?? r.ke ?? "—"}</span>,
      user: (
        <span className="text-ink3 text-xs font-mono">
          {r.user_id?.replace("user-", "") ?? "—"}
        </span>
      ),
    };
  });

  const roomOptions = [
    { value: "", label: "Semua Ruangan" },
    ...rooms.map((r) => ({ value: r.id, label: `${r.icon} ${r.name}` })),
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon="🔁"
        title="Riwayat Perpindahan"
        subtitle="Histori pemindahan barang antar ruangan"
        stats={[
          { value: filtered.length, label: "Total Catatan", tone: "teal" },
        ]}
      />

      {/* ── Filter form ── */}
      <Card>
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <Input
            label="Tanggal Mulai"
            name="start_date"
            type="date"
            defaultValue={params.start_date ?? ""}
          />
          <Input
            label="Tanggal Akhir"
            name="end_date"
            type="date"
            defaultValue={params.end_date ?? ""}
          />
          <Select
            label="Ruangan"
            name="room_id"
            defaultValue={params.room_id ?? ""}
            options={roomOptions}
          />
          <Select
            label="Kategori"
            name="kategori"
            defaultValue={params.kategori ?? ""}
            options={KATEGORI_OPTIONS}
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-teal text-white rounded-md text-sm font-semibold hover:bg-teal/90 transition-colors"
          >
            🔍 Filter
          </button>
        </form>
      </Card>

      {/* ── Riwayat table ── */}
      <Suspense fallback={<RiwayatLoading />}>
        <Card className="p-0 overflow-hidden">
          <Table
            columns={columns}
            rows={rows}
            striped
            emptyMessage="📭 Belum ada riwayat perpindahan"
          />
        </Card>
      </Suspense>
    </div>
  );
}
