"use client";

import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import {
  ArrowsLeftRight,
  Chair,
  Check,
  DesktopTower,
  MagnifyingGlass,
  Package,
  Stethoscope,
  X,
} from "@phosphor-icons/react";
import type { Item, ItemCategory, Room } from "@/types/database";

export interface MoveItemModalProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  fromRoom: Room;
  rooms: Room[];
  /** Called with destination room when user confirms. Parent handles local list + toast. */
  onConfirm: (destRoom: Room, destKat: ItemCategory) => void;
}

const KAT_ICON: Record<ItemCategory, React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>> = {
  alkes: Stethoscope,
  meubelair: Chair,
  elektronik: DesktopTower,
  lainnya: Package,
};

const KAT_TILE: Record<ItemCategory, string> = {
  alkes: "bg-primary-soft text-primary",
  meubelair: "bg-warning-soft text-warning",
  elektronik: "bg-info-soft text-info",
  lainnya: "bg-surface-muted text-text-2",
};

const KAT_LABEL: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

const KAT_CHIPS: { value: "all" | ItemCategory; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "alkes", label: "Alkes" },
  { value: "meubelair", label: "Meubelair" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

function resolveKat(kat?: string): ItemCategory {
  if (kat === "alkes" || kat === "meubelair" || kat === "elektronik" || kat === "lainnya") {
    return kat;
  }
  return "lainnya";
}

function buildMeta(item: Item): string {
  const parts: string[] = [];
  if (item.spec) parts.push(item.spec);
  if (item.merk) parts.push(item.merk);
  if (item.noreg) parts.push(`No.Reg: ${item.noreg}`);
  return parts.join("  ·  ");
}

/**
 * GAS `#moveModal` / `openMoveModal` parity — pindah satu aset ke ruangan lain.
 * Mock-only: no auth, no backend. Parent owns list mutation via onConfirm.
 */
export function MoveItemModal({
  open,
  onClose,
  item,
  fromRoom,
  rooms,
  onConfirm,
}: MoveItemModalProps) {
  const srcKat = resolveKat(item?.category);
  const SrcKatIcon = KAT_ICON[srcKat];
  // Fresh state on each open via parent remount key={item?.id ?? "closed"}
  const [searchQ, setSearchQ] = React.useState("");
  const [filterKat, setFilterKat] = React.useState<"all" | ItemCategory>(srcKat);
  const [destRoomId, setDestRoomId] = React.useState<string | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Focus search only — no setState (parent remount resets form state)
  React.useEffect(() => {
    if (!open || !item) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 100);
    return () => window.clearTimeout(t);
  }, [open, item]);

  const destKat: ItemCategory = filterKat === "all" ? srcKat : filterKat;

  const filteredRooms = React.useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return rooms.filter((r) => {
      if (r.id === fromRoom.id) return false;
      if (!q) return true;
      const name = r.name.toLowerCase();
      const desc = (r.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [rooms, fromRoom.id, searchQ]);

  const destRoom = destRoomId
    ? rooms.find((r) => r.id === destRoomId) ?? null
    : null;

  const handleClose = () => {
    setDestRoomId(null);
    setSearchQ("");
    onClose();
  };

  const handleSelectDest = (roomId: string) => {
    setDestRoomId(roomId);
  };

  const handleClearDest = () => {
    setDestRoomId(null);
  };

  const handleConfirm = () => {
    if (!item || !destRoom) return;
    onConfirm(destRoom, destKat);
    handleClose();
  };

  if (!item) return null;

  const meta = buildMeta(item);

  return (
    <Dialog open={open} onClose={handleClose} size="md" zIndex={3500}>
      {/* Head — netral berbatas; tidak ada gradasi. */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3.5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary"
          aria-hidden
        >
          <ArrowsLeftRight size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight text-foreground">
            Pindah Aset ke Ruangan Lain
          </div>
          <div className="mt-0.5 truncate text-[12px] text-text-3">
            {item.name || "-"} · dari {fromRoom.name}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {/* Body — GAS .mv-modal-body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {/* Item card */}
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface-muted px-3.5 py-2.5">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-sm ${KAT_TILE[srcKat]}`}
            aria-hidden
          >
            <SrcKatIcon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-foreground">
              {item.name || "—"}
            </div>
            {meta ? (
              <div className="mt-0.5 truncate text-[11px] text-text-3">{meta}</div>
            ) : null}
          </div>
          <span className="shrink-0 rounded-sm border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-text-2">
            Dari: {fromRoom.icon} {fromRoom.name}
          </span>
        </div>

        {/* Search rooms */}
        <div className="flex h-9 items-center gap-2 rounded-sm border border-border bg-surface px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
          <MagnifyingGlass size={14} className="shrink-0 text-text-3" aria-hidden />
          <input
            ref={searchRef}
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari ruangan tujuan..."
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-3"
          />
        </div>

        {/* Kategori chips — sets destination category, not room filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3">
            Kategori:
          </span>
          {KAT_CHIPS.map((chip) => {
            const on = filterKat === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setFilterKat(chip.value)}
                aria-pressed={on}
                className={`rounded-sm border px-2.5 py-1 text-[11px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 ${
                  on
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-surface text-text-2 hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Room list */}
        <div className="flex min-h-[200px] flex-col gap-1.5">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <MagnifyingGlass size={22} aria-hidden className="text-text-3" />
              <p className="text-[13px] text-text-3">Tidak ada ruangan yang cocok</p>
            </div>
          ) : (
            filteredRooms.map((r) => {
              const selected = r.id === destRoomId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectDest(r.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-3 rounded-sm border px-3.5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 ${
                    selected
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-muted text-[18px] leading-none"
                    aria-hidden
                  >
                    {r.icon || "🏠"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-foreground">
                      {r.name}
                    </div>
                    {r.description ? (
                      <div className="mt-px line-clamp-1 text-[11px] text-text-3">
                        {r.description}
                      </div>
                    ) : null}
                  </div>
                  {selected ? (
                    <Check
                      size={15}
                      weight="bold"
                      aria-hidden
                      className="shrink-0 text-primary"
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer — only after destination selected (GAS #mvFooter) */}
      {destRoom ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t border-border bg-surface-subtle px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-text-2">
            <span aria-hidden>{destRoom.icon || "🏠"}</span>
            <span className="min-w-0">
              Pindah ke{" "}
              <b className="font-semibold text-foreground">{destRoom.name}</b>
              {" · "}
              Kategori:{" "}
              <b className="font-semibold text-foreground">{KAT_LABEL[destKat]}</b>
            </span>
          </div>
          <div className="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleClearDest}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              Pilih Lain
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              <Check size={15} weight="bold" aria-hidden />
              Pindahkan Sekarang
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
