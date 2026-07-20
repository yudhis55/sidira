"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
// NOTE: The parent page remounts this component via a `key` prop when the
// viewed month/year changes, so `useState` initializers always reflect the
// freshly-fetched server data. Do not add an effect to re-sync props into
// state (it triggers the react-hooks/set-state-in-effect lint rule and causes
// cascading renders).
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  toggleUtilCheck,
  bulkSetUtilCheck,
  saveUtilNote,
  type UtilState,
  type UtilMeta,
} from "@/lib/auth/utilitas";

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_NAMES = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

interface ChecklistProps {
  utilId: string;
  utilMeta: UtilMeta;
  items: Array<{ nama: string; ket?: string }>;
  /** 0-based month (0 = Jan). */
  month: number;
  /** 4-digit year. */
  year: number;
  stateForMonth: { checks: UtilState[]; note: string };
}

export function Checklist({
  utilId,
  utilMeta,
  items,
  month,
  year,
  stateForMonth,
}: ChecklistProps) {
  const [pending, startTransition] = useTransition();
  const today = todayString();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Bulk-set form state.
  const [bulkDate, setBulkDate] = useState<string>(today);
  const [bulkFrom, setBulkFrom] = useState<string>(today);
  const [bulkTo, setBulkTo] = useState<string>(today);

  // Notes state (debounced save). Note key is `${utilId}_${year}_${month}` —
  // constructed in saveUtilNote on the server; no client use needed since the
  // parent remounts this component on month change via `key`.
  const [noteText, setNoteText] = useState<string>(stateForMonth.note);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Index check rows by `${item_index}|${state_key}` for O(1) lookup.
  const checkMap = useMemo(() => {
    const m = new Map<string, UtilState>();
    for (const c of stateForMonth.checks) {
      if (c.kind !== "check") continue;
      m.set(`${c.item_index ?? ""}|${c.state_key}`, c);
    }
    return m;
  }, [stateForMonth.checks]);

  const isDone = (itemIndex: number, dateKey: string) => {
    return checkMap.has(`${String(itemIndex)}|${dateKey}`);
  };

  const formatDateKey = (day: number) =>
    `${year}-${pad2(month + 1)}-${pad2(day)}`;

  // Summary: counts only non-future cells (matches GAS utilRender logic).
  const summary = useMemo(() => {
    let done = 0;
    let cells = 0;
    for (let idx = 0; idx < items.length; idx++) {
      for (let day = 1; day <= daysInMonth; day++) {
        const ds = formatDateKey(day);
        if (ds > today) continue;
        cells++;
        if (isDone(idx, ds)) done++;
      }
    }
    return { done, cells };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, daysInMonth, checkMap, today, year, month]);

  const summaryPct =
    summary.cells > 0 ? Math.round((summary.done / summary.cells) * 100) : 0;

  const handleToggle = (itemIndex: number, dateKey: string) => {
    const done = isDone(itemIndex, dateKey);
    startTransition(async () => {
      try {
        await toggleUtilCheck(utilId, itemIndex, dateKey, !done);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengubah status pemeliharaan");
      }
    });
  };

  const handleApplyDate = () => {
    if (!bulkDate) {
      toast.warning("Pilih tanggal terlebih dahulu");
      return;
    }
    startTransition(async () => {
      try {
        const res = await bulkSetUtilCheck(utilId, { date: bulkDate });
        toast.success(
          `${res.items} item diset sudah dikerjakan untuk ${formatDateDisplay(bulkDate)}`
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal menerapkan tanggal");
      }
    });
  };

  const handleApplyRange = () => {
    if (!bulkFrom || !bulkTo) {
      toast.warning("Isi tanggal dari dan sampai");
      return;
    }
    if (bulkFrom > bulkTo) {
      toast.warning("Tanggal awal harus sebelum tanggal akhir");
      return;
    }
    startTransition(async () => {
      try {
        const res = await bulkSetUtilCheck(utilId, {
          dateFrom: bulkFrom,
          dateTo: bulkTo,
        });
        toast.success(
          `${res.items} item × ${res.dates} hari diset selesai`
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal menerapkan rentang");
      }
    });
  };

  const handleApplyMonth = () => {
    const monthStart = `${year}-${pad2(month + 1)}-01`;
    const monthEnd = `${year}-${pad2(month + 1)}-${pad2(daysInMonth)}`;
    startTransition(async () => {
      try {
        const res = await bulkSetUtilCheck(utilId, {
          dateFrom: monthStart,
          dateTo: monthEnd,
        });
        toast.success(
          `${res.items} item × ${res.dates} hari diset selesai (seluruh bulan)`
        );
      } catch (err) {
        console.error(err);
        toast.error("Gagal menerapkan seluruh bulan");
      }
    });
  };

  // Debounced note save (2s after last keystroke).
  const handleNoteChange = (value: string) => {
    setNoteText(value);
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await saveUtilNote(utilId, year, month, value);
        } catch (err) {
          console.error(err);
          toast.error("Gagal menyimpan catatan");
        }
      });
    }, 2000);
  };

  // Cleanup timer on unmount.
  useEffect(() => {
    return () => {
      if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    };
  }, []);

  const monthHref = (y: number, m0: number) =>
    `/utilitas/${encodeURIComponent(utilId)}?year=${y}&month=${m0 + 1}`;

  return (
    <div className="overflow-hidden rounded-none ring-1 ring-foreground/10 bg-card">
      {/* Card head — util.bg is the utilitas identity color (allowed exception). */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: utilMeta.bg }}
      >
        <span className="text-2xl leading-none">{utilMeta.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm font-semibold text-foreground">
            Ceklist Pemeliharaan Bulanan
          </div>
          <div className="text-xs text-muted-foreground">
            Klik sel untuk tandai sudah dikerjakan
          </div>
        </div>
        <span className="font-mono text-xs font-semibold whitespace-nowrap">
          {summary.done}/{summary.cells} dikerjakan
        </span>
      </div>

      <div className="space-y-4 p-4">
        {/* Month nav: ‹ year › + month tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a
                href={monthHref(year - 1, month)}
                aria-label="Tahun sebelumnya"
              >
                ‹
              </a>
            </Button>
            <span className="w-12 text-center font-mono text-sm font-semibold tabular-nums">
              {year}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a
                href={monthHref(year + 1, month)}
                aria-label="Tahun berikutnya"
              >
                ›
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {MONTH_NAMES_SHORT.map((m, mi) => {
              const active = mi === month;
              return (
                <a
                  key={m}
                  href={monthHref(year, mi)}
                  className={
                    "inline-flex h-8 items-center rounded-none border px-2 font-mono text-xs transition-colors " +
                    (active
                      ? "border-foreground bg-foreground text-background font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                >
                  {m}
                </a>
              );
            })}
          </div>
        </div>

        {/* Centang Semua bar */}
        <div className="rounded-none border border-border p-3">
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ✓ Centang Semua Sudah Dikerjakan
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">
                  📅 Tanggal
                </Label>
                <Input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="w-[10rem]"
                  disabled={pending}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyDate}
                disabled={pending}
                className="h-8"
              >
                ✓ Terapkan
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">
                  📆 Rentang
                </Label>
                <Input
                  type="date"
                  value={bulkFrom}
                  onChange={(e) => setBulkFrom(e.target.value)}
                  className="w-[10rem]"
                  disabled={pending}
                />
              </div>
              <span className="pb-1.5 font-mono text-xs text-muted-foreground">
                s/d
              </span>
              <Input
                type="date"
                value={bulkTo}
                onChange={(e) => setBulkTo(e.target.value)}
                className="w-[10rem]"
                disabled={pending}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleApplyRange}
                disabled={pending}
                className="h-8"
              >
                ✓ Terapkan Rentang
              </Button>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleApplyMonth}
              disabled={pending}
              className="h-8"
            >
              📅 Seluruh Bulan ({MONTH_NAMES_FULL[month]})
            </Button>
          </div>
        </div>

        {/* The matrix table */}
        {items.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            Belum ada item pemeliharaan. Tambahkan item pada bagian Jadwal di bawah.
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto rounded-none border border-border">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="sticky left-0 z-10 min-w-[12rem] border-r border-border bg-muted/40 px-2 py-1.5 text-left font-mono text-xs font-semibold whitespace-nowrap">
                    {MONTH_NAMES_FULL[month]} {year} — Kegiatan Pemeliharaan
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const ds = formatDateKey(day);
                    const dow = new Date(ds + "T00:00:00").getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    const isToday = ds === today;
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
                  <th className="min-w-[6rem] border-l border-border px-2 py-1.5 text-left font-mono text-xs font-semibold whitespace-nowrap">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="sticky left-0 z-[1] min-w-[12rem] border-r border-border bg-background px-2 py-1 align-top">
                      <div className="font-medium leading-tight">{it.nama}</div>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const ds = formatDateKey(day);
                      const done = isDone(idx, ds);
                      const isFuture = ds > today;
                      const isToday = ds === today;
                      const dow = new Date(ds + "T00:00:00").getDay();
                      const isWeekend = dow === 0 || dow === 6;
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
                            onClick={() => !isFuture && handleToggle(idx, ds)}
                            title={
                              `${it.nama} — ${DAY_NAMES[dow]}, ${day} ${MONTH_NAMES_FULL[month]} ${year}: ` +
                              (isFuture
                                ? "Tanggal mendatang"
                                : done
                                  ? "Sudah dikerjakan (klik untuk batalkan)"
                                  : "Belum dikerjakan")
                            }
                            className={
                              "flex h-7 w-full items-center justify-center font-mono text-xs transition-colors " +
                              (isFuture
                                ? "cursor-not-allowed text-muted-foreground/30"
                                : "cursor-pointer hover:bg-muted/60") +
                              (done ? " bg-muted font-semibold" : "")
                            }
                          >
                            {done ? (
                              <span aria-hidden>✓</span>
                            ) : isFuture ? (
                              <span />
                            ) : (
                              <span className="text-muted-foreground/50">·</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="border-l border-border px-2 py-1 align-top font-mono text-xs text-muted-foreground">
                      {it.ket || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary — achromatic, icons not colored dots */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>✓</span>
            {summary.done} sudah dikerjakan
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="text-muted-foreground/50">·</span>
            {summary.cells - summary.done} belum
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>📊</span>
            {summaryPct}% selesai bulan ini
          </span>
        </div>

        {/* Notes textarea — per month */}
        <div className="space-y-2">
          <Label htmlFor="utilNotesTa" className="text-xs">
            📝 Catatan Kondisi / Tindakan Bulan Ini
          </Label>
          <Textarea
            id="utilNotesTa"
            value={noteText}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Tuliskan catatan pemeliharaan, kendala, atau tindakan yang dilakukan..."
            rows={3}
            disabled={pending}
          />
        </div>
      </div>
    </div>
  );
}

function formatDateDisplay(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return `${d}/${m}/${y}`;
}
