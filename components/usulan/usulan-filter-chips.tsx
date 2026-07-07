"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FilterChip {
  key: string;
  label: string;
}

interface UsulanFilterChipsProps {
  /** The searchParams key to set (e.g. "prioritas" or "status"). */
  paramKey: string;
  chips: FilterChip[];
  /** Preserved search params from the parent so other filters stay active. */
  className?: string;
}

/**
 * Achromatic filter chips driven by URL searchParams. Selecting a chip
 * updates the URL without a full reload (preserves other query params).
 */
export function UsulanFilterChips({
  paramKey,
  chips,
  className,
}: UsulanFilterChipsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) || "all";

  function buildHref(key: string): string {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") {
      params.delete(paramKey);
    } else {
      params.set(paramKey, key);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {chips.map((chip) => {
        const active = current === chip.key;
        const href = buildHref(chip.key);
        return (
          <Link
            key={chip.key}
            href={href}
            className={cn(
              "inline-flex h-7 items-center px-2.5 font-mono text-xs ring-1 transition-colors",
              active
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-background text-foreground ring-border hover:bg-muted"
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
