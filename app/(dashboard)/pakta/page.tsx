import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPaktaList } from "@/lib/auth/pakta";
import { Plus, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";

export default async function PaktaPage() {
  const paktaList = await getPaktaList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pakta Integritas</h1>
          <p className="text-muted-foreground">
            Kelola surat perjanjian tanggung jawab atas aset
          </p>
        </div>
        <Link href="/pakta/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Pakta Baru
          </Button>
        </Link>
      </div>

      {paktaList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl mb-2">Belum ada Pakta</CardTitle>
            <CardDescription className="text-center mb-4">
              Buat pakta pertama Anda untuk mendokumentasikan tanggung jawab atas aset
            </CardDescription>
            <Link href="/pakta/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Pakta Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paktaList.map((pakta) => (
            <Link key={pakta.id} href={`/pakta/${pakta.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{pakta.nomor}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(pakta.tanggal).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{pakta.pj_nama}</span>
                    </div>
                    {pakta.pj_jabatan && (
                      <p className="text-sm text-muted-foreground">{pakta.pj_jabatan}</p>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-semibold">{pakta.items.length}</span> barang
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
