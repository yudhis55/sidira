"use client";

import { Button } from "@/components/ui/button";

/**
 * Small client button that triggers the browser print dialog.
 * Server components can't call window.print(), so this is a client island.
 */
export function PrintButton({
  label = "🖨️ Cetak",
  variant = "ghost",
}: {
  label?: string;
  variant?: "ghost" | "outline" | "default" | "secondary";
}) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => window.print()}
    >
      {label}
    </Button>
  );
}
