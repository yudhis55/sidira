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
  { key: "mendesak", label: "Mendesak" },
  { key: "penting", label: "Penting" },
  { key: "rencana", label: "Rencana" },
  { key: "diajukan", label: "Diajukan" },
  { key: "disetujui", label: "Disetujui" },
];

const KAT_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: "alkes", label: "Alkes" },
  { value: "meubelair", label: "Meubelair" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

const PRIO_OPTIONS: { value: UsulanPrioritas; label: string }[] = [
  { value: "mendesak", label: "Mendesak" },
  { value: "penting", label: "Penting" },
  { value: "rencana", label: "Rencana" },
];

const STATUS_OPTIONS: { value: UsulanStatus; label: string }[] = [
  { value: "diajukan", label: "Diajukan" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
  { value: "proses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

const KAT_LABELS: Record<ItemCategory, string> = {
  alkes: "Alkes",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

/** GAS `.uprio-*` — warna select prioritas mengikuti nilainya. */
const PRIO_TINT: Record<UsulanPrioritas, CSSProperties> = {
  mendesak: {
    background: "var(--danger-soft)",
    color: "var(--danger)",
    borderColor: "transparent",
  },
  penting: {
    background: "var(--warning-soft)",
    color: "var(--warning)",
    borderColor: "transparent",
  },
  rencana: {
    background: "var(--info-soft)",
    color: "var(--info)",
    borderColor: "transparent",
  },
};

/** GAS `.ustatus-*`. */
const STATUS_TINT: Record<UsulanStatus, CSSProperties> = {
  diajukan: {
    background: "var(--warning-soft)",
    color: "var(--warning)",
    borderColor: "transparent",
  },
  disetujui: {
    background: "var(--success-soft)",
    color: "var(--success)",
    borderColor: "transparent",
  },
  ditolak: {
    background: "var(--danger-soft)",
    color: "var(--danger)",
    borderColor: "transparent",
  },
  proses: {
    background: "var(--info-soft)",
    color: "var(--info)",
    borderColor: "transparent",
  },
  selesai: {
    background: "var(--primary-soft)",
    color: "var(--primary)",
    borderColor: "transparent",
  },
};

/* ── Gaya sel (GAS .usulan-tbl input/select/textarea) ── */

const CELL: CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};

const FIELD: CSSProperties = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 12.5,
  padding: "5px 8px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--foreground)",
  outline: "none",
};

const TINTED_SELECT: CSSProperties = {
  ...FIELD,
  fontWeight: 600,
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

type SummaryTone = "violet" | "danger" | "warning" | "info" | "success";

const SUMMARY_TONE: Record<SummaryTone, { fg: string; bg: string; tile: string }> = {
  violet: {
    fg: "var(--violet)",
    bg: "var(--surface)",
    tile: "var(--violet2)",
  },
  danger: { fg: "var(--danger)", bg: "var(--surface)", tile: "var(--danger-soft)" },
  warning: { fg: "var(--warning)", bg: "var(--surface)", tile: "var(--warning-soft)" },
  info: { fg: "var(--info)", bg: "var(--surface)", tile: "var(--info-soft)" },
  success: { fg: "var(--success)", bg: "var(--surface)", tile: "var(--success-soft)" },
};

function SummaryCard({
  tone,
  value,
  label,
}: {
  tone: SummaryTone;
  value: number;
  label: string;
}) {
  const t = SUMMARY_TONE[tone];
  return (
    <div
      style={{
        flex: 1,
        minWidth: 120,
        padding: "9px 13px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 9,
        background: t.bg,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: t.tile,
          flexShrink: 0,
        }}
        aria-hidden
      />
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1,
            color: "var(--foreground)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-3)",
            fontWeight: 600,
            marginTop: 3,
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
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
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
          padding: "10px 16px",
          background: "var(--surface)",
          borderBottom: collapsed ? "none" : "1px solid var(--border)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--violet)",
            flexShrink: 0,
          }}
          aria-hidden
        />

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          Usulan Sarana Prasarana &amp; Alkes
        </span>

        <span
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontWeight: 600,
            marginLeft: 4,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {total} usulan
        </span>

        {/* GAS mewarnai badge ini merah saat ada usulan mendesak (~22178). */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            background: mendesak > 0 ? "var(--danger-soft)" : "var(--surface-muted)",
            color: mendesak > 0 ? "var(--danger)" : "var(--text-3)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {mendesak} mendesak
        </span>

        <span
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            marginLeft: 6,
            transition: "transform 0.2s",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
        </span>
      </div>

      {/* ── Body (GAS .usulan-body) ── */}
      {!collapsed && (
        <div style={{ background: "var(--surface)", padding: "14px 16px" }}>
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
                <SummaryCard tone="violet" value={total} label="Total Usulan" />
                <SummaryCard tone="danger" value={mendesak} label="Mendesak" />
                <SummaryCard tone="warning" value={penting} label="Penting" />
                <SummaryCard tone="info" value={rencana} label="Rencana" />
                <SummaryCard tone="success" value={disetujui} label="Disetujui" />
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
                        padding: "5px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${isActive ? "transparent" : "var(--border)"}`,
                        background: isActive ? "var(--primary)" : "var(--surface)",
                        color: isActive ? "var(--primary-foreground)" : "var(--text-2)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "background-color 0.15s, color 0.15s",
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
                    padding: "5px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--foreground)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Export CSV
                </button>
              </div>

              {/* ── Tabel (GAS .usulan-tbl) ── */}
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: "var(--r2, 8px)",
                  border: "1px solid var(--border)",
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
                    <tr style={{ background: "var(--surface-muted)" }}>
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
                            fontWeight: 600,
                            color: "var(--text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            borderBottom: "1px solid var(--border)",
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
                            fontWeight: 600,
                            color: "var(--text-3)",
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
                            color: "var(--text-2)",
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
                              border: "1px solid transparent",
                              background: "transparent",
                              color: "var(--text-3)",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                          >
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
                            color: "var(--text-3)",
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
                color: "var(--text-3)",
              }}
            >
              <div>Belum ada usulan untuk ruangan ini.</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
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
              borderRadius: "var(--radius-sm)",
              border: "1px dashed var(--border)",
              background: "var(--surface)",
              color: "var(--text-2)",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
         > Tambah Usulan Baru
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
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, color: "var(--foreground)" }}>
            Hapus Usulan
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
            {roomName}
          </div>
        </div>
        <div style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-2)" }}>
          Hapus <strong>{pendingDelete?.nama || "usulan ini"}</strong> dari
          daftar usulan? Tindakan ini tidak dapat dibatalkan.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 20px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--foreground)",
              fontSize: 13,
              fontWeight: 600,
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
              height: 36,
              padding: "0 16px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "var(--danger)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Hapus
          </button>
        </div>
      </Dialog>
    </div>
  );
}
