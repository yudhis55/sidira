"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/lib/use-is-client";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl"; // max-width: 360, 520, 720, 960
  closeOnBackdropClick?: boolean; // default true
  /** Stacking order for overlay parity with GAS (default 3500; laporan uses 3100). */
  zIndex?: number;
  /** Extra classes on the fixed overlay (e.g. items-start for tall GAS modals). */
  overlayClassName?: string;
  /** Extra classes on the white panel (radius, max-width override, shadow). */
  panelClassName?: string;
}

export function Dialog({
  open,
  onClose,
  children,
  size = "md",
  closeOnBackdropClick = true,
  zIndex = 3500,
  overlayClassName,
  panelClassName,
}: DialogProps) {
  const mounted = useIsClient();

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const sizeClasses = {
    sm: "max-w-[360px]",
    md: "max-w-[520px]",
    lg: "max-w-[720px]",
    xl: "max-w-[960px]",
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 bg-ink/45 backdrop-blur-[4px] flex items-center justify-center p-4",
        overlayClassName
      )}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "bg-white w-full max-h-[calc(100vh-64px)] flex flex-col overflow-hidden",
          !panelClassName &&
            "rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
          sizeClasses[size],
          panelClassName
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
