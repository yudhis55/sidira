"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChecklistRoomModal } from "@/components/inventaris/checklist-room-modal";
import { MoveAllModal } from "@/components/inventaris/move-all-modal";
import { MoveItemModal } from "@/components/inventaris/move-item-modal";
import { Dialog } from "@/components/gas/dialog";
import { mergeRoom, mergeRooms, useRoomOverrides } from "@/lib/room-store";
import { moveItemsToRoom } from "@/lib/move-store";
import {
  bulkSetCondition,
  createItemRecord,
  deleteItem,
  moveItem as moveItemServer,
  moveItems as moveItemsServer,
  updateItemField,
} from "@/lib/auth/items";
import { deleteRoom, updateRoomName, updateRoomPj } from "@/lib/auth/rooms";
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

type ItemPriority = NonNullable<Item["prio"]>;

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

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "baik", label: "✅ Baik" },
  { value: "rr", label: "⚠️ Rusak Ringan" },
  { value: "rb", label: "🔴 Rusak Berat" },
  { value: "ta", label: "— Tidak Ada" },
];

const PRIORITY_OPTIONS: { value: ItemPriority; label: string }[] = [
  { value: "wajib", label: "⭐ Wajib" },
  { value: "penting", label: "🔹 Penting" },
  { value: "pendukung", label: "· Pendukung" },
];

/* ── GAS td input / td select (index.html ~716–771, 2045–2058) ── */

const CELL_BASE =
  "rounded-[var(--r2)] border-[1.5px] px-2 py-[5px] text-xs outline-none transition-colors";

/** Input bergaris — GAS `td input[type=text|number]`. */
const CELL_INPUT = `${CELL_BASE} w-full border-line bg-white text-ink focus:border-teal2`;

/**
 * Input "hantu" — tampil seperti teks biasa (GAS merender sel ini statis),
 * garisnya baru muncul saat hover/fokus supaya tetap bisa diedit langsung.
 */
const CELL_GHOST = `${CELL_BASE} w-full border-transparent bg-transparent hover:border-line focus:border-teal2 focus:bg-white`;

const CELL_SELECT = `${CELL_BASE} w-full cursor-pointer font-bold`;

/** GAS `td select.k-*` (~732–754). */
const CONDITION_CLASS: Record<ItemCondition, string> = {
  baik: "bg-teal4 text-teal border-teal3",
  rr: "bg-amber2 text-amber border-[#fde68a]",
  rb: "bg-red2 text-red border-[#fecaca]",
  ta: "bg-slate2 text-slate border-line",
};

/** GAS `.spill.sp-*` (~702–713), dipakai sebagai warna select prioritas. */
const PRIORITY_CLASS: Record<ItemPriority, string> = {
  wajib: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
  penting: "bg-blue2 text-blue border-[#bfdbfe]",
  pendukung: "bg-slate2 text-slate border-line",
};

const TH_BASE =
  "bg-[#f8fafc] px-3.5 py-2.5 text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap";

/**
 * Detail ruangan — port GAS buildPanels (index.html ~19103).
 * Seluruh sel dapat diedit langsung seperti spreadsheet; perubahan sel
 * tersimpan ke Supabase (debounce) untuk ruangan DB. Ruangan `custom_*`
 * (localStorage saja) tetap sesi-lokal. Baris baru memakai id negatif
 * sementara sampai tersimpan (anti-tabrakan dengan id DB).
 */
