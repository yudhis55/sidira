import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUtilMetaList } from "@/lib/auth/utilitas";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function UtilitasPage() {
  const utilitasList = await getUtilMetaList();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Utilitas</h1>
          <p className="text-muted-foreground">
            Kelola utilitas seperti Ambulance, Genset, IPAL
          </p>
        </div>
        <Link href="/utilitas/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Utilitas
          </Button>
        </Link>
      </div>

      {utilitasList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Belum ada utilitas. Klik "Tambah Utilitas" untuk menambahkan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {utilitasList.map((util) => (
            <Link key={util.util_id} href={`/utilitas/${util.util_id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{util.icon}</span>
                    <span>{util.label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: util.warna }}
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: util.bg }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Urutan: {util.order_no}
                    {util.custom && " • Custom"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
