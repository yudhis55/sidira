import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLogStatusPengajuan,
  getPengajuanDetail,
} from "@/lib/auth/marketplace";
import { getUser } from "@/lib/auth/utils";
import {
  PENGAJUAN_STATUS_BADGE,
  PENGAJUAN_STATUS_LABELS,
  type LogStatusPengajuan,
  type PengajuanDetail,
} from "@/lib/marketplace-types";
import { PengajuanDetailClient } from "@/components/marketplace/admin/pengajuan-detail-client";
import { cn } from "@/lib/utils";

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PengajuanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  let detail: PengajuanDetail;
  try {
    detail = await getPengajuanDetail(numericId);
  } catch {
    notFound();
  }

  const [user, logs] = await Promise.all([
    getUser(),
    getLogStatusPengajuan(numericId).catch((): LogStatusPengajuan[] => []),
  ]);
  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/pengajuan"
            className="text-[12px] font-semibold text-text-3 hover:text-foreground"
          >
            ← Kembali ke daftar pengajuan
          </Link>
          <h1 className="mt-1 font-mono text-[22px] font-bold leading-tight tracking-tight text-foreground">
            {detail.nomor}
          </h1>
        </div>
        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-[12px] font-semibold",
            PENGAJUAN_STATUS_BADGE[detail.status]
          )}
        >
          {PENGAJUAN_STATUS_LABELS[detail.status]}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3">
            Pemohon
          </div>
          <div className="mt-1 text-[13px] font-semibold text-foreground">
            {detail.nama_pemohon}
          </div>
          <div className="mt-0.5 text-[12px] text-text-2">
            {detail.room_icon ? `${detail.room_icon} ` : ""}
            {detail.room_name ?? "Ruangan tidak ditemukan"}
          </div>
        </div>
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3">
            Waktu
          </div>
          <div className="mt-1 text-[12px] text-text-2">
            Diajukan: {fmtDateTime(detail.diajukan_at)}
          </div>
          <div className="text-[12px] text-text-2">
            Diputuskan: {fmtDateTime(detail.diputuskan_at)}
          </div>
          <div className="text-[12px] text-text-2">
            Diserahkan: {fmtDateTime(detail.diserahkan_at)}
          </div>
        </div>
      </div>

      {detail.catatan_pemohon && (
        <div className="rounded-md border border-border bg-surface-subtle px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3">
            Catatan pemohon
          </div>
          <p className="mt-1 whitespace-pre-wrap text-[13px] text-text-2">
            {detail.catatan_pemohon}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-[11px] uppercase tracking-[0.04em] text-text-3">
              <th className="px-4 py-2.5 font-semibold">Barang</th>
              <th className="px-4 py-2.5 font-semibold text-right">Diminta</th>
              <th className="px-4 py-2.5 font-semibold text-right">
                Disetujui
              </th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((it) => (
              <tr key={it.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-foreground">
                    {it.nama_snapshot}
                  </span>
                  <span className="ml-1 text-text-3">
                    ({it.satuan_snapshot})
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-text-2">
                  {it.jumlah_diminta}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-text-2">
                  {it.jumlah_disetujui}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail.diterima_oleh && (
        <p className="text-[12px] text-text-2">
          Diterima oleh:{" "}
          <span className="font-semibold text-foreground">
            {detail.diterima_oleh}
          </span>
        </p>
      )}

      <PengajuanDetailClient
        id={detail.id}
        status={detail.status}
        items={detail.items}
        catatanAdmin={detail.catatan_admin ?? null}
        canDecide={isAdmin}
      />

      {logs.length > 0 && (
        <div className="rounded-md border border-border bg-surface">
          <div className="border-b border-border bg-surface-subtle px-5 py-3">
            <h2 className="text-[13px] font-bold text-foreground">
              Riwayat Status
            </h2>
          </div>
          <ol className="space-y-3 px-5 py-4">
            {logs.map((log) => (
              <li key={log.id} className="flex gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-foreground">
                    {log.status_lama
                      ? `${PENGAJUAN_STATUS_LABELS[log.status_lama]} → `
                      : ""}
                    {PENGAJUAN_STATUS_LABELS[log.status_baru]}
                  </div>
                  <div className="text-[11px] text-text-3">
                    {fmtDateTime(log.created_at)} · {log.user_nama}
                  </div>
                  {log.catatan && (
                    <p className="mt-0.5 text-[12px] text-text-2">
                      {log.catatan}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
