/**
 * Shared design-system primitives for SIDIRA.
 *
 *  - PageHeader (icon tile + title + subtitle + right-side stat chips)
 *  - StatChip (small stat block)
 *  - LegendBar (kategori + prioritas legend)
 *  - Toolbar (page-actions wrapper)
 *  - FilterChips (pill filter switcher)
 *
 * Uses the semantic tokens defined in app/globals.css. Legacy GAS vars are
 * still mapped there so untouched module pages keep rendering correctly.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────
 * StatChip — small stat block (📦 12 Total Item)
 * ─────────────────────────────────────────────── */
export interface StatChipProps {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label: string;
  /** tone drives the icon chip background: teal | amber | blue | red | violet | slate */
  tone?: "teal" | "amber" | "blue" | "red" | "violet" | "slate";
  valueClassName?: string;
  className?: string;
}

const TONE_BG: Record<NonNullable<StatChipProps["tone"]>, string> = {
  teal: "bg-primary-soft",
  amber: "bg-warning-soft",
  blue: "bg-info-soft",
  red: "bg-danger-soft",
  violet: "bg-[var(--violet2)]",
  slate: "bg-surface-muted",
};

const TONE_FG: Record<NonNullable<StatChipProps["tone"]>, string> = {
  teal: "text-primary",
  amber: "text-warning",
  blue: "text-info",
  red: "text-danger",
  violet: "text-[var(--violet)]",
  slate: "text-text-2",
};

export function StatChip({
  icon,
  value,
  label,
  tone = "teal",
  valueClassName,
  className,
}: StatChipProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon ? (
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-md text-lg leading-none",
            TONE_BG[tone],
            TONE_FG[tone]
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <div
          className={cn(
            "font-mono text-[20px] font-semibold leading-none tracking-tight",
            TONE_FG[tone],
            valueClassName
          )}
        >
          {value}
        </div>
        <div className="mt-1 text-[12px] text-text-3">{label}</div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
 * PageHeader — baku tiap modul.
 * ─────────────────────────────────────────────── */
export interface PageHeaderStat {
  value: React.ReactNode;
  label: string;
  tone?: StatChipProps["tone"];
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  stats?: PageHeaderStat[];
  /** right-aligned actions (buttons, links) */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon,
  title,
  subtitle,
  stats,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[20px] leading-none text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-balance text-[20px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] leading-snug text-text-3">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {(stats?.length || actions) && (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {stats?.map((s, i) => (
            <div
              key={i}
              className="min-w-[64px] rounded-sm border border-border bg-surface px-3 py-1.5 text-right"
            >
              <div className="font-mono text-[16px] font-semibold leading-none tracking-tight text-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] leading-none text-text-3">{s.label}</div>
            </div>
          ))}
          {actions}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
 * Toolbar — page-actions wrapper (GAS .page-actions).
 * ─────────────────────────────────────────────── */
export function Toolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-border pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────
 * LegendBar — kategori + prioritas legend (GAS .legend-bar).
 * ─────────────────────────────────────────────── */
const KAT_LEGEND = [
  { color: "var(--teal)", label: "Alat Kesehatan" },
  { color: "var(--amber)", label: "Meubelair" },
  { color: "var(--blue)", label: "Elektronik" },
  { color: "var(--slate)", label: "Lainnya" },
];

const PRIO_LEGEND = [
  { label: "Wajib", className: "bg-warning-soft text-warning" },
  { label: "Penting", className: "bg-info-soft text-info" },
  { label: "Pendukung", className: "bg-surface-muted text-text-2" },
];

export function LegendBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-surface px-4 py-2.5 text-[12px]",
        className
      )}
    >
      <span className="mr-1 font-semibold text-text-2">Keterangan:</span>
      {KAT_LEGEND.map((k) => (
        <span key={k.label} className="inline-flex items-center gap-1.5 text-text-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: k.color }}
          />
          {k.label}
        </span>
      ))}
      <span className="ml-auto flex flex-wrap items-center gap-2">
        {PRIO_LEGEND.map((p) => (
          <span
            key={p.label}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
              p.className
            )}
          >
            {p.label}
          </span>
        ))}
      </span>
    </div>
  );
}

/* ───────────────────────────────────────────────
 * FilterChips — pill filter switcher (GAS .sbbk-filter / .ri-chip).
 * ─────────────────────────────────────────────── */
export interface FilterChip {
  key: string;
  label: React.ReactNode;
}

export function FilterChips({
  chips,
  active,
  onPick,
  className,
}: {
  chips: FilterChip[];
  active: string;
  onPick: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {chips.map((c) => {
        const on = c.key === active;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onPick(c.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
              on
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-surface text-text-2 hover:bg-surface-muted hover:text-foreground"
            )}
            aria-pressed={on}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────
 * CategoryBadge / PriorityBadge — colored pills (data).
 * ─────────────────────────────────────────────── */
const KAT_BADGE: Record<string, string> = {
  alkes: "bg-danger-soft text-danger",
  meubelair: "bg-warning-soft text-warning",
  elektronik: "bg-info-soft text-info",
  lainnya: "bg-surface-muted text-text-2",
};

export function CategoryBadge({
  category,
  label,
  className,
}: {
  category: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        KAT_BADGE[category] ?? KAT_BADGE.lainnya,
        className
      )}
    >
      {label ?? category}
    </span>
  );
}

const PRIO_BADGE: Record<string, string> = {
  wajib: "bg-warning-soft text-warning",
  penting: "bg-info-soft text-info",
  pendukung: "bg-surface-muted text-text-2",
};

export function PriorityBadge({
  priority,
  label,
  className,
}: {
  priority: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        PRIO_BADGE[priority] ?? PRIO_BADGE.pendukung,
        className
      )}
    >
      {label ?? priority}
    </span>
  );
}

/* ───────────────────────────────────────────────
 * KondisiBadge — condition display with tone.
 * ─────────────────────────────────────────────── */
const KONDISI_STYLE: Record<string, string> = {
  baik: "bg-success-soft text-success",
  rr: "bg-warning-soft text-warning",
  rb: "bg-danger-soft text-danger",
  ta: "bg-surface-muted text-text-2",
};

const KONDISI_LABEL: Record<string, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

export function KondisiBadge({
  condition,
  label,
  className,
}: {
  condition: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
        KONDISI_STYLE[condition] ?? KONDISI_STYLE.baik,
        className
      )}
    >
      {label ?? KONDISI_LABEL[condition] ?? condition}
    </span>
  );
}
