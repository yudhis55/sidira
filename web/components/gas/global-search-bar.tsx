"use client";

/**
 * Search bar global di header — port GAS `.global-search-bar` / `#gsDropdown`.
 *
 * Kolom pencarian selalu terlihat di header (lengkap dengan badge Ctrl+K dan
 * tombol bersihkan), sedangkan hasil tampil sebagai dropdown putih di bawahnya.
 * Dropdown dirender lewat portal (posisi fixed mengikuti kolom pencarian) agar
 * tidak terpotong.
 *
 * Paritas GAS yang dijaga di sini:
 * - `gsSetFilter`  → chip kategori (Semua/Alkes/Meubelair/Elektronik).
 * - `gsHighlight`  → kata kunci dibungkus `<mark>`.
 * - `gsGetCond`    → kondisi live per item (dibaca dari baris tabel yang tampil).
 * - `gsNavigateTo` → pindah ruangan, scroll ke baris, kilau `.gs-highlighted`
 *                    2,2 detik.
 *
 * Sumber hasil tetap `globalSearch` (server) / `mockGlobalSearch`. Metadata
 * tambahan (kategori, kondisi, jumlah, id item, nama/ikon ruangan) diambil dari
 * Supabase browser client supaya pengelompokkan per ruangan dan filter kategori
 * bisa bekerja — `SearchResult` server hanya memuat label/href.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  Buildings,
  FileText,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import { globalSearch, type SearchResult } from "@/lib/auth/global-search";
import { mockGlobalSearch } from "@/lib/mock-data/global-search";
import { getMockItems } from "@/lib/mock-data/items";
import { getMockRooms } from "@/lib/mock-data/rooms";
import { createClient } from "@/lib/supabase/client";
import { useIsClient } from "@/lib/use-is-client";
import type { ItemCategory, ItemCondition } from "@/types/database";

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

type CategoryFilter = "all" | "alkes" | "meubelair" | "elektronik";

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "alkes", label: "🩺 Alkes" },
  { value: "meubelair", label: "🪑 Meubelair" },
  { value: "elektronik", label: "💻 Elektronik" },
];

/** GAS `.gs-item-kat` — petak kecil kategori. */
const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  alkes: "🩺",
  meubelair: "🪑",
  elektronik: "💻",
  lainnya: "📦",
};

const CATEGORY_TILE: Record<ItemCategory, string> = {
  alkes: "bg-primary-soft",
  meubelair: "bg-warning-soft",
  elektronik: "bg-info-soft",
  lainnya: "bg-surface-muted",
};

/** GAS `gsGetCond` label + `.gs-cond.*`. */
const CONDITION_LABEL: Record<ItemCondition, string> = {
  baik: "✅ Baik",
  rr: "⚠ R.Ringan",
  rb: "🔴 R.Berat",
  ta: "— T.Ada",
};

const CONDITION_TILE: Record<ItemCondition, string> = {
  baik: "bg-success-soft text-success",
  rr: "bg-warning-soft text-warning",
  rb: "bg-danger-soft text-danger",
  ta: "bg-surface-muted text-text-2",
};

/** GAS `tr.gs-highlighted` — kilau teal lalu memudar (2,2 detik). */
const ROW_HIGHLIGHT_CSS = `
@keyframes sidiraGsHighlight {
  0% { background-color: rgba(78, 235, 208, 0.35); }
  100% { background-color: transparent; }
}
tr.gs-highlighted { animation: sidiraGsHighlight 2.2s ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  tr.gs-highlighted { animation: none; background-color: rgba(78, 235, 208, 0.2); }
}
`;

const MARK_NAME =
  "rounded-[3px] bg-[#fef08a] px-0.5 text-foreground";
const MARK_SPEC =
  "rounded-[3px] bg-[#fef9c3] px-px text-foreground";

interface Anchor {
  left: number;
  top: number;
  width: number;
}

interface RoomMeta {
  name: string;
  icon: string;
}

interface ItemMeta {
  id: number;
  room_id: string;
  name: string;
  category: ItemCategory;
  condition: ItemCondition;
  quantity: number;
  unit: string;
  merk?: string | null;
  noreg?: string | null;
  spec?: string | null;
}

