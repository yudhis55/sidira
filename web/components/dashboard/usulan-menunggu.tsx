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

const PRIORITAS_CLASS: Record<UsulanPrioritas, string> = {
  mendesak: "bg-danger-soft text-danger",
  penting: "bg-warning-soft text-warning",
  rencana: "bg-surface-muted text-text-2",
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
        hasMore ? <WidgetLink href="/usulan" label="Lihat semua" /> : undefined
      }
    >
      {rows.length === 0 ? (
        <WidgetEmpty message="Tidak ada usulan menunggu." />
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {rows.map((row, i) => (
            <li
              key={`${row.usulanId}-${i}`}
              className="border-b border-border last:border-b-0"
            >
              <a
                href={`/usulan/${row.usulanId}`}
                aria-label={`Usulan ${row.nama} dari ${row.roomName}, prioritas ${row.prioritas}`}
                className="block py-2.5 text-inherit no-underline"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${PRIORITAS_CLASS[row.prioritas]}`}
                  >
                    {USULAN_PRIORITAS_LABELS[row.prioritas]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                    {row.nama} × {row.qty} {row.satuan}
                  </span>
                </span>
                <span className="mt-0.5 block text-[11px] text-text-3">
                  {row.roomName}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
