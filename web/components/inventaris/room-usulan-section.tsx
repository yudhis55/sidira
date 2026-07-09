"use client";

import { useState, useMemo, useCallback } from "react";
import type { Usulan, UsulanItem, UsulanPrioritas } from "@/lib/usulan-types";
import type { ItemCategory } from "@/types/database";

interface RoomUsulanSectionProps {
  roomId: string;
  roomName: string;
  usulanList: Usulan[];
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

const KAT_ICONS: Record<ItemCategory, string> = {
  alkes: "🩺",
  meubelair: "🪑",
  elektronik: "💻",
  lainnya: "📦",
};

const KAT_LABELS: Record<ItemCategory, string> = {
  alkes: "Alkes",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

function fmtDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── GAS-exact badge components ── */

function PrioBadge({ prio }: { prio: UsulanPrioritas }) {
  const styles: Record<
    UsulanPrioritas,
    { bg: string; color: string; border: string; label: string }
  > = {
    mendesak: {
      bg: "#fee2e2",
      color: "#b91c1c",
      border: "#fca5a5",
      label: "🔴 Mendesak",
    },
    penting: {
      bg: "#fef3c7",
      color: "#92400e",
      border: "#fcd34d",
      label: "🟡 Penting",
    },
    rencana: {
      bg: "#dbeafe",
      color: "#1e40af",
      border: "#93c5fd",
      label: "🔵 Rencana",
    },
  };
  const s = styles[prio] || styles.penting;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 10,
        fontSize: "10.5px",
        fontWeight: 700,
        whiteSpace: "nowrap",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

function UStatusBadge({ status }: { status: string }) {
  const styles: Record<
    string,
    { bg: string; color: string; border: string; label: string }
  > = {
    diajukan: {
      bg: "#fef9c3",
      color: "#854d0e",
      border: "#fde047",
      label: "📤 Diajukan",
    },
    disetujui: {
      bg: "#dcfce7",
      color: "#166534",
      border: "#86efac",
      label: "✅ Disetujui",
    },
    ditolak: {
      bg: "#fee2e2",
      color: "#b91c1c",
      border: "#fca5a5",
      label: "❌ Ditolak",
    },
    proses: {
      bg: "#e0f2fe",
      color: "#0369a1",
      border: "#7dd3fc",
      label: "🔄 Diproses",
    },
    selesai: {
      bg: "#d4f0eb",
      color: "#0e7c6b",
      border: "#6ee7b7",
      label: "🎉 Selesai",
    },
  };
  const s = styles[status] || styles.diajukan;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 10,
        fontSize: "10.5px",
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
}

function UKatBadge({ kat }: { kat: ItemCategory }) {
  const styles: Record<
    ItemCategory,
    { bg: string; color: string }
  > = {
    alkes: { bg: "#d4f0eb", color: "#0e7c6b" },
    meubelair: { bg: "#fef3c7", color: "#92400e" },
    elektronik: { bg: "#dbeafe", color: "#1e40af" },
    lainnya: { bg: "#f1f5f9", color: "#475569" },
  };
  const s = styles[kat] || styles.lainnya;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 8,
        fontSize: "10.5px",
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {KAT_ICONS[kat]} {KAT_LABELS[kat]}
    </span>
  );
}

/* ── CSV export helper ── */

function buildCsv(
  items: { item: UsulanItem; usulanDate: string }[],
  roomName: string
) {
  const headers = [
    "No",
    "Nama Barang",
    "Kategori",
    "Jumlah",
    "Satuan",
    "Prioritas",
    "Status",
    "Keterangan",
    "Tgl Diajukan",
  ];
  const rows = items.map(({ item, usulanDate }, i) =>
    [
      i + 1,
      item.nama,
      KAT_LABELS[item.kategori] || item.kategori,
      item.qty,
      item.satuan,
      item.prioritas,
      item.status,
      item.keterangan || "",
      fmtDate(usulanDate),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Usulan_${roomName.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Main component ── */

export function RoomUsulanSection({
  roomId,
  roomName,
  usulanList,
}: RoomUsulanSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Flatten all usulan items for this room
  const allItems = useMemo(() => {
    const flat: { item: UsulanItem; usulanId: number; usulanDate: string }[] =
      [];
    for (const u of usulanList) {
      for (const it of u.payload?.items || []) {
        flat.push({ item: it, usulanId: u.id, usulanDate: u.created_at });
      }
    }
    return flat;
  }, [usulanList]);

  const totalItems = allItems.length;
  const mendesakCount = allItems.filter(
    ({ item }) => item.prioritas === "mendesak"
  ).length;

  // Filter logic: priority filters match on item.prioritas, status filters match on item.status
  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return allItems;
    const prioFilters = ["mendesak", "penting", "rencana"];
    if (prioFilters.includes(activeFilter)) {
      return allItems.filter(({ item }) => item.prioritas === activeFilter);
    }
    return allItems.filter(({ item }) => item.status === activeFilter);
  }, [allItems, activeFilter]);

  const handleExport = useCallback(() => {
    buildCsv(filteredItems, roomName);
  }, [filteredItems, roomName]);

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
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #4c1d9518, #7c3aed22)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #4c1d9510, #7c3aed15)";
        }}
      >
        {/* Purple dot */}
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#7c3aed",
            flexShrink: 0,
          }}
        />

