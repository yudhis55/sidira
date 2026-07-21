"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/gas/badge";
import { Button } from "@/components/gas/button";
import { Dialog } from "@/components/gas/dialog";
import { Input } from "@/components/gas/input";
import { Modal } from "@/components/gas/modal";
import { Select } from "@/components/gas/select";
import { ChecklistRoomModal } from "@/components/inventaris/checklist-room-modal";
import { MoveItemModal } from "@/components/inventaris/move-item-modal";
import type {
  Item,
  ItemCategory,
  ItemCondition,
  Room,
} from "@/types/database";

interface RoomDetailInteractiveProps {
  room: Room;
  items: Item[];
  rooms: Room[];
}

const CATEGORY_CONFIG: {
  value: ItemCategory;
  label: string;
  headerBg: string;
  dotColor: string;
  labelColor: string;
  countBg: string;
}[] = [
  {
    value: "alkes",
    label: "Alat Kesehatan",
    headerBg: "bg-teal3",
    dotColor: "bg-teal",
    labelColor: "text-teal",
    countBg: "bg-teal",
  },
  {
    value: "meubelair",
    label: "Meubelair",
    headerBg: "bg-amber2",
    dotColor: "bg-amber",
    labelColor: "text-amber",
    countBg: "bg-amber",
  },
  {
    value: "elektronik",
    label: "Elektronik",
    headerBg: "bg-blue2",
    dotColor: "bg-blue",
    labelColor: "text-blue",
    countBg: "bg-blue",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    headerBg: "bg-slate2",
    dotColor: "bg-slate",
    labelColor: "text-slate",
    countBg: "bg-slate",
  },
];

const CONDITION_CYCLE: ItemCondition[] = ["baik", "rr", "rb", "ta"];

const CONDITION_LABELS: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

function nextCondition(current: ItemCondition): ItemCondition {
  const idx = CONDITION_CYCLE.indexOf(current);
  return CONDITION_CYCLE[(idx + 1) % CONDITION_CYCLE.length];
}

/** Priority spill badge matching GAS sp-wajib / sp-penting / sp-pendukung */
function PriorityPill({ prio }: { prio?: string }) {
  if (!prio) return null;
  if (prio === "wajib")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-amber2 text-amber">
        ⭐ Wajib
      </span>
    );
  if (prio === "penting")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-blue2 text-blue">
        🔹 Penting
      </span>
    );
  if (prio === "pendukung")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-slate2 text-slate">
        · Pendukung
      </span>
    );
  return null;
}

/**
 * Mock-only interactive room detail: local state for conditions + move dialogs.
 * No @/lib/auth, no Supabase.
 */
