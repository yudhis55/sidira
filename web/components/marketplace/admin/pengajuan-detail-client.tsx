"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  approvePengajuan,
  serahkanPengajuan,
} from "@/lib/auth/marketplace";
import {
  PENGAJUAN_STATUS_LABELS,
  type PengajuanItem,
  type PengajuanStatus,
} from "@/lib/marketplace-types";
import { cn } from "@/lib/utils";

interface Props {
  id: number;
  status: PengajuanStatus;
  items: PengajuanItem[];
  catatanAdmin: string | null;
  canDecide: boolean;
}

export function PengajuanDetailClient({
  id,
  status,
  items,
  catatanAdmin,
  canDecide,
}: Props) {
  const router = useRouter();

  const [qty, setQty] = React.useState<Record<number, number>>(() =>
    Object.fromEntries(items.map((it) => [it.id, it.jumlah_diminta]))
  );
  const [catatan, setCatatan] = React.useState(catatanAdmin ?? "");
  const [penerima, setPenerima] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"putus" | "serah" | null>(null);

  const isDiajukan = status === "diajukan";
  const canSerah =
    status === "disetujui" || status === "disetujui_sebagian";

  const setAll = (value: "max" | "zero") => {
    setQty(
      Object.fromEntries(
        items.map((it) => [it.id, value === "max" ? it.jumlah_diminta : 0])
      )
    );
  };

  const totalDiminta = items.reduce((s, it) => s + it.jumlah_diminta, 0);
  const totalDisetujui = items.reduce((s, it) => s + (qty[it.id] ?? 0), 0);

  const submitDecision = async () => {
    setError(null);
    setPending("putus");
    try {
      const result = await approvePengajuan({
        id,
        decisions: items.map((it) => ({
          item_id: it.id,
          jumlah_disetujui: Math.min(
            Math.max(0, qty[it.id] ?? 0),
            it.jumlah_diminta
          ),
        })),
        catatan,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(
        `Pengajuan diputuskan: ${
          result.status ? PENGAJUAN_STATUS_LABELS[result.status] : "tersimpan"
        }`
      );
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  const submitSerah = async () => {
    setError(null);
    setPending("serah");
    try {
      const result = await serahkanPengajuan(id, penerima);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Barang ditandai sudah diserahkan");
      setPenerima("");
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  if (!canDecide && !canSerah) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="border-b border-border bg-surface-subtle px-5 py-3">
        <h2 className="text-[13px] font-bold text-foreground">
          {isDiajukan ? "Keputusan Admin" : "Serah Terima"}
        </h2>
      </div>

      <div className="space-y-4 px-5 py-4">
        {error && (
          <div
            role="alert"
            className="rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] font-medium text-danger"
          >
            {error}
          </div>
        )}

        {isDiajukan && canDecide && (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAll("max")}
                className="inline-flex h-8 items-center rounded-sm border border-border bg-surface px-3 text-[12px] font-semibold text-foreground transition-colors hover:bg-surface-muted"
              >
                Setujui Semua
              </button>
              <button
                type="button"
                onClick={() => setAll("zero")}
                className="inline-flex h-8 items-center rounded-sm border border-border bg-surface px-3 text-[12px] font-semibold text-danger transition-colors hover:bg-danger-soft"
              >
                Tolak Semua
              </button>
            </div>

            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle text-[11px] uppercase tracking-[0.04em] text-text-3">
                    <th className="px-3 py-2 font-semibold">Barang</th>
                    <th className="px-3 py-2 font-semibold text-right">
                      Diminta
                    </th>
                    <th className="px-3 py-2 font-semibold text-right">
                      Disetujui
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr
                      key={it.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-3 py-2">
                        <span className="font-semibold text-foreground">
                          {it.nama_snapshot}
                        </span>
                        <span className="ml-1 text-text-3">
                          ({it.satuan_snapshot})
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums text-text-2">
                        {it.jumlah_diminta}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          max={it.jumlah_diminta}
                          value={qty[it.id] ?? 0}
                          onChange={(e) =>
                            setQty((prev) => ({
                              ...prev,
                              [it.id]: Number(e.target.value) || 0,
                            }))
                          }
                          aria-label={`Jumlah disetujui untuk ${it.nama_snapshot}`}
                          className="h-8 w-20 rounded-sm border border-border bg-surface px-2 text-right font-mono text-[13px] tabular-nums text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-subtle font-semibold">
                    <td className="px-3 py-2 text-[12px] text-text-2">Total</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {totalDiminta}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-mono tabular-nums",
                        totalDisetujui === 0
                          ? "text-danger"
                          : totalDisetujui === totalDiminta
                            ? "text-primary"
                            : "text-warning"
                      )}
                    >
                      {totalDisetujui}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div>
              <label
                htmlFor="catatan-admin"
                className="mb-1.5 block text-[12px] font-semibold text-text-2"
              >
                Catatan admin (opsional)
              </label>
              <textarea
                id="catatan-admin"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={3}
                placeholder="Alasan persetujuan, penolakan, atau catatan lain..."
                className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitDecision}
                disabled={pending !== null}
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pending === "putus" ? "Memproses..." : "Simpan Keputusan"}
              </button>
            </div>
          </>
        )}

        {canSerah && canDecide && (
          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <label
                htmlFor="penerima"
                className="mb-1.5 block text-[12px] font-semibold text-text-2"
              >
                Nama penerima barang
              </label>
              <input
                id="penerima"
                type="text"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
                placeholder="Nama lengkap penerima"
                className="h-9 w-full max-w-sm rounded-sm border border-border bg-surface px-3 text-[13px] text-foreground outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitSerah}
                disabled={pending !== null || !penerima.trim()}
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pending === "serah" ? "Memproses..." : "Tandai Diserahkan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
