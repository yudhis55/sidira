"use client";

/**
 * Modal pratinjau cetak SBBK — port GAS `#sbbkPrintModal` / `sbbkDoPrint`
 * (index.html 8511–8524, 24941–24951). Toolbar ungu dengan "🖨️ Cetak Sekarang"
 * dan "✕ Tutup", isi dokumen sama dengan rute `/sbbk/[id]/print`.
 */
import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import { SbbkPrintDoc } from "@/components/sbbk/sbbk-print-doc";
import type { SBBK } from "@/types/database";

export interface SbbkPrintModalProps {
  open: boolean;
  onClose: () => void;
  sbbk: SBBK;
}

export function SbbkPrintModal({ open, onClose, sbbk }: SbbkPrintModalProps) {
  const doPrint = () => {
    // GAS sbbkDoPrint(): isolasi cetak lewat class di <body>.
    document.body.classList.add("printing-sbbk");
    window.print();
    window.setTimeout(
      () => document.body.classList.remove("printing-sbbk"),
      1200
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      zIndex={3600}
      overlayClassName="items-start overflow-y-auto px-4 py-5"
      panelClassName="max-w-[820px] rounded-[14px] shadow-[0_28px_72px_rgba(0,0,0,0.22)]"
    >
      {/* GAS .sbbk-print-toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2.5 bg-[#4c1d95] px-5 py-3 text-white print:hidden">
        <h3 className="m-0 flex-1 text-sm font-extrabold">🖨️ Cetak SBBK</h3>
        <button
          type="button"
          onClick={doPrint}
          className="rounded-lg border-none bg-white px-[18px] py-[7px] text-[13px] font-extrabold text-[#4c1d95] transition-[filter] hover:brightness-95"
        >
          🖨️ Cetak Sekarang
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border-[1.5px] border-white/30 bg-white/15 px-3.5 py-[7px] text-xs font-bold text-white transition-colors hover:bg-white/25"
        >
          ✕ Tutup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-5">
        <SbbkPrintDoc sbbk={sbbk} id="sbbkPrintDoc" />
      </div>
    </Dialog>
  );
}
