"use client";

/**
 * Checklist detail dialog — port GAS `#clDetailOverlay` (index.html ~8829).
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

/** Satu catatan pemeriksaan terdahulu untuk item yang sama. */
export interface ChecklistHistoryEntry {
  dateKey: string;
  payload: ChecklistDetailPayload;
}

export interface ChecklistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemCategory: ItemCategory;
  dateKey: string;
  initial?: ChecklistDetailPayload | null;
  /** Riwayat tanggal lain untuk item ini — GAS #detLogWrap / #detLogList. */
  history?: ChecklistHistoryEntry[];
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

/** GAS #detJenisKerusakan — 3 optgroup, 17 opsi. */
const JENIS_KERUSAKAN: { group: string; options: string[] }[] = [
  {
    group: "Kerusakan Fisik",
    options: [
      "Retak / Pecah",
      "Bengkok / Penyok",
      "Aus / Terkikis",
      "Berkarat / Korosif",
      "Bocor / Rembes",
      "Komponen Hilang / Lepas",
    ],
  },
  {
    group: "Kerusakan Fungsi",
    options: [
      "Tidak Berfungsi / Mati Total",
      "Fungsi Tidak Normal / Lemah",
      "Error / Kalibrasi Bergeser",
      "Tidak Akurat (hasil ukur)",
      "Konslet / Arus Bocor",
      "Overheat / Panas Berlebih",
    ],
  },
  {
    group: "Kerusakan Lainnya",
    options: [
      "Kotor / Tidak Higienis",
      "Kabel Rusak / Terkelupas",
      "Baterai Habis / Lemah",
      "Software / Firmware Error",
      "Lainnya (lihat keterangan)",
    ],
  },
];

