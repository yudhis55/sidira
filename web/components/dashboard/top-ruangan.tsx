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
 * 5 ruangan dengan % item perlu perhatian (rr+rb+ta) tertinggi.
 * Tiap baris menaut ke halaman inventaris ruangan tersebut.
 */
export function TopRuangan({ rows }: { rows: TopRuanganRow[] }) {
  return (
    <WidgetCard
      title="Ruangan Perlu Perhatian"
      action={<WidgetLink href="/inventaris" label="Lihat semua →" />}
    >
      {rows.length === 0 ? (
        <WidgetEmpty message="Belum ada data inventaris per ruangan." />
      ) : (
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {rows.map((row) => (
            <li key={row.roomId}>
              <a
                href={`/inventaris/${row.roomId}`}
                aria-label={`${row.roomName}: ${row.perhatian} dari ${row.total} item perlu perhatian (${row.pct} persen)`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7px 4px",
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "16px" }}>
                  {row.roomIcon}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {row.roomName}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      display: "block",
                      height: "4px",
                      borderRadius: "4px",
                      background: "var(--line)",
                      marginTop: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        width: `${row.pct}%`,
                        borderRadius: "4px",
                        background:
                          row.pct >= 50 ? "var(--red)" : "var(--amber)",
                      }}
                    />
                  </span>
                </span>
                <span
                  style={{
                    fontFamily:
                      "var(--font-mono), 'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: "12.5px",
                    color: row.pct >= 50 ? "var(--red)" : "var(--amber)",
                    flexShrink: 0,
                  }}
                >
                  {row.pct}%
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </WidgetCard>
  );
}
