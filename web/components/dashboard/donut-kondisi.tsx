"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useIsClient } from "@/lib/use-is-client";
import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

const SEGMENTS = [
  { key: "baik", label: "Baik", color: "var(--teal)" },
  { key: "rr", label: "Rusak ringan", color: "var(--amber)" },
  { key: "rb", label: "Rusak berat", color: "var(--red)" },
  { key: "ta", label: "Tidak aktif", color: "var(--slate)" },
] as const;

export type KondisiKey = (typeof SEGMENTS)[number]["key"];

/**
 * Hex dari var token globals.css — atribut SVG Recharts tidak bisa pakai
 * CSS var secara andalan, jadi nilai yang sama di-hardcode di sini.
 * --teal #0e7c6b · --amber #b45309 · --red #b91c1c · --slate #475569
 */
const SEGMENT_HEX: Record<KondisiKey, string> = {
  baik: "#0e7c6b",
  rr: "#b45309",
  rb: "#b91c1c",
  ta: "#475569",
};

const INK = "#0f1923";
const LINE = "#e2e8ef";
const FONT_MONO = "'JetBrains Mono', monospace";

/** Tinggi tetap donat — dipakai chart & placeholder pra-hidrasi. */
const CHART_HEIGHT = 260;

type DonutDatum = { key: KondisiKey; name: string; value: number };

/** Tooltip minimal: kartu putih kecil, border tipis, teks Indonesia. */
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
    <div
      style={{
        background: "#fff",
        border: `1px solid ${LINE}`,
        borderRadius: "8px",
        padding: "6px 10px",
        fontSize: "12px",
        color: INK,
        fontFamily: FONT_MONO,
        whiteSpace: "nowrap",
      }}
    >
      {item.name}: {value} ({pct}%)
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
      <WidgetCard title="Kondisi Aset" action={<WidgetLink href="/laporan" label="Lihat laporan →" />}>
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
      style={{ position: "relative", width: "100%", height: CHART_HEIGHT }}
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
              <Cell key={d.key} fill={SEGMENT_HEX[d.key]} />
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
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 800,
            fontSize: "28px",
            lineHeight: 1.1,
            color: INK,
          }}
        >
          {total}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            color: "#5e7080",
          }}
        >
          item
        </span>
      </div>
    </div>
  );

  return (
    <WidgetCard title="Kondisi Aset" action={<WidgetLink href="/laporan" label="Lihat laporan →" />}>
      {!isClient ? (
        // Placeholder pra-hidrasi: tinggi sama, tanpa markup chart.
        <div
          aria-hidden="true"
          style={{
            height: CHART_HEIGHT,
            borderRadius: "50%",
            background: "var(--line2)",
            margin: "0 auto",
            width: CHART_HEIGHT,
            maxWidth: "100%",
          }}
        />
      ) : (
        chart
      )}

      {/* Legenda: titik warna + label + hitungan (gaya sama seperti sebelumnya). */}
      <ul
        style={{
          listStyle: "none",
          margin: "12px 0 0",
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "6px 20px",
        }}
      >
        {SEGMENTS.map((seg) => (
          <li
            key={seg.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "var(--ink2)",
              minWidth: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: SEGMENT_HEX[seg.key],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {seg.label}
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
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