        {/* Label */}
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

        {/* Total badge */}
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
          {totalItems} usulan
        </span>

        {/* Mendesak badge (ml-auto) */}
        {mendesakCount > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: 20,
              background: "#7c3aed",
              color: "#fff",
            }}
          >
            {mendesakCount} mendesak
          </span>
        )}

        {/* If no mendesak, still need spacer for chevron */}
        {mendesakCount === 0 && <span style={{ marginLeft: "auto" }} />}

        {/* Chevron */}
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
          {totalItems === 0 ? (
            /* Empty state (GAS .usulan-empty) */
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div>Belum ada usulan untuk ruangan ini.</div>
            </div>
          ) : (
            <>
              {/* ── Toolbar (GAS .usulan-toolbar) ── */}
              <div
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

                {/* Export CSV button (GAS .usulan-export-btn) */}
                <button
                  type="button"
                  onClick={handleExport}
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
                    transition: "0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#7c3aed";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ede9fe";
                    e.currentTarget.style.color = "#6d28d9";
                  }}
                >
                  ⬇ Export CSV
                </button>
              </div>

              {/* ── Table (GAS .usulan-tbl) ── */}
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
                          ["Kategori", 100, "left"],
                          ["Jumlah Diusulkan", 90, "center"],
                          ["Satuan", 110, "left"],
                          ["Prioritas", 110, "left"],
                          ["Status", 110, "left"],
                          ["Alasan / Justifikasi", 200, "left"],
                          ["Keterangan Tambahan", 150, "left"],
                          ["Tgl Diajukan", 110, "left"],
                          ["", 36, "center"],
                        ] as [string, number, string][]
                      ).map(([label, minW, align]) => (
                        <th
                          key={label || "action"}
                          style={{
                            padding: "9px 10px",
                            textAlign: align as React.CSSProperties["textAlign"],
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
                    {filteredItems.map(({ item, usulanDate }, idx) => (
                      <tr
                        key={`${item.nama}-${idx}`}
                        style={{ transition: "background 0.1s" }}
                        onMouseEnter={(e) => {
                          e.currentTarget
                            .querySelectorAll("td")
                            .forEach((td) => {
                              (td as HTMLElement).style.background = "#faf5ff";
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget
                            .querySelectorAll("td")
                            .forEach((td) => {
                              (td as HTMLElement).style.background = "";
                            });
                        }}
                      >
                        {/* No */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#7c3aed",
                            fontSize: 12,
                          }}
                        >
                          {idx + 1}
                        </td>

                        {/* Nama Barang */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            fontWeight: 600,
                          }}
                        >
                          {item.nama}
                        </td>

                        {/* Kategori */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <UKatBadge kat={item.kategori} />
                        </td>

                        {/* Jumlah */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            textAlign: "center",
                            fontWeight: 700,
                          }}
                        >
                          {item.qty}
                        </td>

                        {/* Satuan */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          {item.satuan}
                        </td>

                        {/* Prioritas */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <PrioBadge prio={item.prioritas} />
                        </td>

                        {/* Status */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <UStatusBadge status={item.status} />
                        </td>

                        {/* Alasan / Justifikasi */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          {item.keterangan || "—"}
                        </td>

                        {/* Keterangan Tambahan */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          —
                        </td>

                        {/* Tgl Diajukan */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDate(usulanDate)}
                        </td>

                        {/* Action (delete) */}
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #f3f4f6",
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            title="Hapus usulan"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid #fca5a5",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              fontSize: 12,
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

                    {filteredItems.length === 0 && (
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
        </div>
      )}
    </div>
  );
}
