"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UtilItem, UtilMeta, UtilState } from "@/types/database";
import {
  bulkSetUtilCheck,
  saveUtilNote,
  toggleUtilCheck,
  updateUtilItems,
} from "@/lib/auth/utilitas";
import { UtilChecklistMatrix } from "./util-checklist-matrix";
import { UtilJadwalCard } from "./util-jadwal-card";
import { JadwalEditModal } from "./jadwal-edit-modal";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function buildDoneSet(checks: UtilState[]): Set<string> {
  const set = new Set<string>();
  for (const c of checks) {
    if (c.kind !== "check") continue;
    set.add(`${c.item_index ?? ""}|${c.state_key}`);
  }
  return set;
}

export interface UtilDetailPanelsProps {
  /** ID utilitas — dipakai untuk tulis/baca `util_state` & `util_items`. */
  utilId: string;
  utilMeta: Pick<UtilMeta, "icon" | "label" | "warna" | "bg">;
  initialItems: UtilItem[];
  year: number;
  /** 0-based month (0 = Januari). */
  month0: number;
  /** Seluruh state check untuk utilitas ini (semua bulan/tahun). */
  initialChecks: UtilState[];
  /** Catatan per bulan, key "YYYY-MM". */
  initialNotesByMonth: Record<string, string>;
}

/**
 * Panel detail utilitas — meniru susunan GAS utilBuildPanel:
 * kartu Ceklist Pemeliharaan Bulanan lalu kartu Jadwal Pemeliharaan Tahunan.
 * State (ceklist, catatan, item jadwal) dipegang bersama supaya edit jadwal
 * dan toggle ceklist saling tersinkron; tulis ke Supabase via server actions
 * (upsert per utilitas ke `util_state` / `util_items`). Gagal tulis →
 * toast.error berbahasa Indonesia dan state sesi dipertahankan (hanya sel
 * yang gagal yang dikembalikan).
 *
 * Utilitas lokal `custom_*` (localStorage) tetap sesi-lokal: tanpa tulis server.
 */
export function UtilDetailPanels({
  utilId,
  utilMeta,
  initialItems,
  year: initialYear,
  month0: initialMonth0,
  initialChecks,
  initialNotesByMonth,
}: UtilDetailPanelsProps) {
  const [items, setItems] = useState<UtilItem[]>(initialItems);
  const [doneSet, setDoneSet] = useState(() => buildDoneSet(initialChecks));
  const [notesByMonth, setNotesByMonth] = useState(initialNotesByMonth);
  const [year, setYear] = useState(initialYear);
  const [month0, setMonth0] = useState(initialMonth0);
  const [editOpen, setEditOpen] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    };
  }, []);

  /** Utilitas tambahan lokal — tidak ada baris Supabase, murni state sesi. */
  const isLocal = utilId.startsWith("custom_");

  const today = todayString();
  const monthKey = `${year}-${pad2(month0 + 1)}`;

  const flipCell = (prev: Set<string>, itemIndex: number, stateKey: string) => {
    const next = new Set(prev);
    const key = `${itemIndex}|${stateKey}`;
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const toggleCell = (itemIndex: number, stateKey: string) => {
    if (stateKey > today) return;
    setDoneSet((prev) => flipCell(prev, itemIndex, stateKey));
    if (isLocal) return;
    toggleUtilCheck(utilId, itemIndex, stateKey, !doneSet.has(`${itemIndex}|${stateKey}`))
      .then((res) => {
        if (res?.error) {
          setDoneSet((prev) => flipCell(prev, itemIndex, stateKey));
          toast.error("Gagal mengubah status ceklist. Coba lagi.");
        }
      })
      .catch(() => {
        setDoneSet((prev) => flipCell(prev, itemIndex, stateKey));
        toast.error("Gagal mengubah status ceklist. Coba lagi.");
      });
  };

  const markAllOnDates = (dates: string[]) => {
    if (items.length === 0 || dates.length === 0) return;
    const target = dates.filter((ds) => ds <= today);
    if (target.length === 0) return;
    const keys: string[] = [];
    for (const ds of target) {
      for (let idx = 0; idx < items.length; idx++) {
        keys.push(`${idx}|${ds}`);
      }
    }
    setDoneSet((prev) => {
      const next = new Set(prev);
      for (const k of keys) next.add(k);
      return next;
    });
    if (isLocal) return;
    const sorted = [...target].sort();
    const opts =
      sorted.length === 1
        ? { date: sorted[0] }
        : { dateFrom: sorted[0], dateTo: sorted[sorted.length - 1] };
    bulkSetUtilCheck(utilId, opts)
      .then(() => undefined)
      .catch(() => {
        setDoneSet((prev) => {
          const next = new Set(prev);
          for (const k of keys) next.delete(k);
          return next;
        });
        toast.error("Gagal menandai ceklist. Coba lagi.");
      });
  };

  const handleNoteChange = (value: string) => {
    setNotesByMonth((prev) => ({ ...prev, [monthKey]: value }));
    if (isLocal) return;
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    noteSaveTimer.current = setTimeout(() => {
      saveUtilNote(utilId, year, month0, value)
        .then((res) => {
          if (res?.error) toast.error("Gagal menyimpan catatan. Coba lagi.");
        })
        .catch(() => {
          toast.error("Gagal menyimpan catatan. Coba lagi.");
        });
    }, 2000);
  };

  const handleSaveJadwal = async (next: UtilItem[]): Promise<boolean> => {
    const cleaned = next.map((it) => ({ nama: it.nama, ket: it.ket }));
    if (isLocal) {
      setItems(next);
      return true;
    }
    let res: Awaited<ReturnType<typeof updateUtilItems>> | null = null;
    try {
      res = await updateUtilItems(utilId, cleaned);
    } catch {
      res = { error: "Gagal menyimpan jadwal pemeliharaan" };
    }
    if (res?.error) {
      toast.error("Gagal menyimpan jadwal pemeliharaan. Coba lagi.");
      return false;
    }
    setItems(next);
    return true;
  };

  return (
    <>
      <UtilChecklistMatrix
        utilMeta={utilMeta}
        items={items}
        year={year}
        month0={month0}
        doneSet={doneSet}
        note={notesByMonth[monthKey] ?? ""}
        onToggle={toggleCell}
        onMarkDates={markAllOnDates}
        onNoteChange={handleNoteChange}
        onYearChange={(delta) => setYear((y) => y + delta)}
        onMonthSelect={setMonth0}
      />

      <UtilJadwalCard
        icon={utilMeta.icon}
        year={year}
        items={items}
        doneSet={doneSet}
        onEdit={() => setEditOpen(true)}
      />

      <JadwalEditModal
        open={editOpen}
        icon={utilMeta.icon}
        label={utilMeta.label}
        items={items}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveJadwal}
      />
    </>
  );
}
