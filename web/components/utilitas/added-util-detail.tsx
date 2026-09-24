"use client";

/**
 * Detail utilitas hasil "Tambah Utilitas" — metanya hanya ada di localStorage
 * (`sidira_util_added`), jadi server tidak bisa mencarinya. Susunannya sama
 * dengan rute utilitas bawaan: header, bilah unit, lalu panel ceklist.
 */

import Link from "next/link";
import { UtilDetailPanels } from "@/components/utilitas/util-detail-panels";
import { useAddedUtilitas, useUtilitasList } from "@/lib/utilitas-store";
import { useIsClient } from "@/lib/use-is-client";
import type { UtilItem, UtilMeta, UtilState } from "@/types/database";

export interface AddedUtilDetailProps {
  utilId: string;
  /** Utilitas bawaan dari mock — dipakai untuk bilah unit. */
  baseMetas: UtilMeta[];
  /** Jumlah item per utilitas bawaan, dihitung di server. */
  itemCounts: Record<string, number>;
  year: number;
  /** 0-based month (0 = Januari). */
  month0: number;
}

const NO_ITEMS: UtilItem[] = [];
const NO_CHECKS: UtilState[] = [];
const NO_NOTES: Record<string, string> = {};

export function AddedUtilDetail({
  utilId,
  baseMetas,
  itemCounts,
  year,
  month0,
}: AddedUtilDetailProps) {
  const mounted = useIsClient();
  const [added] = useAddedUtilitas();
  const metas = useUtilitasList(baseMetas);
  const utilMeta = added.find((m) => m.util_id === utilId);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-lg border border-line bg-white px-6 py-10 text-center text-[13px] text-ink3">
          Memuat utilitas…
        </div>
      </div>
    );
  }

  if (!utilMeta) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-lg border border-line bg-white px-6 py-12 text-center">
          <div className="text-[34px] leading-none" aria-hidden>
            🧰
          </div>
          <h1 className="mt-3 text-base font-extrabold text-ink">
            Utilitas tidak ditemukan
          </h1>
          <p className="mx-auto mt-1 max-w-[420px] text-[12.5px] text-ink3">
            Utilitas ini mungkin sudah dihapus, atau ditambahkan di peramban
            lain — data utilitas tambahan masih tersimpan lokal.
          </p>
          <Link
            href="/utilitas"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-teal2 to-teal px-5 py-[9px] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(14,124,107,0.3)] transition-all duration-[180ms] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(14,124,107,0.4)]"
          >
            ← Kembali ke Utilitas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      {/* Header — GAS .util-header */}
      <div className="flex flex-wrap items-center gap-3.5 rounded-lg border border-line bg-white px-6 py-5">
        <div
          className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] text-[26px] leading-none"
          style={{ background: utilMeta.bg || "var(--teal3)" }}
          aria-hidden
        >
          {utilMeta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold leading-tight text-ink">
            Pemeliharaan {utilMeta.label}
          </h1>
          <p className="mt-0.5 text-xs text-ink3">
            Puskesmas Baruharjo · belum ada item pemeliharaan
          </p>
        </div>
        <div className="ml-auto flex gap-3.5">
          <div className="text-center">
            <div className="text-[22px] font-black leading-none text-teal">
              0
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-ink3">
              Item
            </div>
          </div>
          <div className="text-center">
            <div className="text-[22px] font-black leading-none text-teal">
              0
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-ink3">
              Sudah Dikerjakan
            </div>
          </div>
        </div>
      </div>

      {/* Unit bar — GAS .util-unit-bar / .util-unit-btn */}
      <div className="flex flex-wrap gap-1.5">
        {metas.map((meta) => {
          const active = meta.util_id === utilId;
          return (
            <Link key={meta.util_id} href={`/utilitas/${meta.util_id}`}>
              <span
                className={
                  active
                    ? "inline-flex cursor-pointer items-center gap-[7px] rounded-[10px] border-2 border-transparent px-[18px] py-[9px] text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                    : "inline-flex cursor-pointer items-center gap-[7px] rounded-[10px] border-2 border-line bg-white px-[18px] py-[9px] text-[13px] font-bold text-ink2 transition-colors hover:border-ink3"
                }
                style={active ? { background: meta.bg || "var(--teal)" } : undefined}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {meta.icon}
                </span>
                <span>{meta.label}</span>
                <span
                  className={
                    active
                      ? "rounded-[10px] bg-white/25 px-[7px] py-px font-mono text-[10px] font-bold text-white"
                      : "rounded-[10px] bg-line2 px-[7px] py-px font-mono text-[10px] font-bold text-ink3"
                  }
                >
                  {itemCounts[meta.util_id] ?? 0}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <UtilDetailPanels
        utilId={utilMeta.util_id}
        utilMeta={utilMeta}
        initialItems={NO_ITEMS}
        year={year}
        month0={month0}
        initialChecks={NO_CHECKS}
        initialNotesByMonth={NO_NOTES}
      />
    </div>
  );
}
