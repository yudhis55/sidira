import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMockRooms } from "@/lib/mock-data/rooms";
import { getMockItemsByRoom } from "@/lib/mock-data/items";
import { getMockUsulan } from "@/lib/mock-data/usulan";
import {
  getMockRiwayat,
  getMockLaporanSummary,
  getMockLaporanRooms,
} from "@/lib/mock-data";
import { RoomDetailInteractive } from "@/components/inventaris/room-detail-interactive";
import { RoomUsulanSection } from "@/components/inventaris/room-usulan-section";
import { PageActionsHost } from "@/components/gas/page-actions-host";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { id } = await params;

  const rooms = getMockRooms();
  const room = rooms.find((r) => r.id === id);
  if (!room) return notFound();

  const items = getMockItemsByRoom(id);
  const usulanList = getMockUsulan(id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <RoomDetailInteractive room={room} items={items} rooms={rooms} />

      <RoomUsulanSection
        roomId={id}
        roomName={room.name}
        usulanList={usulanList}
      />

      <Suspense fallback={null}>
        <PageActionsHost
          riwayatItems={getMockRiwayat()}
          laporanSummary={getMockLaporanSummary()}
          laporanRooms={getMockLaporanRooms()}
          withDivider
          exportItems={items}
          roomName={room.name}
        />
      </Suspense>
    </div>
  );
}
