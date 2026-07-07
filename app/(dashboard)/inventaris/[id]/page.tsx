import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoomById, getRooms } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { getUsulanByRoomWithRoomInfo } from "@/lib/auth/usulan";
import { RoomDetailClient } from "@/components/inventaris/room-detail-client";
import { ItemTable } from "@/components/inventaris/item-table";
import { RoomUsulanSection } from "@/components/inventaris/room-usulan-section";
import { CATEGORIES } from "@/components/inventaris/constants";
import type { Item, ItemCategory } from "@/types/database";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;

  let room;
  try {
    room = await getRoomById(id);
  } catch {
    notFound();
  }

  // Fetch items, room list (for move dialogs), and usulan for this room.
  const [items, rooms, usulanList] = await Promise.all([
    getItems(id),
    getRooms(),
    getUsulanByRoomWithRoomInfo(id),
  ]);

  // Group items by category.
  const grouped: Record<ItemCategory, Item[]> = {
    alkes: [],
    meubelair: [],
    elektronik: [],
    lainnya: [],
  };
  for (const item of items) {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  }

  const itemCount = items.length;
  const totalUnits = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventaris">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            Detail Ruangan
          </h1>
          <p className="text-sm text-muted-foreground">
            Inventaris barang per kategori
          </p>
        </div>
      </div>

      {/* Room header + move-all dialog (client) */}
      <RoomDetailClient
        room={room}
        itemCount={itemCount}
        totalUnits={totalUnits}
        items={items}
        rooms={rooms}
      />

      {/* Category tables — show all 4 categories always (like GAS) */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <ItemTable
            key={cat.value}
            roomId={id}
            category={cat.value}
            items={grouped[cat.value]}
            rooms={rooms}
          />
        ))}
      </div>

      {/* Usulan section (per-room, collapsible) */}
      <RoomUsulanSection
        roomId={id}
        roomName={room.name}
        usulanList={usulanList}
      />
    </div>
  );
}
