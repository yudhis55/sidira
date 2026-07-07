import type { UsulanPrioritas, UsulanStatus } from "@/lib/usulan-types";
import {
  USULAN_PRIORITAS_LABELS,
  USULAN_STATUS_LABELS,
} from "@/lib/usulan-types";
import { cn } from "@/lib/utils";

/**
 * Achromatic prioritas badge — text inside a ring border, no color fill.
 * Mendesak uses a ⚠ icon but stays muted per DESIGN.md.
 */
export function PrioritasBadge({
  prioritas,
  className,
}: {
  prioritas: UsulanPrioritas;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center px-2 font-mono text-[10px] ring-1 ring-border whitespace-nowrap",
        className
      )}
    >
      {USULAN_PRIORITAS_LABELS[prioritas]}
    </span>
  );
}

/**
 * Achromatic status badge — text inside a ring border.
 * "ditolak" uses the destructive text color (the only allowed red use)
 * since it is semantically a negative/rejected state.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: UsulanStatus;
  className?: string;
}) {
  const isDitolak = status === "ditolak";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center px-2 font-mono text-[10px] ring-1 whitespace-nowrap",
        isDitolak
          ? "text-destructive ring-destructive/20"
          : "ring-border",
        className
      )}
    >
      {USULAN_STATUS_LABELS[status]}
    </span>
  );
}
