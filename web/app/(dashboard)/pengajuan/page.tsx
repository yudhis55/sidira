import Link from "next/link";
import { getPengajuanList } from "@/lib/auth/marketplace";
import {
  PENGAJUAN_STATUS_BADGE,
  PENGAJUAN_STATUS_LABELS,
  type PengajuanHeader,
  type PengajuanStatus,
} from "@/lib/marketplace-types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: Array<{ key: "all" | PengajuanStatus; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "diajukan", label: "Menunggu" },
  { key: "disetujui", label: "Disetujui" },
  { key: "disetujui_sebagian", label: "Sebagian" },
  { key: "ditolak", label: "Ditolak" },
  { key: "diserahkan", label: "Diserahkan" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

function fmtDateTime(iso: string): string {
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

function matchQuery(row: PengajuanHeader, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    row.nomor.toLowerCase().includes(needle) ||
    row.nama_pemohon.toLowerCase().includes(needle) ||
    (row.room_name ?? "").toLowerCase().includes(needle)
  );
}

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function PengajuanPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statusFilter = (sp.status || "all") as "all" | PengajuanStatus;
  const q = (sp.q || "").trim();

  const list = await getPengajuanList().catch((): PengajuanHeader[] => []);

  const counts = new Map<string, number>();
  for (const row of list) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }

  const rows = list
    .filter((row) => (statusFilter === "all" ? true : row.status === statusFilter))
    .filter((row) => matchQuery(row, q));

  const menunggu = counts.get("diajukan") ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
            Pengajuan Barang
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            {list.length} pengajuan · {menunggu} menunggu keputusan
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.key;
          const count =
            f.key === "all" ? list.length : counts.get(f.key) ?? 0;
          return (
            <Link
              key={f.key}
              href={
                f.key === "all"
                  ? "/pengajuan"
                  : `/pengajuan?status=${f.key}`
              }
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-text-2 hover:bg-surface-muted"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "font-mono text-[11px] tabular-nums",
                  active ? "opacity-80" : "text-text-3"
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <form method="get" className="flex gap-2">
        {statusFilter !== "all" && (
          <input type="hidden" name="status" value={statusFilter} />
        )}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nomor, nama pemohon, atau ruangan..."
          className="h-9 w-full max-w-sm rounded-sm border border-border bg-surface px-3 text-[13px] text-foreground outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-muted"
        >
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-[11px] uppercase tracking-[0.04em] text-text-3">
              <th className="px-4 py-2.5 font-semibold">Nomor</th>
              <th className="px-4 py-2.5 font-semibold">Diajukan</th>
              <th className="px-4 py-2.5 font-semibold">Pemohon</th>
              <th className="px-4 py-2.5 font-semibold">Ruangan</th>
              <th className="px-4 py-2.5 font-semibold text-right">Item</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-surface-muted"
              >
                <td className="px-4 py-2.5 font-mono text-[12px] font-semibold text-foreground">
                  {row.nomor}
                </td>
                <td className="px-4 py-2.5 text-text-2">
                  {fmtDateTime(row.diajukan_at)}
                </td>
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {row.nama_pemohon}
                </td>
                <td className="px-4 py-2.5 text-text-2">
                  {row.room_icon ? `${row.room_icon} ` : ""}
                  {row.room_name ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-text-2">
                  {row.item_count ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      PENGAJUAN_STATUS_BADGE[row.status]
                    )}
                  >
                    {PENGAJUAN_STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/pengajuan/${row.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-3">
                  Tidak ada pengajuan untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
