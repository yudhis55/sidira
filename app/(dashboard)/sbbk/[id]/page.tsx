import { getSbbkById, deleteSbbk } from "@/lib/auth/sbbk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, User, FileText } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface SBBKDetailPageProps {
  params: { id: string };
}

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteSbbk(id);
  revalidatePath("/sbbk");
  redirect("/sbbk");
}

export default async function SBBKDetailPage({ params }: SBBKDetailPageProps) {
  const { id } = await params;
  const sbbk = await getSbbkById(id);

  if (!sbbk) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl mb-2">SBBK Tidak Ditemukan</CardTitle>
            <Link href="/sbbk">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = sbbk.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sbbk">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{sbbk.no}</h1>
            <p className="text-muted-foreground">Detail SBBK</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/sbbk/${sbbk.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={sbbk.id} />
            <Button variant="destructive" type="submit">
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi SBBK</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nomor SBBK</label>
              <p className="text-lg font-semibold">{sbbk.no}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tanggal</label>
                <p>
                  {new Date(sbbk.tgl).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            {sbbk.anggaran && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Anggaran</label>
                <Badge variant="outline" className="ml-2">
                  {sbbk.anggaran}
                </Badge>
              </div>
            )}
            {sbbk.jenis && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jenis</label>
                <p>{sbbk.jenis}</p>
              </div>
            )}
            {sbbk.ket_umum && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Keterangan Umum</label>
                <p className="text-sm text-muted-foreground">{sbbk.ket_umum}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penerima</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kepada</label>
                <p className="font-semibold">{sbbk.kepada}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent>
          {sbbk.items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Tidak ada barang dalam SBBK ini
            </p>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-semibold">No</th>
                      <th className="text-left p-3 font-semibold">Nama Barang</th>
                      <th className="text-left p-3 font-semibold">Merk</th>
                      <th className="text-right p-3 font-semibold">Jumlah</th>
                      <th className="text-left p-3 font-semibold">Satuan</th>
                      <th className="text-right p-3 font-semibold">Harga</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sbbk.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{item.nama}</td>
                        <td className="p-3 text-muted-foreground">{item.merk || "-"}</td>
                        <td className="p-3 text-right">{item.qty}</td>
                        <td className="p-3">{item.satuan}</td>
                        <td className="p-3 text-right">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          Rp {item.total.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted border-t-2">
                    <tr>
                      <td colSpan={6} className="p-3 text-right font-bold">
                        Total Nilai:
                      </td>
                      <td className="p-3 text-right font-bold text-lg">
                        Rp {totalValue.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
