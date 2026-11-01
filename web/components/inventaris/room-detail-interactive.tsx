"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowsDownUp,
  ArrowsLeftRight,
  CalendarBlank,
  CaretDown,
  Check,
  PencilSimple,
  Plus,
  Trash,
  User,
  Warning,
  X,
} from "@phosphor-icons/react";
import { ChecklistRoomModal } from "@/components/inventaris/checklist-room-modal";
import { RoomQrDialog } from "@/components/inventaris/room-qr-dialog";
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
  /** Petak kecil berwarna kategori (bukan emoji). */
  tileClass: string;
  /** Warna titik/petak kategori untuk summary <details>. */
  dotColor: string;
}[] = [
  {
    value: "alkes",
    label: "Alat Kesehatan",
    tileClass: "bg-primary-soft text-primary",
    dotColor: "bg-primary",
  },
  {
    value: "meubelair",
    label: "Meubelair",
    tileClass: "bg-warning-soft text-warning",
    dotColor: "bg-warning",
  },
  {
    value: "elektronik",
    label: "Elektronik",
    tileClass: "bg-info-soft text-info",
    dotColor: "bg-info",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    tileClass: "bg-surface-muted text-text-2",
    dotColor: "bg-text-3",
  },
];

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "baik", label: "Baik" },
  { value: "rr", label: "Rusak Ringan" },
  { value: "rb", label: "Rusak Berat" },
  { value: "ta", label: "Tidak Ada" },
];

const PRIORITY_OPTIONS: { value: ItemPriority; label: string }[] = [
  { value: "wajib", label: "Wajib" },
  { value: "penting", label: "Penting" },
  { value: "pendukung", label: "Pendukung" },
];

/* ── GAS td input / td select (index.html ~716–771, 2045–2058) ── */

const CELL_BASE =
  "rounded-sm border px-2 py-[5px] text-[13px] outline-none transition-colors";

/** Input bergaris — GAS `td input[type=text|number]`. */
const CELL_INPUT = `${CELL_BASE} w-full border-border bg-surface text-foreground placeholder:text-text-3 focus:border-primary focus:ring-2 focus:ring-ring/25`;

/**
 * Input "hantu" — tampil seperti teks biasa (GAS merender sel ini statis),
 * garisnya baru muncul saat hover/fokus supaya tetap bisa diedit langsung.
 */
const CELL_GHOST = `${CELL_BASE} w-full border-transparent bg-transparent leading-[1.35] placeholder:text-text-3 hover:border-border focus:border-primary focus:bg-surface focus:ring-2 focus:ring-ring/25`;

const CELL_SELECT = `${CELL_BASE} w-full cursor-pointer font-bold`;

/** GAS `td select.k-*` (~732–754). */
const CONDITION_CLASS: Record<ItemCondition, string> = {
  baik: "bg-success-soft text-success border-transparent",
  rr: "bg-warning-soft text-warning border-transparent",
  rb: "bg-danger-soft text-danger border-transparent",
  ta: "bg-surface-muted text-text-2 border-transparent",
};

/** GAS `.spill.sp-*` (~702–713), dipakai sebagai warna select prioritas. */
const PRIORITY_CLASS: Record<ItemPriority, string> = {
  wajib: "bg-warning-soft text-warning border-transparent",
  penting: "bg-info-soft text-info border-transparent",
  pendukung: "bg-surface-muted text-text-2 border-transparent",
};

const TH_BASE =
  "bg-surface-muted px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3 border-b border-border whitespace-nowrap";

/** Kolom yang bisa diurut — klik header: naik → turun → kembali awal. */
type SortKey =
  | "name"
  | "year"
  | "merk"
  | "noreg"
  | "unit"
  | "std"
  | "quantity"
  | "prio"
  | "condition"
  | "notes";
type SortState = { key: SortKey; dir: "asc" | "desc" } | null;

const CONDITION_RANK: Record<string, number> = {
  baik: 0,
  rr: 1,
  rb: 2,
  ta: 3,
};
const PRIO_RANK: Record<string, number> = {
  wajib: 0,
  penting: 1,
  pendukung: 2,
};

function sortValue(item: Item, key: SortKey): string | number | null {
  switch (key) {
    case "name":
      return item.name || null;
    case "year":
      return item.year ?? null;
    case "merk":
      return item.merk || item.type || null;
    case "noreg":
      return item.noreg || null;
    case "unit":
      return item.unit || null;
    case "std":
      return item.std ?? null;
    case "quantity":
      return item.quantity ?? null;
    case "prio":
      return item.prio ? (PRIO_RANK[item.prio] ?? 99) : null;
    case "condition":
      return item.condition ? (CONDITION_RANK[item.condition] ?? 99) : null;
    case "notes":
      return item.notes || null;
  }
}

