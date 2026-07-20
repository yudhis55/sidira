import React from "react";
import { getMockSbbkById } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";

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
}

export default async function SbbkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = getMockSbbkById(id);

  if (!sbbk) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-3xl mb-3" aria-hidden>📄</span>
            <p className="font-mono text-sm font-semibold mb-2">SBBK Tidak Ditemukan</p>
            <Link href="/sbbk">
              <Button size="sm" variant="ghost">
                ← 
                Kembali ke Daftar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = sbbk.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sbbk">
            <Button variant="ghost" size="icon" aria-label="Kembali">
              ←
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">{sbbk.no}</h1>
            <p className="text-xs text-muted-foreground">Detail SBBK</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/sbbk/${sbbk.id}/edit`}>
            <Button variant="ghost" size="sm">
              <span aria-hidden>✏️</span>
              Edit
            </Button>
          </Link>
          <Link href={`/sbbk/${sbbk.id}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              🖨️ Cetak
            </Button>
          </Link>
          <Link href="/sbbk" title="Mode demo — hapus tidak aktif">
            <Button variant="ghost" size="sm" className="text-red border-red/30 hover:bg-red2">
              🗑️
              Hapus
            </Button>
          </Link>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Informasi SBBK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Nomor SBBK</p>
              <p className="font-mono font-semibold">{sbbk.no}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Tanggal</p>
              <p>{fmtDate(sbbk.tgl)}</p>
            </div>
            {sbbk.anggaran && (
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Anggaran</p>
                <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] ring-1 ring-border">
                  {sbbk.anggaran}
                </span>
              </div>
            )}
            {sbbk.jenis && (
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Jenis</p>
                <p>{sbbk.jenis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Penerima</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Kepada</p>
              <p className="font-semibold">{sbbk.kepada}</p>
            </div>
            {sbbk.ket_umum && (
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Keterangan Umum</p>
                <p className="text-muted-foreground">{sbbk.ket_umum}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-mono text-sm">
              Daftar Barang ({sbbk.items.length} item)
            </CardTitle>
            <span className="font-mono text-sm font-bold">
              Total: Rp {totalValue.toLocaleString("id-ID")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left font-mono text-[10px] uppercase text-muted-foreground">No</th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] uppercase text-muted-foreground">Nama Barang</th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] uppercase text-muted-foreground">Merk</th>
                  <th className="px-4 py-2 text-right font-mono text-[10px] uppercase text-muted-foreground">Qty</th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] uppercase text-muted-foreground">Satuan</th>
                  <th className="px-4 py-2 text-right font-mono text-[10px] uppercase text-muted-foreground">Harga</th>
                  <th className="px-4 py-2 text-right font-mono text-[10px] uppercase text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {sbbk.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{item.nama}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.merk || "-"}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{item.qty}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{item.satuan || "-"}</td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {Number(item.harga || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">
                      {Number(item.total || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/20">
                  <td colSpan={6} className="px-4 py-2.5 text-right font-mono text-[10px] uppercase text-muted-foreground">
                    Total Nilai
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    Rp {totalValue.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
