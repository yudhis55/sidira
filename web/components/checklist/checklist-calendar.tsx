"use client";

import { useState, useMemo, useCallback, useEffect, Fragment } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/lib/use-local-storage";
import { useActiveYear } from "@/lib/year-store";
import { checklistStorageKey } from "@/lib/storage-keys";
import {
  getChecklistEntries,
  saveChecklistEntry,
  deleteChecklistEntry,
} from "@/lib/auth/checklist";
import { ChecklistFormDialog } from "./checklist-form-dialog";
import type { ItemCategory, ItemCondition, ChecklistPayload } from "@/types/database";

/* ── local mock types (no backend) ── */

export interface ChecklistEntryLocal {
  id: string;
  room_id: string;
  item_id: number;
  category: ItemCategory;
  item_index: number;
  date_key: string;
  payload: ChecklistPayload;
}

interface ChecklistCalendarProps {
  roomId: string;
  roomName: string;
  roomIcon: string;
  /** Year (e.g. 2026) being viewed — seed only; nav is local. */
  year: number;
  /**
   * Bila true (tidak ada `?year=` eksplisit), tahun global KIR diikuti:
   * ganti tahun di header ikut memindahkan kalender.
   */
  followGlobalYear?: boolean;
  /** Month 0-based (0 = Jan) — seed only; nav is local. */
  month: number;
  items: Array<{
    id: number;
    name: string;
    spec?: string;
    merk?: string;
    type?: string;
    category: ItemCategory;
    index_in_room: number;
  }>;
  /** Optional seed entries (mock page passes []). */
  entries?: ChecklistEntryLocal[];
}

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const CAT_LABELS: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

const CAT_EMOJI: Record<ItemCategory, string> = {
  alkes: "🩺",
  meubelair: "🪑",
  elektronik: "💻",
  lainnya: "📦",
};

const CAT_ORDER: ItemCategory[] = ["alkes", "meubelair", "elektronik", "lainnya"];

const CAT_ROW_CLASS: Record<ItemCategory, string> = {
  alkes: "bg-[var(--teal3)] text-[var(--teal)]",
  meubelair: "bg-[var(--amber2)] text-[var(--amber)]",
  elektronik: "bg-[var(--blue2)] text-[var(--blue)]",
  lainnya: "bg-[var(--slate2)] text-[var(--slate)]",
};

/** GAS CL_CYCLE / CL_ICON / CL_BG / CL_BORDER / CL_TEXTCOL */
const CYCLE: (ItemCondition | null)[] = [null, "baik", "rr", "rb", "ta"];

const CL_ICON: Record<ItemCondition, string> = {
  baik: "✔",
  rr: "⚠",
  rb: "✖",
  ta: "—",
};

const CL_LABEL: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

const CL_STYLE: Record<
  ItemCondition,
  { bg: string; border: string; color: string }
> = {
  baik: { bg: "#d1fae5", border: "#10b981", color: "#065f46" },
  rr: { bg: "#fef3c7", border: "#f59e0b", color: "#92400e" },
  rb: { bg: "#fee2e2", border: "#b91c1c", color: "#b91c1c" },
  ta: { bg: "#f1f5f9", border: "#94a3b8", color: "#475569" },
};

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

