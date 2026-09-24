"use client";

/**
 * Pindah beberapa/semua item — port GAS `openMvAllModal` (index.html ~28455).
 *
 * Bedanya dengan `MoveItemModal`: bagian atas berisi daftar centang seluruh
 * item ruangan lengkap dengan "Pilih Semua", sehingga sebagian item saja pun
 * bisa dipindah. Sisanya (cari ruangan, chip kategori tujuan, daftar ruangan,
 * footer konfirmasi) mengikuti modal pindah satu item.
 */
import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import type { Item, ItemCategory, Room } from "@/types/database";

export interface MoveAllModalProps {
  open: boolean;
  onClose: () => void;
  items: Item[];
  fromRoom: Room;
  rooms: Room[];
  /**
   * `destKat` null berarti chip kategori masih "Semua" — GAS mempertahankan
   * kategori asal tiap item pada kondisi ini.
   */
  onConfirm: (
    destRoom: Room,
    destKat: ItemCategory | null,
    selected: Item[]
  ) => void;
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

function itemMeta(item: Item): string {
  return [item.spec, item.merk, item.noreg ? `No.Reg: ${item.noreg}` : ""]
    .filter(Boolean)
    .join("  ·  ");
}

export function MoveAllModal({
  open,
  onClose,
  items,
  fromRoom,
  rooms,
  onConfirm,
}: MoveAllModalProps) {
  // State direset lewat remount (parent memakai key), bukan lewat effect.
  // GAS membuka modal tanpa satu pun item tercentang (MVA.selectedIids = []).
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [itemQ, setItemQ] = React.useState("");
  const [roomQ, setRoomQ] = React.useState("");
  const [filterKat, setFilterKat] = React.useState<"all" | ItemCategory>("all");
  const [destRoomId, setDestRoomId] = React.useState<string | null>(null);

  const selectedSet = React.useMemo(
    () => new Set(selectedIds),
    [selectedIds]
  );

  /** GAS melewati baris tanpa nama (baris kosong yang baru ditambah). */
  const namedItems = React.useMemo(
    () => items.filter((it) => (it.name || "").trim()),
    [items]
  );

  const visibleItems = React.useMemo(() => {
    const q = itemQ.trim().toLowerCase();
    if (!q) return namedItems;
    return namedItems.filter((it) =>
      [it.name, it.spec, it.merk, it.noreg]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [namedItems, itemQ]);

  const filteredRooms = React.useMemo(() => {
    const q = roomQ.trim().toLowerCase();
    return rooms.filter((r) => {
      if (r.id === fromRoom.id) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
      );
    });
  }, [rooms, fromRoom.id, roomQ]);

  const destRoom = destRoomId
    ? rooms.find((r) => r.id === destRoomId) ?? null
    : null;
  const destKat: ItemCategory | null = filterKat === "all" ? null : filterKat;

  const allVisibleChecked =
    visibleItems.length > 0 &&
    visibleItems.every((it) => selectedSet.has(it.id));

  const toggleItem = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /** GAS `mvaToggleAll` — hanya menyentuh item yang sedang tampil. */
  const toggleAll = () =>
    setSelectedIds((prev) => {
      const visibleIds = visibleItems.map((it) => it.id);
      if (allVisibleChecked) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });

  const handleConfirm = () => {
    if (!destRoom) return;
    const selected = namedItems.filter((it) => selectedSet.has(it.id));
    if (selected.length === 0) return;
    onConfirm(destRoom, destKat, selected);
    onClose();
  };

  const selectedCount = selectedSet.size;

  return (
    <Dialog open={open} onClose={onClose} size="md" zIndex={3500}>
      {/* Head — GAS .mv-modal-head */}
      <div
        className="flex shrink-0 items-center justify-between px-[22px] py-[18px] text-white"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)" }}
      >
        <div className="min-w-0">
          <div className="text-base font-extrabold leading-tight">
            ↗ Pindah Item ke Ruangan Lain
          </div>
          <div className="mt-[3px] truncate text-[11px] opacity-75">
            Pilih item dari {fromRoom.icon} {fromRoom.name} —{" "}
            {namedItems.length} item tersedia
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 shrink-0 rounded-lg border-[1.5px] border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/28"
        >
          ✕ Tutup
        </button>
      </div>

      {/* Body — GAS .mv-modal-body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {/* Daftar centang item — GAS #mvaList */}
        <div className="rounded-xl border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-extrabold text-[#1d4ed8]">
              <input
                type="checkbox"
                checked={allVisibleChecked}
                onChange={toggleAll}
                className="size-4 cursor-pointer accent-[#1d4ed8]"
              />
              Pilih Semua
            </label>
            <span className="rounded-full bg-[#dbeafe] px-2.5 py-[3px] text-[11px] font-bold text-[#1d4ed8]">
              {selectedCount} dipilih
            </span>
            <input
              type="text"
              value={itemQ}
              onChange={(e) => setItemQ(e.target.value)}
              placeholder="🔍 Cari item..."
              className="ml-auto min-w-0 flex-1 rounded-lg border-[1.5px] border-[#bfdbfe] bg-white px-2.5 py-1 text-[12px] text-ink outline-none placeholder:text-ink3 focus:border-[#1d4ed8] sm:max-w-[180px]"
            />
          </div>

          <div className="mt-2.5 max-h-[180px] overflow-y-auto rounded-lg border border-[#bfdbfe] bg-white">
            {visibleItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-ink3">
                Tidak ada item yang cocok
              </div>
            ) : (
              visibleItems.map((item) => {
                const kat = item.category;
                const meta = itemMeta(item);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2.5 border-b border-line px-2.5 py-[7px] last:border-b-0 hover:bg-[#f8faff]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSet.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="size-4 shrink-0 cursor-pointer accent-[#1d4ed8]"
                    />
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sm"
                      style={{ background: KAT_BG[kat] }}
                      aria-hidden
                    >
                      {KAT_ICON[kat]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-bold text-ink">
                        {item.name || "(tanpa nama)"}
                      </span>
                      {meta ? (
                        <span className="block truncate text-[10.5px] text-ink3">
                          {meta}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Cari ruangan tujuan — GAS #mvSearchInput */}
        <div className="flex items-center gap-2 rounded-[10px] border-[1.5px] border-line bg-bg px-3.5 py-2 transition-[border-color] focus-within:border-[#1d4ed8]">
          <span className="text-sm text-ink3" aria-hidden>
            🔍
          </span>
          <input
            type="text"
            value={roomQ}
            onChange={(e) => setRoomQ(e.target.value)}
            placeholder="Cari ruangan tujuan..."
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-ink outline-none placeholder:text-ink3"
          />
        </div>

        {/* Chip kategori tujuan — GAS mvSetKat */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-ink3">
            Kategori tujuan:
          </span>
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

        {/* Daftar ruangan — GAS mvRenderRooms */}
        <div className="flex min-h-[160px] flex-col gap-1.5">
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
                  onClick={() => setDestRoomId(r.id)}
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
                    <div className="text-[13px] font-bold text-ink">
                      {r.name}
                    </div>
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

      {/* Footer — GAS #mvFooter, muncul setelah tujuan dipilih */}
      {destRoom ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t border-line bg-[#f8faff] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-[#1d4ed8]">
            <span className="text-lg" aria-hidden>
              {destRoom.icon || "🏠"}
            </span>
            <span className="min-w-0">
              Pindah ke <b>{destRoom.name}</b>
              {"  ·  "}
              Kategori: <b>{destKat ? KAT_LABEL[destKat] : "ikut asal item"}</b>
              {"  ·  "}
              <b>{selectedCount}</b> item dipilih
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setDestRoomId(null)}
              className="rounded-[10px] border-[1.5px] border-line bg-white px-4 py-2 text-xs font-bold text-ink2 transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
            >
              ← Pilih Lain
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="rounded-[10px] border-none px-[22px] py-2 text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(29,78,216,0.3)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)" }}
            >
              ✅ Pindahkan Sekarang
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
