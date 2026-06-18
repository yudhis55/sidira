import { getSbbkList } from "@/lib/auth/sbbk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";

export default async function SBBKPage() {
  const sbbkList = await getSbbkList();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SBBK</h1>
          <p className="text-muted-foreground">
            Surat Bukti Barang Keluar
          </p>
        </div>
        <Link href="/sbbk/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat SBBK Baru
          </Button>
        </Link>
      </div>

      {sbbkList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl mb-2">Belum ada SBBK</CardTitle>
            <p className="text-muted-foreground text-center mb-4">
              Buat SBBK pertama Anda untuk mencatat pengeluaran barang
            </p>
            <Link href="/sbbk/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buat SBBK Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sbbkList.map((sbbk) => (
            <Link key={sbbk.id} href={`/sbbk/${sbbk.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{sbbk.no}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(sbbk.tgl).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{sbbk.anggaran || "Umum"}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{sbbk.kepada}</p>
                        {sbbk.jenis && (
                          <p className="text-sm text-muted-foreground">
                            {sbbk.jenis}
                          </p>
                        )}
                      </div>
                    </div>
                    {sbbk.ket_umum && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sbbk.ket_umum}
                      </p>
                    )}
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
