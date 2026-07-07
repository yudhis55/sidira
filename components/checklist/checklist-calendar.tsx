"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  TriangleAlert,
  CircleX,
  Minus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { ChecklistFormDialog } from "./checklist-form-dialog";
import {
  saveChecklistPayload,
  deleteChecklistEntry,
  bulkSetChecklist,
  type ChecklistEntry,
  type ChecklistPayload,
} from "@/lib/auth/checklist";
import type { ItemCategory } from "@/types/database";

interface ChecklistCalendarProps {
  roomId: string;
  roomName: string;
  roomIcon: string;
  /** Year (e.g. 2026) being viewed. */
  year: number;
  /** Month 0-based (0 = Jan). */
  month: number;
  /**
   * Items in the room. `index_in_room` is used as the row identity key and
   * must match `item_index` stored on checklist entries.
   */
  items: Array<{
    id: number;
    name: string;
    spec?: string;
    merk?: string;
    type?: string;
    category: ItemCategory;
    index_in_room: number;
  }>;
  /** Checklist entries for the viewed month. */
  entries: ChecklistEntry[];
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

const CAT_ORDER: ItemCategory[] = ["alkes", "meubelair", "elektronik", "lainnya"];

// Status cycle: empty -> baik -> rr -> rb -> ta -> empty
const CYCLE: (ChecklistPayload["status"] | null)[] = [null, "baik", "rr", "rb", "ta"];

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

type FilterValue = "all" | ItemCategory;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function ChecklistCalendar({
  roomId,
  roomName,
  roomIcon,
  year,
  month,
  items,
  entries,
}: ChecklistCalendarProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [detailCell, setDetailCell] = useState<{
    itemId: number;
    itemName: string;
    itemCategory: ItemCategory;
    itemIndex: number;
    dateKey: string;
    existingEntry?: ChecklistEntry;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  // set-all-baik form state
  const [baikDate, setBaikDate] = useState<string>(todayString());
  const [baikFrom, setBaikFrom] = useState<string>(todayString());
  const [baikTo, setBaikTo] = useState<string>(todayString());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const tds = todayString();

  // Index entries by `${item_index}|${date_key}` for O(1) lookup.
  // NOTE: lookup uses item_index (the matrix row key) per the unique constraint.
  const entryMap = useMemo(() => {
    const m = new Map<string, ChecklistEntry>();
    for (const e of entries) {
      m.set(`${e.item_index}|${e.date_key}`, e);
    }
    return m;
  }, [entries]);

  const getEntry = useCallback(
    (itemIndex: number, dateKey: string): ChecklistEntry | undefined => {
      return entryMap.get(`${itemIndex}|${dateKey}`);
    },
    [entryMap]
  );

  const formatDateKey = useCallback(
    (day: number) => {
      return `${year}-${pad2(month + 1)}-${pad2(day)}`;
    },
    [year, month]
  );

  // Items grouped + filtered, in category order.
  const groupedItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cats: ItemCategory[] = filter === "all" ? CAT_ORDER : [filter];
    return cats
      .map((cat) => ({
        category: cat,
        items: items.filter((it) => {
          if (it.category !== cat) return false;
          if (q && !it.name.toLowerCase().includes(q)) return false;
          return true;
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [items, filter, search]);

  // Summary counts (computed across the visible matrix, like GAS clUpdateSummaryOnly
  // which counts up-to-and-including-today cells).
  const summary = useMemo(() => {
    let baik = 0, rr = 0, rb = 0, ta = 0, checked = 0, cells = 0;
    const cats: ItemCategory[] = filter === "all" ? CAT_ORDER : [filter];
    const q = search.trim().toLowerCase();
    for (const cat of cats) {
      for (const it of items) {
        if (it.category !== cat) continue;
        if (q && !it.name.toLowerCase().includes(q)) continue;
        for (let day = 1; day <= daysInMonth; day++) {
          const ds = formatDateKey(day);
          if (ds > tds) continue; // future dates don't count as cells
          cells++;
          const e = getEntry(it.index_in_room, ds);
          const st = e?.payload?.status;
          if (st) {
            checked++;
            if (st === "baik") baik++;
            else if (st === "rr") rr++;
            else if (st === "rb") rb++;
            else if (st === "ta") ta++;
          }
        }
      }
    }
    return { baik, rr, rb, ta, checked, cells };
  }, [items, filter, search, daysInMonth, getEntry, tds, formatDateKey]);

  const cycleStatus = useCallback(
    (itemIndex: number, dateKey: string, currentStatus: ChecklistPayload["status"] | undefined) => {
      const cur = currentStatus ?? null;
      const ci = CYCLE.indexOf(cur);
      const next = CYCLE[(ci + 1) % CYCLE.length];

      const item = items.find((it) => it.index_in_room === itemIndex);
      if (!item) return;

      if (next === null) {
        // Cycle to empty: GAS clears the entry. We emulate "empty" by deleting
        // the row (saveChecklistPayload always upserts, so a delete is the only
        // way to represent the empty state).
        const existing = getEntry(itemIndex, dateKey);
        if (existing?.id) {
          startTransition(async () => {
            try {
              await deleteChecklistEntry(existing.id!, roomId);
            } catch (err) {
              console.error(err);
              toast.error("Gagal menghapus status checklist");
            }
          });
        }
        return;
      }

      // Preserve existing detail fields when toggling status.
      const existing = getEntry(itemIndex, dateKey);
      const merged: ChecklistPayload = {
        status: next,
        jenis_kerusakan: existing?.payload?.jenis_kerusakan,
        uraian_kerusakan: existing?.payload?.uraian_kerusakan,
        jenis_tindakan: existing?.payload?.jenis_tindakan,
        uraian_tindakan: existing?.payload?.uraian_tindakan,
        petugas: existing?.payload?.petugas,
        no_laporan: existing?.payload?.no_laporan,
      };

      startTransition(async () => {
        try {
          await saveChecklistPayload(
            roomId,
            item.id,
            item.category,
            itemIndex,
            dateKey,
            merged
          );
        } catch (err) {
          console.error(err);
          toast.error("Gagal menyimpan status checklist");
        }
      });
    },
    [items, roomId, getEntry, startTransition]
  );

  const openDetail = (itemIndex: number, dateKey: string) => {
    const item = items.find((it) => it.index_in_room === itemIndex);
    if (!item) return;
    setDetailCell({
      itemId: item.id,
      itemName: item.name,
      itemCategory: item.category,
      itemIndex,
      dateKey,
      existingEntry: getEntry(itemIndex, dateKey),
    });
  };

  const handleApplyBaikDate = () => {
    if (!baikDate) {
      toast.warning("Pilih tanggal terlebih dahulu");
      return;
    }
    startTransition(async () => {
      try {
        const res = await bulkSetChecklist(roomId, "baik", {
          date: baikDate,
          category: filter === "all" ? undefined : filter,
        });
        toast.success(
          `${res.count} item diset Baik untuk ${formatDateDisplay(baikDate)}`
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal menerapkan status Baik");
      }
    });
  };

  const handleApplyBaikRange = () => {
    if (!baikFrom || !baikTo) {
      toast.warning("Isi tanggal dari dan sampai");
      return;
    }
    if (baikFrom > baikTo) {
      toast.warning("Tanggal awal harus sebelum tanggal akhir");
      return;
    }
    startTransition(async () => {
      try {
        const res = await bulkSetChecklist(roomId, "baik", {
          dateFrom: baikFrom,
          dateTo: baikTo,
          category: filter === "all" ? undefined : filter,
        });
        toast.success(
          `${Math.round(res.count / Math.max(res.dates, 1))} item × ${res.dates} hari diset Baik`
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal menerapkan status Baik");
      }
    });
  };

  const handleApplyBaikMonth = () => {
    const monthStart = `${year}-${pad2(month + 1)}-01`;
    const monthEnd = `${year}-${pad2(month + 1)}-${pad2(daysInMonth)}`;
    startTransition(async () => {
      try {
        const res = await bulkSetChecklist(roomId, "baik", {
          dateFrom: monthStart,
          dateTo: monthEnd,
          category: filter === "all" ? undefined : filter,
        });
        toast.success(
          `${Math.round(res.count / Math.max(res.dates, 1))} item × ${res.dates} hari diset Baik (seluruh bulan)`
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal menerapkan status Baik");
      }
    });
  };

  const summaryPct =
    summary.cells > 0 ? Math.round((summary.checked / summary.cells) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="font-mono text-2xl font-bold tracking-tight">
          <span className="mr-2">{roomIcon}</span>
          Ceklist Harian — {roomName}
        </h2>
        <p className="text-xs text-muted-foreground">
          Klik sel untuk ubah status · Klik kanan atau tahan untuk isi keterangan detail
        </p>
      </div>

      {/* Year navigation + month tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <a
              href={`/checklist?room=${encodeURIComponent(roomId)}&year=${year - 1}&month=${month + 1}`}
              aria-label="Tahun sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </a>
          </Button>
          <span className="font-mono text-sm font-semibold tabular-nums w-12 text-center">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <a
              href={`/checklist?room=${encodeURIComponent(roomId)}&year=${year + 1}&month=${month + 1}`}
              aria-label="Tahun berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {MONTH_NAMES_SHORT.map((m, mi) => {
            const active = mi === month;
            const monthStart = `${year}-${pad2(mi + 1)}-01`;
            const monthEnd = `${year}-${pad2(mi + 1)}-${pad2(new Date(year, mi + 1, 0).getDate())}`;
            // has-data indicator: check if any entry falls in this month.
            // We only have entries for the viewed month, so this is approximate
            // (accurate for the currently-viewed month, false otherwise).
            const hasData =
              mi === month &&
              entries.some(
                (e) => e.date_key >= monthStart && e.date_key <= monthEnd
              );
            return (
              <a
                key={m}
                href={`/checklist?room=${encodeURIComponent(roomId)}&year=${year}&month=${mi + 1}`}
                className={
                  "inline-flex h-8 items-center rounded-none border px-2 font-mono text-xs transition-colors " +
                  (active
                    ? "border-foreground bg-foreground text-background font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {m}
                {hasData && (
                  <span
                    className={
                      "ml-1 inline-block h-1.5 w-1.5 rounded-full " +
                      (active ? "bg-background" : "bg-foreground")
                    }
                    aria-label="ada data"
                  />
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Filter buttons + search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["all", "alkes", "meubelair", "elektronik"] as FilterValue[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "inline-flex h-8 items-center rounded-none border px-2.5 font-mono text-xs transition-colors " +
                (filter === f
                  ? "border-foreground bg-foreground text-background font-semibold"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              {f === "all" ? "Semua" : CAT_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full max-w-[16rem]">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang..."
            className="pl-7"
          />
        </div>
      </div>

      {/* Set-all-baik toolbar */}
      <div className="rounded-none border border-border p-3">
        <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Set Baik Otomatis
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tanggal</Label>
              <Input
                type="date"
                value={baikDate}
                onChange={(e) => setBaikDate(e.target.value)}
                className="w-[10rem]"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyBaikDate}
              disabled={pending}
              className="h-8"
            >
              Terapkan
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Rentang dari</Label>
              <Input
                type="date"
                value={baikFrom}
                onChange={(e) => setBaikFrom(e.target.value)}
                className="w-[10rem]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">sampai</Label>
              <Input
                type="date"
                value={baikTo}
                onChange={(e) => setBaikTo(e.target.value)}
                className="w-[10rem]"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleApplyBaikRange}
              disabled={pending}
              className="h-8"
            >
              Terapkan Rentang
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleApplyBaikMonth}
            disabled={pending}
            className="h-8"
          >
            Seluruh Bulan ({MONTH_NAMES_FULL[month]})
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
        <span className="inline-flex items-center gap-1">
          <Check className="h-3.5 w-3.5" />
          {summary.baik} Baik
        </span>
        <span className="inline-flex items-center gap-1">
          <TriangleAlert className="h-3.5 w-3.5" />
          {summary.rr} Rusak Ringan
        </span>
        <span className="inline-flex items-center gap-1">
          <CircleX className="h-3.5 w-3.5" />
          {summary.rb} Rusak Berat
        </span>
        <span className="inline-flex items-center gap-1">
          <Minus className="h-3.5 w-3.5" />
          {summary.ta} Tidak Ada
        </span>
        <span className="ml-2 text-muted-foreground">
          Terisi: <span className="font-semibold text-foreground">{summary.checked}/{summary.cells}</span> ({summaryPct}%)
        </span>
      </div>

      {/* The matrix table */}
      <div className="relative w-full overflow-x-auto rounded-none border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-10 min-w-[12rem] border-r border-border bg-muted/40 px-2 py-1.5 text-left font-mono text-xs font-semibold whitespace-nowrap">
                {MONTH_NAMES_FULL[month]} {year} — Nama Barang
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const ds = formatDateKey(day);
                const dow = new Date(ds + "T00:00:00").getDay();
                const isWeekend = dow === 0 || dow === 6;
                const isToday = ds === tds;
                return (
                  <th
                    key={day}
                    className={
                      "border-r border-border px-0.5 py-1 text-center font-mono text-xs font-medium tabular-nums " +
                      (isToday ? "ring-2 ring-foreground/30 ring-inset" : "") +
                      (isWeekend ? " bg-muted/30" : "")
                    }
                    title={`${DAY_NAMES[dow]}, ${day} ${MONTH_NAMES_FULL[month]} ${year}`}
                  >
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groupedItems.length === 0 && (
              <tr>
                <td
                  colSpan={daysInMonth + 1}
                  className="px-2 py-8 text-center text-muted-foreground"
                >
                  Tidak ada item ditemukan
                </td>
              </tr>
            )}
            {groupedItems.map((group) => (
              <MatrixGroup
                key={group.category}
                group={group}
                daysInMonth={daysInMonth}
                formatDateKey={formatDateKey}
                getEntry={getEntry}
                tds={tds}
                onToggle={cycleStatus}
                onOpenDetail={openDetail}
                pending={pending}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground">
        Klik sel = ubah status · Klik kanan atau dobel klik = isi keterangan detail kerusakan &amp; perbaikan
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Check className="h-3.5 w-3.5" /> Baik
        </span>
        <span className="inline-flex items-center gap-1">
          <TriangleAlert className="h-3.5 w-3.5" /> Rusak Ringan
        </span>
        <span className="inline-flex items-center gap-1">
          <CircleX className="h-3.5 w-3.5" /> Rusak Berat
        </span>
        <span className="inline-flex items-center gap-1">
          <Minus className="h-3.5 w-3.5" /> Tidak Ada
        </span>
        <span>· Belum</span>
      </div>

      {/* Detail dialog */}
      {detailCell && (
        <ChecklistFormDialog
          open={!!detailCell}
          onOpenChange={(open) => !open && setDetailCell(null)}
          entry={detailCell.existingEntry}
          roomId={roomId}
          itemId={detailCell.itemId}
          itemName={detailCell.itemName}
          itemCategory={detailCell.itemCategory}
          itemIndex={detailCell.itemIndex}
          dateKey={detailCell.dateKey}
        />
      )}
    </div>
  );
}

function formatDateDisplay(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return `${d}/${m}/${y}`;
}

/** Renders a category separator row + the item rows for that category. */
function MatrixGroup({
  group,
  daysInMonth,
  formatDateKey,
  getEntry,
  tds,
  onToggle,
  onOpenDetail,
  pending,
}: {
  group: { category: ItemCategory; items: ChecklistCalendarProps["items"] };
  daysInMonth: number;
  formatDateKey: (day: number) => string;
  getEntry: (itemIndex: number, dateKey: string) => ChecklistEntry | undefined;
  tds: string;
  onToggle: (itemIndex: number, dateKey: string, currentStatus: ChecklistPayload["status"] | undefined) => void;
  onOpenDetail: (itemIndex: number, dateKey: string) => void;
  pending: boolean;
}) {
  return (
    <>
      <tr className="border-b border-border bg-muted/20">
        <td
          colSpan={daysInMonth + 1}
          className="px-2 py-1 font-mono text-xs font-semibold whitespace-nowrap"
        >
          {CAT_LABELS[group.category]} — {group.items.length} item
        </td>
      </tr>
      {group.items.map((it) => (
        <tr key={`${it.category}-${it.id}`} className="border-b border-border">
          <td className="sticky left-0 z-[1] min-w-[12rem] border-r border-border bg-background px-2 py-1 align-top">
            <div className="font-medium leading-tight">{it.name}</div>
            {(it.spec || it.merk || it.type) && (
              <div className="text-[0.65rem] leading-tight text-muted-foreground">
                {it.spec || [it.merk, it.type].filter(Boolean).join(" ")}
              </div>
            )}
          </td>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const ds = formatDateKey(day);
            const entry = getEntry(it.index_in_room, ds);
            const status = entry?.payload?.status;
            const isFuture = ds > tds;
            const isToday = ds === tds;
            const dow = new Date(ds + "T00:00:00").getDay();
            const isWeekend = dow === 0 || dow === 6;
            const hasNote = !!(
              entry?.payload?.jenis_kerusakan ||
              entry?.payload?.uraian_kerusakan ||
              entry?.payload?.uraian_tindakan ||
              entry?.payload?.petugas
            );
            return (
              <td
                key={day}
                className={
                  "border-r border-border p-0 text-center align-middle " +
                  (isToday ? "ring-2 ring-foreground/30 ring-inset" : "") +
                  (isWeekend ? " bg-muted/30" : "")
                }
              >
                <button
                  type="button"
                  disabled={isFuture || pending}
                  onClick={() =>
                    !isFuture && onToggle(it.index_in_room, ds, status)
                  }
                  onDoubleClick={() => !isFuture && onOpenDetail(it.index_in_room, ds)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isFuture) onOpenDetail(it.index_in_room, ds);
                  }}
                  title={buildTooltip(it.name, ds, status, entry, isFuture)}
                  className={
                    "relative flex h-7 w-full items-center justify-center font-mono text-xs transition-colors " +
                    (isFuture
                      ? "cursor-not-allowed text-muted-foreground/30"
                      : "cursor-pointer hover:bg-muted/60") +
                    (status ? " bg-muted/40 font-semibold" : "")
                  }
                >
                  <StatusIcon status={status} isFuture={isFuture} />
                  {hasNote && (
                    <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-foreground" />
                  )}
                </button>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

function buildTooltip(
  itemName: string,
  dateKey: string,
  status: ChecklistPayload["status"] | undefined,
  entry: ChecklistEntry | undefined,
  isFuture: boolean
) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dow = new Date(dateKey + "T00:00:00").getDay();
  const label = status
    ? status === "baik"
      ? "Baik"
      : status === "rr"
        ? "Rusak Ringan"
        : status === "rb"
          ? "Rusak Berat"
          : "Tidak Ada"
    : isFuture
      ? "Tanggal mendatang"
      : "Belum diisi";
  let t = `${DAY_NAMES[dow]}, ${d} ${MONTH_NAMES_FULL[m - 1]} ${y} — ${itemName}: ${label}`;
  if (entry?.payload?.petugas) t += ` | ${entry.payload.petugas}`;
  if (entry?.payload?.jenis_kerusakan) t += ` | ${entry.payload.jenis_kerusakan}`;
  return t;
}

function StatusIcon({
  status,
  isFuture,
}: {
  status: ChecklistPayload["status"] | undefined;
  isFuture: boolean;
}) {
  if (!status) {
    return isFuture ? <span /> : <span className="text-muted-foreground/50">·</span>;
  }
  if (status === "baik") return <Check className="h-3.5 w-3.5" />;
  if (status === "rr") return <TriangleAlert className="h-3.5 w-3.5" />;
  if (status === "rb") return <CircleX className="h-3.5 w-3.5" />;
  if (status === "ta") return <Minus className="h-3.5 w-3.5" />;
  return null;
}
