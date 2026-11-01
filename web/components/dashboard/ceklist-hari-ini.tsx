import { WidgetCard, WidgetEmpty, WidgetLink } from "./widget-card";

/**
 * % ruangan ber-item yang sudah punya entri ceklist hari ini.
 * Angka jujur dari tabel checklist (date_key = hari ini, lokal).
 */
export function CeklistHariIni({
  checked,
  total,
  todayLabel,
}: {
  checked: number;
  total: number;
  todayLabel: string;
}) {
  if (total === 0) {
    return (
      <WidgetCard
        title="Ceklist Hari Ini"
        action={<WidgetLink href="/checklist" label="Buka ceklist" />}
      >
        <WidgetEmpty message="Belum ada ruangan ber-item untuk diceklist." />
      </WidgetCard>
    );
  }

  const pct = Math.round((checked / total) * 100);

  return (
    <WidgetCard
      title="Ceklist Hari Ini"
      action={<WidgetLink href="/checklist" label="Buka ceklist" />}
    >
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono text-[28px] font-bold leading-none tabular-nums ${
            pct === 100 ? "text-success" : "text-foreground"
          }`}
        >
          {pct}%
        </span>
        <span className="text-[12px] text-text-2">
          {checked} dari {total} ruangan · {todayLabel}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${checked} dari ${total} ruangan sudah ceklist hari ini`}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-subtle"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      {checked < total ? (
        <p className="mt-2.5 text-[12px] text-text-3">
          {total - checked} ruangan belum diceklist hari ini.
        </p>
      ) : (
        <p className="mt-2.5 text-[12px] font-medium text-success">
          Semua ruangan sudah diceklist hari ini.
        </p>
      )}
    </WidgetCard>
  );
}
