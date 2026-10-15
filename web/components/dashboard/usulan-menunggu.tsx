import { USULAN_PRIORITAS_LABELS } from "@/lib/usulan-types";
import type { UsulanPrioritas } from "@/lib/usulan-types";
import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

export interface UsulanMenungguRow {
  usulanId: number;
  roomName: string;
  nama: string;
  prioritas: UsulanPrioritas;
  qty: number;
  satuan: string;
}

const PRIORITAS_STYLE: Record<UsulanPrioritas, { bg: string; color: string }> = {
  mendesak: { bg: "#fef3c7", color: "#92400e" },
  penting: { bg: "var(--blue2)", color: "var(--blue)" },
  rencana: { bg: "var(--slate2)", color: "var(--slate)" },
};

/**
 * Usulan berstatus "diajukan" (= menunggu persetujuan), maks 5.
 */
export function UsulanMenunggu({
  rows,
  hasMore,
}: {
  rows: UsulanMenungguRow[];
  hasMore: boolean;
}) {
  return (
    <WidgetCard
      title="Usulan Menunggu"
      action={
        hasMore ? (
          <WidgetLink href="/usulan" label="Lihat semua →" />
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        <WidgetEmpty message="Tidak ada usulan menunggu." />
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
          {rows.map((row, i) => {
            const style = PRIORITAS_STYLE[row.prioritas];
            return (
              <li
                key={`${row.usulanId}-${i}`}
                style={{
                  padding: "7px 4px",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <a
                  href={`/usulan/${row.usulanId}`}
                  aria-label={`Usulan ${row.nama} dari ${row.roomName}, prioritas ${row.prioritas}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        background: style.bg,
                        color: style.color,
                      }}
                    >
                      {USULAN_PRIORITAS_LABELS[row.prioritas]}
                    </span>
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "var(--ink)",
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.nama} × {row.qty} {row.satuan}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11.5px",
                      color: "var(--ink3)",
                      marginTop: "3px",
                    }}
                  >
                    {row.roomName}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