/** Hasil pencarian + metadata ruangan/item (lihat catatan di atas). */
interface Hit extends SearchResult {
  roomId?: string;
  itemId?: number;
  category?: ItemCategory;
  condition?: ItemCondition;
  quantity?: number;
  unit?: string;
  merk?: string;
  noreg?: string;
  spec?: string;
}

interface ResultGroup {
  key: string;
  roomId?: string;
  title: string;
  icon: string;
  hits: Hit[];
}

/* ── Helper paritas GAS ───────────────────────────────────────────────── */

/** Ambil id ruangan dari href `/inventaris/<id>`. */
function roomIdFromHref(href: string): string | undefined {
  const match = /^\/inventaris\/([^/?#]+)/.exec(href);
  return match ? match[1] : undefined;
}

/** Pisahkan label ruangan server (`icon nama`) menjadi ikon + nama. */
function splitRoomLabel(label: string): { icon: string; name: string } {
  const space = label.indexOf(" ");
  if (space > 0) {
    return { icon: label.slice(0, space), name: label.slice(space + 1) };
  }
  return { icon: "🏥", name: label };
}

/**
 * GAS `gsHighlight()` — bungkus setiap kecocokan dengan `<mark>`.
 * Regex di-escape supaya karakter seperti `(` atau `.` tidak jadi pola.
 */
function highlight(
  text: string,
  query: string,
  variant: "name" | "spec" = "name"
): React.ReactNode {
  const needle = query.trim();
  if (!needle || !text) return text;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lower = needle.toLowerCase();
  const markClass = variant === "name" ? MARK_NAME : MARK_SPEC;

  return parts.map((part, i) =>
    part.toLowerCase() === lower ? (
      <mark key={i} className={markClass}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

/**
 * GAS `gsGetCond()` — baca kondisi live dari baris tabel yang sedang tampil.
 * Saat hasil berasal dari ruangan lain (baris belum ada di DOM) nilai DB dari
 * enrichment dipakai sebagai gantinya.
 */
function readLiveCondition(itemId?: number): ItemCondition | undefined {
  if (itemId == null || typeof document === "undefined") return undefined;
  const row = document.querySelector<HTMLElement>(
    `tr[data-item-id="${itemId}"]`
  );
  const value = row?.dataset.itemCondition;
  return value === "baik" || value === "rr" || value === "rb" || value === "ta"
    ? value
    : undefined;
}

/** Kategori efektif: metadata DB, atau fallback dari `sub` (kategori GAS). */
function effectiveCategory(hit: Hit): ItemCategory | undefined {
  if (hit.category) return hit.category;
  const sub = (hit.sub ?? "").toLowerCase();
  if (
    sub === "alkes" ||
    sub === "meubelair" ||
    sub === "elektronik" ||
    sub === "lainnya"
  ) {
    return sub;
  }
  return undefined;
}

/** Cache metadata ruangan (nama + ikon) selama sesi halaman. */
let roomMetaPromise: Promise<Map<string, RoomMeta>> | null = null;

function loadRoomMeta(): Promise<Map<string, RoomMeta>> {
  if (IS_MOCK) {
    return Promise.resolve(
      new Map(
        getMockRooms().map((room) => [
          room.id,
          { name: room.name, icon: room.icon || "🏥" },
        ])
      )
    );
  }

  if (!roomMetaPromise) {
    roomMetaPromise = (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("rooms")
          .select("id, name, icon");
        const map = new Map<string, RoomMeta>();
        for (const room of (data ?? []) as Array<{
          id: string;
          name: string;
          icon: string | null;
        }>) {
          map.set(room.id, {
            name: room.name,
            icon: room.icon || "🏥",
          });
        }
        return map;
      } catch {
        return new Map<string, RoomMeta>();
      }
    })();
  }

  return roomMetaPromise;
}

/** Metadata item untuk hasil grup "Item" (filter kategori, kondisi, jumlah). */
async function fetchItemMeta(
  names: string[],
  roomIds: string[]
): Promise<ItemMeta[]> {
  const uniqueNames = Array.from(new Set(names));
  const uniqueRooms = Array.from(new Set(roomIds));
  if (uniqueNames.length === 0 || uniqueRooms.length === 0) return [];

  if (IS_MOCK) {
    const wanted = new Set(uniqueNames.map((name) => name.toLowerCase()));
    const rooms = new Set(uniqueRooms);
    return getMockItems()
      .filter(
        (item) =>
          wanted.has(item.name.toLowerCase()) && rooms.has(item.room_id)
      )
      .map((item) => ({
        id: item.id,
        room_id: item.room_id,
        name: item.name,
        category: item.category,
        condition: item.condition,
        quantity: item.quantity,
        unit: item.unit,
        merk: item.merk,
        noreg: item.noreg,
        spec: item.spec,
      }));
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .select(
        "id, room_id, name, category, condition, quantity, unit, merk, noreg, spec"
      )
      .in("name", uniqueNames)
      .in("room_id", uniqueRooms);
    if (error) return [];
    return (data ?? []) as ItemMeta[];
  } catch {
    return [];
  }
}

/** Tempelkan metadata item ke hasil berdasarkan pasangan ruangan + nama. */
function applyItemMeta(hits: Hit[], metas: ItemMeta[]): Hit[] {
  if (metas.length === 0) return hits;

  const byKey = new Map<string, ItemMeta[]>();
  for (const meta of metas) {
    const key = `${meta.room_id}::${meta.name.toLowerCase()}`;
    const bucket = byKey.get(key);
    if (bucket) bucket.push(meta);
    else byKey.set(key, [meta]);
  }

  return hits.map((hit) => {
    if (hit.group !== "Item" || !hit.roomId) return hit;
    const bucket = byKey.get(`${hit.roomId}::${hit.label.toLowerCase()}`);
    const meta = bucket?.shift();
    if (!meta) return hit;
    return {
      ...hit,
      itemId: meta.id,
      category: meta.category,
      condition: meta.condition,
      quantity: meta.quantity,
      unit: meta.unit,
      merk: meta.merk ?? undefined,
      noreg: meta.noreg ?? undefined,
      spec: meta.spec ?? undefined,
    };
  });
}

/* ── Komponen ─────────────────────────────────────────────────────────── */

export function GlobalSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [roomMeta, setRoomMeta] = React.useState<Map<string, RoomMeta>>(
    () => new Map()
  );
  const [filter, setFilter] = React.useState<CategoryFilter>("all");
  const [loading, setLoading] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);
  const mounted = useIsClient();

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = React.useRef(0);
  const pendingRef = React.useRef<{
    roomId: string;
    itemId: number;
    at: number;
  } | null>(null);

  // GAS: Ctrl+K memfokuskan kolom pencarian, Esc menutup hasil.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Posisi dropdown mengikuti kolom pencarian (header sticky + bisa di-scroll).
  const measure = React.useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({ left: r.left, top: r.bottom + 6, width: r.width });
  }, []);

  React.useEffect(() => {
    if (!focused) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [focused, measure]);

  // Pencarian ter-debounce 250ms, minimal 2 karakter (sama dengan GAS gsSearch).
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      requestRef.current += 1;
      debounceRef.current = setTimeout(() => {
        setHits([]);
        setLoading(false);
        setActiveIdx(0);
      }, 0);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestRef.current;
      setLoading(true);
      try {
        const base = IS_MOCK ? mockGlobalSearch(q) : await globalSearch(q);
        if (requestId !== requestRef.current) return;

        const withRoom = base.map<Hit>((hit) => ({
          ...hit,
          roomId: roomIdFromHref(hit.href),
        }));
        setHits(withRoom);
        setActiveIdx(0);
        setLoading(false);

        const names = withRoom
          .filter((hit) => hit.group === "Item")
          .map((hit) => hit.label);
        const roomIds = withRoom
          .map((hit) => hit.roomId)
          .filter((id): id is string => Boolean(id));

        const [meta, itemMetas] = await Promise.all([
          loadRoomMeta(),
          fetchItemMeta(names, roomIds),
        ]);
        if (requestId !== requestRef.current) return;

        setRoomMeta(meta);
        setHits((prev) => applyItemMeta(prev, itemMetas));
      } catch (err) {
        if (requestId !== requestRef.current) return;
        console.error("global search error:", err);
        setHits([]);
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return hits;
    return hits.filter(
      (hit) => hit.group === "Item" && effectiveCategory(hit) === filter
    );
  }, [hits, filter]);

  // GAS: grup per ruangan (bukan per kategori), urutan mengikuti hasil.
  const groups = React.useMemo(() => {
    const map = new Map<string, ResultGroup>();
    const order: string[] = [];

    for (const hit of filtered) {
      let key: string;
      let roomId: string | undefined;
      let title: string;
      let icon: string;

      if (hit.group === "Usulan") {
        key = "usulan";
        title = "Usulan";
        icon = "📝";
      } else {
        roomId = hit.roomId;
        key = `room:${roomId ?? "tanpa-ruangan"}`;
        const meta = roomId ? roomMeta.get(roomId) : undefined;
        if (meta) {
          title = meta.name;
          icon = meta.icon;
        } else if (hit.group === "Ruangan") {
          const split = splitRoomLabel(hit.label);
          title = split.name;
          icon = split.icon;
        } else {
          title = "Ruangan";
          icon = "🏥";
        }
      }

      let group = map.get(key);
      if (!group) {
        group = { key, roomId, title, icon, hits: [] };
        map.set(key, group);
        order.push(key);
      }
      group.hits.push(hit);
    }

    return order.reduce<ResultGroup[]>((acc, key) => {
      const group = map.get(key);
      if (group) acc.push(group);
      return acc;
    }, []);
  }, [filtered, roomMeta]);

  const flat = React.useMemo(
    () => groups.flatMap((group) => group.hits),
    [groups]
  );

  const active = Math.min(activeIdx, Math.max(flat.length - 1, 0));
  const roomCount = groups.reduce(
    (total, group) => (group.roomId ? total + 1 : total),
    0
  );

  /** GAS `gsNavigateTo` — scroll + kilau baris sasaran. */
  const flashRow = React.useCallback((itemId: number) => {
    const row = document.querySelector<HTMLElement>(
      `tr[data-item-id="${itemId}"]`
    );
    if (!row) return false;
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.classList.add("gs-highlighted");
    window.setTimeout(() => row.classList.remove("gs-highlighted"), 2200);
    return true;
  }, []);

  // Setelah pindah ruangan, baris baru muncul hasil render/fetch klien.
  React.useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    if (Date.now() - pending.at > 10000) {
      pendingRef.current = null;
      return;
    }
    if (pathname !== `/inventaris/${pending.roomId}`) return;

    let cancelled = false;
    let attempts = 0;
    let timerId: number | undefined;

    const tryFlash = () => {
      if (cancelled) return;
      if (flashRow(pending.itemId)) {
        pendingRef.current = null;
        return;
      }
      attempts += 1;
      if (attempts >= 30) {
        pendingRef.current = null;
        return;
      }
      timerId = window.setTimeout(tryFlash, 150);
    };

    timerId = window.setTimeout(tryFlash, 150);

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [pathname, flashRow]);

  const close = () => {
    setQ("");
    setHits([]);
    setFocused(false);
    setFilter("all");
  };

  const navigateRoom = (roomId: string) => {
    close();
    router.push(`/inventaris/${roomId}`);
  };

  const go = (hit: Hit) => {
    const itemId = hit.itemId;
    const roomId = hit.roomId;
    close();

    if (itemId != null && roomId) {
      if (pathname === `/inventaris/${roomId}`) {
        flashRow(itemId);
      } else {
        pendingRef.current = { roomId, itemId, at: Date.now() };
        router.push(hit.href);
      }
      return;
    }

    router.push(hit.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(Math.min(active + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[active];
      if (hit) go(hit);
    }
  };

  const showDropdown = focused && q.trim().length > 0;

  return (
    <>
      <style>{ROW_HIGHLIGHT_CSS}</style>
      <div className="w-full min-w-0">
        <div
          ref={wrapRef}
          onClick={() => inputRef.current?.focus()}
          className="flex h-9 w-full cursor-text items-center gap-2 rounded-sm border border-border bg-surface-subtle px-2.5 transition-colors focus-within:border-ring focus-within:bg-surface focus-within:ring-2 focus-within:ring-ring/35"
        >
          <MagnifyingGlass
            size={16}
            aria-hidden="true"
            className="shrink-0 text-text-3"
          />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            // Blur ditunda supaya klik pada hasil sempat terproses.
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            placeholder="Cari barang, alat, sarana... (Ctrl+K)"
            autoComplete="off"
            aria-label="Pencarian global"
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-2"
          />
          {q ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ("");
                setFilter("all");
                inputRef.current?.focus();
              }}
              aria-label="Bersihkan pencarian"
              className="flex size-5 shrink-0 items-center justify-center rounded-full border-none bg-surface-muted p-0 text-text-2 transition-colors hover:bg-border hover:text-foreground"
            >
              <X size={11} />
            </button>
          ) : (
            <kbd className="hidden shrink-0 items-center rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-3 sm:inline-flex">
              Ctrl+K
            </kbd>
          )}
        </div>

        {/* #gsDropdown — di-portal agar tidak terpotong header */}
        {mounted && showDropdown && anchor
          ? createPortal(
              <div
                className="fixed z-[900] max-h-[520px] overflow-y-auto rounded-[14px] border-[1.5px] border-line bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                style={{
                  left: anchor.left,
                  top: anchor.top,
                  width: Math.max(anchor.width, 480),
                }}
              >
                {/* .gs-drop-head */}
                <div className="sticky top-0 z-[2] border-b border-line bg-surface px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-text-3">
                      {loading ? (
                        "Mencari…"
                      ) : (
                        <>
                          Ditemukan{" "}
                          <b className="font-mono text-teal">{flat.length}</b>{" "}
                          hasil
                          {roomCount > 0 ? ` di ${roomCount} ruangan` : ""}
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-text-3">
                      ↑↓ pilih · Enter buka · Esc tutup
                    </span>
                  </div>

                  {/* .gs-filter-chips — GAS gsSetFilter */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {FILTERS.map((option) => {
                      const on = filter === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFilter(option.value);
                            setActiveIdx(0);
                          }}
                          aria-pressed={on}
                          className={`rounded-xl border-[1.5px] px-2.5 py-[3px] text-[10.5px] font-bold transition-colors ${
                            on
                              ? "border-teal bg-teal text-white"
                              : "border-line bg-surface text-text-3 hover:border-teal hover:text-teal"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {loading && flat.length === 0 ? (
                  <div className="px-4 py-9 text-center text-[12.5px] text-text-3">
                    Mencari…
                  </div>
                ) : flat.length === 0 ? (
                  <div className="px-4 py-9 text-center">
                    {q.trim().length < 2 ? (
                      <>
                        <div className="text-[14px] font-bold text-text-2">
                          Ketik minimal 2 karakter
                        </div>
                        <div className="mt-1 text-[12px] text-text-3">
                          Pencarian mencakup ruangan, barang, dan usulan
                        </div>
                      </>
                    ) : (
                      <>
                        <div aria-hidden className="mb-2 text-[36px] leading-none">
                          🔍
                        </div>
                        <div className="text-[14px] font-bold text-text-2">
                          Tidak ditemukan
                        </div>
                        <div className="mt-1 text-[12px] text-text-3">
                          Coba kata kunci lain atau ubah filter kategori
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  groups.map((group) => {
                    const groupRoomId = group.roomId;
                    const headerContent = (
                      <>
                        <span aria-hidden className="text-[14px] leading-none">
                          {group.icon}
                        </span>
                        <span className="truncate">{group.title}</span>
                        <span className="ml-auto rounded-full bg-surface-muted px-[7px] py-px text-[10px] font-bold normal-case tracking-normal text-text-3">
                          {group.hits.length} item
                        </span>
                      </>
                    );
                    const headerClass =
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-[11px] font-extrabold uppercase tracking-[0.04em] text-text-2";

                    return (
                      <div
                        key={group.key}
                        className="border-b border-line last:border-b-0"
                      >
                        {groupRoomId ? (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => navigateRoom(groupRoomId)}
                            className={`${headerClass} bg-surface-subtle transition-colors hover:bg-surface-muted`}
                          >
                            {headerContent}
                          </button>
                        ) : (
                          <div className={`${headerClass} bg-surface-subtle`}>
                            {headerContent}
                          </div>
                        )}

                        {group.hits.map((hit, index) => {
                          const idx = flat.indexOf(hit);
                          const on = idx === active;
                          const rowClass = `flex w-full items-center gap-2.5 border-b border-line px-4 py-[9px] pl-8 text-left last:border-b-0 transition-colors ${
                            on ? "bg-teal4" : "hover:bg-teal4"
                          }`;
                          const key = `${group.key}-${hit.itemId ?? hit.label}-${index}`;

                          if (hit.group === "Ruangan") {
                            const split = splitRoomLabel(hit.label);
                            return (
                              <button
                                key={key}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => go(hit)}
                                onMouseEnter={() => setActiveIdx(idx)}
                                className={rowClass}
                              >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-teal4 text-teal">
                                  <Buildings size={14} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[13px] font-bold text-foreground">
                                    {highlight(split.name, q)}
                                  </span>
                                  <span className="block truncate text-[11px] text-text-3">
                                    Buka ruangan
                                  </span>
                                </span>
                              </button>
                            );
                          }

                          if (hit.group === "Usulan") {
                            return (
                              <button
                                key={key}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => go(hit)}
                                onMouseEnter={() => setActiveIdx(idx)}
                                className={rowClass}
                              >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-2">
                                  <FileText size={14} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[13px] font-bold text-foreground">
                                    {highlight(hit.label, q)}
                                  </span>
                                  <span className="block truncate text-[11px] text-text-3">
                                    {hit.sub ? highlight(hit.sub, q, "spec") : "Usulan"}
                                  </span>
                                </span>
                              </button>
                            );
                          }

                          const category = effectiveCategory(hit) ?? "lainnya";
                          const condition =
                            readLiveCondition(hit.itemId) ??
                            hit.condition ??
                            "ta";
                          const specText =
                            hit.spec ?? (hit.merk ? "" : (hit.sub ?? ""));

                          return (
                            <button
                              key={key}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => go(hit)}
                              onMouseEnter={() => setActiveIdx(idx)}
                              className={rowClass}
                            >
                              <span
                                aria-hidden
                                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-[14px] leading-none ${CATEGORY_TILE[category]}`}
                              >
                                {CATEGORY_EMOJI[category]}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-bold text-foreground">
                                  {highlight(hit.label, q)}
                                  {hit.merk ? (
                                    <span className="font-normal text-text-3">
                                      {" · "}
                                      {highlight(hit.merk, q, "spec")}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="block truncate text-[11px] text-text-3">
                                  {specText ? (
                                    highlight(specText, q, "spec")
                                  ) : hit.noreg ? null : (
                                    <>—</>
                                  )}
                                  {hit.noreg ? (
                                    <span className="ml-1.5 font-mono text-[10px] text-text-3">
                                      {highlight(hit.noreg, q, "spec")}
                                    </span>
                                  ) : null}
                                </span>
                              </span>
                              <span className="flex shrink-0 items-center gap-1.5">
                                {hit.quantity != null ? (
                                  <span className="rounded-md bg-surface-muted px-1.5 py-px text-[10.5px] font-bold text-text-2">
                                    ×{hit.quantity} {hit.unit}
                                  </span>
                                ) : null}
                                <span
                                  className={`whitespace-nowrap rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${CONDITION_TILE[condition]}`}
                                >
                                  {CONDITION_LABEL[condition]}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}

                {/* .gs-drop-foot */}
                {flat.length > 0 ? (
                  <div className="sticky bottom-0 flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t border-line bg-surface px-4 py-2">
                    <span className="flex flex-wrap items-center gap-1 text-[10.5px] text-text-3">
                      <kbd className="rounded border border-line bg-surface px-[5px] py-px font-mono text-[10px]">
                        ↑↓
                      </kbd>
                      Navigasi
                      <kbd className="rounded border border-line bg-surface px-[5px] py-px font-mono text-[10px]">
                        Enter
                      </kbd>
                      Buka
                      <kbd className="rounded border border-line bg-surface px-[5px] py-px font-mono text-[10px]">
                        Esc
                      </kbd>
                      Tutup
                    </span>
                    <span className="ml-auto text-[11px] font-bold text-teal">
                      Total: {flat.length} item ditemukan
                    </span>
                  </div>
                ) : null}
              </div>,
              document.body
            )
          : null}
      </div>
    </>
  );
}
