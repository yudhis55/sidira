"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Dialog } from "@/components/gas/dialog";
import { useLocalStorageState } from "@/lib/use-local-storage";
import { usulanStorageKey } from "@/lib/storage-keys";
import type {
  Usulan,
  UsulanPrioritas,
  UsulanStatus,
} from "@/lib/usulan-types";
import type { ItemCategory } from "@/types/database";

interface RoomUsulanSectionProps {
  roomId: string;
  roomName: string;
  usulanList: Usulan[];
}

/** Satu baris usulan yang bisa diedit — setara item di `usulanData[roomId]` GAS. */
interface UsulanRow {
  /** Kunci stabil untuk React; GAS memakai index array. */
  id: string;
  nama: string;
  kategori: ItemCategory;
  qty: number;
  satuan: string;
  prioritas: UsulanPrioritas;
  status: UsulanStatus;
  alasan: string;
  keterangan: string;
  /** Tanggal diajukan, format dd/mm/yyyy seperti GAS. */
  tgl: string;
}

type FilterKey =
  | "all"
  | "mendesak"
  | "penting"
  | "rencana"
  | "diajukan"
  | "disetujui";

const FILTER_BUTTONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "mendesak", label: "🔴 Mendesak" },
  { key: "penting", label: "🟡 Penting" },
  { key: "rencana", label: "🔵 Rencana" },
  { key: "diajukan", label: "Diajukan" },
  { key: "disetujui", label: "✅ Disetujui" },
];

const KAT_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: "alkes", label: "🩺 Alkes" },
  { value: "meubelair", label: "🪑 Meubelair" },
  { value: "elektronik", label: "💻 Elektronik" },
  { value: "lainnya", label: "📦 Lainnya" },
];

const PRIO_OPTIONS: { value: UsulanPrioritas; label: string }[] = [
  { value: "mendesak", label: "🔴 Mendesak" },
  { value: "penting", label: "🟡 Penting" },
  { value: "rencana", label: "🔵 Rencana" },
];

const STATUS_OPTIONS: { value: UsulanStatus; label: string }[] = [
  { value: "diajukan", label: "📤 Diajukan" },
  { value: "disetujui", label: "✅ Disetujui" },
  { value: "ditolak", label: "❌ Ditolak" },
  { value: "proses", label: "🔄 Diproses" },
  { value: "selesai", label: "🎉 Selesai" },
];

const KAT_LABELS: Record<ItemCategory, string> = {
  alkes: "Alkes",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

/** GAS `.uprio-*` — warna select prioritas mengikuti nilainya. */
const PRIO_TINT: Record<UsulanPrioritas, CSSProperties> = {
  mendesak: { background: "#fee2e2", color: "#b91c1c", borderColor: "#fca5a5" },
  penting: { background: "#fef3c7", color: "#92400e", borderColor: "#fcd34d" },
  rencana: { background: "#dbeafe", color: "#1e40af", borderColor: "#93c5fd" },
};

/** GAS `.ustatus-*`. */
const STATUS_TINT: Record<UsulanStatus, CSSProperties> = {
  diajukan: { background: "#fef9c3", color: "#854d0e", borderColor: "#fde047" },
  disetujui: { background: "#dcfce7", color: "#166534", borderColor: "#86efac" },
  ditolak: { background: "#fee2e2", color: "#b91c1c", borderColor: "#fca5a5" },
  proses: { background: "#e0f2fe", color: "#0369a1", borderColor: "#7dd3fc" },
  selesai: { background: "#d4f0eb", color: "#0e7c6b", borderColor: "#6ee7b7" },
};

/* ── Gaya sel (GAS .usulan-tbl input/select/textarea) ── */

const CELL: CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "top",
};

const FIELD: CSSProperties = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 12,
  padding: "5px 8px",
  borderRadius: 6,
  border: "1.5px solid #e5e7eb",
  background: "#fff",
  color: "#111827",
  outline: "none",
};

