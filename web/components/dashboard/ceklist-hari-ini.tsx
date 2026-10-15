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
        action={<WidgetLink href="/checklist" label="Buka ceklist →" />}
      >
        <WidgetEmpty message="Belum ada ruangan ber-item untuk diceklist." />
      </WidgetCard>
    );
  }

  const pct = Math.round((checked / total) * 100);

  return (
    <WidgetCard
      title="Ceklist Hari Ini"
      action={<WidgetLink href="/checklist" label="Buka ceklist →" />}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: "28px",
            lineHeight: 1.1,
            color: pct === 100 ? "var(--teal)" : "var(--ink)",
          }}
        >
          {pct}%
        </span>
        <span style={{ fontSize: "12px", color: "var(--ink3)" }}>
          {checked} dari {total} ruangan · {todayLabel}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${checked} dari ${total} ruangan sudah ceklist hari ini`}
        style={{
          height: "6px",
          borderRadius: "6px",
          background: "var(--line)",
          marginTop: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "6px",
            background: pct === 100 ? "var(--teal)" : "var(--amber)",
          }}
        />
      </div>
      {checked < total ? (
        <p style={{ fontSize: "12px", color: "var(--ink3)", margin: "10px 0 0" }}>
          {total - checked} ruangan belum diceklist hari ini.
        </p>
      ) : (
        <p style={{ fontSize: "12px", color: "var(--teal)", margin: "10px 0 0", fontWeight: 600 }}>
          Semua ruangan sudah diceklist hari ini.
        </p>
      )}
    </WidgetCard>
  );
}
