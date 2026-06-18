import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPaktaById } from "@/lib/auth/pakta";
import { getRooms } from "@/lib/auth/rooms";
import { ArrowLeft, Edit, Trash2, Calendar, User, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deletePakta } from "@/lib/auth/pakta";

export default async function PaktaDetailPage({ params }: { params: { id: string } }) {
  const pakta = await getPaktaById(params.id);
  const rooms = await getRooms();

  if (!pakta) {
    redirect("/pakta");
  }

  async function handleDelete() {
    "use server";
    await deletePakta(params.id);
    revalidatePath("/pakta");
    redirect("/pakta");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pakta">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pakta.nomor}</h1>
            <p className="text-muted-foreground">Detail Pakta Integritas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/pakta/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <form action={handleDelete}>
            <Button variant="destructive" type="submit">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pakta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nomor Pakta</p>
              <p className="text-lg font-semibold">{pakta.nomor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Tanggal
              </p>
              <p className="font-medium">
                {new Date(pakta.tanggal).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {pakta.lokasi && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Lokasi
                </p>
                <p className="font-medium">{pakta.lokasi}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penanggung Jawab</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-4 w-4" />
                Nama
              </p>
              <p className="text-lg font-semibold">{pakta.pj_nama}</p>
            </div>
            {pakta.pj_jabatan && (
              <div>
                <p className="text-sm text-muted-foreground">Jabatan</p>
                <p className="font-medium">{pakta.pj_jabatan}</p>
              </div>
            )}
            {pakta.pj_nip && (
              <div>
                <p className="text-sm text-muted-foreground">NIP</p>
                <p className="font-medium">{pakta.pj_nip}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Daftar Barang ({pakta.items.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pakta.items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada barang dalam pakta ini
            </p>
          ) : (
            <div className="space-y-4">
              {pakta.items.map((item) => (
                <div key={item.item_id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.nama}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{item.kategori}</Badge>
                        <Badge
                          variant={
                            item.kondisi === "baik"
                              ? "default"
                              : item.kondisi === "rr"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {item.kondisi === "baik"
                            ? "Baik"
                            : item.kondisi === "rr"
                            ? "Rusak Ringan"
                            : item.kondisi === "rb"
                            ? "Rusak Berat"
                            : "Tidak Ada"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {item.keterangan && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Keterangan:</p>
                      <p className="text-sm">{item.keterangan}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