type FilterValue = "all" | ItemCategory;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateKey(year: number, month0: number, day: number) {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

function entryKey(itemIndex: number, dateKey: string) {
  return `${itemIndex}|${dateKey}`;
}

function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

function seedMap(entries: ChecklistEntryLocal[] | undefined) {
  const map = new Map<string, ChecklistEntryLocal>();
  for (const e of entries ?? []) {
    map.set(entryKey(e.item_index, e.date_key), e);
  }
  return map;
}

export function ChecklistCalendar({
  roomId,
  roomName,
  roomIcon,
  year: initialYear,
  month: initialMonth,
  items,
  entries,
  followGlobalYear = false,
}: ChecklistCalendarProps) {
  const [activeYear] = useActiveYear();
  const [year, setYear] = useState(initialYear);
  // Ikuti tahun KIR global (pola resmi "adjust state during render"):
  // ganti tahun di header ikut memindahkan kalender.
  if (followGlobalYear && year !== activeYear) setYear(activeYear);
  const [month0, setMonth0] = useState(initialMonth);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  // Entri ceklist dipersist ke localStorage (meniru GAS clData) supaya bisa
  // dibaca ulang oleh modul Laporan. Bila baca Supabase berhasil, data
  // Supabase dipakai (state sesi); localStorage hanya fallback baca.
  const seedList = useMemo(() => entries ?? [], [entries]);
  const [fallbackList, setFallbackList] = useLocalStorageState<
    ChecklistEntryLocal[]
  >(checklistStorageKey(roomId), seedList);
  // Entri Supabase per room+bulan; null = belum termuat / gagal baca.
  const [remoteList, setRemoteList] = useState<ChecklistEntryLocal[] | null>(
    null
  );
  const entryList = remoteList ?? fallbackList;
  const map = useMemo(() => seedMap(entryList), [entryList]);
  const setMap = useCallback(
    (
      updater: (
        prev: Map<string, ChecklistEntryLocal>
      ) => Map<string, ChecklistEntryLocal>
    ) => {
      if (remoteList !== null) {
        // Mode Supabase: tulis ke state sesi saja agar tak fork dengan
        // localStorage.
        setRemoteList((prev) =>
          Array.from(updater(seedMap(prev ?? [])).values())
        );
      } else {
        setFallbackList((prev) =>
          Array.from(updater(seedMap(prev)).values())
        );
      }
    },
    [remoteList, setFallbackList]
  );

  // Muat entri bulan aktif dari Supabase; gagal baca → tetap di fallback
  // localStorage (jangan hapus kode baca localStorage di atas).
  useEffect(() => {
    let cancelled = false;
    const startKey = formatDateKey(year, month0, 1);
    const endKey = formatDateKey(year, month0, daysInMonth(year, month0));
    getChecklistEntries(roomId, startKey, endKey)
      .then((rows) => {
        if (cancelled) return;
        setRemoteList(
          rows.map((r) => ({
            id:
              r.id !== undefined
                ? String(r.id)
                : `local-${r.item_index}-${r.date_key}`,
            room_id: r.room_id,
            item_id: r.item_id,
            category: r.category as ItemCategory,
            item_index: r.item_index,
            date_key: r.date_key,
            payload: r.payload as ChecklistPayload,
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setRemoteList(null);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, year, month0]);
  const [detailCell, setDetailCell] = useState<{
    itemId: number;
    itemName: string;
    itemCategory: ItemCategory;
    itemIndex: number;
    dateKey: string;
    existing?: ChecklistEntryLocal;
  } | null>(null);

  const tds = todayString();
  const dim = daysInMonth(year, month0);

  const [baikDate, setBaikDate] = useState(tds);
  const [baikFrom, setBaikFrom] = useState(tds);
  const [baikTo, setBaikTo] = useState(tds);

  const getEntry = useCallback(
    (itemIndex: number, dateKey: string) => map.get(entryKey(itemIndex, dateKey)),
    [map]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== "all" && it.category !== filter) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        (it.spec || "").toLowerCase().includes(q) ||
        (it.merk || "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  const grouped = useMemo(() => {
    const groups: { cat: ItemCategory; items: typeof filteredItems }[] = [];
    for (const cat of CAT_ORDER) {
      const list = filteredItems.filter((i) => i.category === cat);
      if (list.length) groups.push({ cat, items: list });
    }
    return groups;
  }, [filteredItems]);

  const summary = useMemo(() => {
    let baik = 0;
    let rr = 0;
    let rb = 0;
    let ta = 0;
    let checked = 0;
    let cells = 0;
    for (const it of filteredItems) {
      for (let d = 1; d <= dim; d++) {
        const dk = formatDateKey(year, month0, d);
        if (dk > tds) continue;
        cells++;
        const st = getEntry(it.index_in_room, dk)?.payload?.status;
        if (st) {
          checked++;
          if (st === "baik") baik++;
          else if (st === "rr") rr++;
          else if (st === "rb") rb++;
          else if (st === "ta") ta++;
        }
      }
    }
    return { baik, rr, rb, ta, checked, cells };
  }, [filteredItems, dim, year, month0, tds, getEntry]);

  // Riwayat pemeriksaan item terpilih — GAS #detLogList (tanggal lain, terbaru dulu).
  const detailHistory = useMemo(() => {
    if (!detailCell) return [];
    return Array.from(map.values())
      .filter(
        (e) =>
          e.item_index === detailCell.itemIndex &&
          e.date_key !== detailCell.dateKey &&
          Boolean(e.payload?.status)
      )
      .sort((a, b) => b.date_key.localeCompare(a.date_key))
      .slice(0, 12)
      .map((e) => ({ dateKey: e.date_key, payload: e.payload }));
  }, [map, detailCell]);

  // Tulis optimistis ke state sesi lalu persist ke Supabase (mode remote).
  // Gagal tulis → toast error Indonesia, data tetap di state sesi.
  const setStatus = useCallback(
    (
      item: ChecklistCalendarProps["items"][number],
      dateKey: string,
      status: ItemCondition | null,
      preserve?: ChecklistPayload
    ) => {
      const useRemote = remoteList !== null;
      const prevEntry = map.get(entryKey(item.index_in_room, dateKey));
      setMap((prev) => {
        const next = new Map(prev);
        const k = entryKey(item.index_in_room, dateKey);
        if (status === null) {
          next.delete(k);
          return next;
        }
        const existing = prev.get(k);
        next.set(k, {
          id: existing?.id ?? `local-${item.index_in_room}-${dateKey}`,
          room_id: roomId,
          item_id: item.id,
          category: item.category,
          item_index: item.index_in_room,
          date_key: dateKey,
          payload: {
            status,
            jenis_kerusakan: preserve?.jenis_kerusakan ?? existing?.payload?.jenis_kerusakan,
            uraian_kerusakan: preserve?.uraian_kerusakan ?? existing?.payload?.uraian_kerusakan,
            jenis_tindakan: preserve?.jenis_tindakan ?? existing?.payload?.jenis_tindakan,
            uraian_tindakan: preserve?.uraian_tindakan ?? existing?.payload?.uraian_tindakan,
            petugas: preserve?.petugas ?? existing?.payload?.petugas,
            no_laporan: preserve?.no_laporan ?? existing?.payload?.no_laporan,
          },
        });
        return next;
      });
      if (!useRemote) return;
      if (status === null) {
        const numericId =
          prevEntry && !prevEntry.id.startsWith("local-")
            ? Number(prevEntry.id)
            : NaN;
        if (!Number.isNaN(numericId)) {
          deleteChecklistEntry(numericId, roomId).catch(() => {
            toast.error(
              "Gagal menghapus checklist di server. Perubahan hanya tersimpan sementara di sesi ini."
            );
          });
        }
        return;
      }
      const payload: ChecklistPayload = {
        status,
        jenis_kerusakan:
          preserve?.jenis_kerusakan ?? prevEntry?.payload?.jenis_kerusakan,
        uraian_kerusakan:
          preserve?.uraian_kerusakan ?? prevEntry?.payload?.uraian_kerusakan,
        jenis_tindakan:
          preserve?.jenis_tindakan ?? prevEntry?.payload?.jenis_tindakan,
        uraian_tindakan:
          preserve?.uraian_tindakan ?? prevEntry?.payload?.uraian_tindakan,
        petugas: preserve?.petugas ?? prevEntry?.payload?.petugas,
        no_laporan: preserve?.no_laporan ?? prevEntry?.payload?.no_laporan,
      };
      saveChecklistEntry({
        room_id: roomId,
        item_id: item.id,
        category: item.category,
        item_index: item.index_in_room,
        date_key: dateKey,
        payload,
      })
        .then((saved: { id?: number } | null) => {
          const savedId =
            saved && typeof saved.id === "number" ? String(saved.id) : null;
          if (savedId) {
            setRemoteList((prev) =>
              prev
                ? prev.map((e) =>
                    e.item_index === item.index_in_room &&
                    e.date_key === dateKey
                      ? { ...e, id: savedId }
                      : e
                  )
                : prev
            );
          }
        })
        .catch(() => {
          toast.error(
            "Gagal menyimpan checklist ke server. Perubahan hanya tersimpan sementara di sesi ini."
          );
        });
    },
    [roomId, setMap, map, remoteList]
  );

  const cycleStatus = (
    item: ChecklistCalendarProps["items"][number],
    dateKey: string
  ) => {
    if (dateKey > tds) return;
    const cur = getEntry(item.index_in_room, dateKey)?.payload?.status ?? null;
    const ci = CYCLE.indexOf(cur);
    const next = CYCLE[(ci + 1) % CYCLE.length];
    setStatus(item, dateKey, next);
  };

  // GAS exportClCSV — export entri terisi bulan aktif per kategori
  const exportCsv = () => {
    const headers = [
      "Ruangan",
      "Kategori",
      "Nama Barang",
      "Tanggal",
      "Status",
      "Jenis Kerusakan",
      "Uraian Kerusakan",
      "Jenis Tindakan",
      "Uraian Tindakan",
      "Petugas",
      "No. Laporan",
    ];
    const esc = (v: string) => `"${v.replace(/"/g, "'")}"`;
    let csv = headers.join(",") + "\n";

    for (const cat of CAT_ORDER) {
      for (const it of items.filter((i) => i.category === cat)) {
        for (let day = 1; day <= dim; day++) {
          const dk = formatDateKey(year, month0, day);
          const payload = getEntry(it.index_in_room, dk)?.payload;
          const st = payload?.status;
          if (!st) continue;
          csv +=
            [
              esc(roomName),
              esc(CAT_LABELS[cat]),
              esc(it.name),
              esc(dk),
              esc(CL_LABEL[st]),
              esc(payload?.jenis_kerusakan ?? ""),
              esc(payload?.uraian_kerusakan ?? ""),
              esc(payload?.jenis_tindakan ?? ""),
              esc(payload?.uraian_tindakan ?? ""),
              esc(payload?.petugas ?? ""),
              esc(payload?.no_laporan ?? ""),
            ].join(",") + "\n";
        }
      }
    }

    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ceklist-detail-${roomName.replace(/ /g, "-")}-${MONTH_NAMES_SHORT[month0]}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDetail = (
    item: ChecklistCalendarProps["items"][number],
    dateKey: string
  ) => {
    if (dateKey > tds) return;
    setDetailCell({
      itemId: item.id,
      itemName: item.name,
      itemCategory: item.category,
      itemIndex: item.index_in_room,
      dateKey,
      existing: getEntry(item.index_in_room, dateKey),
    });
  };

  const applyBaikOnDates = (dates: string[]) => {
    if (!dates.length || !filteredItems.length) return;
    const useRemote = remoteList !== null;
    // Jepret payload lama untuk preserve keterangan + persist Supabase.
    const snapshot = new Map(map);
    setMap((prev) => {
      const next = new Map(prev);
      for (const dk of dates) {
        if (dk > tds) continue;
        for (const item of filteredItems) {
          const k = entryKey(item.index_in_room, dk);
          const existing = prev.get(k);
          next.set(k, {
            id: existing?.id ?? `local-${item.index_in_room}-${dk}`,
            room_id: roomId,
            item_id: item.id,
            category: item.category,
            item_index: item.index_in_room,
            date_key: dk,
            payload: {
              status: "baik",
              jenis_kerusakan: existing?.payload?.jenis_kerusakan,
              uraian_kerusakan: existing?.payload?.uraian_kerusakan,
              jenis_tindakan: existing?.payload?.jenis_tindakan,
              uraian_tindakan: existing?.payload?.uraian_tindakan,
              petugas: existing?.payload?.petugas,
              no_laporan: existing?.payload?.no_laporan,
            },
          });
        }
      }
      return next;
    });
    if (!useRemote) return;
    const tasks: Array<Promise<unknown>> = [];
    for (const dk of dates) {
      if (dk > tds) continue;
      for (const item of filteredItems) {
        const existing = snapshot.get(entryKey(item.index_in_room, dk));
        tasks.push(
          saveChecklistEntry({
            room_id: roomId,
            item_id: item.id,
            category: item.category,
            item_index: item.index_in_room,
            date_key: dk,
            payload: {
              status: "baik",
              jenis_kerusakan: existing?.payload?.jenis_kerusakan,
              uraian_kerusakan: existing?.payload?.uraian_kerusakan,
              jenis_tindakan: existing?.payload?.jenis_tindakan,
              uraian_tindakan: existing?.payload?.uraian_tindakan,
              petugas: existing?.payload?.petugas,
              no_laporan: existing?.payload?.no_laporan,
            },
          })
        );
      }
    }
    Promise.all(tasks).catch(() => {
      toast.error(
        "Gagal menyimpan sebagian checklist ke server. Perubahan hanya tersimpan sementara di sesi ini."
      );
    });
  };

  const handleApplyBaikDate = () => {
    if (!baikDate) return;
    applyBaikOnDates([baikDate]);
  };

  const handleApplyBaikRange = () => {
    if (!baikFrom || !baikTo || baikFrom > baikTo) return;
    const dates: string[] = [];
    const start = new Date(baikFrom + "T00:00:00");
    const end = new Date(baikTo + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
      );
    }
    applyBaikOnDates(dates);
  };

  const handleApplyBaikMonth = () => {
    const dates: string[] = [];
    for (let d = 1; d <= dim; d++) {
      dates.push(formatDateKey(year, month0, d));
    }
    applyBaikOnDates(dates);
  };

  const FILTERS: { key: FilterValue; label: string; emoji: string; cls?: string }[] = [
    { key: "all", label: "Semua", emoji: "📦" },
    { key: "alkes", label: "Alat Kesehatan", emoji: "🩺" },
    { key: "meubelair", label: "Meubelair", emoji: "🪑", cls: "f-meub" },
    { key: "elektronik", label: "Elektronik", emoji: "💻", cls: "f-elek" },
  ];

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-white">
      {/* Head — GAS .cl-modal-head gradient */}
      <div
        className="flex shrink-0 items-center gap-3.5 px-6 py-[18px]"
        style={{
          background: "linear-gradient(135deg, #0a3d32 0%, #0e7c6b 100%)",
        }}
      >
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[22px] leading-none"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1.5px solid rgba(255,255,255,0.22)",
          }}
          aria-hidden
        >
          {roomIcon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold text-white">
            Ceklist Harian — {roomName}
          </h3>
          <p className="mt-0.5 text-[11.5px] text-white/65">
            Kondisi barang per hari dalam satu bulan
          </p>
        </div>
        <span className="ml-auto whitespace-nowrap font-mono text-[11px] font-semibold text-white/80">
          {summary.checked}/{summary.cells} terisi
        </span>
      </div>

      {/* Year + month tabs — GAS .cl-controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-[#f8fafc] px-6 py-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            className="flex size-[30px] items-center justify-center rounded-lg border-[1.5px] border-line bg-white text-sm text-ink2 transition-colors hover:border-teal hover:text-teal"
            aria-label="Tahun sebelumnya"
          >
            ‹
          </button>
          <span className="min-w-12 text-center text-[15px] font-extrabold tabular-nums text-ink">
            {year}
          </span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            className="flex size-[30px] items-center justify-center rounded-lg border-[1.5px] border-line bg-white text-sm text-ink2 transition-colors hover:border-teal hover:text-teal"
            aria-label="Tahun berikutnya"
          >
            ›
          </button>
        </div>

        <div className="flex flex-1 flex-wrap gap-1">
          {MONTH_NAMES_SHORT.map((label, mi) => {
            const active = mi === month0;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setMonth0(mi)}
                className={cn(
                  "rounded-md border-[1.5px] px-2.5 py-1 text-[11px] font-bold transition-colors",
                  active
                    ? "border-teal bg-teal text-white"
                    : "border-line bg-white text-ink3 hover:border-[var(--teal2)] hover:text-teal"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar — GAS .cl-filter-bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-6 py-2.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          let activeCls =
            "bg-[var(--teal4)] border-teal text-teal";
          if (f.key === "meubelair" && active)
            activeCls = "bg-[var(--amber2)] border-[var(--amber)] text-[var(--amber)]";
          if (f.key === "elektronik" && active)
            activeCls = "bg-[var(--blue2)] border-[var(--blue)] text-[var(--blue)]";
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-1 text-[11px] font-bold transition-colors",
                active
                  ? activeCls
                  : "border-line bg-[var(--line2)] text-ink3 hover:border-[var(--teal2)]"
              )}
            >
              <span aria-hidden>{f.emoji}</span>
              {f.label}
            </button>
          );
        })}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari nama barang..."
          className="ml-auto w-[180px] rounded-full border-[1.5px] border-line bg-white px-3 py-1.5 text-xs text-ink outline-none transition-colors focus:border-[var(--teal2)]"
        />
      </div>

      {/* All-baik bar — GAS .cl-allbaik-bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#f0fdf9] px-6 py-2">
        <span className="text-[11px] font-bold text-ink3">
          ✅ Centang Semua Baik:
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="whitespace-nowrap text-[10px] font-bold text-ink3">
            📅 Tanggal:
          </span>
          <input
            type="date"
            value={baikDate}
            onChange={(e) => setBaikDate(e.target.value)}
            className="cursor-pointer rounded-lg border-[1.5px] border-teal/40 bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={handleApplyBaikDate}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-teal/40 bg-[var(--teal4)] px-2.5 py-1 text-[11px] font-bold text-teal transition-colors hover:border-teal hover:bg-teal hover:text-white"
          >
            ✅ Terapkan
          </button>
        </div>

        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="whitespace-nowrap text-[10px] font-bold text-ink3">
            📆 Rentang:
          </span>
          <input
            type="date"
            value={baikFrom}
            onChange={(e) => setBaikFrom(e.target.value)}
            className="cursor-pointer rounded-lg border-[1.5px] border-teal/40 bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none focus:border-teal"
          />
          <span className="text-[10px] font-bold text-ink3">s/d</span>
          <input
            type="date"
            value={baikTo}
            onChange={(e) => setBaikTo(e.target.value)}
            className="cursor-pointer rounded-lg border-[1.5px] border-teal/40 bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={handleApplyBaikRange}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-teal/40 bg-[var(--teal4)] px-2.5 py-1 text-[11px] font-bold text-teal transition-colors hover:border-teal hover:bg-teal hover:text-white"
          >
            ✅ Terapkan Rentang
          </button>
        </div>

        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

        <button
          type="button"
          onClick={handleApplyBaikMonth}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-teal/40 bg-[var(--teal4)] px-2.5 py-1 text-[11px] font-bold text-teal transition-colors hover:border-teal hover:bg-teal hover:text-white"
          title={`Set semua Baik untuk ${MONTH_NAMES_FULL[month0]} ${year}`}
        >
          📅 Seluruh Bulan
        </button>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink3">
            {items.length === 0
              ? "Belum ada barang di ruangan ini."
              : "Tidak ada barang yang cocok dengan filter."}
          </div>
        ) : (
          <table className="w-full min-w-[900px] border-collapse bg-white text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 min-w-[200px] bg-[#f0f4f8] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-ink3">
                  Nama Barang
                </th>
                {Array.from({ length: dim }, (_, i) => {
                  const day = i + 1;
                  const dk = formatDateKey(year, month0, day);
                  const isToday = dk === tds;
                  const isSunday = new Date(dk + "T00:00:00").getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={cn(
                        "sticky top-0 z-10 w-[34px] bg-[#f0f4f8] px-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-ink3",
                        isSunday && "text-[#a855f7]"
                      )}
                    >
                      <span
                        className={cn(
                          "block font-mono text-[9px]",
                          isToday && "font-extrabold text-teal"
                        )}
                      >
                        {day}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ cat, items: catItems }) => (
                <Fragment key={cat}>
                  <tr className={CAT_ROW_CLASS[cat]}>
                    <td
                      colSpan={dim + 1}
                      className="px-4 py-1.5 text-[10.5px] font-extrabold uppercase tracking-wide"
                    >
                      {CAT_EMOJI[cat]} {CAT_LABELS[cat]}
                      <span className="ml-2 opacity-70">({catItems.length})</span>
                    </td>
                  </tr>
                  {catItems.map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:[&>td]:bg-[#f8fffe]"
                    >
                      <td className="sticky left-0 z-[5] min-w-[200px] border-b border-r-2 border-line bg-white px-4 py-1.5 text-left group-hover:bg-[#f8fffe]">
                        <div className="text-xs font-semibold text-ink">
                          {item.name}
                        </div>
                        {(item.spec || item.merk || item.type) && (
                          <div className="text-[10.5px] text-ink3">
                            {[item.merk, item.type, item.spec]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </td>
                      {Array.from({ length: dim }, (_, i) => {
                        const day = i + 1;
                        const dk = formatDateKey(year, month0, day);
                        const isFuture = dk > tds;
                        const isToday = dk === tds;
                        const entry = getEntry(item.index_in_room, dk);
                        const st = entry?.payload?.status;
                        const style = st ? CL_STYLE[st] : null;
                        const title = isFuture
                          ? `${DAY_NAMES[new Date(dk + "T00:00:00").getDay()]}, ${day} ${MONTH_NAMES_FULL[month0]} (mendatang)`
                          : `${dk}${st ? `: ${CL_LABEL[st]}` : ": Belum diisi"}`;

                        return (
                          <td
                            key={day}
                            className="border-b border-line px-1 py-1.5 text-center align-middle"
                          >
                            <button
                              type="button"
                              disabled={isFuture}
                              title={title}
                              onClick={() => cycleStatus(item, dk)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                openDetail(item, dk);
                              }}
                              className={cn(
                                "mx-auto flex size-[26px] items-center justify-center rounded-md border-2 text-[13px] transition-all",
                                isFuture &&
                                  "cursor-not-allowed border-line bg-white opacity-35",
                                !isFuture &&
                                  !st &&
                                  "cursor-pointer border-line bg-white text-ink3 hover:border-teal hover:bg-[var(--teal4)]",
                                isToday && !st && !isFuture && "ring-1 ring-teal/40"
                              )}
                              style={
                                style
                                  ? {
                                      background: style.bg,
                                      borderColor: style.border,
                                      color: style.color,
                                    }
                                  : undefined
                              }
                            >
                              {st
                                ? CL_ICON[st]
                                : ""}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary + legenda — GAS clRenderSummary (~20391) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-[#f8fafc] px-6 py-3">
        <button
          type="button"
          onClick={exportCsv}
          title="Export entri ceklist bulan ini ke CSV"
          className="inline-flex items-center gap-1 rounded-2xl border-[1.5px] border-line bg-white px-3 py-1 text-[11px] font-bold text-ink2 transition-colors hover:border-teal hover:text-teal"
        >
          📥 Export CSV
        </button>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink2">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#10b981" }}
          />
          {summary.baik} Baik
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink2">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#f59e0b" }}
          />
          {summary.rr} Rusak Ringan
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink2">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#b91c1c" }}
          />
          {summary.rb} Rusak Berat
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink2">
          <span
            className="size-2.5 rounded-full"
            style={{ background: "#94a3b8" }}
          />
          {summary.ta} Tidak Ada
        </span>
        <span className="ml-3 text-xs font-semibold text-ink3">
          Terisi:{" "}
          <b className="text-teal">
            {summary.checked}/{summary.cells}
          </b>{" "}
          (
          {summary.cells > 0
            ? Math.round((summary.checked / summary.cells) * 100)
            : 0}
          %)
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-[11px] text-ink3">
          <span title="Baik">✔ Baik</span>
          <span title="Rusak Ringan">⚠ Rusak Ringan</span>
          <span title="Rusak Berat">✖ Rusak Berat</span>
          <span title="Tidak Ada">— Tidak Ada</span>
          <span title="Belum diisi">· Belum</span>
          <span className="text-[#a855f7]" title="Hari Minggu">
            ■ Minggu
          </span>
        </div>
      </div>

      {detailCell ? (
        <ChecklistFormDialog
          key={`${detailCell.itemIndex}-${detailCell.dateKey}`}
          open
          onOpenChange={(open) => {
            if (!open) setDetailCell(null);
          }}
          itemName={detailCell.itemName}
          itemCategory={detailCell.itemCategory}
          dateKey={detailCell.dateKey}
          initial={detailCell.existing?.payload ?? null}
          history={detailHistory}
          onSave={(payload) => {
            const item = items.find(
              (it) => it.index_in_room === detailCell.itemIndex
            );
            if (!item) return;
            setStatus(item, detailCell.dateKey, payload.status, payload);
            setDetailCell(null);
          }}
          onClear={() => {
            const item = items.find(
              (it) => it.index_in_room === detailCell.itemIndex
            );
            if (!item) return;
            setStatus(item, detailCell.dateKey, null);
            setDetailCell(null);
          }}
        />
      ) : null}
    </div>
  );
}
