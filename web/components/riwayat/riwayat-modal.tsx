"use client";

import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import type { ItemCategory, RiwayatPindah } from "@/types/database";

export interface RiwayatModalProps {
  open: boolean;
  onClose: () => void;
  items: RiwayatPindah[];
}

const KAT_ICON: Record<ItemCategory, string> = {
  alkes: "🩺",
  meubelair: "🪑",
  elektronik: "💻",
  lainnya: "📦",
};

const KAT_BG: Record<ItemCategory, string> = {
  alkes: "#ccfbf1",
  meubelair: "#fef3c7",
  elektronik: "#dbeafe",
  lainnya: "#f3f4f6",
};

function formatTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

function resolveKat(kat?: ItemCategory): ItemCategory {
  return kat && kat in KAT_ICON ? kat : "lainnya";
}

/**
 * GAS `#mvLogModal` parity — riwayat perpindahan aset (timeline list, no filters).
 */
export function RiwayatModal({ open, onClose, items }: RiwayatModalProps) {
  // Local override for "Hapus Semua" (UI-only clear). Null = use props.
  const [override, setOverride] = React.useState<RiwayatPindah[] | null>(null);
  const list = override ?? items;

  const handleClose = () => {
    setOverride(null);
    onClose();
  };

  const handleClearAll = () => {
    if (!confirm("Hapus semua riwayat perpindahan?")) return;
    setOverride([]);
  };

  return (
    <Dialog open={open} onClose={handleClose} size="lg" zIndex={3500}>
      {/* Head — blue gradient GAS .mv-modal-head */}
      <div
        className="flex shrink-0 items-center justify-between px-[22px] py-[18px] text-white"
        style={{
          background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
        }}
      >
        <div className="min-w-0">
          <div className="text-base font-extrabold leading-tight">
            📦 Riwayat Perpindahan Aset
          </div>
          <div className="mt-[3px] text-[11px] opacity-75">
            Histori pemindahan barang antar ruangan
          </div>
        </div>
        <div className="ml-3 flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-[10px] border-[1.5px] border-[#b91c1c] bg-white px-4 py-[9px] text-xs font-bold text-[#b91c1c] transition-colors hover:border-[#991b1b] hover:text-[#991b1b]"
          >
            🗑 Hapus Semua
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border-[1.5px] border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/28"
          >
            ✕ Tutup
          </button>
        </div>
      </div>

      {/* Body — max-h 60vh, min-h 120px */}
      <div
        className="overflow-y-auto px-5 py-4"
        style={{ maxHeight: "60vh", minHeight: 120 }}
      >
        {list.length === 0 ? (
          <div className="px-10 py-10 text-center text-sm text-ink3">
            📭 Belum ada riwayat perpindahan
          </div>
        ) : (
          list.map((entry) => {
            const kat = resolveKat(entry.kat);
            const dari = entry.dari_name || entry.dari || "?";
            const ke = entry.ke_name || entry.ke || "?";
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                  style={{ background: KAT_BG[kat] }}
                  aria-hidden
                >
                  {KAT_ICON[kat]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-ink">
                    {entry.nama || "—"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink3">
                    📍 {dari} → {ke}
                  </div>
                </div>
                <div className="ml-auto shrink-0 whitespace-nowrap text-[10px] text-ink3">
                  {formatTs(entry.ts)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Dialog>
  );
}
