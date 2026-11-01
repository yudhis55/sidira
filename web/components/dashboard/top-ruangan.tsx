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
 * Warna diambil dari design token globals.css. Atribut SVG Recharts
 * menerima `var(...)`, jadi tidak ada hex yang di-hardcode di sini.
 */
const DANGER = "var(--danger)";
const TRACK = "var(--surface-subtle)";
const TEXT_2 = "var(--text-2)";
const FONT_MONO = "var(--font-mono)";

/** Lebar sumbu kategori — cukup untuk nama ruangan panjang (mis. "POLINDES PAKIS"). */
const Y_AXIS_WIDTH = 136;
const ROW_HEIGHT = 44;

type BarDatum = {
  name: string;
  pct: number;
  perhatian: number;
  total: number;
};

/** Tooltip minimal: kartu permukaan, border 1px, angka mono. */
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
    <div className="whitespace-nowrap rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-2">
      <strong className="font-semibold text-foreground">{d.name}</strong>:{" "}
      <span className="font-mono tabular-nums">{d.pct}%</span> perlu perhatian (
      <span className="font-mono tabular-nums">{d.perhatian}</span> dari{" "}
      <span className="font-mono tabular-nums">{d.total}</span> item)
    </div>
  );
}

/**
 * Label % di ujung bar — mono 11px, warna danger mengikuti bar.
 */
type PctLabelProps = {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
};

function PctLabel({ x, y, width, height, value }: PctLabelProps) {
  if (x == null || y == null || width == null) return null;
  const h = height != null ? Number(height) : ROW_HEIGHT;
  return (
    <text
      x={Number(x) + Number(width) + 6}
      y={Number(y) + h / 2 + 4}
      textAnchor="start"
      fontSize={11}
      fontWeight={700}
      fontFamily={FONT_MONO}
      fill={DANGER}
    >
      {Number(value)}%
    </text>
  );
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
      action={<WidgetLink href="/inventaris" label="Lihat semua" />}
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

            if (!isClient) {
              return (
                <div
                  aria-hidden="true"
                  className="rounded-md bg-surface-subtle"
                  style={{ height }}
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
                      fontSize: 11,
                      fill: TEXT_2,
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
                    background={{ fill: TRACK }}
                  >
                    {data.map((d, i) => (
                      <Cell key={rows[i]?.roomId ?? i} fill={DANGER} />
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
