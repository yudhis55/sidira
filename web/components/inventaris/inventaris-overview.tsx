"use client";

/**
 * Ringkasan seluruh ruangan — badan halaman `/inventaris`.
 *
 * Dijadikan komponen klien supaya hasil sunting ruangan (ganti nama, hapus)
 * yang masih tersimpan di localStorage langsung tercermin di kartu maupun
 * angka statistik, sama seperti sidebar.
 */
import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { LegendBar, CategoryBadge } from "@/components/shared/page-elements";
import { InventarisCsvExport } from "@/components/inventaris/csv-export";
import { useRoomList } from "@/lib/room-store";
import type { Usulan } from "@/lib/usulan-types";
import type { Item, ItemCategory, Room } from "@/types/database";

interface InventarisOverviewProps {
  rooms: Room[];
  items: Item[];
  usulan: Usulan[];
}

function computeStats(items: Item[], rooms: Room[], usulan: Usulan[]) {
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
      // Aktif = belum tuntas; `selesai` dan `ditolak` tidak lagi dihitung.
      if (it.status !== "selesai" && it.status !== "ditolak") usulanAktif += 1;
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

export function InventarisOverview({
  rooms: allRooms,
  items,
  usulan,
}: InventarisOverviewProps) {
  // Ruangan tambahan (localStorage) dan hasil sunting ikut terhitung di sini.
  const rooms = useRoomList(allRooms);

  const summaries = computeRoomSummaries(items, rooms);
  const stats = computeStats(items, rooms, usulan);

  // Kartu statistik global — cermin GAS .gstats (index.html ~846–882, 8179–8232).
  const gstats = [
    {
      icon: "📦",
      iconBg: "var(--teal3)",
      value: stats.totalItem,
      valueColor: "var(--teal)",
      label: "Total Item",
    },
    {
      icon: "🩺",
      iconBg: "var(--teal3)",
      value: stats.alkes,
      valueColor: "var(--teal)",
      label: "Alat Kesehatan",
    },
    {
      icon: "🪑",
      iconBg: "var(--amber2)",
      value: stats.meubelair,
      valueColor: "var(--amber)",
      label: "Meubelair",
    },
    {
      icon: "💻",
      iconBg: "var(--blue2)",
      value: stats.elektronik,
      valueColor: "var(--blue)",
      label: "Elektronik",
    },
    {
      icon: "🔴",
      iconBg: "var(--red2)",
      value: stats.perluPerhatian,
      valueColor: "var(--red)",
      label: "Perlu Perhatian",
    },
    {
      icon: "📋",
      iconBg: "var(--violet2)",
      value: stats.usulanAktif,
      valueColor: "var(--violet)",
      label: "Usulan Aktif",
    },
  ];

  return (
    <div className="space-y-6">
      {/* GAS tidak punya judul halaman di daftar — baris pertama = legenda. */}
      <LegendBar />

      {/* Global stats — GAS .gstats: kartu besar, ikon tinted, label full-caps. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {gstats.map((g) => (
          <Card key={g.label} className="flex items-center gap-3 p-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-[10px] text-[20px] leading-none"
              style={{ background: g.iconBg }}
              aria-hidden
            >
              {g.icon}
            </div>
            <div className="min-w-0">
              <div
                className="font-mono text-[22px] font-extrabold leading-none"
                style={{ color: g.valueColor }}
              >
                {g.value}
              </div>
              <div className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.3px] text-ink3">
                {g.label}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Aksi daftar — GAS menaruh aksi di level header ruangan, jadi layar
          daftar hanya menyimpan Tambah Ruangan + Export CSV. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <InventarisCsvExport />
        <Link href="/inventaris/new">
          <Button>➕ Tambah Ruangan</Button>
        </Link>
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
              <Button>➕ Tambah Ruangan</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map(
            ({
              room,
              total,
              alkes,
              meubelair,
              elektronik,
              lainnya,
              perluPerhatian,
            }) => (
              <Link
                key={room.id}
                href={`/inventaris/${room.id}`}
                className="group"
              >
                <Card className="h-full cursor-pointer p-5 transition-shadow hover:shadow-lg">
                  {/* Kepala kartu — cermin GAS .room-header (icon-big + title + desc). */}
                  <div className="flex items-center gap-4">
                    <div
                      className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] text-[26px] leading-none"
                      style={{ background: room.bg }}
                      aria-hidden
                    >
                      {room.icon || "🏥"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-extrabold text-ink">
                        {room.name}
                      </h3>
                      <p className="mt-[3px] line-clamp-1 text-xs text-ink3">
                        {room.description || room.pj || "Tidak ada deskripsi"}
                      </p>
                    </div>
                    {perluPerhatian > 0 && (
                      <span className="shrink-0 rounded-full bg-[var(--red2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--red)]">
                        {perluPerhatian}⚠️
                      </span>
                    )}
                  </div>
                  {/* Statistik kartu — cermin GAS .rstat. */}
                  <div className="mt-4 flex gap-3">
                    <div className="rounded-lg bg-line2 px-4 py-2 text-center">
                      <div className="font-mono text-xl font-extrabold leading-none text-teal">
                        {total}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3px] text-ink3">
                        Total Unit
                      </div>
                    </div>
                    {perluPerhatian > 0 && (
                      <div className="rounded-lg bg-line2 px-4 py-2 text-center">
                        <div className="font-mono text-xl font-extrabold leading-none text-red">
                          {perluPerhatian}
                        </div>
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3px] text-ink3">
                          Perlu Perhatian
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                      {alkes > 0 && (
                        <CategoryBadge category="alkes" label={`🩺 ${alkes}`} />
                      )}
                      {meubelair > 0 && (
                        <CategoryBadge
                          category="meubelair"
                          label={`🪑 ${meubelair}`}
                        />
                      )}
                      {elektronik > 0 && (
                        <CategoryBadge
                          category="elektronik"
                          label={`💻 ${elektronik}`}
                        />
                      )}
                      {lainnya > 0 && (
                        <CategoryBadge
                          category="lainnya"
                          label={`🔧 ${lainnya}`}
                        />
                      )}
                      {total === 0 && (
                        <span className="text-xs text-ink3">Belum ada item</span>
                      )}
                    </div>
                </Card>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
