"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useIsClient } from "@/lib/use-is-client";
import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

const SEGMENTS = [
  { key: "baik", label: "Baik", color: "var(--success)" },
  { key: "rr", label: "Rusak ringan", color: "var(--warning)" },
  { key: "rb", label: "Rusak berat", color: "var(--danger)" },
  { key: "ta", label: "Tidak aktif", color: "var(--text-3)" },
] as const;

export type KondisiKey = (typeof SEGMENTS)[number]["key"];

/** Tinggi tetap donat — dipakai chart & placeholder pra-hidrasi. */
const CHART_HEIGHT = 260;

type DonutDatum = { key: KondisiKey; name: string; value: number };

/** Tooltip minimal: kartu permukaan, border 1px, angka mono. */
function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ name?: string | number; value?: number | string }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const value = Number(item.value ?? 0);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="whitespace-nowrap rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-2">
      {item.name}:{" "}
      <span className="font-mono tabular-nums text-foreground">{value}</span> (
      <span className="font-mono tabular-nums">{pct}%</span>)
    </div>
  );
}

/**
 * Donat kondisi aset via Recharts PieChart (donut innerRadius).
 * Chart dirender hanya setelah hidrasi (useIsClient) — sebelum itu
 * placeholder setinggi chart supaya layout tidak lompat.
 * Tetap punya ringkasan aria-label + tabel sr-only sebagai teks alternatif.
 */
export function DonutKondisi({
  counts,
}: {
  counts: Record<KondisiKey, number>;
}) {
  const isClient = useIsClient();
  const total = SEGMENTS.reduce((s, seg) => s + (counts[seg.key] ?? 0), 0);

  if (total === 0) {
    return (
      <WidgetCard title="Kondisi Aset" action={<WidgetLink href="/laporan" label="Lihat laporan" />}>
        <WidgetEmpty message="Belum ada data item." />
      </WidgetCard>
    );
  }

  // Irisan pie: lewati nilai 0 supaya tooltip tidak menampilkan irisan kosong.
  const data: DonutDatum[] = SEGMENTS.map((seg) => ({
    key: seg.key,
    name: seg.label,
    value: counts[seg.key] ?? 0,
  })).filter((d) => d.value > 0);

  const summary = SEGMENTS.map(
    (seg) => `${counts[seg.key] ?? 0} ${seg.label.toLowerCase()}`
  ).join(", ");

  const chart = (
    <div
      role="img"
      aria-label={`Ringkasan kondisi ${total} item: ${summary}`}
      className="relative w-full"
      style={{ height: CHART_HEIGHT }}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            cornerRadius={3}
            stroke="none"
            /* Animasi dimatikan: ResponsiveContainer memicu ulang animasi
               tiap resize — donat "menghilang" sesaat. */
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell
                key={d.key}
                fill={SEGMENTS.find((seg) => seg.key === d.key)?.color}
                fillOpacity={d.key === "ta" ? 0.4 : 1}
              />
            ))}
          </Pie>
          <Tooltip
            content={<DonutTooltip total={total} />}
            cursor={false}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Teks tengah di atas ResponsiveContainer (absolute overlay). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="font-mono text-[26px] font-bold leading-none tabular-nums text-foreground">
          {total}
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-text-3">
          item
        </span>
      </div>
    </div>
  );

  return (
    <WidgetCard title="Kondisi Aset" action={<WidgetLink href="/laporan" label="Lihat laporan" />}>
      {!isClient ? (
        // Placeholder pra-hidrasi: tinggi sama, tanpa markup chart.
        <div
          aria-hidden="true"
          className="mx-auto max-w-full rounded-full bg-surface-subtle"
          style={{ height: CHART_HEIGHT, width: CHART_HEIGHT }}
        />
      ) : (
        chart
      )}

      {/* Legenda: titik warna + label + hitungan. */}
      <ul className="mt-3 grid list-none grid-cols-2 gap-x-5 gap-y-1.5 p-0">
        {SEGMENTS.map((seg) => (
          <li
            key={seg.key}
            className="flex min-w-0 items-center gap-2 text-[12px] text-text-2"
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{
                background: seg.color,
                opacity: seg.key === "ta" ? 0.4 : 1,
              }}
            />
            <span className="flex-1 truncate">{seg.label}</span>
            <span className="shrink-0 font-mono text-[12px] tabular-nums text-foreground">
              {counts[seg.key] ?? 0}
            </span>
          </li>
        ))}
      </ul>

      {/* Teks alternatif donat untuk pembaca layar */}
      <table className="sr-only">
        <caption>Ringkasan kondisi {total} item</caption>
        <tbody>
          {SEGMENTS.map((seg) => (
            <tr key={seg.key}>
              <th scope="row">{seg.label}</th>
              <td>{counts[seg.key] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  );
}
