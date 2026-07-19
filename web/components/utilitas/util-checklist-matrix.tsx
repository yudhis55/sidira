"use client";

import { useMemo, useState } from "react";
import type { UtilMeta, UtilState } from "@/types/database";
import { cn } from "@/lib/utils";

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MONTH_NAMES_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dateKey(year: number, month0: number, day: number) {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

function checkKey(itemIndex: number, stateKey: string) {
  return `${itemIndex}|${stateKey}`;
}

function daysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

function buildDoneSet(checks: UtilState[]): Set<string> {
  const set = new Set<string>();
  for (const c of checks) {
    if (c.kind !== "check") continue;
    const idx = c.item_index ?? "";
    set.add(`${idx}|${c.state_key}`);
  }
  return set;
}

export interface UtilChecklistMatrixProps {
  utilId: string;
  utilMeta: Pick<UtilMeta, "icon" | "label" | "warna" | "bg">;
  items: Array<{ nama: string; ket?: string }>;
  year: number;
  /** 0-based month (0 = Januari). */
  month0: number;
  initialChecks: UtilState[];
  initialNote: string;
}

/**
 * GAS-like monthly checklist matrix for utilitas.
 * Mock-only: all toggles / bulk / notes stay in local state.
 */
export function UtilChecklistMatrix({
  utilId: _utilId,
  utilMeta,
  items,
  year: initialYear,
  month0: initialMonth0,
  initialChecks,
  initialNote,
}: UtilChecklistMatrixProps) {
  void _utilId;

  const [year, setYear] = useState(initialYear);
  const [month0, setMonth0] = useState(initialMonth0);
  const [doneSet, setDoneSet] = useState(() => buildDoneSet(initialChecks));
  const [noteText, setNoteText] = useState(initialNote);

  const today = todayString();
  const dim = daysInMonth(year, month0);

  const [bulkDate, setBulkDate] = useState(today);
  const [bulkFrom, setBulkFrom] = useState(today);
  const [bulkTo, setBulkTo] = useState(today);

  const isDone = (itemIndex: number, stateKey: string) =>
    doneSet.has(checkKey(itemIndex, stateKey));

  const summary = useMemo(() => {
    let done = 0;
    let cells = 0;
    for (let idx = 0; idx < items.length; idx++) {
      for (let day = 1; day <= dim; day++) {
        const ds = dateKey(year, month0, day);
        if (ds > today) continue;
        cells++;
        if (doneSet.has(checkKey(idx, ds))) done++;
      }
    }
    return { done, cells };
  }, [items, dim, doneSet, today, year, month0]);

  const summaryPct =
    summary.cells > 0 ? Math.round((summary.done / summary.cells) * 100) : 0;

  const toggleCell = (itemIndex: number, stateKey: string) => {
    if (stateKey > today) return;
    const key = checkKey(itemIndex, stateKey);
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const markAllOnDates = (dates: string[]) => {
    if (items.length === 0 || dates.length === 0) return;
    setDoneSet((prev) => {
      const next = new Set(prev);
      for (const ds of dates) {
        if (ds > today) continue;
        for (let idx = 0; idx < items.length; idx++) {
          next.add(checkKey(idx, ds));
        }
      }
      return next;
    });
  };

  const handleApplyDate = () => {
    if (!bulkDate) return;
    markAllOnDates([bulkDate]);
  };

  const handleApplyRange = () => {
    if (!bulkFrom || !bulkTo || bulkFrom > bulkTo) return;
    const dates: string[] = [];
    const start = new Date(bulkFrom + "T00:00:00");
    const end = new Date(bulkTo + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
      );
    }
    markAllOnDates(dates);
  };

  const handleApplyMonth = () => {
    const dates: string[] = [];
    for (let day = 1; day <= dim; day++) {
      dates.push(dateKey(year, month0, day));
    }
    markAllOnDates(dates);
  };

  const handleCheckToday = () => {
    markAllOnDates([today]);
  };

  const goYear = (delta: number) => setYear((y) => y + delta);

  const selectMonth = (m0: number) => setMonth0(m0);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      {/* Card head — util.bg is identity color (GAS util-card-head) */}
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{ background: utilMeta.bg }}
      >
        <span className="text-[22px] leading-none" aria-hidden>
          {utilMeta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-extrabold text-ink">
            Ceklist Pemeliharaan Bulanan
          </div>
          <div className="mt-0.5 text-[11px] text-ink3">
            Klik sel untuk tandai sudah dikerjakan
          </div>
        </div>
        <span className="ml-auto whitespace-nowrap font-mono text-[11px] font-semibold text-ink2">
          {summary.done}/{summary.cells} dikerjakan
        </span>
      </div>

      {/* Month nav: year ‹ › + 12 month tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-[#fafafa] px-5 py-2.5">
        <button
          type="button"
          onClick={() => goYear(-1)}
          className="rounded-md border-[1.5px] border-line bg-white px-2.5 py-0.5 text-[13px] font-bold text-ink2 hover:border-ink3"
          aria-label="Tahun sebelumnya"
        >
          ‹
        </button>
        <span className="min-w-10 text-center text-sm font-extrabold tabular-nums text-ink">
          {year}
        </span>
        <button
          type="button"
          onClick={() => goYear(1)}
          className="rounded-md border-[1.5px] border-line bg-white px-2.5 py-0.5 text-[13px] font-bold text-ink2 hover:border-ink3"
          aria-label="Tahun berikutnya"
        >
          ›
        </button>

        <div className="ml-2 flex flex-wrap gap-0.5">
          {MONTH_NAMES_SHORT.map((label, mi) => {
            const active = mi === month0;
            return (
              <button
                key={label}
                type="button"
                onClick={() => selectMonth(mi)}
                className={cn(
                  "rounded-2xl border-[1.5px] px-2.5 py-1 text-[11px] font-bold transition-colors",
                  active
                    ? "border-teal bg-teal text-white"
                    : "border-transparent bg-line2 text-ink3 hover:bg-line hover:text-ink2"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk: centang semua */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#f0fdf9] px-5 py-2">
        <span className="text-[11px] font-bold text-ink3">
          ✓ Centang Semua Sudah Dikerjakan:
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="whitespace-nowrap text-[10px] font-bold text-ink3">
            📅 Tanggal:
          </span>
          <input
            type="date"
            value={bulkDate}
            onChange={(e) => setBulkDate(e.target.value)}
            className="cursor-pointer rounded-lg border-[1.5px] border-teal/40 bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={handleApplyDate}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-teal/40 bg-teal4 px-2.5 py-1 text-[11px] font-bold text-teal transition-colors hover:border-teal hover:bg-teal hover:text-white"
          >
            ✓ Terapkan
          </button>
        </div>

        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="whitespace-nowrap text-[10px] font-bold text-ink3">
            📆 Rentang:
          </span>
          <input
            type="date"
            value={bulkFrom}
            onChange={(e) => setBulkFrom(e.target.value)}
            className="cursor-pointer rounded-lg border-[1.5px] border-teal/40 bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none focus:border-teal"
          />
          <span className="text-[10px] font-bold text-ink3">s/d</span>
          <input
            type="date"
            value={bulkTo}
            onChange={(e) => setBulkTo(e.target.value)}
            className="cursor-pointer rounded-lg border-[1.5px] border-teal/40 bg-white px-2 py-1 text-[11px] font-semibold text-ink outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={handleApplyRange}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-violet/35 bg-violet2 px-2.5 py-1 text-[11px] font-bold text-violet transition-colors hover:border-violet hover:bg-violet hover:text-white"
          >
            ✓ Terapkan Rentang
          </button>
        </div>

        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

        <button
          type="button"
          onClick={handleApplyMonth}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-blue/35 bg-blue2 px-2.5 py-1 text-[11px] font-bold text-blue transition-colors hover:border-blue hover:bg-blue hover:text-white"
        >
          📅 Seluruh Bulan
        </button>

        <button
          type="button"
          onClick={handleCheckToday}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border-[1.5px] border-teal/40 bg-teal4 px-2.5 py-1 text-[11px] font-bold text-teal transition-colors hover:border-teal hover:bg-teal hover:text-white"
        >
          ✓ Centang semua hari ini
        </button>
      </div>

      {/* Matrix table */}
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-ink3">
          Belum ada item pemeliharaan.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="min-w-[180px] border border-line bg-[#f8fafc] px-2.5 py-1.5 text-left text-[10px] font-bold text-ink3">
                  {MONTH_NAMES_FULL[month0]} {year} — Kegiatan Pemeliharaan
                </th>
                {Array.from({ length: dim }, (_, i) => i + 1).map((day) => {
                  const ds = dateKey(year, month0, day);
                  const dow = new Date(ds + "T00:00:00").getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  const isToday = ds === today;
                  return (
                    <th
                      key={day}
                      title={`${DAY_NAMES[dow]}, ${day} ${MONTH_NAMES_FULL[month0]} ${year}`}
                      className={cn(
                        "border border-line px-1 py-1.5 text-center text-[10px] font-bold tabular-nums text-ink3",
                        isToday && "bg-teal4 text-teal",
                        isWeekend && !isToday && "bg-[#fdf4ff]"
                      )}
                    >
                      {day}
                    </th>
                  );
                })}
                <th className="min-w-[110px] border border-line bg-[#f8fafc] px-2 py-1.5 text-center text-[10px] font-bold text-ink3">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={`${it.nama}-${idx}`} className="even:[&>td]:bg-[#fafafa]">
                  <td className="border border-line px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-ink">
                    {it.nama}
                  </td>
                  {Array.from({ length: dim }, (_, i) => i + 1).map((day) => {
                    const ds = dateKey(year, month0, day);
                    const done = isDone(idx, ds);
                    const isFuture = ds > today;
                    const isToday = ds === today;
                    const dow = new Date(ds + "T00:00:00").getDay();
                    const isWeekend = dow === 0 || dow === 6;

                    return (
                      <td key={day} className="border border-line p-0 text-center align-middle">
                        <button
                          type="button"
                          disabled={isFuture}
                          onClick={() => toggleCell(idx, ds)}
                          title={
                            `${it.nama} — ${DAY_NAMES[dow]}, ${day} ${MONTH_NAMES_FULL[month0]} ${year}: ` +
                            (isFuture
                              ? "Tanggal mendatang"
                              : done
                                ? "Sudah dikerjakan (klik untuk batalkan)"
                                : "Belum dikerjakan")
                          }
                          className={cn(
                            "flex h-8 w-full select-none items-center justify-center text-[13px] font-bold transition-[filter]",
                            isFuture &&
                              "cursor-default bg-[#f9f9f9] text-[#ddd]",
                            !isFuture && "cursor-pointer hover:brightness-95",
                            !isFuture &&
                              !done &&
                              isWeekend &&
                              "bg-[#fdf4ff] text-[#ccc]",
                            !isFuture &&
                              !done &&
                              !isWeekend &&
                              "text-[#ccc]",
                            done && "bg-teal3 text-teal",
                            isToday && !isFuture && "outline outline-2 outline-teal -outline-offset-2"
                          )}
                        >
                          {done ? "✔" : isFuture ? "" : "·"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="border border-line px-2 py-1 text-center text-[10px] text-ink3">
                    {it.ket || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 border-t border-line bg-[#fafafa] px-5 py-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#d1fae5] px-3 py-1 text-[11px] font-bold text-[#065f46]">
          ✔ {summary.done} sudah dikerjakan
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate2 px-3 py-1 text-[11px] font-bold text-ink3">
          · {Math.max(0, summary.cells - summary.done)} belum
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-teal4 px-3 py-1 text-[11px] font-bold text-teal">
          📊 {summaryPct}% selesai bulan ini
        </span>
      </div>

      {/* Notes — local only */}
      <div className="border-t border-line px-5 py-3">
        <label
          htmlFor="utilNotesTa"
          className="mb-1.5 block text-[11px] font-bold text-ink3"
        >
          📝 Catatan Kondisi / Tindakan Bulan Ini
        </label>
        <textarea
          id="utilNotesTa"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Tuliskan catatan pemeliharaan, kendala, atau tindakan yang dilakukan..."
          rows={3}
          className="min-h-[56px] w-full resize-y rounded-md border-[1.5px] border-line bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-teal"
        />
      </div>

      {/* Quiet mock hint — no server persist */}
      <div className="border-t border-line px-5 py-2 text-[10px] text-ink3">
        Mode mock — perubahan tidak disimpan ke server.
        <span className="ml-1 font-semibold text-ink2">{utilMeta.label}</span>
      </div>
    </div>
  );
}
