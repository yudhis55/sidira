import { getSbbkById, deleteSbbk } from "@/lib/auth/sbbk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Printer, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteSbbk(id);
  revalidatePath("/sbbk");
  redirect("/sbbk");
}

export default async function SbbkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = await getSbbkById(id);

  if (!sbbk) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden />
            <p className="font-mono text-sm font-semibold mb-2">SBBK Tidak Ditemukan</p>
            <Link href="/sbbk">
              <Button size="sm" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
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
            <Button variant="outline" size="icon" aria-label="Kembali">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">{sbbk.no}</h1>
            <p className="text-xs text-muted-foreground">Detail SBBK</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/sbbk/${sbbk.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Link href={`/sbbk/${sbbk.id}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Cetak
            </Button>
          </Link>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={sbbk.id} />
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          </form>
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
          <CardTitle className="font-mono text-sm">Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sbbk.items.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Tidak ada barang dalam SBBK ini
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium">No</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Nama Barang</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                    <th className="h-9 px-2 text-right font-mono font-medium">Qty</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Satuan</th>
                    <th className="h-9 px-2 text-right font-mono font-medium">Harga Satuan</th>
                    <th className="h-9 px-2 text-right font-mono font-medium">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {sbbk.items.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="px-2 py-2 font-mono">{index + 1}</td>
                      <td className="px-2 py-2 font-medium">{item.nama}</td>
                      <td className="px-2 py-2 text-muted-foreground">{item.merk || "-"}</td>
                      <td className="px-2 py-2 text-right font-mono">{item.qty}</td>
                      <td className="px-2 py-2">{item.satuan}</td>
                      <td className="px-2 py-2 text-right font-mono">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </td>
                      <td className="px-2 py-2 text-right font-mono font-semibold">
                        Rp {item.total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr className="border-t-2 border-border">
                    <td colSpan={6} className="px-2 py-2 text-right font-mono font-bold">
                      Total Nilai:
                    </td>
                    <td className="px-2 py-2 text-right font-mono font-bold">
                      Rp {totalValue.toLocaleString("id-ID")}
                    </td>
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