export function RoomDetailInteractive({
  room,
  items: initialItems,
  rooms,
}: RoomDetailInteractiveProps) {
  const [items, setItems] = useState<Item[]>(initialItems);

  // Move single item (GAS move-item-modal)
  const [moveItem, setMoveItem] = useState<Item | null>(null);

  // Move all
  const [moveAllOpen, setMoveAllOpen] = useState(false);
  const [moveAllTargetRoomId, setMoveAllTargetRoomId] = useState("");

  // Add item (mock)
  const [addCategory, setAddCategory] = useState<ItemCategory | null>(null);
  const [addName, setAddName] = useState("");

  // Ceklist harian modal (GAS openChecklist — room-scoped matrix)
  const [checklistOpen, setChecklistOpen] = useState(false);

  const destinationRooms = useMemo(
    () => rooms.filter((r) => r.id !== room.id),
    [rooms, room.id]
  );

  const roomOptions = useMemo(
    () =>
      destinationRooms.map((r) => ({
        value: r.id,
        label: `${r.icon} ${r.name}`,
      })),
    [destinationRooms]
  );

  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + (i.quantity || 0), 0);

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

  function handleCycleCondition(itemId: number) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const next = nextCondition(it.condition);
        toast.success(
          `${it.name}: ${CONDITION_LABELS[it.condition]} → ${CONDITION_LABELS[next]}`
        );
        return { ...it, condition: next };
      })
    );
  }

  function handleSemuaBaik() {
    if (items.length === 0) {
      toast.info("Tidak ada item di ruangan ini");
      return;
    }
    setItems((prev) => prev.map((it) => ({ ...it, condition: "baik" })));
    toast.success("Semua kondisi di ruangan ini diset menjadi Baik");
  }

  /** Per-category bulk set baik (GAS .btn-all-baik / setAllKondisiBaik) */
  function handleCategorySemuaBaik(category: ItemCategory, label: string) {
    const count = items.filter((it) => it.category === category).length;
    if (count === 0) {
      toast.info(`Tidak ada item di kategori ${label}`);
      return;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.category === category ? { ...it, condition: "baik" } : it
      )
    );
    toast.success(`Semua kondisi ${label} diset menjadi Baik (${count} item)`);
  }

  function handleEditMock() {
    toast.info("Mode edit ruangan (mock) — belum dihubungkan ke backend");
  }

  function handleHapusMock() {
    toast.info("Hapus ruangan (mock) — belum dihubungkan ke backend");
  }

  function openMoveItem(item: Item) {
    setMoveItem(item);
  }

  function closeMoveItem() {
    setMoveItem(null);
  }

  function confirmMoveItem(destRoom: Room, _destKat: ItemCategory) {
    if (!moveItem) return;
    setItems((prev) => prev.filter((it) => it.id !== moveItem.id));
    toast.success(
      `${moveItem.name} dipindah ke ${destRoom.name} (mock)`
    );
    closeMoveItem();
  }

  function openMoveAll() {
    if (items.length === 0) {
      toast.info("Tidak ada item untuk dipindah");
      return;
    }
    setMoveAllTargetRoomId(destinationRooms[0]?.id ?? "");
    setMoveAllOpen(true);
  }

  function closeMoveAll() {
    setMoveAllOpen(false);
    setMoveAllTargetRoomId("");
  }

  function confirmMoveAll() {
    if (!moveAllTargetRoomId) {
      toast.error("Pilih ruangan tujuan");
      return;
    }
    const dest = rooms.find((r) => r.id === moveAllTargetRoomId);
    const count = items.length;
    setItems([]);
    toast.success(
      `${count} item dipindah ke ${dest?.name ?? "ruangan tujuan"} (mock)`
    );
    closeMoveAll();
  }

  function handleDeleteItem(item: Item) {
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    toast.success(`${item.name} dihapus (mock)`);
  }

  function openChecklist() {
    setChecklistOpen(true);
  }

  function closeChecklist() {
    setChecklistOpen(false);
  }

  function openAddItem(category: ItemCategory) {
    setAddCategory(category);
    setAddName("");
  }

  function closeAddItem() {
    setAddCategory(null);
    setAddName("");
  }

  function confirmAddItem() {
    if (!addCategory) return;
    const name = addName.trim();
    if (!name) {
      toast.error("Nama barang wajib diisi");
      return;
    }
    const now = new Date().toISOString();
    const nextId =
      items.reduce((max, it) => (it.id > max ? it.id : max), 0) + 1;
    const indexInRoom =
      items.filter((it) => it.category === addCategory).length;
    const newItem: Item = {
      id: nextId,
      room_id: room.id,
      category: addCategory,
      name,
      quantity: 1,
      unit: "unit",
      condition: "baik",
      index_in_room: indexInRoom,
      prio: "pendukung",
      created_at: now,
      updated_at: now,
    };
    setItems((prev) => [...prev, newItem]);
    const label =
      CATEGORY_CONFIG.find((c) => c.value === addCategory)?.label ??
      addCategory;
    toast.success(`${name} ditambahkan ke ${label} (mock)`);
    closeAddItem();
  }

  const addCategoryLabel =
    addCategory != null
      ? (CATEGORY_CONFIG.find((c) => c.value === addCategory)?.label ??
        addCategory)
      : "";

  return (
    <>
      {/* Room Header (matches GAS .room-header) */}
      <div className="flex flex-wrap items-center gap-4 mb-[22px] px-6 py-5 bg-white rounded-[var(--r)] border border-line">
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
          style={{ background: room.bg }}
        >
          {room.icon}
        </div>

        <div className="min-w-0">
          <div className="text-lg font-extrabold text-ink">{room.name}</div>
          {room.description && (
            <div className="text-xs text-ink3 mt-0.5">{room.description}</div>
          )}
        </div>

        <div className="ml-auto flex gap-3 flex-wrap">
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-[20px] font-extrabold text-teal font-mono leading-none">
              {totalItems}
            </div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide mt-1">
              Jenis Item
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-[20px] font-extrabold text-teal font-mono leading-none">
              {totalUnits}
            </div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide mt-1">
              Total Unit
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.info("Ubah penanggung jawab (mock)")}
          className="flex items-center gap-2 px-[14px] py-[7px] rounded-[10px] bg-line2 border-[1.5px] border-line min-w-[200px] max-w-[280px] text-left hover:border-teal hover:bg-[#f0fdfa] group"
        >
          <span className="text-base">{"\u{1F464}"}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-extrabold text-ink3 uppercase tracking-wide">
              Penanggung Jawab
            </div>
            <div
              className={`text-[12.5px] font-bold truncate ${
                room.pj
                  ? "text-ink"
                  : "text-ink3 italic font-normal"
              }`}
            >
              {room.pj || "Belum diisi"}
            </div>
          </div>
          <span className="text-xs text-ink3 opacity-0 group-hover:opacity-100">
            {"\u270F\uFE0F"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleSemuaBaik}
          className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-[rgba(14,124,107,0.3)] bg-[rgba(14,124,107,0.08)] text-teal hover:bg-teal hover:text-white transition-colors"
        >
          {"\u2705"} Semua Kondisi Baik
        </button>
        <button
          type="button"
          onClick={handleEditMock}
          className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-colors"
        >
          {"\u270F\uFE0F"} Edit Nama
        </button>
        <button
          type="button"
          onClick={openMoveAll}
          className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-colors"
        >
          {"\u2197"} Pindah Item
        </button>
        <button
          type="button"
          onClick={handleHapusMock}
          className="del-room-btn px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-red/30 bg-red2 text-red hover:bg-red hover:text-white transition-colors"
        >
          {"\u{1F5D1}"} Hapus
        </button>
      </div>
      {/* ── 4 Category Sections ── */}
      <div className="space-y-5">
        {CATEGORY_CONFIG.map((cat) => {
          const catItems = grouped[cat.value];
          return (
            <details key={cat.value} open className="cat-section">
              <summary
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md cursor-pointer select-none list-none ${cat.headerBg}`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.dotColor}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-[0.8px] ${cat.labelColor}`}
                >
                  {cat.label}
                </span>
                <span
                  className={`ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white ${cat.countBg}`}
                >
                  {catItems.length} item
                </span>
                <button
                  type="button"
                  title="Set semua kondisi menjadi Baik"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCategorySemuaBaik(cat.value, cat.label);
                  }}
                  className="relative z-[2] inline-flex items-center gap-[5px] px-2.5 py-[3px] rounded-[20px] text-[11px] font-bold whitespace-nowrap border-[1.5px] border-[rgba(14,124,107,0.35)] bg-[rgba(14,124,107,0.1)] text-teal hover:bg-teal hover:text-white hover:border-teal transition-colors"
                >
                  {"\u2705"} Semua Baik
                </button>
                <span className="text-[11px] ml-1.5">▾</span>
              </summary>

              <div className="mt-px">
                <div className="overflow-x-auto rounded-b-lg">
                  <table className="w-full border-collapse text-[13px] bg-white border border-line border-t-0">
                    <thead>
                      <tr>
                        <th className="w-9 text-center px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap">
                          No
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left">
                          Nama Barang
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[72px]">
                          Spesifikasi
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[110px]">
                          Merek / Tipe
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[100px]">
                          No. Register
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left">
                          Satuan
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center">
                          Std
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center">
                          Jml
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center min-w-[90px]">
                          Prioritas
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center min-w-[120px]">
                          Kondisi
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[130px]">
                          Keterangan
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center min-w-[80px]">
                          Ceklist
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap" />
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={13}
                            className="py-6 text-center text-ink3 text-sm"
                          >
                            Tidak ada data
                          </td>
                        </tr>
                      ) : (
                        catItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="border-b border-line last:border-b-0 hover:bg-[#fafcff]"
                          >
                            <td className="w-9 text-center px-3.5 py-2.5 font-mono text-[11px] text-ink3">
                              {idx + 1}
                            </td>
                            <td className="px-3.5 py-2.5 font-semibold text-ink">
                              {item.name}
                            </td>
                            <td className="px-3.5 py-2.5 text-[11.5px] text-ink3 font-normal">
                              {item.spec || "-"}
                            </td>
                            <td className="px-3.5 py-2.5 text-xs text-ink2">
                              {item.merk
                                ? `${item.merk}${item.type ? ` / ${item.type}` : ""}`
                                : "-"}
                            </td>
                            <td className="px-3.5 py-2.5 text-xs text-ink2 font-mono">
                              {item.noreg || item.kode_barang || "-"}
                            </td>
                            <td className="px-3.5 py-2.5 text-xs text-ink3">
                              {item.unit || "-"}
                            </td>
                            <td className="px-3.5 py-2.5 text-center font-mono text-xs text-ink3">
                              {item.std && item.std > 0 ? item.std : "-"}
                            </td>
                            <td className="px-3.5 py-2.5 text-center font-mono text-[13px] font-bold text-ink2">
                              {item.quantity}
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              <PriorityPill prio={item.prio} />
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleCycleCondition(item.id)}
                                className="inline-flex cursor-pointer rounded-[4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                                title="Klik untuk ganti kondisi (baik → rr → rb → ta)"
                                aria-label={`Kondisi ${CONDITION_LABELS[item.condition]}, klik untuk ganti`}
                              >
                                <Badge variant={item.condition}>
                                  {CONDITION_LABELS[item.condition] ||
                                    item.condition}
                                </Badge>
                              </button>
                            </td>
                            <td className="px-3.5 py-2.5 text-xs text-ink3">
                              {item.notes || ""}
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={openChecklist}
                                className="inline-flex h-[26px] items-center gap-0.5 rounded-[5px] border border-line bg-line2 px-1.5 text-[11px] font-semibold text-ink2 transition-colors hover:bg-line"
                                title="Ceklist harian"
                              >
                                📋
                              </button>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex items-center gap-1">
                                {/* GAS .mv-btn — compact blue outline, icon-only */}
                                <button
                                  type="button"
                                  onClick={() => openMoveItem(item)}
                                  className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] text-[13px] font-black leading-none text-[#1d4ed8] transition-all duration-150 hover:scale-110 hover:border-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white"
                                  title="Pindah ke ruangan lain"
                                  aria-label={`Pindah ${item.name}`}
                                >
                                  ↗
                                </button>
                                {/* GAS .del-btn — compact red fill, icon-only */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item)}
                                  className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border-0 bg-red2 text-xs text-red transition-colors hover:bg-[#fca5a5]"
                                  title="Hapus"
                                  aria-label={`Hapus ${item.name}`}
                                >
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="add-btn flex w-full items-center justify-center gap-2 border border-t-0 border-dashed border-line bg-transparent px-[18px] py-[9px] text-xs font-semibold text-ink3 rounded-b-[var(--r)] transition-colors duration-[180ms] hover:border-teal3 hover:bg-teal4 hover:text-teal"
                  onClick={() => openAddItem(cat.value)}
                >
                  ＋ Tambah {cat.label}
                </button>
              </div>
            </details>
          );
        })}
      </div>

      {/* Add item modal (mock) */}
      <Modal
        open={!!addCategory}
        onClose={closeAddItem}
        title={`Tambah ${addCategoryLabel}`}
        subtitle={`Item baru di kategori ${addCategoryLabel}`}
        icon="＋"
        iconVariant="teal"
        size="sm"
        footer={
          <>
            <Button type="button" variant="modal-cancel" onClick={closeAddItem}>
              Batal
            </Button>
            <Button type="button" variant="modal-ok" onClick={confirmAddItem}>
              Tambah
            </Button>
          </>
        }
      >
        <Input
          label="Nama Barang"
          placeholder={`Nama ${addCategoryLabel.toLowerCase()}...`}
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmAddItem();
            }
          }}
          autoFocus
        />
      </Modal>

      {/* Move single item — GAS #moveModalBg 1:1; remount resets form state */}
      <MoveItemModal
        key={moveItem?.id ?? "closed"}
        open={!!moveItem}
        onClose={closeMoveItem}
        item={moveItem}
        fromRoom={room}
        rooms={rooms}
        onConfirm={confirmMoveItem}
      />

      {/* Move all — GAS-ish chrome (blue head + room select) */}
      <Dialog open={moveAllOpen} onClose={closeMoveAll} size="md" zIndex={3500}>
        <div
          className="flex shrink-0 items-center justify-between px-[22px] py-[18px] text-white"
          style={{
            background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
          }}
        >
          <div className="min-w-0">
            <div className="text-base font-extrabold leading-tight">
              📦 Pindah Semua Item
            </div>
            <div className="mt-[3px] text-[11px] opacity-75">
              {items.length} item dari {room.icon} {room.name}
            </div>
          </div>
          <button
            type="button"
            onClick={closeMoveAll}
            className="ml-3 shrink-0 rounded-lg border-[1.5px] border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/28"
          >
            ✕ Tutup
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-[13px] font-bold text-ink">
            Pindahkan seluruh inventaris ruangan ini ke tujuan di bawah.
          </div>
          <Select
            label="Ruangan Tujuan"
            value={moveAllTargetRoomId}
            onChange={(e) => setMoveAllTargetRoomId(e.target.value)}
            options={roomOptions}
          />
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-[#f8faff] px-5 py-3.5">
          <button
            type="button"
            onClick={closeMoveAll}
            className="rounded-[10px] border-[1.5px] border-line bg-white px-4 py-[9px] text-xs font-bold text-ink2 transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmMoveAll}
            disabled={!moveAllTargetRoomId}
            className="rounded-[10px] border-none px-[22px] py-[9px] text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(29,78,216,0.3)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
            }}
          >
            ✅ Pindahkan Semua
          </button>
        </div>
      </Dialog>

      {/* Ceklist Harian — GAS openChecklist / #clModalOverlay (mock matrix) */}
      <ChecklistRoomModal
        open={checklistOpen}
        onClose={closeChecklist}
        room={room}
        items={items}
      />
    </>
  );
}
