"use client";

import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
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

const KAT_ICON: Record<ItemCategory, string> = {
  alkes: "🩺",
  meubelair: "🪑",
  elektronik: "💻",
  lainnya: "📦",
};

const KAT_BG: Record<ItemCategory, string> = {
  alkes: "#ccfbf1",
  meubelair: "#fef3c7",
  elektronik: "#dbeafe",
  lainnya: "#f3f4f6",
};

const KAT_LABEL: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

const KAT_CHIPS: { value: "all" | ItemCategory; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "alkes", label: "🩺 Alkes" },
  { value: "meubelair", label: "🪑 Meubelair" },
  { value: "elektronik", label: "💻 Elektronik" },
  { value: "lainnya", label: "📦 Lainnya" },
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
      {/* Head — blue gradient GAS .mv-modal-head */}
      <div
        className="flex shrink-0 items-center justify-between px-[22px] py-[18px] text-white"
        style={{
          background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
        }}
      >
        <div className="min-w-0">
          <div className="text-base font-extrabold leading-tight">
            ↗ Pindah Aset ke Ruangan Lain
          </div>
          <div className="mt-[3px] truncate text-[11px] opacity-75">
            {item.name || "—"} → dari {fromRoom.name}
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="ml-3 shrink-0 rounded-lg border-[1.5px] border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/28"
        >
          ✕ Tutup
        </button>
      </div>

      {/* Body — GAS .mv-modal-body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {/* Item card */}
        <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg"
            style={{ background: KAT_BG[srcKat] }}
            aria-hidden
          >
            {KAT_ICON[srcKat]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-ink">
              {item.name || "—"}
            </div>
            {meta ? (
              <div className="mt-0.5 text-[11px] text-ink3">{meta}</div>
            ) : null}
          </div>
          <span className="shrink-0 rounded-lg bg-[#dbeafe] px-2.5 py-[3px] text-[11px] font-bold text-[#1d4ed8]">
            Dari: {fromRoom.icon} {fromRoom.name}
          </span>
        </div>

        {/* Search rooms */}
        <div className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2 transition-[border-color] focus-within:border-[#1d4ed8]">
          <span className="text-sm text-ink3" aria-hidden>
            🔍
          </span>
          <input
            ref={searchRef}
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari ruangan tujuan..."
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-ink outline-none placeholder:text-ink3"
          />
        </div>

        {/* Kategori chips — sets destination category, not room filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-ink3">Kategori:</span>
          {KAT_CHIPS.map((chip) => {
            const on = filterKat === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setFilterKat(chip.value)}
                className={
                  on
                    ? "rounded-2xl border-[1.5px] border-[#1d4ed8] bg-[#1d4ed8] px-3 py-1 text-[11px] font-bold text-white transition-colors"
                    : "rounded-2xl border-[1.5px] border-line bg-white px-3 py-1 text-[11px] font-bold text-ink3 transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                }
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Room list */}
        <div className="flex min-h-[200px] flex-col gap-1.5">
          {filteredRooms.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-ink3">
              Tidak ada ruangan yang cocok
            </div>
          ) : (
            filteredRooms.map((r) => {
              const selected = r.id === destRoomId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectDest(r.id)}
                  className={
                    selected
                      ? "flex w-full items-center gap-3 rounded-[10px] border-[1.5px] border-[#1d4ed8] bg-[#dbeafe] px-3.5 py-2.5 text-left shadow-[0_0_0_3px_rgba(29,78,216,0.15)] transition-all"
                      : "flex w-full items-center gap-3 rounded-[10px] border-[1.5px] border-line bg-white px-3.5 py-2.5 text-left transition-all hover:translate-x-[3px] hover:border-[#1d4ed8] hover:bg-[#eff6ff]"
                  }
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-bg text-[22px]">
                    {r.icon || "🏠"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-ink">{r.name}</div>
                    {r.description ? (
                      <div className="mt-px text-[11px] text-ink3">
                        {r.description}
                      </div>
                    ) : null}
                  </div>
                  {selected ? (
                    <span className="shrink-0 text-lg text-[#1d4ed8]" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer — only after destination selected (GAS #mvFooter) */}
      {destRoom ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t border-line bg-[#f8faff] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-[#1d4ed8]">
            <span className="text-lg" aria-hidden>
              {destRoom.icon || "🏠"}
            </span>
            <span className="min-w-0">
              Pindah ke <b>{destRoom.name}</b>
              {"  ·  "}
              Kategori: <b>{KAT_LABEL[destKat]}</b>
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleClearDest}
              className="rounded-[10px] border-[1.5px] border-line bg-white px-4 py-2 text-xs font-bold text-ink2 transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
            >
              ← Pilih Lain
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-[10px] border-none px-[22px] py-2 text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(29,78,216,0.3)] transition-[filter] hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
              }}
            >
              ✅ Pindahkan Sekarang
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
