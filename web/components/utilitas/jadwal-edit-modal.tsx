"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UtilItem } from "@/types/database";
import { cn } from "@/lib/utils";

// GAS FREQ_LIST
const FREQ_LIST = ["Harian", "Mingguan", "Bulanan", "Semester", "Tahunan"];

const FREQ_CHIPS: Array<{ freq: string; label: string; activeBg: string }> = [
  { freq: "all", label: "Semua", activeBg: "var(--ink2)" },
  { freq: "Harian", label: "⏱ Harian", activeBg: "#0e7c6b" },
  { freq: "Mingguan", label: "📅 Mingguan", activeBg: "#6d28d9" },
  { freq: "Bulanan", label: "🗓 Bulanan", activeBg: "#1d4ed8" },
  { freq: "Semester", label: "📆 Semester", activeBg: "#b45309" },
  { freq: "Tahunan", label: "🗃 Tahunan", activeBg: "#be185d" },
];

// GAS .jedit-freq-sel[data-val=...] — warna border+teks select per frekuensi
const FREQ_SEL_COLOR: Record<string, string> = {
  Harian: "#0e7c6b",
  Mingguan: "#6d28d9",
  Bulanan: "#1d4ed8",
  Semester: "#b45309",
  Tahunan: "#be185d",
};

export interface JadwalEditModalProps {
  open: boolean;
  icon: string;
  label: string;
  items: UtilItem[];
  onClose: () => void;
  /**
   * Simpan daftar item. Boleh sinkron (utilitas lokal `custom_*`) atau
   * asinkron (tulis `util_items` via server action). Kembalikan `false` bila
   * simpan gagal — modal tetap terbuka dan draf sesi dipertahankan; induk
   * menampilkan `toast.error` berbahasa Indonesia.
   */
  onSave: (items: UtilItem[]) => boolean | Promise<boolean>;
}

/**
 * Modal "Edit Jadwal" — porting GAS openJadwalEdit/jedit*:
 * daftar item editable (nama + frekuensi), filter chip frekuensi,
 * drag & drop urutan, tambah/hapus item, simpan.
 */
