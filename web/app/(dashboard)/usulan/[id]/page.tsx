import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { getUsulanById } from "@/lib/auth/usulan";
import { USULAN_KATEGORI_LABELS } from "@/lib/usulan-types";
import type { UsulanItem } from "@/lib/usulan-types";
import { ItemStatusActions } from "@/components/usulan/item-status-actions";
import { DeleteUsulanButton } from "@/components/usulan/delete-button";
import { UsulanCsvExport } from "@/components/usulan/usulan-csv-export";
import { UsulanDetailFilters } from "@/components/usulan/usulan-detail-filters";
import { PrioritasBadge, StatusBadge } from "@/components/usulan/usulan-badges";

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={className}>{children}</h3>;
}
function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export const dynamic = "force-dynamic";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prioritas?: string; status?: string }>;
}

export default async function UsulanDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const sp = await searchParams;
  const prioritasFilter = sp.prioritas || "all";
  const statusFilter = sp.status || "all";

  let usulan;
  try {
    usulan = await getUsulanById(id);
  } catch {
    notFound();
  }

  const roomName = usulan.rooms?.name || usulan.room_id;
  const roomIcon = usulan.rooms?.icon || "📦";
  const allItems: UsulanItem[] = usulan.payload?.items || [];

  // Apply filters
  const filteredItems = allItems.filter((item) => {
    if (prioritasFilter !== "all" && item.prioritas !== prioritasFilter) {
      return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalValue = allItems.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );
  const diajukanCount = allItems.filter((i) => i.status === "diajukan").length;
  const disetujuiCount = allItems.filter((i) => i.status === "disetujui").length;
  const ditolakCount = allItems.filter((i) => i.status === "ditolak").length;
  const mendesakCount = allItems.filter((i) => i.prioritas === "mendesak").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/usulan">
            <Button variant="ghost" size="icon" aria-label="Kembali">
              ←
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">
              {roomIcon} {roomName}
            </h1>
            <p className="text-xs text-muted-foreground">
              Usulan Pengadaan · {fmtDate(usulan.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/usulan/${usulan.id}/edit`}>
            <Button variant="ghost" size="sm">
              ✏️
              Edit
            </Button>
          </Link>
          <UsulanCsvExport
            roomId={usulan.room_id}
            filename={`Usulan_${roomName.replace(/\s+/g, "_")}`}
          />
          <DeleteUsulanButton id={usulan.id} />
        </div>
      </div>

      {/* Info + summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Total Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-lg font-bold">
              Rp {totalValue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {allItems.length} barang diusulkan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Status Barang</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-xs">
            <div>
              <div className="font-mono text-lg font-bold">{diajukanCount}</div>
              <div className="text-[10px] text-muted-foreground">Diajukan</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold">{disetujuiCount}</div>
              <div className="text-[10px] text-muted-foreground">Disetujui</div>
            </div>
            <div>
              <div className="font-mono text-lg font-bold text-destructive">
                {ditolakCount}
              </div>
              <div className="text-[10px] text-muted-foreground">Ditolak</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Mendesak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-lg font-bold">
              {mendesakCount}
            </div>
            <p className="text-xs text-muted-foreground">
              barang berprioritas mendesak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter chips (client) */}
      <UsulanDetailFilters />

      {/* Items table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">Daftar Barang Diusulkan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              💡
              <p className="font-mono text-sm font-semibold mb-1">
                Tidak ada barang
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {allItems.length === 0
                  ? "Usulan ini belum memiliki barang."
                  : "Tidak ada barang yang cocok dengan filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">No</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Nama Barang</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Kategori</th>
                    <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">Jumlah</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Satuan</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Prioritas</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Status</th>
                    <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">Harga</th>
                    <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">Total</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Keterangan</th>
                    <th className="h-9 px-2 text-center font-mono font-medium whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => {
                    const realIndex = allItems.indexOf(item);
                    return (
                      <tr
                        key={index}
                        className="border-b border-border last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-2 py-2 font-mono text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-2 py-2 font-medium">{item.nama}</td>
                        <td className="px-2 py-2 text-muted-foreground">
                          {USULAN_KATEGORI_LABELS[item.kategori] || item.kategori}
                        </td>
                        <td className="px-2 py-2 text-right font-mono">{item.qty}</td>
                        <td className="px-2 py-2">{item.satuan}</td>
                        <td className="px-2 py-2">
                          <PrioritasBadge prioritas={item.prioritas} />
                        </td>
                        <td className="px-2 py-2">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-2 py-2 text-right font-mono">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </td>
                        <td className="px-2 py-2 text-right font-mono font-semibold">
                          Rp {item.total.toLocaleString("id-ID")}
                        </td>
                        <td className="px-2 py-2 text-muted-foreground max-w-[200px] truncate">
                          {item.keterangan || "-"}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex justify-center">
                            <ItemStatusActions
                              usulanId={usulan.id}
                              itemIndex={realIndex}
                              currentStatus={item.status}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr className="border-t-2 border-border">
                    <td
                      colSpan={8}
                      className="px-2 py-2 text-right font-mono font-bold"
                    >
                      Total Nilai (terfilter):
                    </td>
                    <td className="px-2 py-2 text-right font-mono font-bold">
                      Rp{" "}
                      {filteredItems
                        .reduce((s, it) => s + (it.total || 0), 0)
                        .toLocaleString("id-ID")}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
