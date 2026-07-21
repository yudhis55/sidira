"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChecklistCalendar } from "@/components/checklist/checklist-calendar";
import { Button } from "@/components/gas/button";
import type { Item, Room } from "@/types/database";

export interface ChecklistRoomModalProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  /** Room items — scoped matrix (GAS openChecklist room.items). */
  items: Item[];
}

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

/**
 * GAS #clModalOverlay / openChecklist (~20060) — room-scoped ceklist harian.
 * Mock-only: matrix state lives in ChecklistCalendar (local Map).
 * Close: Escape, backdrop, Tutup.
 */
export function ChecklistRoomModal({
  open,
  onClose,
  room,
  items,
}: ChecklistRoomModalProps) {
  const mounted = useIsClient();
  const now = React.useMemo(() => new Date(), []);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const calendarItems = items.map((it) => ({
    id: it.id,
    name: it.name,
    spec: it.spec,
    merk: it.merk,
    type: it.type,
    category: it.category,
    index_in_room: it.index_in_room,
  }));

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4"
      style={{
        background: "rgba(8, 24, 18, 0.65)",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Ceklist Harian — ${room.name}`}
    >
      {/* GAS .cl-modal — 96vw / max 1080 / max-h 90vh */}
      <div className="flex max-h-[90vh] w-[96vw] max-w-[1080px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
        {/* Body scrolls; calendar includes head + matrix */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="[&>div]:rounded-none [&>div]:border-0">
            <ChecklistCalendar
              roomId={room.id}
              roomName={room.name}
              roomIcon={room.icon}
              year={now.getFullYear()}
              month={now.getMonth()}
              items={calendarItems}
              entries={[]}
            />
          </div>
        </div>

        {/* GAS .cl-footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-line bg-white px-6 py-3">
          <Button type="button" variant="modal-cancel" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
