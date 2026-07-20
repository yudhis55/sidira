"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/gas/badge";
import { Button } from "@/components/gas/button";
import { Modal } from "@/components/gas/modal";
import { Select } from "@/components/gas/select";
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

  // Move single item
  const [moveItem, setMoveItem] = useState<Item | null>(null);
  const [moveTargetRoomId, setMoveTargetRoomId] = useState("");

  // Move all
  const [moveAllOpen, setMoveAllOpen] = useState(false);
  const [moveAllTargetRoomId, setMoveAllTargetRoomId] = useState("");

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

  function handleEditMock() {
    toast.info("Mode edit ruangan (mock) — belum dihubungkan ke backend");
  }

  function handleHapusMock() {
    toast.info("Hapus ruangan (mock) — belum dihubungkan ke backend");
  }

  function openMoveItem(item: Item) {
    setMoveItem(item);
    setMoveTargetRoomId(destinationRooms[0]?.id ?? "");
  }

  function closeMoveItem() {
    setMoveItem(null);
    setMoveTargetRoomId("");
  }

  function confirmMoveItem() {
    if (!moveItem) return;
    if (!moveTargetRoomId) {
      toast.error("Pilih ruangan tujuan");
      return;
    }
    const dest = rooms.find((r) => r.id === moveTargetRoomId);
    setItems((prev) => prev.filter((it) => it.id !== moveItem.id));
    toast.success(
      `${moveItem.name} dipindah ke ${dest?.name ?? "ruangan tujuan"} (mock)`
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

  function handleChecklistMock(item: Item) {
    toast.info(`Ceklist: ${item.name} (mock)`);
  }

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
                                onClick={() => handleChecklistMock(item)}
                                className="text-xs px-2 py-1 rounded bg-line2 text-ink2 hover:bg-line font-semibold"
                              >
                                📋 Ceklist
                              </button>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openMoveItem(item)}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-line2 text-ink2 hover:bg-line text-xs"
                                  title="Pindah ke ruangan lain"
                                  aria-label={`Pindah ${item.name}`}
                                >
                                  📦
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item)}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-red2 text-red hover:opacity-90 text-xs"
                                  title="Hapus"
                                  aria-label={`Hapus ${item.name}`}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* Move single item modal */}
      <Modal
        open={!!moveItem}
        onClose={closeMoveItem}
        title="Pindah Barang"
        subtitle={
          moveItem
            ? `Pindahkan "${moveItem.name}" ke ruangan lain`
            : undefined
        }
        icon="📦"
        iconVariant="blue"
        size="sm"
        footer={
          <>
            <Button type="button" variant="modal-cancel" onClick={closeMoveItem}>
              Batal
            </Button>
            <Button type="button" variant="modal-ok" onClick={confirmMoveItem}>
              Pindah
            </Button>
          </>
        }
      >
        <Select
          label="Ruangan Tujuan"
          value={moveTargetRoomId}
          onChange={(e) => setMoveTargetRoomId(e.target.value)}
          options={roomOptions}
        />
      </Modal>

      {/* Move all modal */}
      <Modal
        open={moveAllOpen}
        onClose={closeMoveAll}
        title="Pindah Semua Item"
        subtitle={`Pindahkan ${items.length} item dari ${room.name}`}
        icon="📦"
        iconVariant="amber"
        size="sm"
        footer={
          <>
            <Button type="button" variant="modal-cancel" onClick={closeMoveAll}>
              Batal
            </Button>
            <Button type="button" variant="modal-ok" onClick={confirmMoveAll}>
              Pindah Semua
            </Button>
          </>
        }
      >
        <Select
          label="Ruangan Tujuan"
          value={moveAllTargetRoomId}
          onChange={(e) => setMoveAllTargetRoomId(e.target.value)}
          options={roomOptions}
        />
      </Modal>
    </>
  );
}
