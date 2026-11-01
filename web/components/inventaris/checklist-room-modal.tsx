"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChecklistCalendar } from "@/components/checklist/checklist-calendar";
import { Check } from "@phosphor-icons/react";
import { useIsClient } from "@/lib/use-is-client";
import type { Item, Room } from "@/types/database";

export interface ChecklistRoomModalProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  /** Room items — scoped matrix (GAS openChecklist room.items). */
  items: Item[];
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
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-foreground/40 p-3 backdrop-blur-[3px] sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Ceklist Harian — ${room.name}`}
    >
      {/* GAS .cl-modal — 96vw / max 1080 / max-h 90vh */}
      <div className="flex max-h-[90vh] w-[96vw] max-w-[1080px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
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

        {/* GAS .cl-footer — Export CSV + Tutup + Simpan */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-surface-subtle px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            Tutup
          </button>
          {/* Entri sudah tersimpan per klik (localStorage, meniru GAS clData);
              Simpan hanya menutup modal — visual 1:1 GAS .cl-footer. */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <Check size={15} weight="bold" aria-hidden />
            Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