const TINTED_SELECT: CSSProperties = {
  ...FIELD,
  fontWeight: 700,
  cursor: "pointer",
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** dd/mm/yyyy — sama dengan GAS addUsulan (toLocaleDateString id-ID). */
function fmtTgl(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Ratakan semua item usulan ruangan menjadi baris-baris yang bisa diedit. */
function seedRows(usulanList: Usulan[]): UsulanRow[] {
  const rows: UsulanRow[] = [];
  for (const u of usulanList) {
    (u.payload?.items || []).forEach((it, i) => {
      rows.push({
        id: `${u.id}-${i}`,
        nama: it.nama,
        kategori: it.kategori,
        qty: it.qty,
        satuan: it.satuan,
        prioritas: it.prioritas,
        status: it.status,
        alasan: it.alasan ?? it.keterangan ?? "",
        keterangan: it.alasan ? (it.keterangan ?? "") : "",
        tgl: fmtTgl(u.created_at),
      });
    });
  }
  return rows;
}

function exportCsv(rows: UsulanRow[], roomName: string) {
  const headers = [
    "No",
    "Nama Barang",
    "Kategori",
    "Jumlah",
    "Satuan",
    "Prioritas",
    "Status",
    "Alasan / Justifikasi",
    "Keterangan Tambahan",
    "Tgl Diajukan",
  ];
  const body = rows.map((r, i) =>
    [
      i + 1,
      r.nama,
      KAT_LABELS[r.kategori] || r.kategori,
      r.qty,
      r.satuan,
      r.prioritas,
      r.status,
      r.alasan,
      r.keterangan,
      r.tgl,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...body].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Usulan_${roomName.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Kartu ringkasan (GAS .usum-card, updateUsulanStats ~22164) ── */

function SummaryCard({
  icon,
  value,
  label,
  bg,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 120,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #ede9fe",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: bg,
      }}
    >
      <div style={{ fontSize: 20 }} aria-hidden>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color }}>
          {value}
        </div>
        <div
          style={{
            fontSize: "10.5px",
            color: "#6b7280",
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Komponen utama ── */

/**
 * Usulan Sarana Prasarana & Alkes per ruangan — port GAS renderUsulanRow /
 * addUsulan / deleteUsulan (~21962–22140). Seluruh sel dapat diedit dan
 * disimpan ke localStorage (`sidira_usulan_<roomId>`) selama fase mock.
 */
export function RoomUsulanSection({
  roomId,
  roomName,
  usulanList,
}: RoomUsulanSectionProps) {
  const seeded = useMemo(() => seedRows(usulanList), [usulanList]);
  const [rows, setRows] = useLocalStorageState<UsulanRow[]>(
    usulanStorageKey(roomId),
    seeded
  );

  const [collapsed, setCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [pendingDelete, setPendingDelete] = useState<UsulanRow | null>(null);

  const total = rows.length;
  const mendesak = rows.filter((r) => r.prioritas === "mendesak").length;
  const penting = rows.filter((r) => r.prioritas === "penting").length;
  const rencana = rows.filter((r) => r.prioritas === "rencana").length;
  const disetujui = rows.filter((r) => r.status === "disetujui").length;

  const filtered = useMemo(() => {
    if (activeFilter === "all") return rows;
    if (
      activeFilter === "mendesak" ||
      activeFilter === "penting" ||
      activeFilter === "rencana"
    ) {
      return rows.filter((r) => r.prioritas === activeFilter);
    }
    return rows.filter((r) => r.status === activeFilter);
  }, [rows, activeFilter]);

  function updateRow(id: string, patch: Partial<UsulanRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  }

  /** GAS addUsulan (~22064) — baris kosong siap ketik di akhir tabel. */
  function addRow() {
    const now = new Date();
    const row: UsulanRow = {
      id: `new-${now.getTime()}-${Math.round(performance.now())}`,
      nama: "",
      kategori: "alkes",
      qty: 1,
      satuan: "Unit",
      prioritas: "penting",
      status: "diajukan",
      alasan: "",
      keterangan: "",
      tgl: `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`,
    };
    setActiveFilter("all");
    setRows((prev) => [...prev, row]);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <div
      style={{
        marginTop: 28,
        borderRadius: "var(--r, 10px)",
        border: "2px solid #7c3aed22",
        overflow: "hidden",
      }}
    >
      {/* ── Header (GAS .usulan-header) ── */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 18px",
          background: "linear-gradient(135deg, #4c1d9510, #7c3aed15)",
          borderBottom: collapsed ? "none" : "1px solid #7c3aed22",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#7c3aed",
            flexShrink: 0,
          }}
        />

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: "#7c3aed",
          }}
        >
          📋 Usulan Sarana Prasarana &amp; Alkes
        </span>

        <span
          style={{
            fontSize: 11,
            color: "#6d28d9",
            padding: "2px 9px",
            borderRadius: 10,
            background: "#ede9fe",
            fontWeight: 700,
            marginLeft: 6,
          }}
        >
          {total} usulan
        </span>

        {/* GAS mewarnai badge ini merah saat ada usulan mendesak (~22178). */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 20,
            background: mendesak > 0 ? "#b91c1c" : "#7c3aed",
            color: "#fff",
          }}
        >
          {mendesak} mendesak
        </span>

        <span
          style={{
            fontSize: 11,
            color: "#7c3aed",
            marginLeft: 6,
            transition: "transform 0.2s",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </div>

      {/* ── Body (GAS .usulan-body) ── */}
      {!collapsed && (
        <div style={{ background: "#fff", padding: "16px 18px" }}>
          {total > 0 && (
            <>
              {/* Ringkasan 5 kartu */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <SummaryCard
                  icon="📋"
                  value={total}
                  label="Total Usulan"
                  bg="#f5f3ff"
                  color="#7c3aed"
                />
                <SummaryCard
                  icon="🔴"
                  value={mendesak}
                  label="Mendesak"
                  bg="#fef2f2"
                  color="#b91c1c"
                />
                <SummaryCard
                  icon="🟡"
                  value={penting}
                  label="Penting"
                  bg="#fffbeb"
                  color="#92400e"
                />
                <SummaryCard
                  icon="🔵"
                  value={rencana}
                  label="Rencana"
                  bg="#eff6ff"
                  color="#1e40af"
                />
                <SummaryCard
                  icon="✅"
                  value={disetujui}
                  label="Disetujui"
                  bg="#dcfce7"
                  color="#166534"
                />
              </div>

              {/* ── Toolbar (GAS .usulan-toolbar) ── */}
              <div
                className="no-print"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {FILTER_BUTTONS.map((btn) => {
                  const isActive = activeFilter === btn.key;
                  return (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setActiveFilter(btn.key)}
                      style={{
                        padding: "5px 13px",
                        borderRadius: 20,
                        border: `1.5px solid ${isActive ? "#7c3aed" : "#e5e7eb"}`,
                        background: isActive ? "#7c3aed" : "#fff",
                        color: isActive ? "#fff" : "#374151",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "0.15s",
                      }}
                    >
                      {btn.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => exportCsv(filtered, roomName)}
                  style={{
                    marginLeft: "auto",
                    padding: "5px 13px",
                    borderRadius: 8,
                    border: "1.5px solid #7c3aed44",
                    background: "#ede9fe",
                    color: "#6d28d9",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ⬇ Export CSV
                </button>
              </div>

              {/* ── Tabel (GAS .usulan-tbl) ── */}
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: "var(--r2, 8px)",
                  border: "1px solid #e5e7eb",
                  marginBottom: 12,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f5f3ff" }}>
                      {(
                        [
                          ["No", 34, "center"],
                          ["Nama Barang / Sarana", 180, "left"],
                          ["Kategori", 110, "left"],
                          ["Jumlah Diusulkan", 90, "center"],
                          ["Satuan", 90, "left"],
                          ["Prioritas", 120, "left"],
                          ["Status", 120, "left"],
                          ["Alasan / Justifikasi", 200, "left"],
                          ["Keterangan Tambahan", 150, "left"],
                          ["Tgl Diajukan", 110, "left"],
                          ["", 36, "center"],
                        ] as [string, number, CSSProperties["textAlign"]][]
                      ).map(([label, minW, align]) => (
                        <th
                          key={label || "action"}
                          className={label ? undefined : "no-print"}
                          style={{
                            padding: "9px 10px",
                            textAlign: align,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6d28d9",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            borderBottom: "2px solid #ddd6fe",
                            whiteSpace: "nowrap",
                            minWidth: minW,
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, idx) => (
                      <tr key={row.id}>
                        <td
                          style={{
                            ...CELL,
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#7c3aed",
                            fontSize: 12,
                          }}
                        >
                          {idx + 1}
                        </td>

                        {/* Nama */}
                        <td style={CELL}>
                          <input
                            type="text"
                            value={row.nama}
                            placeholder="Nama barang / sarana..."
                            onChange={(e) =>
                              updateRow(row.id, { nama: e.target.value })
                            }
                            style={{
                              ...FIELD,
                              fontWeight: 600,
                              minWidth: 160,
                            }}
                          />
                        </td>

                        {/* Kategori */}
                        <td style={CELL}>
                          <select
                            value={row.kategori}
                            aria-label="Kategori usulan"
                            onChange={(e) =>
                              updateRow(row.id, {
                                kategori: e.target.value as ItemCategory,
                              })
                            }
                            style={{ ...FIELD, cursor: "pointer" }}
                          >
                            {KAT_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Jumlah */}
                        <td style={CELL}>
                          <input
                            type="number"
                            min={1}
                            value={row.qty}
                            aria-label="Jumlah diusulkan"
                            onChange={(e) =>
                              updateRow(row.id, {
                                qty: Number(e.target.value) || 0,
                              })
                            }
                            style={{
                              ...FIELD,
                              width: 70,
                              textAlign: "center",
                              fontWeight: 700,
                            }}
                          />
                        </td>

                        {/* Satuan */}
                        <td style={CELL}>
                          <input
                            type="text"
                            value={row.satuan}
                            aria-label="Satuan"
                            onChange={(e) =>
                              updateRow(row.id, { satuan: e.target.value })
                            }
                            style={{ ...FIELD, width: 80 }}
                          />
                        </td>

                        {/* Prioritas */}
                        <td style={CELL}>
                          <select
                            value={row.prioritas}
                            aria-label="Prioritas usulan"
                            onChange={(e) =>
                              updateRow(row.id, {
                                prioritas: e.target.value as UsulanPrioritas,
                              })
                            }
                            style={{
                              ...TINTED_SELECT,
                              ...PRIO_TINT[row.prioritas],
                            }}
                          >
                            {PRIO_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Status */}
                        <td style={CELL}>
                          <select
                            value={row.status}
                            aria-label="Status usulan"
                            onChange={(e) =>
                              updateRow(row.id, {
                                status: e.target.value as UsulanStatus,
                              })
                            }
                            style={{
                              ...TINTED_SELECT,
                              ...STATUS_TINT[row.status],
                            }}
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Alasan / Justifikasi */}
                        <td style={CELL}>
                          <textarea
                            rows={2}
                            value={row.alasan}
                            placeholder="Alasan pengadaan / justifikasi kebutuhan..."
                            onChange={(e) =>
                              updateRow(row.id, { alasan: e.target.value })
                            }
                            style={{
                              ...FIELD,
                              minWidth: 180,
                              resize: "vertical",
                            }}
                          />
                        </td>

                        {/* Keterangan Tambahan */}
                        <td style={CELL}>
                          <input
                            type="text"
                            value={row.keterangan}
                            placeholder="Keterangan tambahan..."
                            onChange={(e) =>
                              updateRow(row.id, { keterangan: e.target.value })
                            }
                            style={{ ...FIELD, minWidth: 130 }}
                          />
                        </td>

                        {/* Tgl Diajukan */}
                        <td
                          style={{
                            ...CELL,
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.tgl}
                        </td>

                        {/* Hapus */}
                        <td className="no-print" style={{ ...CELL, textAlign: "center" }}>
                          <button
                            type="button"
                            title="Hapus usulan ini"
                            onClick={() => setPendingDelete(row)}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid #fca5a5",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={11}
                          style={{
                            padding: "24px 10px",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: 13,
                          }}
                        >
                          Tidak ada usulan dengan filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Empty state (GAS .usulan-empty) */}
          {total === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden>
                📋
              </div>
              <div>Belum ada usulan untuk ruangan ini.</div>
              <div style={{ fontSize: 12, color: "#c4b5fd", marginTop: 4 }}>
                Klik tombol di bawah untuk menambahkan usulan.
              </div>
            </div>
          )}

          {/* GAS .usulan-add-btn */}
          <button
            type="button"
            onClick={addRow}
            className="no-print"
            style={{
              width: "100%",
              padding: "10px 18px",
              borderRadius: 10,
              border: "1.5px dashed #c4b5fd",
              background: "#faf5ff",
              color: "#6d28d9",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            ＋ Tambah Usulan Baru
          </button>
        </div>
      )}

      {/* Konfirmasi hapus — pengganti confirm() bawaan di GAS deleteUsulan */}
      <Dialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        size="sm"
        zIndex={3600}
      >
        <div
          style={{
            padding: "18px 22px",
            background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>
            🗑 Hapus Usulan
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3 }}>
            {roomName}
          </div>
        </div>
        <div style={{ padding: "18px 22px", fontSize: 13, color: "#374151" }}>
          Hapus <strong>{pendingDelete?.nama || "usulan ini"}</strong> dari
          daftar usulan? Tindakan ini tidak dapat dibatalkan.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "14px 22px",
            borderTop: "1px solid #ede9fe",
            background: "#faf5ff",
          }}
        >
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              border: "none",
              background: "#b91c1c",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            ✕ Hapus
          </button>
        </div>
      </Dialog>
    </div>
  );
}
