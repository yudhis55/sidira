import { ArrowsLeftRightIcon, ReceiptIcon } from "@phosphor-icons/react/ssr";
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
      action={<WidgetLink href="/riwayat" label="Lihat riwayat" />}
    >
      {rows.length === 0 ? (
        <WidgetEmpty message="Belum ada aktivitas tercatat." />
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {rows.map((row) => {
            const pindah = row.kind === "pindah";
            const Icon = pindah ? ArrowsLeftRightIcon : ReceiptIcon;
            return (
              <li
                key={row.key}
                className="flex items-start gap-2.5 border-b border-border py-2.5 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
                    pindah
                      ? "bg-primary-soft text-primary"
                      : "bg-info-soft text-info"
                  }`}
                >
                  <Icon size={15} weight="bold" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-foreground">
                    {row.text}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-text-3">
                    {formatRelatif(row.ts)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