export function RoomDetailInteractive({
  room: roomProp,
  items: initialItems,
  rooms: allRooms,
}: RoomDetailInteractiveProps) {
  const router = useRouter();
  /** False untuk ruangan `custom_*` (hanya localStorage, tanpa baris DB). */
  const isDbRoom = !roomProp.id.startsWith("custom_");
  const [items, setItems] = useState<Item[]>(initialItems);
  // Sinkron ulang saat pindah ruangan — server adalah sumber kebenaran,
  // bukan lagi localStorage (yang dulu membayangi data server).
  const [seenRoomId, setSeenRoomId] = useState(roomProp.id);
  if (seenRoomId !== roomProp.id) {
    setSeenRoomId(roomProp.id);
    setItems(initialItems);
  }
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const persistTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  /** Id sementara yang sedang dibuatkan baris DB — cegah duplikat. */
  const creatingIds = useRef<Set<number>>(new Set());

  // Nama & penanggung jawab hasil sunting disimpan terpisah dari data mock.
  const [overrides, setOverrides] = useRoomOverrides();
  const room = mergeRoom(roomProp, overrides);
  const rooms = mergeRooms(allRooms, overrides);

  // Edit nama ruangan inline — GAS memakai prompt(), di sini form inline.
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(room.name);

  // Edit penanggung jawab inline — GAS `editPj`.
  const [editingPj, setEditingPj] = useState(false);
  const [pjDraft, setPjDraft] = useState(room.pj ?? "");

  // Konfirmasi hapus ruangan — GAS memakai confirm(), di sini dialog.
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Move single item (GAS move-item-modal)
  const [moveItem, setMoveItem] = useState<Item | null>(null);

  // Move all / sebagian (GAS openMvAllModal)
  const [moveAllOpen, setMoveAllOpen] = useState(false);

  // Ceklist harian modal (GAS openChecklist — room-scoped matrix)
  const [checklistOpen, setChecklistOpen] = useState(false);

  /** Baris baru dari addRow — nama-nya difokuskan sekali setelah render. */
  const focusItemId = useRef<number | null>(null);

  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + (i.quantity || 0), 0);
  /* Kotak stat "Perlu Perhatian" ala GAS — merah bila > 0. */
  const attentionCount = items.filter((i) => i.condition !== "baik").length;

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

  const emptyCategories = CATEGORY_CONFIG.filter(
    (cat) => grouped[cat.value].length === 0
  );

  /**
   * Simpan satu field ke Supabase (debounce 800ms per sel). Baris
   * sementara (id negatif, belum bernama) dibuatkan baris DB saat namanya
   * terisi; ruangan `custom_*` murni lokal.
   */
  const persistItemField = useCallback(
    (itemId: number, field: string, value: string | number) => {
      if (!isDbRoom) return;
      const key = `${itemId}:${field}`;
      if (persistTimers.current[key]) clearTimeout(persistTimers.current[key]);
      persistTimers.current[key] = setTimeout(async () => {
        const row = itemsRef.current.find((it) => it.id === itemId);
        if (!row) return;
        // Baris sementara: buat baris DB begitu ada nama.
        if (itemId < 0) {
          if (!row.name.trim() || creatingIds.current.has(itemId)) return;
          creatingIds.current.add(itemId);
          const res = await createItemRecord({
            room_id: roomProp.id,
            category: row.category,
            name: row.name.trim(),
            merk: row.merk || undefined,
            type: row.type || undefined,
            spec: row.spec || undefined,
            noreg: row.noreg || undefined,
            year: row.year ?? undefined,
            quantity: row.quantity ?? 0,
            unit: row.unit || "unit",
            std: row.std ?? 0,
            prio: row.prio ?? "pendukung",
            condition: row.condition,
            notes: row.notes || undefined,
            index_in_room: row.index_in_room ?? 0,
          });
          creatingIds.current.delete(itemId);
          if ("error" in res) {
            toast.error("Gagal menyimpan baris baru ke server");
            return;
          }
          const realId = res.id;
          setItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, id: realId } : it))
          );
          return;
        }
        const res = await updateItemField(itemId, roomProp.id, field, value);
        if (res && "error" in res) {
          toast.error("Gagal menyimpan perubahan ke server");
        }
      }, 800);
    },
    [isDbRoom, roomProp.id]
  );

  /** Patch satu item — dipakai semua sel tabel (optimistik + persist). */
  const updateItem = useCallback(
    (itemId: number, patch: Partial<Item>) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, ...patch, updated_at: new Date().toISOString() }
            : it
        )
      );
      for (const [field, value] of Object.entries(patch)) {
        if (field === "id" || field === "updated_at") continue;
        if (typeof value !== "string" && typeof value !== "number") continue;
        persistItemField(itemId, field, value);
      }
    },
    [persistItemField]
  );

  /** Callback ref: fokus + select otomatis untuk baris yang baru ditambah. */
  const nameInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) return;
      if (focusItemId.current === null) return;
      if (node.dataset.itemId !== String(focusItemId.current)) return;
      focusItemId.current = null;
      node.focus();
      node.select();
    },
    []
  );

  async function handleSemuaBaik() {
    if (items.length === 0) {
      toast.info("Tidak ada item di ruangan ini");
      return;
    }
    setItems((prev) => prev.map((it) => ({ ...it, condition: "baik" })));
    if (isDbRoom) {
      const res = await bulkSetCondition(roomProp.id, "baik").catch(() => ({
        error: "Gagal menyimpan ke server",
      }));
      if (res && "error" in res) {
        toast.error("Gagal menyimpan ke server — muat ulang untuk sinkron");
        return;
      }
    }
    toast.success("Semua kondisi di ruangan ini diset menjadi Baik");
  }

  /** Per-category bulk set baik (GAS .btn-all-baik / setAllKondisiBaik) */
  async function handleCategorySemuaBaik(category: ItemCategory, label: string) {
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
    if (isDbRoom) {
      const res = await bulkSetCondition(roomProp.id, "baik", category).catch(
        () => ({ error: "Gagal menyimpan ke server" })
      );
      if (res && "error" in res) {
        toast.error("Gagal menyimpan ke server — muat ulang untuk sinkron");
        return;
      }
    }
    toast.success(`Semua kondisi ${label} diset menjadi Baik (${count} item)`);
  }

  /** Simpan satu bidang perubahan ruangan ke localStorage. */
  function patchRoom(patch: Partial<{ name: string; pj: string }>) {
    setOverrides((prev) => ({
      ...prev,
      [room.id]: { ...prev[room.id], ...patch },
    }));
  }

  function startEditName() {
    setNameDraft(room.name);
    setEditingName(true);
  }

  /** GAS `editRoomName` (prompt) — diganti form inline sesuai keputusan desain. */
  async function saveName() {
    const next = nameDraft.trim();
    if (!next) {
      toast.error("Nama ruangan tidak boleh kosong");
      return;
    }
    if (next === room.name) {
      setEditingName(false);
      return;
    }
    patchRoom({ name: next });
    setEditingName(false);
    if (isDbRoom) {
      const res = await updateRoomName(roomProp.id, next).catch(() => ({
        error: "Gagal menyimpan ke server",
      }));
      if (res && "error" in res) {
        toast.error(
          typeof res.error === "string"
            ? res.error
            : "Gagal menyimpan ke server"
        );
        return;
      }
    }
    toast.success("Nama ruangan diperbarui");
  }

  function startEditPj() {
    setPjDraft(room.pj ?? "");
    setEditingPj(true);
  }

  /** GAS `editPj` — kosong berarti "Belum diisi". */
  async function savePj() {
    const next = pjDraft.trim();
    patchRoom({ pj: next });
    setEditingPj(false);
    if (isDbRoom) {
      const res = await updateRoomPj(roomProp.id, next).catch(() => ({
        error: "Gagal menyimpan ke server",
      }));
      if (res && "error" in res) {
        toast.error(
          typeof res.error === "string"
            ? res.error
            : "Gagal menyimpan ke server"
        );
        return;
      }
    }
    toast.success(
      next ? `Penanggung jawab: ${next}` : "Penanggung jawab dikosongkan"
    );
  }

  /** GAS `delRoom` (confirm) — ruangan disembunyikan, lalu kembali ke daftar. */
  async function confirmDeleteRoom() {
    if (isDbRoom) {
      const res = await deleteRoom(roomProp.id).catch(() => ({
        error: "Gagal menghapus di server",
      }));
      if (res && "error" in res) {
        toast.error(
          typeof res.error === "string"
            ? res.error
            : "Gagal menghapus di server"
        );
        return;
      }
    } else {
      setOverrides((prev) => ({
        ...prev,
        [room.id]: { ...prev[room.id], deleted: true },
      }));
    }
    setDeleteOpen(false);
    toast.success(`Ruangan ${room.name} dihapus`);
    router.push("/inventaris");
  }

  function openMoveItem(item: Item) {
    setMoveItem(item);
  }

  function closeMoveItem() {
    setMoveItem(null);
  }

  async function confirmMoveItem(destRoom: Room, destKat: ItemCategory) {
    if (!moveItem) return;
    const target = moveItem;
    // Ruangan lokal / baris sementara: pindah lokal saja.
    if (!isDbRoom || target.id < 0 || destRoom.id.startsWith("custom_")) {
      if (!isDbRoom || destRoom.id.startsWith("custom_")) {
        moveItemsToRoom([target], room, destRoom, destKat);
      } else {
        toast.info("Simpan baris baru dulu (isi nama) sebelum memindah");
        return;
      }
    } else {
      const res = await moveItemServer(
        target.id,
        roomProp.id,
        destRoom.id,
        target.name,
        destKat
      ).catch(() => ({ error: "Gagal memindah di server" }));
      if (res && "error" in res) {
        toast.error(
          typeof res.error === "string" ? res.error : "Gagal memindah di server"
        );
        return;
      }
    }
    setItems((prev) => prev.filter((it) => it.id !== target.id));
    toast.success(`${target.name || "Item"} dipindah ke ${destRoom.name}`);
    closeMoveItem();
    router.refresh();
  }

  function openMoveAll() {
    if (items.length === 0) {
      toast.info("Tidak ada item di ruangan ini");
      return;
    }
    setMoveAllOpen(true);
  }

  function closeMoveAll() {
    setMoveAllOpen(false);
  }

  /** GAS mvConfirm mode bulk (~28603) — hanya item tercentang yang berpindah. */
  async function confirmMoveAll(
    destRoom: Room,
    destKat: ItemCategory | null,
    selected: Item[]
  ) {
    if (selected.length === 0) return;
    // Ruangan lokal: pindah lokal saja (perilaku lama).
    if (!isDbRoom || destRoom.id.startsWith("custom_")) {
      const moved = moveItemsToRoom(selected, room, destRoom, destKat);
      if (moved === 0) return;
      const movedIds = new Set(selected.map((it) => it.id));
      setItems((prev) => prev.filter((it) => !movedIds.has(it.id)));
      toast.success(`${moved} item dipindah ke ${destRoom.name}`);
      return;
    }
    const saved = selected.filter((it) => it.id > 0);
    if (saved.length < selected.length) {
      toast.info("Baris baru (belum bernama) tidak ikut dipindah");
    }
    if (saved.length === 0) return;
    const res = await moveItemsServer(
      saved.map((it) => it.id),
      roomProp.id,
      destRoom.id
    ).catch(() => ({ error: "Gagal memindah di server" }));
    if (res && "error" in res) {
      toast.error(
        typeof res.error === "string" ? res.error : "Gagal memindah di server"
      );
      return;
    }
    const movedIds = new Set(saved.map((it) => it.id));
    setItems((prev) => prev.filter((it) => !movedIds.has(it.id)));
    toast.success(`${saved.length} item dipindah ke ${destRoom.name}`);
    router.refresh();
  }

  /** GAS delRow (~19340) — hapus langsung, nomor urut menyesuaikan sendiri. */
  async function handleDeleteItem(item: Item) {
    // Baris sementara: hapus lokal saja.
    if (!isDbRoom || item.id < 0) {
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      toast.success(`${item.name || "Baris"} dihapus`);
      return;
    }
    const res = await deleteItem(item.id, roomProp.id).catch(() => ({
      error: "Gagal menghapus di server",
    }));
    if (res && "error" in res) {
      toast.error(
        typeof res.error === "string" ? res.error : "Gagal menghapus di server"
      );
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    toast.success(`${item.name || "Baris"} dihapus`);
  }

  function openChecklist() {
    setChecklistOpen(true);
  }

  function closeChecklist() {
    setChecklistOpen(false);
  }

  /** GAS addRow (~19304) — sisipkan baris kosong siap ketik, tanpa modal.
   *  Id negatif sementara (anti-tabrakan id DB); baris dibuatkan di server
   *  otomatis begitu namanya diisi (lihat persistItemField). */
  /** Counter id sementara (negatif, anti-tabrakan id DB). */
  const tempIdRef = useRef(-1);
  function addRow(category: ItemCategory) {
    const now = new Date().toISOString();
    const nextId = tempIdRef.current--;
    const newItem: Item = {
      id: nextId,
      room_id: room.id,
      category,
      name: "",
      spec: "",
      merk: "",
      noreg: "",
      quantity: 0,
      unit: "",
      std: 0,
      condition: "baik",
      prio: "pendukung",
      notes: "",
      index_in_room: items.filter((it) => it.category === category).length,
      created_at: now,
      updated_at: now,
    };
    focusItemId.current = nextId;
    setItems((prev) => [...prev, newItem]);
  }

  return (
    <>
      {/* Room Header (matches GAS .room-header) */}
      <div className="flex items-center gap-4 mb-[22px] px-6 py-5 bg-white rounded-[var(--r)] border border-line shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
          style={{ background: room.bg }}
        >
          {room.icon}
        </div>

        <div>
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nameDraft}
                autoFocus
                aria-label="Nama ruangan"
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="w-[240px] rounded-lg border-[1.5px] border-teal2 bg-white px-2.5 py-1 text-lg font-extrabold text-ink outline-none"
              />
              <button
                type="button"
                onClick={saveName}
                className="rounded-lg border-[1.5px] border-[rgba(14,124,107,0.3)] bg-[rgba(14,124,107,0.08)] px-2.5 py-1 text-xs font-bold text-teal transition-colors hover:bg-teal hover:text-white"
              >
                ✅
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="rounded-lg border-[1.5px] border-line bg-line2 px-2.5 py-1 text-xs font-bold text-ink3 transition-colors hover:border-ink3"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="text-lg font-extrabold text-ink">{room.name}</div>
          )}
          {room.description && (
            <div className="text-xs text-ink3 mt-0.5">{room.description}</div>
          )}
        </div>

        <div className="ml-auto flex gap-3">
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
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div
              className={`text-[20px] font-extrabold font-mono leading-none ${
                attentionCount > 0 ? "text-red" : "text-teal"
              }`}
            >
              {attentionCount}
            </div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide mt-1">
              Perlu Perhatian
            </div>
          </div>
        </div>

        {editingPj ? (
          <div className="flex min-w-[200px] max-w-[300px] items-center gap-1.5 rounded-[10px] border-[1.5px] border-teal2 bg-white px-[10px] py-[6px]">
            <span className="text-base">{"\u{1F464}"}</span>
            <input
              type="text"
              value={pjDraft}
              autoFocus
              placeholder="Nama penanggung jawab"
              aria-label="Penanggung jawab"
              onChange={(e) => setPjDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePj();
                if (e.key === "Escape") setEditingPj(false);
              }}
              className="min-w-0 flex-1 border-none bg-transparent text-[12.5px] font-bold text-ink outline-none placeholder:font-normal placeholder:text-ink3"
            />
            <button
              type="button"
              onClick={savePj}
              className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold text-teal transition-colors hover:bg-teal4"
              aria-label="Simpan penanggung jawab"
            >
              ✅
            </button>
            <button
              type="button"
              onClick={() => setEditingPj(false)}
              className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold text-ink3 transition-colors hover:bg-line2"
              aria-label="Batal"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditPj}
            title="Klik untuk ubah penanggung jawab"
            className="flex items-center gap-2 px-[14px] py-[7px] rounded-[10px] bg-line2 border-[1.5px] border-line min-w-[200px] max-w-[280px] text-left hover:border-teal hover:bg-[#f0fdfa] group"
          >
            <span className="text-base">{"\u{1F464}"}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[9.5px] font-extrabold text-ink3 uppercase tracking-wide">
                Penanggung Jawab
              </div>
              <div
                className={`text-[12.5px] font-bold truncate ${
                  room.pj ? "text-ink" : "text-ink3 italic font-normal"
                }`}
              >
                {room.pj || "Belum diisi"}
              </div>
            </div>
            <span className="text-xs text-ink3 opacity-0 group-hover:opacity-100">
              {"✏️"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSemuaBaik}
          className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-[rgba(14,124,107,0.3)] bg-[rgba(14,124,107,0.08)] text-teal hover:bg-teal hover:text-white transition-colors"
        >
          {"✅"} Semua Kondisi Baik
        </button>
        <button
          type="button"
          onClick={startEditName}
          disabled={editingName}
          className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#eff6ff] disabled:hover:text-[#1d4ed8]"
        >
          {"✏️"} Edit Nama
        </button>
        <button
          type="button"
          onClick={openMoveAll}
          className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white transition-colors"
        >
          {"↗"} Pindah Item
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="del-room-btn px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-red/30 bg-red2 text-red hover:bg-red hover:text-white transition-colors"
        >
          {"\u{1F5D1}"} Hapus
        </button>
      </div>

      {/* ── Kategori: GAS hanya merender kategori yang berisi (~19148) ── */}
      <div className="space-y-5">
        {CATEGORY_CONFIG.map((cat) => {
          const catItems = grouped[cat.value];
          if (catItems.length === 0) return null;
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
                  {"✅"} Semua Baik
                </button>
                <span className="text-[11px] ml-1.5">▾</span>
              </summary>

              <div className="mt-px">
                <div className="overflow-x-auto rounded-b-lg">
                  <table className="w-full border-collapse text-[13px] bg-white border border-line border-t-0">
                    <thead>
                      <tr>
                        <th className={`${TH_BASE} w-9 text-center`}>No</th>
                        <th className={`${TH_BASE} text-left`}>
                          Nama &amp; Spesifikasi
                        </th>
                        <th className={`${TH_BASE} text-center min-w-[92px]`}>
                          Tahun
                        </th>
                        <th className={`${TH_BASE} text-left min-w-[140px]`}>
                          Merek / Tipe
                        </th>
                        <th className={`${TH_BASE} text-left min-w-[130px]`}>
                          No. Register
                        </th>
                        <th className={`${TH_BASE} text-left`}>Satuan</th>
                        <th className={`${TH_BASE} text-center`}>Standar</th>
                        <th className={`${TH_BASE} text-center`}>Jml Ada</th>
                        <th className={`${TH_BASE} text-center min-w-[132px]`}>
                          Prioritas
                        </th>
                        <th className={`${TH_BASE} text-center min-w-[152px]`}>
                          Kondisi
                        </th>
                        <th className={`${TH_BASE} text-left min-w-[160px]`}>
                          Keterangan
                        </th>
                        <th className={`${TH_BASE} text-center min-w-[80px]`}>
                          Ceklist
                        </th>
                        <th className={TH_BASE} />
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b border-line last:border-b-0 hover:bg-[#fafcff]"
                        >
                          {/* No — GAS .td-no */}
                          <td className="w-9 px-3.5 py-2 text-center font-mono text-[11px] text-ink3">
                            {idx + 1}
                          </td>

                          {/* Nama & Spesifikasi — GAS .td-nama / .td-spec */}
                          <td className="px-3.5 py-2 align-top">
                            <input
                              ref={nameInputRef}
                              data-item-id={item.id}
                              type="text"
                              value={item.name}
                              placeholder={`Nama ${cat.label.toLowerCase()}...`}
                              title="Nama barang"
                              onChange={(e) =>
                                updateItem(item.id, { name: e.target.value })
                              }
                              className={`${CELL_GHOST} min-w-[160px] text-[13px] font-semibold text-ink`}
                            />
                            <input
                              type="text"
                              value={item.spec ?? ""}
                              placeholder="Spesifikasi..."
                              title="Spesifikasi"
                              onChange={(e) =>
                                updateItem(item.id, { spec: e.target.value })
                              }
                              className={`${CELL_GHOST} mt-0.5 min-w-[160px] py-[3px] text-[11.5px] font-normal text-ink3`}
                            />
                          </td>

                          {/* Tahun — GAS .inp-tahun */}
                          <td className="px-3.5 py-2">
                            <input
                              type="number"
                              min={1990}
                              max={2099}
                              value={item.year ?? ""}
                              placeholder="—"
                              title="Tahun Pengadaan"
                              onChange={(e) =>
                                updateItem(item.id, {
                                  year: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                              className={`${CELL_INPUT} w-[76px] text-center font-mono font-semibold`}
                            />
                          </td>

                          {/* Merek / Tipe — GAS .inp-merek */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={item.merk ?? ""}
                              placeholder="Merek/Tipe"
                              title="Merek / Tipe"
                              onChange={(e) =>
                                updateItem(item.id, { merk: e.target.value })
                              }
                              className={`${CELL_INPUT} w-[108px]`}
                            />
                          </td>

                          {/* No. Register — GAS .inp-noreg */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={item.noreg ?? ""}
                              placeholder="No. Register"
                              title="Nomor Register"
                              onChange={(e) =>
                                updateItem(item.id, { noreg: e.target.value })
                              }
                              className={`${CELL_INPUT} w-[98px] font-mono text-[11px]`}
                            />
                          </td>

                          {/* Satuan — GAS .td-sat */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={item.unit ?? ""}
                              placeholder="Unit"
                              title="Satuan"
                              onChange={(e) =>
                                updateItem(item.id, { unit: e.target.value })
                              }
                              className={`${CELL_GHOST} w-[70px] text-ink3`}
                            />
                          </td>

                          {/* Standar — GAS .td-std */}
                          <td className="px-3.5 py-2">
                            <input
                              type="number"
                              min={0}
                              value={item.std ?? 0}
                              title="Jumlah standar"
                              onChange={(e) =>
                                updateItem(item.id, {
                                  std: Number(e.target.value) || 0,
                                })
                              }
                              className={`${CELL_GHOST} w-[56px] text-center font-mono text-ink3`}
                            />
                          </td>

                          {/* Jml Ada — GAS .td-jml */}
                          <td className="px-3.5 py-2">
                            <input
                              type="number"
                              min={0}
                              value={item.quantity}
                              title="Jumlah yang ada"
                              onChange={(e) =>
                                updateItem(item.id, {
                                  quantity: Number(e.target.value) || 0,
                                })
                              }
                              className={`${CELL_INPUT} w-[60px] text-center font-mono text-[13px] font-bold`}
                            />
                          </td>

                          {/* Prioritas */}
                          <td className="px-3.5 py-2">
                            <select
                              value={item.prio ?? "pendukung"}
                              title="Prioritas"
                              aria-label={`Prioritas ${item.name || "item"}`}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  prio: e.target.value as ItemPriority,
                                })
                              }
                              className={`${CELL_SELECT} ${
                                PRIORITY_CLASS[item.prio ?? "pendukung"]
                              }`}
                            >
                              {PRIORITY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Kondisi — GAS kondisiOpts + styleKondisi */}
                          <td className="px-3.5 py-2">
                            <select
                              value={item.condition}
                              title="Kondisi"
                              aria-label={`Kondisi ${item.name || "item"}`}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  condition: e.target.value as ItemCondition,
                                })
                              }
                              className={`${CELL_SELECT} ${CONDITION_CLASS[item.condition]}`}
                            >
                              {CONDITION_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Keterangan */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={item.notes ?? ""}
                              placeholder="Catatan..."
                              title="Keterangan"
                              onChange={(e) =>
                                updateItem(item.id, { notes: e.target.value })
                              }
                              className={`${CELL_INPUT} min-w-[110px]`}
                            />
                          </td>

                          {/* Ceklist — GAS .cl-open-btn */}
                          <td className="px-3.5 py-2 text-center">
                            <button
                              type="button"
                              onClick={openChecklist}
                              className="inline-flex h-[26px] items-center gap-1 whitespace-nowrap rounded-[5px] border border-line bg-line2 px-2 text-[11px] font-semibold text-ink2 transition-colors hover:bg-line"
                              title="Ceklist harian"
                            >
                              📅 Ceklist
                            </button>
                          </td>

                          <td className="px-3.5 py-2">
                            <div className="flex items-center gap-1">
                              {/* GAS .mv-btn */}
                              <button
                                type="button"
                                onClick={() => openMoveItem(item)}
                                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border-[1.5px] border-[#bfdbfe] bg-[#eff6ff] text-[13px] font-black leading-none text-[#1d4ed8] transition-all duration-150 hover:scale-110 hover:border-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white"
                                title="Pindah ke ruangan lain"
                                aria-label={`Pindah ${item.name || "item"}`}
                              >
                                ↗
                              </button>
                              {/* GAS .del-btn */}
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border-0 bg-red2 text-xs font-bold text-red transition-colors hover:bg-[#fca5a5]"
                                title="Hapus"
                                aria-label={`Hapus ${item.name || "item"}`}
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="add-btn flex w-full items-center justify-center gap-2 border border-t-0 border-dashed border-line bg-transparent px-[18px] py-[9px] text-xs font-semibold text-ink3 rounded-b-[var(--r)] transition-colors duration-[180ms] hover:border-teal3 hover:bg-teal4 hover:text-teal"
                  onClick={() => addRow(cat.value)}
                >
                  ＋ Tambah {cat.label}
                </button>
              </div>
            </details>
          );
        })}

        {/*
          GAS menyembunyikan kategori kosong sepenuhnya sehingga tak ada jalan
          menambah item pertamanya. Baris tombol ini menutup celah itu tanpa
          mengubah tampilan kategori yang sudah berisi.
        */}
        {emptyCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-[var(--r)] border border-dashed border-line bg-white px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink3">
              Kategori kosong
            </span>
            {emptyCategories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => addRow(cat.value)}
                className="rounded-[20px] border-[1.5px] border-line bg-line2 px-3 py-[5px] text-[11px] font-bold text-ink3 transition-colors hover:border-teal3 hover:bg-teal4 hover:text-teal"
              >
                ＋ {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Move single item — GAS #moveModalBg 1:1; remount resets form state */}
      <MoveItemModal
        key={moveItem ? `move-item-${moveItem.id}` : "move-item-closed"}
        open={!!moveItem}
        onClose={closeMoveItem}
        item={moveItem}
        fromRoom={room}
        rooms={rooms}
        onConfirm={confirmMoveItem}
      />

      {/* Pindah beberapa/semua item — GAS openMvAllModal; remount reset state */}
      <MoveAllModal
        key={moveAllOpen ? "move-all-open" : "move-all-closed"}
        open={moveAllOpen}
        onClose={closeMoveAll}
        items={items}
        fromRoom={room}
        rooms={rooms}
        onConfirm={confirmMoveAll}
      />

      {/* Ceklist Harian — GAS openChecklist / #clModalOverlay (mock matrix) */}
      <ChecklistRoomModal
        open={checklistOpen}
        onClose={closeChecklist}
        room={room}
        items={items}
      />

      {/* Hapus ruangan — GAS delRoom memakai confirm(), di sini dialog bergaya GAS */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} size="sm">
        <div
          className="flex shrink-0 items-center justify-between px-[22px] py-[18px] text-white"
          style={{ background: "linear-gradient(135deg, #7f1d1d, #b91c1c)" }}
        >
          <div className="min-w-0">
            <div className="text-base font-extrabold leading-tight">
              🗑 Hapus Ruangan
            </div>
            <div className="mt-[3px] truncate text-[11px] opacity-75">
              {room.icon} {room.name}
            </div>
          </div>
        </div>

        <div className="px-[22px] py-5">
          <p className="text-[13px] leading-relaxed text-ink2">
            Ruangan <b>{room.name}</b> beserta <b>{totalItems}</b> item di
            dalamnya akan dihapus dari daftar. Tindakan ini tidak dapat
            dibatalkan.
          </p>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-bg px-[22px] py-3.5">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="rounded-[10px] border-[1.5px] border-line bg-white px-4 py-2 text-xs font-bold text-ink2 transition-colors hover:border-ink3"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmDeleteRoom}
            className="rounded-[10px] border-none bg-[#b91c1c] px-[22px] py-2 text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(185,28,28,0.3)] transition-colors hover:bg-[#991b1b]"
          >
            🗑 Ya, Hapus Ruangan
          </button>
        </div>
      </Dialog>
    </>
  );
}
