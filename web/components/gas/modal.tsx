"use client";

import * as React from "react";
import { Dialog } from "./dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  iconVariant?:
    | "teal"
    | "amber"
    | "red"
    | "blue"
    | "violet"
    | "orange"
    | "rose"
    | "slate";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Forwarded to Dialog backdrop (default 3500). */
  zIndex?: number;
  /**
   * Gaya kepala modal. `plain` = kepala putih dengan garis bawah (dipakai
   * modal ringkas), `gas` = gradasi teal ala GAS `.modal-head` (dipakai modal
   * entri seperti Tambah Ruangan / Tambah Utilitas).
   */
  headVariant?: "plain" | "gas";
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconVariant = "slate",
  size = "md",
  children,
  footer,
  zIndex,
  headVariant = "plain",
}: ModalProps) {
  const variantClasses = {
    teal: "bg-teal3 text-teal",
    amber: "bg-amber3 text-amber",
    red: "bg-red3 text-red",
    blue: "bg-blue3 text-blue",
    violet: "bg-violet3 text-violet",
    orange: "bg-orange3 text-orange",
    rose: "bg-rose3 text-rose",
    slate: "bg-slate3 text-slate",
  };

  if (headVariant === "gas") {
    return (
      <Dialog open={open} onClose={onClose} size={size} zIndex={zIndex}>
        {/* GAS .modal-head */}
        <div
          className="flex shrink-0 items-center gap-3 px-6 py-5"
          style={{ background: "linear-gradient(135deg, #0a3d32, #0e7c6b)" }}
        >
          {icon && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-white/20 bg-white/15 text-xl">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-white">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-[11.5px] text-white/65">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="ml-auto flex size-[30px] shrink-0 items-center justify-center rounded-lg border-none bg-white/15 text-base text-white/80 transition-colors hover:bg-white/25"
          >
            ✕
          </button>
        </div>

        {/* GAS .modal-body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {children}
        </div>

        {/* GAS .modal-footer */}
        {footer && (
          <div className="flex shrink-0 justify-end gap-2.5 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} size={size} zIndex={zIndex}>
      {/* Modal Head */}
      <div className="px-5 py-3.5 border-b border-line flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0",
              variantClasses[iconVariant]
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-extrabold text-ink truncate">{title}</h3>
          {subtitle && <p className="text-xs text-ink3 truncate">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-ink3 hover:bg-line2 transition-colors shrink-0"
          aria-label="Close modal"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 1L1 13M1 1L13 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-5 overflow-y-auto flex-1">{children}</div>

      {/* Modal Footer */}
      {footer && (
        <div className="px-5 py-3.5 border-t border-line flex gap-2 justify-end">
          {footer}
        </div>
      )}
    </Dialog>
  );
}
