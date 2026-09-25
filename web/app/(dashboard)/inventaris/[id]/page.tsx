import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRoomById, getRooms } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { getUsulanByRoomWithRoomInfo } from "@/lib/auth/usulan";
import { getLaporanSummary, getLaporanPerRoom } from "@/lib/auth/laporan";
import { getRiwayatList } from "@/lib/auth/riwayat";
import type { ItemCategory, RiwayatPindah } from "@/types/database";
import { RoomDetailInteractive } from "@/components/inventaris/room-detail-interactive";
import { AddedRoomDetail } from "@/components/inventaris/added-room-detail";
import { RoomUsulanSection } from "@/components/inventaris/room-usulan-section";
import { PageActionsHost } from "@/components/gas/page-actions-host";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

type RiwayatRow = Awaited<ReturnType<typeof getRiwayatList>>[number];

function isItemCategory(v: string | undefined): v is ItemCategory {
  return (
    v === "alkes" || v === "meubelair" || v === "elektronik" || v === "lainnya"
  );
}

function toRiwayatPindah(row: RiwayatRow): RiwayatPindah {
  return {
    id: row.id,
    ts: row.ts,
    nama: row.nama,
    kat: isItemCategory(row.kat) ? row.kat : "lainnya",
    dari: row.dari,
    ke: row.ke,
    dari_name: row.dari_name,
    ke_name: row.ke_name,
    user_id: row.user_id,
    created_at: row.created_at,
  };
}

async function loadRiwayat(): Promise<{
  items: RiwayatPindah[];
  error: boolean;
}> {
  try {
    return { items: (await getRiwayatList()).map(toRiwayatPindah), error: false };
  } catch {
    return { items: [], error: true };
  }
}

// Nilai awal modal laporan (diambil ulang live saat dibuka).
// Gagal → nol; halaman tetap tampil, modal menampilkan toast.
async function loadLaporan() {
  const now = new Date();
  const filter = { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
  const [summary, rooms] = await Promise.all([
    getLaporanSummary(filter).catch(() => ({
      total_rooms: 0,
      total_items: 0,
      total_baik: 0,
      total_rr: 0,
      total_rb: 0,
      total_ta: 0,
      percentage_baik: 0,
      percentage_rr: 0,
      percentage_rb: 0,
      percentage_ta: 0,
    })),
    getLaporanPerRoom(filter).catch(
      () => [] as Awaited<ReturnType<typeof getLaporanPerRoom>>
    ),
  ]);
  return { summary, rooms };
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { id } = await params;

  let room;
  try {
    room = await getRoomById(id);
  } catch {
    room = null;
  }

  // Ruangan hasil "Tambah Ruangan" hanya ada di localStorage (id `custom_*`),
  // jadi pencariannya dilakukan di klien — bukan 404.
  if (!room) {
    if (!id.startsWith("custom_")) return notFound();
    // Paralel: 3 roundtrip jadi 1 gelombang.
    const [baseRooms, riwayat, laporan] = await Promise.all([
      getRooms().catch(() => []),
      loadRiwayat(),
      loadLaporan(),
    ]);
    return (
      <>
        {riwayat.error && (
          <p role="alert" className="text-center py-4 text-[12.5px] text-ink3">
            Gagal memuat riwayat perpindahan. Silakan muat ulang halaman.
          </p>
        )}
        <AddedRoomDetail
          roomId={id}
          baseRooms={baseRooms}
          riwayatItems={riwayat.items}
          laporanSummary={laporan.summary}
          laporanRooms={laporan.rooms}
        />
      </>
    );
  }

  // Paralel: 5 roundtrip jadi 1 gelombang.
  const [rooms, items, usulanRes, riwayat, laporan] = await Promise.all([
    getRooms().catch(() => [room]),
    getItems(id).catch(() => []),
    getUsulanByRoomWithRoomInfo(id).then(
      (v): { list: typeof v; error: false } => ({ list: v, error: false }),
      (): {
        list: Awaited<ReturnType<typeof getUsulanByRoomWithRoomInfo>>;
        error: true;
      } => ({ list: [], error: true })
    ),
    loadRiwayat(),
    loadLaporan(),
  ]);
  const usulanList = usulanRes.list;
  const usulanError = usulanRes.error;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <RoomDetailInteractive room={room} items={items} rooms={rooms} />

      <RoomUsulanSection
        roomId={id}
        roomName={room.name}
        usulanList={usulanList}
      />

      {usulanError && (
        <p role="alert" className="text-center py-4 text-[12.5px] text-ink3">
          Gagal memuat data usulan. Silakan muat ulang halaman.
        </p>
      )}

      {riwayat.error && (
        <p role="alert" className="text-center py-4 text-[12.5px] text-ink3">
          Gagal memuat riwayat perpindahan. Silakan muat ulang halaman.
        </p>
      )}
      <Suspense fallback={null}>
        <PageActionsHost
          riwayatItems={riwayat.items}
          laporanSummary={laporan.summary}
          laporanRooms={laporan.rooms}
          withDivider
          exportItems={items}
          roomName={room.name}
          roomId={id}
        />
      </Suspense>
    </div>
  );
}