/** GAS #detJenisTindakan — 3 optgroup, 14 opsi. */
const JENIS_TINDAKAN: { group: string; options: string[] }[] = [
  {
    group: "Pemeliharaan Rutin",
    options: [
      "Pembersihan / Sanitasi",
      "Pelumasan / Perawatan",
      "Pengecekan Berkala",
      "Kalibrasi Ulang",
    ],
  },
  {
    group: "Perbaikan",
    options: [
      "Diperbaiki Sendiri (In-house)",
      "Dikirim ke Teknisi",
      "Dikembalikan ke Vendor / Garansi",
      "Penggantian Suku Cadang",
      "Penggantian Baterai",
    ],
  },
  {
    group: "Tindak Lanjut",
    options: [
      "Diajukan Perbaikan (Laporan)",
      "Diajukan Pengadaan Baru",
      "Dinyatakan Tidak Layak Pakai",
      "Sudah Diperbaiki — Siap Pakai",
      "Belum Ditangani — Menunggu Teknisi",
    ],
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

const FIELD_LABEL =
  "text-xs font-semibold uppercase tracking-wide text-ink2";

const FIELD_CONTROL =
  "w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal";

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

function formatDateLabel(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dow = new Date(`${dateKey}T00:00:00`).getDay();
  return `${DAY_NAMES[dow]}, ${d} ${MONTH_NAMES_FULL[m - 1]} ${y}`;
}

/** Dropdown ber-optgroup yang menerima nilai lama di luar daftar opsi. */
function GroupedSelect({
  label,
  value,
  placeholder,
  groups,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  groups: { group: string; options: string[] }[];
  onChange: (value: string) => void;
}) {
  const known = groups.some((g) => g.options.includes(value));
  return (
    <div className="flex flex-col gap-1.5">
      <label className={FIELD_LABEL}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_CONTROL} cursor-pointer`}
      >
        <option value="">{placeholder}</option>
        {/* Nilai lama dari data lama tetap tampil supaya tidak hilang diam-diam. */}
        {value && !known && <option value={value}>{value}</option>}
        {groups.map((g) => (
          <optgroup key={g.group} label={g.group}>
            {g.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export function ChecklistFormDialog({
  open,
  onOpenChange,
  itemName,
  itemCategory,
  dateKey,
  initial,
  history = [],
  onSave,
  onClear,
}: ChecklistFormDialogProps) {
  // Parent remounts this dialog when detailCell changes (conditional render + key).
  const [payload, setPayload] = useState<ChecklistDetailPayload>(() =>
    payloadFromInitial(initial)
  );
  const [confirmingClear, setConfirmingClear] = useState(false);

  // GAS menyembunyikan grup kerusakan saat status baik/ta, tapi grup tindakan
  // selalu tampil (#detTindakanGroup tidak pernah di-hide).
  const showKerusakan = payload.status === "rr" || payload.status === "rb";

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

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={itemName}
      subtitle={`${formatDateLabel(dateKey)} · ${CAT_LABELS[itemCategory]}`}
      icon="📅"
      iconVariant="teal"
      size="md"
      zIndex={3000}
      footer={
        confirmingClear ? (
          <div className="flex w-full flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink2">
              Hapus status ceklist untuk tanggal ini?
            </span>
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="modal-cancel"
                onClick={() => setConfirmingClear(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClear}
                className="border-[1.5px] border-red/30 bg-red2 font-bold text-red hover:bg-red hover:text-white"
              >
                🗑 Ya, hapus
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-center gap-2">
            {initial?.status ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmingClear(true)}
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
        )
      }
    >
      <div className="space-y-4">
        {/* Status Kondisi — GAS .cl-status-row */}
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink3">
            Status Kondisi <span className="text-red">*</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITIONS.map((c) => {
              const active = payload.status === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setPayload({ ...payload, status: c.value })}
                  className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-2 py-2 text-[11px] font-bold leading-tight transition-all"
                  style={{
                    background: active ? c.bg : "#fff",
                    borderColor: active ? c.border : "var(--line)",
                    color: active ? c.text : "var(--ink3)",
                    boxShadow: active ? `0 0 0 2px ${c.border}33` : "none",
                  }}
                >
                  <span aria-hidden className="text-base leading-none">
                    {c.icon}
                  </span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kerusakan — GAS #detKerusakanGroup (hanya saat rr / rb) */}
        {showKerusakan && (
          <div className="space-y-3 rounded-lg border border-line bg-[#fffbf5] p-3.5">
            <GroupedSelect
              label="🔧 Jenis Kerusakan"
              value={payload.jenis_kerusakan || ""}
              placeholder="— Pilih Jenis Kerusakan —"
              groups={JENIS_KERUSAKAN}
              onChange={(v) => setPayload({ ...payload, jenis_kerusakan: v })}
            />
            <div className="flex flex-col gap-1.5">
              <label className={FIELD_LABEL}>📝 Uraian Kerusakan</label>
              <textarea
                value={payload.uraian_kerusakan || ""}
                onChange={(e) =>
                  setPayload({ ...payload, uraian_kerusakan: e.target.value })
                }
                placeholder="Deskripsikan kerusakan secara detail..."
                rows={2}
                className={`${FIELD_CONTROL} resize-y`}
              />
            </div>
          </div>
        )}

        {/* Tindakan — GAS #detTindakanGroup, selalu tampil */}
        <div className="space-y-2">
          <GroupedSelect
            label="🛠️ Tindakan Perbaikan / Penanganan"
            value={payload.jenis_tindakan || ""}
            placeholder="— Pilih Tindakan —"
            groups={JENIS_TINDAKAN}
            onChange={(v) => setPayload({ ...payload, jenis_tindakan: v })}
          />
          <textarea
            value={payload.uraian_tindakan || ""}
            onChange={(e) =>
              setPayload({ ...payload, uraian_tindakan: e.target.value })
            }
            placeholder="Uraian tindakan yang telah atau akan dilakukan..."
            rows={2}
            aria-label="Uraian tindakan"
            className={`${FIELD_CONTROL} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="👤 Petugas Pemeriksa"
            value={payload.petugas || ""}
            onChange={(e) =>
              setPayload({ ...payload, petugas: e.target.value })
            }
            placeholder="Nama petugas"
          />
          <Input
            label="📋 No. Laporan"
            value={payload.no_laporan || ""}
            onChange={(e) =>
              setPayload({ ...payload, no_laporan: e.target.value })
            }
            placeholder="Opsional"
            className="font-mono"
          />
        </div>

        {/* Riwayat — GAS #detLogWrap / .cl-log-list */}
        {history.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className={FIELD_LABEL}>📜 Riwayat Pemeriksaan</label>
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-line bg-[#f8fafc] p-2">
              {history.map((h) => {
                const cond = CONDITIONS.find((c) => c.value === h.payload.status);
                const detail =
                  h.payload.jenis_kerusakan ||
                  h.payload.jenis_tindakan ||
                  h.payload.uraian_kerusakan ||
                  "";
                return (
                  <li
                    key={h.dateKey}
                    className="flex flex-wrap items-center gap-2 rounded border border-line bg-white px-2 py-1.5 text-[11px]"
                  >
                    <span className="font-mono text-ink3">{h.dateKey}</span>
                    {cond && (
                      <span
                        className="rounded px-1.5 py-px font-bold"
                        style={{ background: cond.bg, color: cond.text }}
                      >
                        {cond.icon} {cond.label}
                      </span>
                    )}
                    {detail && (
                      <span className="min-w-0 flex-1 truncate text-ink2">
                        {detail}
                      </span>
                    )}
                    {h.payload.petugas && (
                      <span className="text-ink3">👤 {h.payload.petugas}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
