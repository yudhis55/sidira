"use client";

import { useMemo, useState } from "react";
import { ClipboardText, MagnifyingGlass } from "@phosphor-icons/react";
import {
  PENGAJUAN_STATUS_BADGE,
  PENGAJUAN_STATUS_LABELS,
  type PengajuanStatus,
  type RiwayatPengajuanPublik,
} from "@/lib/marketplace-types";
import { cn } from "@/lib/utils";

const STATUS_TABS: Array<{ key: "all" | PengajuanStatus; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "diajukan", label: "Menunggu" },
  { key: "disetujui", label: "Disetujui" },
  { key: "disetujui_sebagian", label: "Sebagian" },
  { key: "ditolak", label: "Ditolak" },
  { key: "diserahkan", label: "Diserahkan" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Riwayat pengajuan publik. Sengaja TIDAK menampilkan nama pemohon —
 * hanya ruangan, barang, dan status (lihat `riwayat_pengajuan_publik`).
 */
export function RiwayatClient({ rows }: { rows: RiwayatPengajuanPublik[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | PengajuanStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return (
        row.nomor.toLowerCase().includes(q) ||
        (row.room_name ?? "").toLowerCase().includes(q) ||
        row.items.some((it) => it.nama.toLowerCase().includes(q))
      );
    });
  }, [rows, query, status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
          Riwayat Pengajuan
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Daftar permintaan barang per ruangan beserta statusnya.
        </p>
      </div>

      <div className="space-y-3 rounded-md border border-border bg-surface p-3.5 sm:p-4">
        <div className="relative">
          <MagnifyingGlass
            size={17}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nomor, ruangan, atau nama barang…"
            aria-label="Cari riwayat pengajuan"
            className="h-10 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground outline-none placeholder:text-text-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 pb-0.5 sm:overflow-visible sm:pb-0">
            <div className="flex items-center gap-1.5">
              {STATUS_TABS.map((tab) => {
                const on = status === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatus(tab.key)}
                    aria-pressed={on}
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-text-2 hover:bg-surface-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
          <span className="shrink-0 text-[11.5px] text-text-3">
            {filtered.length.toLocaleString("id-ID")} pengajuan
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-md bg-surface-muted text-text-3">
            <ClipboardText size={20} />
          </span>
          <p className="mt-3 text-[14px] font-semibold text-foreground">
            {rows.length === 0
              ? "Belum ada pengajuan"
              : "Tidak ada pengajuan yang cocok"}
          </p>
          <p className="mt-1 max-w-[44ch] text-[12.5px] leading-relaxed text-text-3">
            {rows.length === 0
              ? "Riwayat akan muncul di sini setelah ada permintaan barang yang dikirim."
              : "Coba kata kunci lain atau ubah filter status."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((row) => (
            <article
              key={row.nomor}
              className="rounded-md border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-[12px] font-semibold text-foreground">
                    {row.nomor}
                  </p>
                  <p className="mt-0.5 text-[12px] text-text-2">
                    <span className="font-semibold text-foreground">
                      {row.room_icon ? `${row.room_icon} ` : ""}
                      {row.room_name ?? "Ruangan tidak ditemukan"}
                    </span>{" "}
                    · {fmtDate(row.diajukan_at)}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    PENGAJUAN_STATUS_BADGE[row.status]
                  )}
                >
                  {PENGAJUAN_STATUS_LABELS[row.status]}
                </span>
              </div>

              <ul className="mt-2.5 space-y-1 border-t border-border pt-2.5">
                {row.items.map((it, index) => {
                  const partial =
                    it.jumlah_disetujui > 0 &&
                    it.jumlah_disetujui !== it.jumlah_diminta;
                  return (
                    <li
                      key={`${row.nomor}-${index}`}
                      className="flex items-baseline justify-between gap-2 text-[12.5px]"
                    >
                      <span className="min-w-0 truncate text-text-2">
                        {it.nama}
                      </span>
                      <span className="shrink-0 font-mono tabular-nums text-foreground">
                        {partial
                          ? `${it.jumlah_disetujui}/${it.jumlah_diminta} ${it.satuan}`
                          : `${it.jumlah_diminta} ${it.satuan}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
