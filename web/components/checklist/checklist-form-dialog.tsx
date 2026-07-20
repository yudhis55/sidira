"use client";

/**
 * Checklist detail dialog — GAS `.cl-detail-overlay` parity.
 * Mock-only: parent owns state; no lib/auth writes.
 */
import { useState } from "react";
import { Modal } from "@/components/gas/modal";
import { Button } from "@/components/gas/button";
import { Input } from "@/components/gas/input";
import type { ItemCategory, ItemCondition } from "@/types/database";

export interface ChecklistDetailPayload {
  status: ItemCondition;
  jenis_kerusakan?: string;
  uraian_kerusakan?: string;
  jenis_tindakan?: string;
  uraian_tindakan?: string;
  petugas?: string;
  no_laporan?: string;
}

export interface ChecklistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemCategory: ItemCategory;
  dateKey: string;
  initial?: ChecklistDetailPayload | null;
  onSave: (payload: ChecklistDetailPayload) => void;
  onClear: () => void;
}

const CONDITIONS: Array<{
  value: ItemCondition;
  label: string;
  icon: string;
  bg: string;
  border: string;
  text: string;
}> = [
  {
    value: "baik",
    label: "Baik",
    icon: "✔",
    bg: "#d1fae5",
    border: "#10b981",
    text: "#065f46",
  },
  {
    value: "rr",
    label: "Rusak Ringan",
    icon: "⚠",
    bg: "#fef3c7",
    border: "#f59e0b",
    text: "#92400e",
  },
  {
    value: "rb",
    label: "Rusak Berat",
    icon: "✖",
    bg: "#fee2e2",
    border: "#b91c1c",
    text: "#b91c1c",
  },
  {
    value: "ta",
    label: "Tidak Ada",
    icon: "—",
    bg: "#f1f5f9",
    border: "#94a3b8",
    text: "#475569",
  },
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

const CAT_LABELS: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

function emptyPayload(): ChecklistDetailPayload {
  return {
    status: "baik",
    jenis_kerusakan: "",
    uraian_kerusakan: "",
    jenis_tindakan: "",
    uraian_tindakan: "",
    petugas: "",
    no_laporan: "",
  };
}

function payloadFromInitial(
  initial?: ChecklistDetailPayload | null
): ChecklistDetailPayload {
  return {
    status: initial?.status || "baik",
    jenis_kerusakan: initial?.jenis_kerusakan || "",
    uraian_kerusakan: initial?.uraian_kerusakan || "",
    jenis_tindakan: initial?.jenis_tindakan || "",
    uraian_tindakan: initial?.uraian_tindakan || "",
    petugas: initial?.petugas || "",
    no_laporan: initial?.no_laporan || "",
  };
}

export function ChecklistFormDialog({
  open,
  onOpenChange,
  itemName,
  itemCategory,
  dateKey,
  initial,
  onSave,
  onClear,
}: ChecklistFormDialogProps) {
  // Parent remounts this dialog when detailCell changes (conditional render + key).
  const [payload, setPayload] = useState<ChecklistDetailPayload>(() =>
    payloadFromInitial(initial)
  );

  const showDetailFields = payload.status === "rr" || payload.status === "rb";

  const dateLabel = (() => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dow = new Date(`${dateKey}T00:00:00`).getDay();
    return `${DAY_NAMES[dow]}, ${d} ${MONTH_NAMES_FULL[m - 1]} ${y}`;
  })();

  const handleSave = () => {
    onSave({
      status: payload.status,
      jenis_kerusakan: payload.jenis_kerusakan || undefined,
      uraian_kerusakan: payload.uraian_kerusakan || undefined,
      jenis_tindakan: payload.jenis_tindakan || undefined,
      uraian_tindakan: payload.uraian_tindakan || undefined,
      petugas: payload.petugas || undefined,
      no_laporan: payload.no_laporan || undefined,
    });
  };

  const handleClear = () => {
    if (!confirm("Hapus status checklist untuk tanggal ini?")) return;
    onClear();
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={itemName}
      subtitle={`${dateLabel} · ${CAT_LABELS[itemCategory]}`}
      icon="📝"
      iconVariant="teal"
      size="md"
      zIndex={3000}
      footer={
        <div className="flex w-full flex-wrap items-center gap-2">
          {initial?.status ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="text-red hover:bg-red2"
            >
              🗑 Hapus
            </Button>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="modal-cancel"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="button" variant="modal-ok" onClick={handleSave}>
              💾 Simpan
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Condition picker — GAS colored chips */}
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink3">
            Kondisi
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITIONS.map((c) => {
              const active = payload.status === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPayload({ ...payload, status: c.value })}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border-2 px-2 text-[11px] font-bold transition-all"
                  style={{
                    background: active ? c.bg : "#fff",
                    borderColor: active ? c.border : "var(--line)",
                    color: active ? c.text : "var(--ink3)",
                    boxShadow: active
                      ? `0 0 0 2px ${c.border}33`
                      : "none",
                  }}
                >
                  <span aria-hidden className="text-sm">
                    {c.icon}
                  </span>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {showDetailFields && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Jenis Kerusakan"
                value={payload.jenis_kerusakan || ""}
                onChange={(e) =>
                  setPayload({ ...payload, jenis_kerusakan: e.target.value })
                }
                placeholder="Contoh: Retak, Patah, dll"
              />
              <Input
                label="Jenis Tindakan"
                value={payload.jenis_tindakan || ""}
                onChange={(e) =>
                  setPayload({ ...payload, jenis_tindakan: e.target.value })
                }
                placeholder="Contoh: Perbaikan, Penggantian"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink2">
                Uraian Kerusakan
              </label>
              <textarea
                value={payload.uraian_kerusakan || ""}
                onChange={(e) =>
                  setPayload({ ...payload, uraian_kerusakan: e.target.value })
                }
                placeholder="Deskripsi detail kerusakan..."
                rows={2}
                className="w-full resize-y rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink2">
                Uraian Tindakan
              </label>
              <textarea
                value={payload.uraian_tindakan || ""}
                onChange={(e) =>
                  setPayload({ ...payload, uraian_tindakan: e.target.value })
                }
                placeholder="Deskripsi tindakan yang dilakukan..."
                rows={2}
                className="w-full resize-y rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Petugas"
            value={payload.petugas || ""}
            onChange={(e) =>
              setPayload({ ...payload, petugas: e.target.value })
            }
            placeholder="Nama petugas"
          />
          <Input
            label="No. Laporan"
            value={payload.no_laporan || ""}
            onChange={(e) =>
              setPayload({ ...payload, no_laporan: e.target.value })
            }
            placeholder="Opsional"
          />
        </div>
      </div>
    </Modal>
  );
}
