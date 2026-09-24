"use client";

/**
 * Detail ruangan hasil "Tambah Ruangan" — ruangan ini hanya ada di
 * localStorage (`sidira_rooms_added`), jadi server tidak bisa mencarinya.
 * Komponen ini meresolusi ruangan di klien lalu memakai tampilan yang sama
 * seperti ruangan bawaan.
 */

import Link from "next/link";
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
        <div className="rounded-lg border border-line bg-white px-6 py-10 text-center text-[13px] text-ink3">
          Memuat ruangan…
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-lg border border-line bg-white px-6 py-12 text-center">
          <div className="text-[34px] leading-none" aria-hidden>
            🏚️
          </div>
          <h1 className="mt-3 text-base font-extrabold text-ink">
            Ruangan tidak ditemukan
          </h1>
          <p className="mx-auto mt-1 max-w-[420px] text-[12.5px] text-ink3">
            Ruangan ini mungkin sudah dihapus, atau ditambahkan di peramban
            lain — data ruangan tambahan masih tersimpan lokal.
          </p>
          <Link
            href="/inventaris"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-teal2 to-teal px-5 py-[9px] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(14,124,107,0.3)] transition-all duration-[180ms] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(14,124,107,0.4)]"
          >
            ← Kembali ke Inventaris
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
