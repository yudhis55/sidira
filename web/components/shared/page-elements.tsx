/**
 * Shared design-system primitives for SIDIRA.
 * Adapted from GAS legacy layout patterns:
 *  - PageHeader (emoji icon + title + subtitle + right-side stat ring)
 *  - StatChip / StatRing (small stat block)
 *  - LegendBar (kategori + prioritas legend)
 *  - Toolbar (page-actions wrapper)
 *  - FilterChips (pill filter switcher)
 *
 * Colors come from custom CSS vars (--teal, --amber, etc.) defined in globals.css,
 * so non-shadcn components (badges, swatches) match the GAS palette exactly.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────
 * StatChip / StatRing — small stat block (📦 12 Total Item)
 * GAS .gstat equivalent.
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
  teal: "bg-[var(--teal3)]",
  amber: "bg-[var(--amber2)]",
  blue: "bg-[var(--blue2)]",
  red: "bg-[var(--red2)]",
  violet: "bg-[var(--violet2)]",
  slate: "bg-[var(--slate2)]",
};

const TONE_FG: Record<NonNullable<StatChipProps["tone"]>, string> = {
  teal: "text-[var(--teal)]",
  amber: "text-[var(--amber)]",
  blue: "text-[var(--blue)]",
  red: "text-[var(--red)]",
  violet: "text-[var(--violet)]",
  slate: "text-[var(--slate)]",
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
            "flex size-10 items-center justify-center text-lg leading-none",
            TONE_BG[tone]
          )}
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <div
          className={cn(
            "font-mono text-lg font-bold leading-none",
            TONE_FG[tone],
            valueClassName
          )}
        >
          {value}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
 * PageHeader — baku tiap modul.
 * GAS panel header pattern: big emoji icon + title + subtitle,
 * with an optional right-side stats row.
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
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center bg-[var(--teal3)] text-2xl leading-none">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="font-mono text-xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {(stats?.length || actions) && (
        <div className="flex items-center gap-2">
          {stats?.map((s, i) => (
            <div
              key={i}
              className="ring-1 ring-border px-3 py-1.5 text-right"
            >
              <div
                className={cn(
                  "font-mono text-lg font-bold leading-none",
                  s.tone ? TONE_FG[s.tone] : "text-foreground"
                )}
              >
                {s.value}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                {s.label}
              </div>
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
 * Holds primary action buttons (Export CSV, Simpan, Tambah, etc.)
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
  { label: "Wajib", className: "bg-[#fef3c7] text-[#92400e]" },
  { label: "Penting", className: "bg-[var(--blue2)] text-[var(--blue)]" },
  { label: "Pendukung", className: "bg-[var(--slate2)] text-[var(--slate)]" },
];

export function LegendBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-none border border-border bg-card px-4 py-2.5 text-xs",
        className
      )}
    >
      <span className="mr-1 font-bold text-ink2">Keterangan:</span>
      {KAT_LEGEND.map((k) => (
        <span key={k.label} className="inline-flex items-center gap-1.5 text-ink3">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: k.color }}
          />
          {k.label}
        </span>
      ))}
      <span className="ml-auto flex items-center gap-2">
        {PRIO_LEGEND.map((p) => (
          <span
            key={p.label}
            className={cn("rounded-[20px] px-[9px] py-[3px] text-[10.5px] font-bold whitespace-nowrap", p.className)}
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
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              on
                ? "border-transparent bg-[var(--teal)] text-white"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
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
 * CategoryBadge / PriorityBadge — colored pills.
 * ─────────────────────────────────────────────── */
const KAT_BADGE: Record<string, string> = {
  alkes: "bg-[var(--red2)] text-[var(--red)]",
  meubelair: "bg-[var(--amber2)] text-[var(--amber)]",
  elektronik: "bg-[var(--blue2)] text-[var(--blue)]",
  lainnya: "bg-[var(--slate2)] text-[var(--slate)]",
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
  wajib: "bg-[var(--amber2)] text-[var(--amber)]",
  penting: "bg-[var(--blue2)] text-[var(--blue)]",
  pendukung: "bg-[var(--slate2)] text-[var(--slate)]",
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
 * KondisiBadge — condition display with icon + tone.
 * ─────────────────────────────────────────────── */
const KONDISI_STYLE: Record<string, string> = {
  baik: "bg-[var(--teal3)] text-[var(--teal)]",
  rr: "bg-[var(--amber2)] text-[var(--amber)]",
  rb: "bg-[var(--red2)] text-[var(--red)]",
  ta: "bg-[var(--slate2)] text-[var(--slate)]",
};

const KONDISI_LABEL: Record<string, string> = {
  baik: "✅ Baik",
  rr: "⚠️ Rusak Ringan",
  rb: "🔴 Rusak Berat",
  ta: "— Tidak Ada",
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
