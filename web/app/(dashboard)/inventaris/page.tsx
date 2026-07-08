import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import {
  PageHeader,
  LegendBar,
  StatChip,
  CategoryBadge,
} from "@/components/shared/page-elements";
import { PrintButton } from "@/components/shared/print-button";
import { InventarisCsvExport, UsulanRekapCsvExport } from "@/components/inventaris/csv-export";
import { getMockRooms, getMockItems, getMockUsulan } from "@/lib/mock-data";
import type { Item, ItemCategory, Room } from "@/types/database";

export const dynamic = "force-dynamic";

// ── Helper: compute stats from mock data ──────────────────────────────
function computeStats(items: Item[], rooms: Room[], usulan: ReturnType<typeof getMockUsulan>) {
  const byKat: Record<ItemCategory, number> = {
    alkes: 0,
    meubelair: 0,
    elektronik: 0,
    lainnya: 0,
  };
  let totalItem = 0;
  let perluPerhatian = 0;

  for (const it of items) {
    const qty = Number(it.quantity) || 0;
    totalItem += qty;
    if (byKat[it.category] !== undefined) byKat[it.category] += qty;
    if (it.condition && it.condition !== "baik") perluPerhatian += 1;
  }

  let usulanAktif = 0;
  for (const u of usulan) {
    const list = u.payload?.items ?? [];
    for (const it of list) {
      if (it.status === "diajukan" || it.status === "disetujui") usulanAktif += 1;
    }
  }

  return {
    totalItem,
    totalRooms: rooms.length,
    alkes: byKat.alkes,
    meubelair: byKat.meubelair,
    elektronik: byKat.elektronik,
    lainnya: byKat.lainnya,
    perluPerhatian,
    usulanAktif,
  };
}

// ── Helper: per-room summaries ────────────────────────────────────────
interface RoomSummary {
  room: Room;
  total: number;
  alkes: number;
  meubelair: number;
  elektronik: number;
  lainnya: number;
  perluPerhatian: number;
}

function computeRoomSummaries(items: Item[], rooms: Room[]): RoomSummary[] {
  return rooms.map((room) => {
    const roomItems = items.filter((i) => i.room_id === room.id);
    const byKat: Record<ItemCategory, number> = {
      alkes: 0,
      meubelair: 0,
      elektronik: 0,
      lainnya: 0,
    };
    let total = 0;
    let perluPerhatian = 0;

    for (const it of roomItems) {
      const qty = Number(it.quantity) || 0;
      total += qty;
      if (byKat[it.category] !== undefined) byKat[it.category] += qty;
      if (it.condition && it.condition !== "baik") perluPerhatian += 1;
    }

    return {
      room,
      total,
      alkes: byKat.alkes,
      meubelair: byKat.meubelair,
      elektronik: byKat.elektronik,
      lainnya: byKat.lainnya,
      perluPerhatian,
    };
  });
}

export default function InventarisPage() {
  const rooms = getMockRooms();
  const items = getMockItems();
  const usulan = getMockUsulan();

  const summaries = computeRoomSummaries(items, rooms);
  const stats = computeStats(items, rooms, usulan);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📦"
        title="Inventaris Ruangan"
        subtitle="Puskesmas Baruharjo · Pemeliharaan aset per ruangan"
        stats={[
          { value: stats.totalRooms, label: "Total Ruangan", tone: "teal" },
          { value: stats.perluPerhatian, label: "Perlu Perhatian", tone: "red" },
          { value: stats.usulanAktif, label: "Usulan Aktif", tone: "amber" },
        ]}
        actions={
          <Link href="/inventaris/new">
            <Button>
              ➕ Tambah Ruangan
            </Button>
          </Link>
        }
      />

      {/* Global stats bar — mirrors GAS .gstats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatChip icon="📦" value={stats.totalItem} label="Total Item" tone="teal" />
        <StatChip icon="🩺" value={stats.alkes} label="Alat Kesehatan" tone="red" />
        <StatChip icon="🪑" value={stats.meubelair} label="Meubelair" tone="amber" />
        <StatChip icon="💻" value={stats.elektronik} label="Elektronik" tone="blue" />
        <StatChip icon="🔧" value={stats.lainnya} label="Lainnya" tone="slate" />
        <StatChip icon="⚠️" value={stats.perluPerhatian} label="Perlu Perhatian" tone="red" />
      </div>

      <LegendBar />

      {/* Page-actions toolbar — mirrors GAS .page-actions */}
      <div className="flex flex-wrap items-center gap-2">
        <InventarisCsvExport />
        <UsulanRekapCsvExport />
        <PrintButton label="🖨️ Cetak" />
      </div>

      {summaries.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-5xl opacity-50">📦</div>
            <h3 className="mb-2 text-xl font-bold">Belum ada ruangan</h3>
            <p className="mb-4 text-center text-sm text-ink3">
              Mulai dengan menambahkan ruangan pertama Anda
            </p>
            <Link href="/inventaris/new">
              <Button>
                ➕ Tambah Ruangan
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ room, total, alkes, meubelair, elektronik, lainnya, perluPerhatian }) => (
            <Link key={room.id} href={`/inventaris/${room.id}`} className="group">
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl leading-none">{room.icon || "🏥"}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-base">{room.name}</h3>
                      <p className="line-clamp-1 text-xs text-ink3">
                        {room.description || room.pj || "Tidak ada deskripsi"}
                      </p>
                    </div>
                    {perluPerhatian > 0 && (
                      <span className="shrink-0 rounded-full bg-[var(--red2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--red)]">
                        {perluPerhatian}⚠️
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3 px-4 pb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-[var(--teal)]">
                      {total}
                    </span>
                    <span className="text-xs text-ink3">total item</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alkes > 0 && <CategoryBadge category="alkes" label={`🩺 ${alkes}`} />}
                    {meubelair > 0 && <CategoryBadge category="meubelair" label={`🪑 ${meubelair}`} />}
                    {elektronik > 0 && <CategoryBadge category="elektronik" label={`💻 ${elektronik}`} />}
                    {lainnya > 0 && <CategoryBadge category="lainnya" label={`🔧 ${lainnya}`} />}
                    {total === 0 && (
                      <span className="text-xs text-ink3">Belum ada item</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
