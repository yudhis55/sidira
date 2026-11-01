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

const KAT_ICON: Record<
  ItemCategory,
  React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>
> = {
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
            Pindah Item ke Ruangan Lain
          </div>
          <div className="mt-0.5 truncate text-[12px] text-text-3">
            Pilih item dari {fromRoom.icon} {fromRoom.name} · {namedItems.length}{" "}
            item tersedia
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {/* Body — GAS .mv-modal-body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {/* Daftar centang item — GAS #mvaList */}
        <div className="rounded-md border border-border bg-surface-subtle p-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-foreground">
              <input
                type="checkbox"
                checked={allVisibleChecked}
                onChange={toggleAll}
                className="size-4 cursor-pointer accent-[var(--primary)]"
              />
              Pilih Semua
            </label>
            <span className="rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-text-2">
              {selectedCount} dipilih
            </span>
            <div className="ml-auto flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-sm border border-border bg-surface px-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 sm:max-w-[200px]">
              <MagnifyingGlass size={13} className="shrink-0 text-text-3" aria-hidden />
              <input
                type="text"
                value={itemQ}
                onChange={(e) => setItemQ(e.target.value)}
                placeholder="Cari item..."
                className="min-w-0 flex-1 border-none bg-transparent text-[12px] text-foreground outline-none placeholder:text-text-3"
              />
            </div>
          </div>

          <div className="mt-2.5 max-h-[180px] overflow-y-auto rounded-sm border border-border bg-surface">
            {visibleItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] text-text-3">
                Tidak ada item yang cocok
              </div>
            ) : (
              visibleItems.map((item) => {
                const kat = item.category;
                const meta = itemMeta(item);
                const KatIcon = KAT_ICON[kat];
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-2.5 border-b border-border px-2.5 py-2 transition-colors duration-150 last:border-b-0 hover:bg-surface-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSet.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
                    />
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-sm ${KAT_TILE[kat]}`}
                      aria-hidden
                    >
                      <KatIcon size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-foreground">
                        {item.name || "(tanpa nama)"}
                      </span>
                      {meta ? (
                        <span className="block truncate text-[11px] text-text-3">
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
        <div className="flex h-9 items-center gap-2 rounded-sm border border-border bg-surface px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
          <MagnifyingGlass size={14} className="shrink-0 text-text-3" aria-hidden />
          <input
            type="text"
            value={roomQ}
            onChange={(e) => setRoomQ(e.target.value)}
            placeholder="Cari ruangan tujuan..."
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-3"
          />
        </div>

        {/* Chip kategori tujuan — GAS mvSetKat */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3">
            Kategori tujuan:
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

        {/* Daftar ruangan — GAS mvRenderRooms */}
        <div className="flex min-h-[160px] flex-col gap-1.5">
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
                  onClick={() => setDestRoomId(r.id)}
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

      {/* Footer — GAS #mvFooter, muncul setelah tujuan dipilih */}
      {destRoom ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2.5 border-t border-border bg-surface-subtle px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] text-text-2">
            <span aria-hidden>{destRoom.icon || "🏠"}</span>
            <span className="min-w-0">
              Pindah ke{" "}
              <b className="font-semibold text-foreground">{destRoom.name}</b>
              {" · "}
              Kategori:{" "}
              <b className="font-semibold text-foreground">
                {destKat ? KAT_LABEL[destKat] : "ikut asal item"}
              </b>
              {" · "}
              <b className="font-mono tabular-nums text-foreground">
                {selectedCount}
              </b>{" "}
              item dipilih
            </span>
          </div>
          <div className="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setDestRoomId(null)}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            >
              Pilih Lain
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50"
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
