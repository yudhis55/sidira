"use client";

/**
 * Detail ruangan hasil "Tambah Ruangan" — ruangan ini hanya ada di
 * localStorage (`sidira_rooms_added`), jadi server tidak bisa mencarinya.
 * Komponen ini meresolusi ruangan di klien lalu memakai tampilan yang sama
 * seperti ruangan bawaan.
 */

import Link from "next/link";
import { ArrowLeft, DoorOpen } from "@phosphor-icons/react";
import { RoomDetailInteractive } from "@/components/inventaris/room-detail-interactive";
import { RoomUsulanSection } from "@/components/inventaris/room-usulan-section";
import {
  PageActionsHost,
  type PageActionsHostProps,
} from "@/components/gas/page-actions-host";
import { useAddedRooms, useRoomList } from "@/lib/room-store";
import { useIsClient } from "@/lib/use-is-client";
import type { Room } from "@/types/database";

type ActionsData = Pick<
  PageActionsHostProps,
  "riwayatItems" | "laporanSummary" | "laporanRooms"
>;

export interface AddedRoomDetailProps extends ActionsData {
  roomId: string;
  /** Ruangan bawaan dari mock — dipakai untuk daftar "pindah ke ruangan". */
  baseRooms: Room[];
}

const NO_ITEMS: never[] = [];

export function AddedRoomDetail({
  roomId,
  baseRooms,
  riwayatItems,
  laporanSummary,
  laporanRooms,
}: AddedRoomDetailProps) {
  const mounted = useIsClient();
  const [added] = useAddedRooms();
  const rooms = useRoomList(baseRooms);
  const room = added.find((r) => r.id === roomId);

  // Sebelum hidrasi selesai localStorage belum terbaca — jangan tampilkan
  // pesan "tidak ditemukan" yang langsung berkedip hilang.
  if (!mounted) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-md border border-border bg-surface px-6 py-10 text-center text-[13px] text-text-3">
          Memuat ruangan…
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-md border border-border bg-surface px-6 py-12 text-center">
          <span
            className="mx-auto mb-3 flex size-11 items-center justify-center rounded-md bg-surface-muted text-text-3"
            aria-hidden
          >
            <DoorOpen size={22} />
          </span>
          <h1 className="text-[15px] font-semibold text-foreground">
            Ruangan tidak ditemukan
          </h1>
          <p className="mx-auto mt-1 max-w-[42ch] text-[13px] leading-relaxed text-text-3">
            Ruangan ini mungkin sudah dihapus, atau ditambahkan di peramban
            lain — data ruangan tambahan masih tersimpan lokal.
          </p>
          <Link
            href="/inventaris"
            className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <ArrowLeft size={15} aria-hidden className="text-text-3" />
            Kembali ke Inventaris
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <RoomDetailInteractive room={room} items={NO_ITEMS} rooms={rooms} />

      <RoomUsulanSection
        roomId={room.id}
        roomName={room.name}
        usulanList={NO_ITEMS}
      />

      <PageActionsHost
        riwayatItems={riwayatItems}
        laporanSummary={laporanSummary}
        laporanRooms={laporanRooms}
        withDivider
        exportItems={NO_ITEMS}
        roomName={room.name}
        roomId={room.id}
      />
    </div>
  );
}