export function JadwalEditModal({
  open,
  icon,
  label,
  items,
  onClose,
  onSave,
}: JadwalEditModalProps) {
  if (!open) return null;
  // Inner di-mount ulang setiap modal dibuka → draft selalu deep copy
  // dari items terkini (meniru GAS openJadwalEdit).
  return (
    <JadwalEditModalInner
      icon={icon}
      label={label}
      items={items}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function JadwalEditModalInner({
  icon,
  label,
  items,
  onClose,
  onSave,
}: Omit<JadwalEditModalProps, "open">) {
  const [draft, setDraft] = useState<UtilItem[]>(() =>
    items.map((it) => ({ nama: it.nama, ket: it.ket }))
  );
  const [filterFreq, setFilterFreq] = useState("all");
  const [newFreq, setNewFreq] = useState("Bulanan");
  const [saving, setSaving] = useState(false);
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const focusLastRef = useRef(false);

  useEffect(() => {
    if (!focusLastRef.current || !listRef.current) return;
    focusLastRef.current = false;
    const inputs =
      listRef.current.querySelectorAll<HTMLInputElement>("[data-nama-inp]");
    inputs[inputs.length - 1]?.focus();
  }, [draft.length]);

  const updateItem = (idx: number, patch: Partial<UtilItem>) => {
    setDraft((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it))
    );
  };

  const deleteItem = (idx: number) => {
    const it = draft[idx];
    if (!it) return;
    if (!window.confirm(`Hapus item "${it.nama}"?`)) return;
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    setDraft((prev) => [...prev, { nama: "", ket: newFreq }]);
    setFilterFreq("all");
    focusLastRef.current = true;
  };

  const handleDrop = (toIdx: number) => {
    const fromIdx = dragIdx.current;
    dragIdx.current = null;
    setDragOverIdx(null);
    if (fromIdx === null || fromIdx === toIdx) return;
    setDraft((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  const handleSave = () => {
    const cleaned = draft
      .filter((it) => it.nama.trim() !== "")
      .map((it) => ({ nama: it.nama.trim(), ket: it.ket }));
    if (cleaned.length === 0) {
      toast.warning("⚠️ Minimal harus ada 1 item pemeliharaan");
      return;
    }
    if (saving) return;
    setSaving(true);
    Promise.resolve()
      .then(() => onSave(cleaned))
      .then((ok) => {
        setSaving(false);
        if (!ok) return;
        onClose();
        toast.success(`✅ Jadwal pemeliharaan disimpan — ${cleaned.length} item`);
      })
      .catch(() => {
        setSaving(false);
        toast.error("Gagal menyimpan jadwal pemeliharaan. Coba lagi.");
      });
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(10,30,25,0.65)] backdrop-blur-[5px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Box — GAS .jedit-box */}
      <div className="flex max-h-[90vh] w-[640px] max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        {/* Head — GAS .jedit-head */}
        <div
          className="flex shrink-0 items-center gap-3 px-5 py-4 text-white"
          style={{ background: "linear-gradient(135deg,#062820,#0e7c6b)" }}
        >
          <span className="text-[22px] leading-none" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold leading-tight">
              Edit Jadwal — {label}
            </div>
            <div className="mt-px text-[11px] opacity-70">
              {draft.length} item pemeliharaan · klik nama untuk ubah
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-auto flex size-[30px] items-center justify-center rounded-full border-[1.5px] border-white/30 bg-transparent text-base text-white transition-colors hover:bg-white/[0.18]"
          >
            ✕
          </button>
        </div>

        {/* Filter bar — GAS .jedit-filter-bar */}
        <div className="flex shrink-0 flex-wrap gap-1 border-b border-line bg-[#fafafa] px-4 py-2.5">
          {FREQ_CHIPS.map((chip) => {
            const active = filterFreq === chip.freq;
            return (
              <button
                key={chip.freq}
                type="button"
                onClick={() => setFilterFreq(chip.freq)}
                className={cn(
                  "flex items-center gap-[5px] rounded-[20px] border-[1.5px] px-3 py-[5px] text-[11px] font-bold transition-colors",
                  active
                    ? "border-transparent text-white"
                    : "border-line bg-white text-ink3 hover:border-ink3 hover:text-ink2"
                )}
                style={active ? { background: chip.activeBg } : undefined}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* List — GAS .jedit-list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-2.5">
          {draft.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-ink3">
              Belum ada item. Klik ＋ Tambah Item di bawah.
            </div>
          ) : (
            draft.map((it, idx) => {
              const hidden = filterFreq !== "all" && it.ket !== filterFreq;
              if (hidden) return null;
              const selColor = FREQ_SEL_COLOR[it.ket ?? ""];
              const freqOptions = FREQ_LIST.includes(it.ket ?? "")
                ? FREQ_LIST
                : [...FREQ_LIST, it.ket ?? ""].filter(Boolean);
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => {
                    dragIdx.current = idx;
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => {
                    dragIdx.current = null;
                    setDragOverIdx(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIdx(idx);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(idx);
                  }}
                  className={cn(
                    "mb-1.5 flex items-center gap-2 rounded-lg border-[1.5px] bg-white px-2.5 py-2 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]",
                    dragOverIdx === idx
                      ? "border-teal bg-teal4"
                      : "border-line"
                  )}
                >
                  <span
                    className="shrink-0 cursor-grab px-1 py-0.5 text-sm leading-none text-ink3 active:cursor-grabbing"
                    title="Geser untuk ubah urutan"
                    aria-hidden
                  >
                    ⠿
                  </span>
                  <input
                    data-nama-inp
                    value={it.nama}
                    placeholder="Nama kegiatan..."
                    onChange={(e) => updateItem(idx, { nama: e.target.value })}
                    className="min-w-0 flex-1 rounded-[5px] border-none bg-transparent px-1.5 py-[3px] text-[12.5px] font-semibold text-ink outline-none focus:bg-line2"
                  />
                  <select
                    value={it.ket ?? ""}
                    onChange={(e) => updateItem(idx, { ket: e.target.value })}
                    className="shrink-0 cursor-pointer rounded-2xl border-[1.5px] bg-white px-2 py-1 text-[11px] font-bold outline-none focus:border-teal"
                    style={
                      selColor
                        ? { borderColor: selColor, color: selColor }
                        : { borderColor: "var(--line)", color: "var(--ink2)" }
                    }
                  >
                    {freqOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteItem(idx)}
                    title="Hapus item ini"
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-line bg-transparent text-[13px] text-ink3 transition-colors hover:border-red hover:bg-red2 hover:text-red"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — GAS .jedit-footer */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-[#fafafa] px-4 py-3">
          <select
            value={newFreq}
            onChange={(e) => setNewFreq(e.target.value)}
            className="cursor-pointer rounded-[20px] border-[1.5px] border-line bg-white px-2.5 py-[7px] text-[11px] font-bold text-ink2 outline-none"
            aria-label="Frekuensi item baru"
          >
            {FREQ_LIST.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-[20px] border-[1.5px] border-dashed border-teal/50 bg-teal4 px-4 py-2 text-xs font-bold text-teal transition-colors hover:border-teal hover:bg-teal hover:text-white"
          >
            ＋ Tambah Item
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[20px] border-[1.5px] border-line bg-white px-4 py-2 text-xs font-bold text-ink3 transition-colors hover:border-ink3 hover:text-ink2"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto rounded-[20px] border-none bg-teal px-[22px] py-2 text-[13px] font-extrabold text-white transition-colors hover:bg-teal2"
          >
            💾 Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
