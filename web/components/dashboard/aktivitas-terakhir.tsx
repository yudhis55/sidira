import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

export interface AktivitasRow {
  key: string;
  kind: "pindah" | "sbbk";
  text: string;
  ts: string;
}

/** Tanggal relatif Bahasa Indonesia; fallback dd/mm/yyyy bila lama. */
export function formatRelatif(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffHari = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffHari <= 0) return "Hari ini";
  if (diffHari === 1) return "Kemarin";
  if (diffHari < 30) return `${diffHari} hari lalu`;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/**
 * Gabungan riwayat pindah + SBBK terbaru, maks 7, urut waktu menurun.
 * Tidak menampilkan user_id mentah.
 */
export function AktivitasTerakhir({ rows }: { rows: AktivitasRow[] }) {
  return (
    <WidgetCard
      title="Aktivitas Terakhir"
      action={<WidgetLink href="/riwayat" label="Lihat riwayat →" />}
    >
      {rows.length === 0 ? (
        <WidgetEmpty message="Belum ada aktivitas tercatat." />
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {rows.map((row) => (
            <li
              key={row.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "7px 4px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  flexShrink: 0,
                  background:
                    row.kind === "pindah" ? "var(--blue2)" : "var(--teal3)",
                }}
              >
                {row.kind === "pindah" ? "⇄" : "🧾"}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                  }}
                >
                  {row.text}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "var(--ink3)",
                    marginTop: "2px",
                  }}
                >
                  {formatRelatif(row.ts)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
