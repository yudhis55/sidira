import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

const SEGMENTS = [
  { key: "baik", label: "Baik", color: "var(--teal)" },
  { key: "rr", label: "Rusak ringan", color: "var(--amber)" },
  { key: "rb", label: "Rusak berat", color: "var(--red)" },
  { key: "ta", label: "Tidak aktif", color: "var(--slate)" },
] as const;

export type KondisiKey = (typeof SEGMENTS)[number]["key"];

/**
 * Donat kondisi aset via CSS conic-gradient (tanpa chart lib).
 * Punya ringkasan aria-label + tabel sr-only sebagai teks alternatif.
 */
export function DonutKondisi({
  counts,
}: {
  counts: Record<KondisiKey, number>;
}) {
  const total = SEGMENTS.reduce((s, seg) => s + (counts[seg.key] ?? 0), 0);

  if (total === 0) {
    return (
      <WidgetCard title="Kondisi Aset" action={<WidgetLink href="/laporan" label="Lihat laporan →" />}>
        <WidgetEmpty message="Belum ada data item." />
      </WidgetCard>
    );
  }

  const { stops } = SEGMENTS.reduce(
    (acc, seg) => {
      const v = counts[seg.key] ?? 0;
      const start = (acc.pos / total) * 100;
      const end = ((acc.pos + v) / total) * 100;
      return {
        pos: acc.pos + v,
        stops: [...acc.stops, `${seg.color} ${start}% ${end}%`],
      };
    },
    { pos: 0, stops: [] as string[] }
  );
  const gradient = stops.join(", ");

  const summary = SEGMENTS.map(
    (seg) => `${counts[seg.key] ?? 0} ${seg.label.toLowerCase()}`
  ).join(", ");

  return (
    <WidgetCard title="Kondisi Aset" action={<WidgetLink href="/laporan" label="Lihat laporan →" />}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          role="img"
          aria-label={`Ringkasan kondisi ${total} item: ${summary}`}
          style={{
            width: "112px",
            height: "112px",
            borderRadius: "50%",
            flexShrink: 0,
            background: `conic-gradient(${gradient})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontWeight: 800,
              fontSize: "20px",
              color: "var(--ink)",
            }}
          >
            {total}
          </div>
        </div>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
            minWidth: "140px",
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
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{seg.label}</span>
              <span
                style={{
                  fontFamily:
                    "var(--font-mono), 'JetBrains Mono', monospace",
                  fontWeight: 700,
                }}
              >
                {counts[seg.key] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </div>
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
