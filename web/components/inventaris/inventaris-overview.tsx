"use client";

/**
 * Ringkasan seluruh ruangan — badan halaman `/inventaris`.
 *
 * Dijadikan komponen klien supaya hasil sunting ruangan (ganti nama, hapus)
 * yang masih tersimpan di localStorage langsung tercermin di kartu maupun
 * angka statistik, sama seperti sidebar.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Chair,
  DesktopTower,
  Notepad,
  Plus,
  QrCode,
  SquaresFour,
  Stack,
  Stethoscope,
  Warning,
} from "@phosphor-icons/react";
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

/** Strip statistik global — sel pipih, numeral mono, label kapital kecil. */
interface StatCell {
  icon: ReactNode;
  value: number;
  label: string;
  tone: "primary" | "warning" | "info" | "danger" | "violet" | "neutral";
}

const TONE_TILE: Record<StatCell["tone"], string> = {
  primary: "bg-primary-soft text-primary",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-danger",
  violet: "bg-[var(--violet2)] text-[var(--violet)]",
  neutral: "bg-surface-muted text-text-2",
};

const TONE_VALUE: Record<StatCell["tone"], string> = {
  primary: "text-foreground",
  warning: "text-foreground",
  info: "text-foreground",
  danger: "text-danger",
  violet: "text-foreground",
  neutral: "text-foreground",
};

export function InventarisOverview({
  rooms: allRooms,
  items,
  usulan,
}: InventarisOverviewProps) {
  // Ruangan tambahan (localStorage) dan hasil sunting ikut terhitung di sini.
  const rooms = useRoomList(allRooms);

  const summaries = computeRoomSummaries(items, rooms);
  const stats = computeStats(items, rooms, usulan);

  // Ikon stat dipisah dari data agar komponen ringkas — bukan emoji.
  const gstats: StatCell[] = [
    { icon: <Stack size={17} />, value: stats.totalItem, label: "Total Item", tone: "primary" },
    { icon: <Stethoscope size={17} />, value: stats.alkes, label: "Alat Kesehatan", tone: "primary" },
    { icon: <Chair size={17} />, value: stats.meubelair, label: "Meubelair", tone: "warning" },
    { icon: <DesktopTower size={17} />, value: stats.elektronik, label: "Elektronik", tone: "info" },
    { icon: <Warning size={17} />, value: stats.perluPerhatian, label: "Perlu Perhatian", tone: "danger" },
    { icon: <Notepad size={17} />, value: stats.usulanAktif, label: "Usulan Aktif", tone: "violet" },
  ];

  return (
    <div className="space-y-6">
      {/* GAS tidak punya judul halaman di daftar — baris pertama = legenda. */}
      <LegendBar />

      {/* Statistik global — strip sel berbatas, bukan kartu berikon emoji. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
        {gstats.map((g) => (
          <div key={g.label} className="flex items-center gap-2.5 bg-surface px-4 py-3">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-sm ${TONE_TILE[g.tone]}`}
              aria-hidden
            >
              {g.icon}
            </span>
            <div className="min-w-0">
              <div
                className={`font-mono text-[18px] font-semibold leading-none tabular-nums ${TONE_VALUE[g.tone]}`}
              >
                {g.value}
              </div>
              <div className="mt-1 truncate text-[10.5px] font-semibold uppercase leading-none tracking-[0.03em] text-text-3">
                {g.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aksi daftar — satu aksi primer (teal solid), sisanya sekunder. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <InventarisCsvExport />
        <Link
          href="/qr-cetak"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <QrCode size={15} aria-hidden className="text-text-3" />
          Cetak Semua QR
        </Link>
        <Link
          href="/inventaris/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <Plus size={15} weight="bold" aria-hidden />
          Tambah Ruangan
        </Link>
      </div>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface px-6 py-14 text-center">
          <span
            className="mb-4 flex size-11 items-center justify-center rounded-md bg-surface-muted text-text-3"
            aria-hidden
          >
            <SquaresFour size={22} />
          </span>
          <h3 className="mb-1.5 text-[15px] font-semibold text-foreground">
            Belum ada ruangan
          </h3>
          <p className="mb-5 max-w-[42ch] text-[13px] leading-relaxed text-text-3">
            Mulai dengan menambahkan ruangan pertama Anda
          </p>
          <Link
            href="/inventaris/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <Plus size={15} weight="bold" aria-hidden />
            Tambah Ruangan
          </Link>
        </div>
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
                className="group block rounded-md border border-border bg-surface p-[18px] transition-colors duration-150 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                {/* Kepala kartu — ikon ruangan (data) + nama + deskripsi. */}
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[22px] leading-none"
                    aria-hidden
                  >
                    {room.icon || "🏥"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold text-foreground">
                      {room.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-text-3">
                      {room.description || room.pj || "Tidak ada deskripsi"}
                    </p>
                  </div>
                  {perluPerhatian > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border bg-danger-soft px-1.5 py-0.5 text-[11px] font-semibold leading-none text-danger">
                      <Warning size={11} weight="fill" aria-hidden />
                      <span className="font-mono tabular-nums">
                        {perluPerhatian}
                      </span>
                    </span>
                  )}
                </div>

                {/* Unit — chip netral berbatas, numeral mono. */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-baseline gap-1.5 rounded-sm border border-border px-2.5 py-1">
                    <span className="font-mono text-[15px] font-semibold leading-none tabular-nums text-foreground">
                      {total}
                    </span>
                    <span className="text-[11px] leading-none text-text-3">
                      unit
                    </span>
                  </span>
                  <span className="inline-flex items-baseline gap-1.5 rounded-sm border border-border px-2.5 py-1">
                    <span className="text-[11px] leading-none text-text-3">
                      Perlu perhatian
                    </span>
                    <span
                      className={`font-mono text-[15px] font-semibold leading-none tabular-nums ${
                        perluPerhatian > 0 ? "text-danger" : "text-text-3"
                      }`}
                    >
                      {perluPerhatian}
                    </span>
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {alkes > 0 && (
                    <CategoryBadge category="alkes" label={`Alkes ${alkes}`} />
                  )}
                  {meubelair > 0 && (
                    <CategoryBadge
                      category="meubelair"
                      label={`Meubelair ${meubelair}`}
                    />
                  )}
                  {elektronik > 0 && (
                    <CategoryBadge
                      category="elektronik"
                      label={`Elektronik ${elektronik}`}
                    />
                  )}
                  {lainnya > 0 && (
                    <CategoryBadge
                      category="lainnya"
                      label={`Lainnya ${lainnya}`}
                    />
                  )}
                  {total === 0 && (
                    <span className="text-[12px] text-text-3">Belum ada item</span>
                  )}
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
