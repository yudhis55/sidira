"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsClient } from "@/lib/use-is-client";
import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

export interface TopRuanganRow {
  roomId: string;
  roomName: string;
  roomIcon: string;
  total: number;
  perhatian: number;
  pct: number;
}

/**
 * Hex dari var token globals.css — atribut SVG Recharts tidak bisa pakai
 * CSS var secara andalan, jadi nilai yang sama di-hardcode di sini.
 * --red #b91c1c · --amber #b45309 · --line2 #f0f4f8 · --ink2 #2d3f50
 */
const RED = "#b91c1c";
const AMBER = "#b45309";
const LINE2 = "#f0f4f8";
const INK2 = "#2d3f50";
const FONT_MONO = "'JetBrains Mono', monospace";

/** Lebar sumbu kategori — cukup untuk nama ruangan panjang (mis. "POLINDES PAKIS"). */
const Y_AXIS_WIDTH = 136;
const ROW_HEIGHT = 44;

type BarDatum = {
  name: string;
  pct: number;
  perhatian: number;
  total: number;
};

/** Tooltip minimal: kartu putih kecil, border tipis, teks Indonesia faktual. */
function RuanganTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: BarDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8ef",
        borderRadius: "8px",
        padding: "6px 10px",
        fontSize: "12px",
        color: "#0f1923",
        whiteSpace: "nowrap",
      }}
    >
      <strong>{d.name}</strong>: {d.pct}% perlu perhatian ({d.perhatian} dari{" "}
      {d.total} item)
    </div>
  );
}

/**
 * Label % di ujung bar — warna mengikuti tingkat keparahan baris
 * (merah ≥50%, amber di bawahnya), font mono agar match kartu lain.
 */
type PctLabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
  index?: number;
};

function makePctLabel(rows: TopRuanganRow[]) {
  return function PctLabel({
    x,
    y,
    width,
    height,
    value,
    index,
  }: PctLabelProps) {
    if (x == null || y == null || width == null) return null;
    const row = rows[index ?? -1];
    if (!row) return null;
    const h = height != null ? Number(height) : ROW_HEIGHT;
    return (
      <text
        x={Number(x) + Number(width) + 6}
        y={Number(y) + h / 2 + 4}
        textAnchor="start"
        fontSize={11.5}
        fontWeight={700}
        fontFamily={FONT_MONO}
        fill={row.pct >= 50 ? RED : AMBER}
      >
        {Number(value)}%
      </text>
    );
  };
}

/**
 * 5 ruangan dengan % item perlu perhatian (rr+rb+ta) tertinggi —
 * Recharts BarChart layout="vertical", bar rounded, track abu di belakang.
 * Chart dirender hanya setelah hidrasi (useIsClient); sebelum itu
 * placeholder setinggi chart supaya layout tidak lompat.
 * Tautan ke halaman ruangan dipertahankan sebagai daftar sr-only.
 */
export function TopRuangan({ rows }: { rows: TopRuanganRow[] }) {
  const isClient = useIsClient();

  return (
    <WidgetCard
      title="Ruangan Perlu Perhatian"
      action={<WidgetLink href="/inventaris" label="Lihat semua →" />}
    >
      {rows.length === 0 ? (
        <WidgetEmpty message="Belum ada data inventaris per ruangan." />
      ) : (
        <>
          {(() => {
            const data: BarDatum[] = rows.map((r) => ({
              name: r.roomName,
              pct: r.pct,
              perhatian: r.perhatian,
              total: r.total,
            }));
            const height = rows.length * ROW_HEIGHT + 16;
            const PctLabel = makePctLabel(rows);

            if (!isClient) {
              return (
                <div
                  aria-hidden="true"
                  style={{
                    height,
                    borderRadius: "8px",
                    background: "var(--line2)",
                  }}
                />
              );
            }

            return (
              <ResponsiveContainer width="100%" height={height}>
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 4, right: 44, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={Y_AXIS_WIDTH}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fontSize: 10.5,
                      fill: INK2,
                      fontFamily: FONT_MONO,
                    }}
                    tickFormatter={(v: string) =>
                      v.length > 20 ? `${v.slice(0, 19)}…` : v
                    }
                  />
                  <Tooltip content={<RuanganTooltip />} cursor={false} />
                  <Bar
                    dataKey="pct"
                    barSize={14}
                    radius={[0, 4, 4, 0]}
                    /* Animasi dimatikan: ResponsiveContainer memicu ulang
                       animasi tiap resize — bar "menghilang" sesaat. */
                    isAnimationActive={false}
                    background={{ fill: LINE2 }}
                  >
                    {data.map((d, i) => (
                      <Cell
                        key={rows[i]?.roomId ?? i}
                        fill={d.pct >= 50 ? RED : AMBER}
                      />
                    ))}
                    <LabelList dataKey="pct" content={<PctLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}

          {/* Tautan per ruangan (navigasi + pembaca layar) — visual bar di atas. */}
          <ul className="sr-only">
            {rows.map((row) => (
              <li key={row.roomId}>
                <a href={`/inventaris/${row.roomId}`}>
                  {row.roomName}: {row.perhatian} dari {row.total} item perlu
                  perhatian ({row.pct} persen)
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </WidgetCard>
  );
}