function compareSort(a: Item, b: Item, sort: NonNullable<SortState>): number {
  const va = sortValue(a, sort.key);
  const vb = sortValue(b, sort.key);
  // Kosong selalu di bawah, di kedua arah.
  if (va == null && vb == null) return a.id - b.id;
  if (va == null) return 1;
  if (vb == null) return -1;
  let c: number;
  if (typeof va === "number" && typeof vb === "number") c = va - vb;
  else c = String(va).localeCompare(String(vb), "id");
  if (c === 0) return a.id - b.id;
  return sort.dir === "asc" ? c : -c;
}

function SortableTh({
  label,
  sortKey,
  sort,
  onToggle,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onToggle: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <th
      className={className ?? TH_BASE}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        title={`Urutkan berdasarkan ${label}`}
        aria-label={`Urutkan berdasarkan ${label}${
          active ? (sort.dir === "asc" ? " (menaik)" : " (menurun)") : ""
        }`}
        className="inline-flex items-center gap-1 text-left uppercase tracking-[0.04em] transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
      >
        {label}
        <span
          aria-hidden
          className={`inline-flex shrink-0 ${
            active ? "text-primary" : "text-text-3/45"
          }`}
        >
          {active ? (
            sort.dir === "asc" ? (
              <ArrowUp size={12} weight="bold" />
            ) : (
              <ArrowDown size={12} weight="bold" />
            )
          ) : (
            <ArrowsDownUp size={12} />
          )}
        </span>
      </button>
    </th>
  );
}

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

  // Urutan tampil tabel — null = urutan KIR (index_in_room). Klik header:
  // menaik → menurun → kembali ke awal.
  const [sort, setSort] = useState<SortState>(null);
  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      !prev || prev.key !== key
        ? { key, dir: "asc" }
        : prev.dir === "asc"
          ? { key, dir: "desc" }
          : null
    );
  };
  const sortItems = (list: Item[]): Item[] => {
    if (!sort) return list;
    return [...list].sort((a, b) => compareSort(a, b, sort));
  };

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
      {/* Room Header (matches GAS .room-header) — layar sempit: elemen
          membungkus ke baris baru, bukan meluber horizontal. */}
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md border border-border bg-surface px-5 py-[18px] max-md:gap-y-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[22px] leading-none"
          style={{ background: room.bg }}
        >
          {room.icon}
        </div>

        <div className="min-w-0">
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
                className="h-9 w-[240px] max-w-full rounded-sm border border-border bg-surface px-2.5 text-[15px] font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
              />
              <button
                type="button"
                onClick={saveName}
                className="inline-flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                aria-label="Simpan nama ruangan"
              >
                <Check size={15} weight="bold" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="inline-flex size-9 items-center justify-center rounded-sm border border-border bg-surface text-text-2 transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                aria-label="Batal ubah nama"
              >
                <X size={15} aria-hidden />
              </button>
            </div>
          ) : (
            <h2 className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
              {room.name}
            </h2>
          )}
          {room.description && (
            <div className="mt-0.5 text-[12px] leading-snug text-text-3">
              {room.description}
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-wrap gap-2 max-md:ml-0 max-md:w-full">
          <div className="min-w-[86px] flex-1 rounded-sm border border-border px-3 py-2 max-md:flex-none">
            <div className="font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
              {totalItems}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase leading-none tracking-[0.04em] text-text-3">
              Jenis Item
            </div>
          </div>
          <div className="min-w-[86px] flex-1 rounded-sm border border-border px-3 py-2 max-md:flex-none">
            <div className="font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
              {totalUnits}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase leading-none tracking-[0.04em] text-text-3">
              Total Unit
            </div>
          </div>
          <div className="min-w-[86px] flex-1 rounded-sm border border-border px-3 py-2 max-md:flex-none">
            <div
              className={`font-mono text-[20px] font-semibold leading-none tabular-nums ${
                attentionCount > 0 ? "text-danger" : "text-foreground"
              }`}
            >
              {attentionCount}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase leading-none tracking-[0.04em] text-text-3">
              Perlu Perhatian
            </div>
          </div>
        </div>

        {editingPj ? (
          <div className="flex h-9 min-w-[200px] max-w-[300px] items-center gap-2 rounded-sm border border-primary bg-surface px-2.5">
            <User size={14} aria-hidden className="shrink-0 text-text-3" />
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
              className="min-w-0 flex-1 border-none bg-transparent text-[13px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-text-3"
            />
            <button
              type="button"
              onClick={savePj}
              className="shrink-0 rounded-sm p-1 text-primary transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              aria-label="Simpan penanggung jawab"
            >
              <Check size={14} weight="bold" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setEditingPj(false)}
              className="shrink-0 rounded-sm p-1 text-text-3 transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              aria-label="Batal"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditPj}
            title="Klik untuk ubah penanggung jawab"
            className="group flex h-9 min-w-[200px] max-w-[280px] items-center gap-2 rounded-sm border border-border bg-surface px-2.5 text-left transition-colors duration-150 hover:border-border-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <User size={14} aria-hidden className="shrink-0 text-text-3" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase leading-none tracking-[0.04em] text-text-3">
                Penanggung Jawab
              </div>
              <div
                className={`mt-0.5 truncate text-[13px] font-semibold leading-none ${
                  room.pj ? "text-foreground" : "font-normal italic text-text-3"
                }`}
              >
                {room.pj || "Belum diisi"}
              </div>
            </div>
            <PencilSimple
              size={13}
              aria-hidden
              className="shrink-0 text-text-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            />
          </button>
        )}

        <button
          type="button"
          onClick={handleSemuaBaik}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-3.5 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <Check size={15} aria-hidden className="text-text-3" />
          Semua Kondisi Baik
        </button>
        <button
          type="button"
          onClick={startEditName}
          disabled={editingName}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-3.5 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50"
        >
          <PencilSimple size={15} aria-hidden className="text-text-3" />
          Edit Nama
        </button>
        <button
          type="button"
          onClick={openMoveAll}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-3.5 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <ArrowsLeftRight size={15} aria-hidden className="text-text-3" />
          Pindah Item
        </button>
        {isDbRoom && <RoomQrDialog roomId={room.id} roomName={room.name} />}
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="del-room-btn inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-3.5 text-[13px] font-semibold text-danger transition-colors duration-150 hover:border-danger/40 hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/35"
        >
          <Trash size={15} aria-hidden />
          Hapus
        </button>
      </div>

      {/* ── Kategori: GAS hanya merender kategori yang berisi (~19148) ── */}
      <div className="space-y-5">
        {CATEGORY_CONFIG.map((cat) => {
          const catItems = sortItems(grouped[cat.value]);
          if (catItems.length === 0) return null;
          return (
            <details key={cat.value} open className="cat-section">
              <summary
                className="flex cursor-pointer select-none list-none items-center gap-2.5 rounded-t-md border border-border bg-surface px-4 py-2.5 transition-colors duration-150 hover:bg-surface-muted [&::-webkit-details-marker]:hidden"
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-sm ${cat.tileClass}`}
                  aria-hidden
                >
                  <span className="size-1.5 rounded-full bg-current" />
                </span>
                <span className="text-[13px] font-semibold text-foreground">
                  {cat.label}
                </span>
                <span className="font-mono text-[12px] tabular-nums text-text-3">
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
                  className="relative z-[2] ml-auto inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-sm border border-border bg-surface px-2.5 text-[11px] font-semibold text-text-2 transition-colors duration-150 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                >
                  <Check size={12} aria-hidden />
                  Semua Baik
                </button>
                <CaretDown
                  size={13}
                  aria-hidden
                  className="shrink-0 text-text-3 transition-transform duration-150"
                />
              </summary>

              <div>
                <div className="overflow-x-auto rounded-b-md border border-t-0 border-border">
                  <table className="w-full border-collapse bg-surface text-[13px]">
                    <thead>
                      <tr>
                        <th className={`${TH_BASE} w-9 text-center`}>No</th>
                        <SortableTh
                          label="Nama & Spesifikasi"
                          sortKey="name"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-left`}
                        />
                        <SortableTh
                          label="Tahun"
                          sortKey="year"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-center min-w-[92px]`}
                        />
                        <SortableTh
                          label="Merek / Tipe"
                          sortKey="merk"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-left min-w-[140px]`}
                        />
                        <SortableTh
                          label="No. Register"
                          sortKey="noreg"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-left min-w-[130px]`}
                        />
                        <SortableTh
                          label="Satuan"
                          sortKey="unit"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-left`}
                        />
                        <SortableTh
                          label="Standar"
                          sortKey="std"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-center`}
                        />
                        <SortableTh
                          label="Jml Ada"
                          sortKey="quantity"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-center`}
                        />
                        <SortableTh
                          label="Prioritas"
                          sortKey="prio"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-center min-w-[132px]`}
                        />
                        <SortableTh
                          label="Kondisi"
                          sortKey="condition"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-center min-w-[152px]`}
                        />
                        <SortableTh
                          label="Keterangan"
                          sortKey="notes"
                          sort={sort}
                          onToggle={toggleSort}
                          className={`${TH_BASE} text-left min-w-[160px]`}
                        />
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
                          className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-surface-muted"
                        >
                          {/* No — GAS .td-no */}
                          <td className="w-9 px-3.5 py-0 text-center font-mono text-[11px] tabular-nums text-text-3">
                            {idx + 1}
                          </td>

                          {/* Nama & Spesifikasi — GAS .td-nama / .td-spec */}
                          <td className="px-3 py-1">
                            <div className="flex min-w-[160px] flex-col">
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
                                className={`${CELL_GHOST} !py-[2px] !text-[13px] !leading-[1.2] font-semibold text-foreground`}
                              />
                              <input
                                type="text"
                                value={item.spec ?? ""}
                                placeholder="Spesifikasi..."
                                title="Spesifikasi"
                                onChange={(e) =>
                                  updateItem(item.id, { spec: e.target.value })
                                }
                                className={`${CELL_GHOST} !border-transparent !px-2 !py-0 !text-[11px] !leading-[1.2] font-normal text-text-3`}
                              />
                            </div>
                          </td>

                          {/* Tahun — GAS .inp-tahun */}
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1">
                            <input
                              type="text"
                              value={item.unit ?? ""}
                              placeholder="Unit"
                              title="Satuan"
                              onChange={(e) =>
                                updateItem(item.id, { unit: e.target.value })
                              }
                              className={`${CELL_GHOST} w-[70px] text-text-3`}
                            />
                          </td>

                          {/* Standar — GAS .td-std */}
                          <td className="px-3 py-1">
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
                              className={`${CELL_GHOST} w-[56px] text-center font-mono text-text-3`}
                            />
                          </td>

                          {/* Jml Ada — GAS .td-jml */}
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1">
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
                          <td className="px-3 py-1 text-center">
                            <button
                              type="button"
                              onClick={openChecklist}
                              className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-sm border border-border bg-surface px-2 text-[11px] font-semibold text-text-2 transition-colors duration-150 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                              title="Ceklist harian"
                            >
                              <CalendarBlank size={12} aria-hidden />
                              Ceklist
                            </button>
                          </td>

                          <td className="px-3 py-1">
                            <div className="flex items-center gap-1">
                              {/* GAS .mv-btn */}
                              <button
                                type="button"
                                onClick={() => openMoveItem(item)}
                                className="inline-flex size-7 items-center justify-center rounded-sm text-text-3 transition-colors duration-150 hover:bg-surface-subtle hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                                title="Pindah ke ruangan lain"
                                aria-label={`Pindah ${item.name || "item"}`}
                              >
                                <ArrowsLeftRight size={16} aria-hidden />
                              </button>
                              {/* GAS .del-btn */}
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="inline-flex size-7 items-center justify-center rounded-sm text-text-3 transition-colors duration-150 hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/35"
                                title="Hapus"
                                aria-label={`Hapus ${item.name || "item"}`}
                              >
                                <Trash size={16} aria-hidden />
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
                  className="add-btn flex w-full items-center justify-center gap-1.5 rounded-b-md border border-t border-border bg-surface px-4 py-2.5 text-[12px] font-semibold text-text-3 transition-colors duration-150 hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                  onClick={() => addRow(cat.value)}
                >
                  <Plus size={13} weight="bold" aria-hidden />
                  Tambah {cat.label}
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
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-surface px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3">
              Kategori kosong
            </span>
            {emptyCategories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => addRow(cat.value)}
                className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-surface px-2.5 text-[11px] font-semibold text-text-2 transition-colors duration-150 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                <Plus size={12} weight="bold" aria-hidden />
                {cat.label}
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
        {/* Head — netral, bukan gradasi: warna status hanya di ikon. */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-3.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-danger-soft text-danger"
            aria-hidden
          >
            <Warning size={16} weight="fill" />
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-tight text-foreground">
              Hapus Ruangan
            </div>
            <div className="mt-0.5 truncate text-[12px] text-text-3">
              {room.icon} {room.name}
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-[13px] leading-relaxed text-text-2">
            Ruangan{" "}
            <b className="font-semibold text-foreground">{room.name}</b> beserta{" "}
            <b className="font-semibold text-foreground">{totalItems}</b> item di
            dalamnya akan dihapus dari daftar. Tindakan ini tidak dapat
            dibatalkan.
          </p>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-surface-subtle px-5 py-3.5">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmDeleteRoom}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-danger px-4 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-danger/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/35"
          >
            <Trash size={15} aria-hidden />
            Ya, Hapus Ruangan
          </button>
        </div>
      </Dialog>
    </>
  );
}
