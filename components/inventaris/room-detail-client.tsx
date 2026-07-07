"use client";

import { useState } from "react";
import type { Item, Room } from "@/types/database";
import { RoomHeader } from "./room-header";
import { MoveAllDialog } from "./move-all-dialog";

interface RoomDetailClientProps {
  room: Room;
  itemCount: number;
  totalUnits: number;
  items: Item[];
  rooms: Room[];
}

/**
 * Client wrapper that composes RoomHeader with the MoveAllDialog,
 * lifting the move-all dialog open state so the header button can trigger it.
 */
export function RoomDetailClient({
  room,
  itemCount,
  totalUnits,
  items,
  rooms,
}: RoomDetailClientProps) {
  const [moveAllOpen, setMoveAllOpen] = useState(false);

  return (
    <>
      <RoomHeader
        room={room}
        itemCount={itemCount}
        totalUnits={totalUnits}
        onOpenMoveAll={() => setMoveAllOpen(true)}
      />
      <MoveAllDialog
        fromRoomId={room.id}
        rooms={rooms}
        items={items}
        open={moveAllOpen}
        onOpenChange={setMoveAllOpen}
      />
    </>
  );
}
