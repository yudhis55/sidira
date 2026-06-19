import { getUsulanList } from "@/lib/auth/usulan";
import { getRooms } from "@/lib/auth/rooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, Package, TrendingUp, Building2 } from "lucide-react";
import Link from "next/link";

export default async function UsulanPage() {
  const usulanList = await getUsulanList();
  const rooms = await getRooms();

  // Calculate statistics
  const totalItems = usulanList.reduce(
    (sum, usulan) => sum + (usulan.payload?.items?.length || 0),
    0
  );
  const totalValue = usulanList.reduce((sum, usulan) => {
    const itemsTotal =
      usulan.payload?.items?.reduce((itemSum, item) => itemSum + item.total, 0) || 0;
    return sum + itemsTotal;
  }, 0);
  const pendingCount = usulanList.reduce(
    (sum, usulan) =>
      sum +
      (usulan.payload?.items?.filter((item) => item.status === "pending").length || 0),
    0
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usulan Pengadaan</h1>
          <p className="text-muted-foreground">
            Kelola usulan pengadaan barang dari setiap ruangan
          </p>
        </div>
        <Link href="/usulan/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Usulan
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usulan</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usulanList.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalItems} barang diusulkan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalValue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimasi total biaya pengadaan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Barang menunggu persetujuan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usulan List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Usulan</CardTitle>
        </CardHeader>
        <CardContent>
          {usulanList.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Usulan</h3>
              <p className="text-muted-foreground mb-4">
                Mulai buat usulan pengadaan barang dari ruangan Anda
              </p>
              <Link href="/usulan/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Usulan Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {usulanList.map((usulan) => {
                const itemCount = usulan.payload?.items?.length || 0;
                const totalValue =
                  usulan.payload?.items?.reduce(
                    (sum, item) => sum + item.total,
                    0
                  ) || 0;
                const pendingItems =
                  usulan.payload?.items?.filter(
                    (item) => item.status === "pending"
                  ).length || 0;
                const approvedItems =
                  usulan.payload?.items?.filter(
                    (item) => item.status === "approved"
                  ).length || 0;
                const rejectedItems =
                  usulan.payload?.items?.filter(
                    (item) => item.status === "rejected"
                  ).length || 0;

                return (
                  <Link key={usulan.id} href={`/usulan/${usulan.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-6 w-6" />
                            <div>
                              <CardTitle className="text-lg">
                                {usulan.rooms?.name || "Unknown Room"}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {new Date(usulan.created_at).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              Rp {totalValue.toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {itemCount} barang
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {pendingItems > 0 && (
                            <Badge variant="secondary">
                              {pendingItems} Pending
                            </Badge>
                          )}
                          {approvedItems > 0 && (
                            <Badge variant="default">
                              {approvedItems} Disetujui
                            </Badge>
                          )}
                          {rejectedItems > 0 && (
                            <Badge variant="destructive">
                              {rejectedItems} Ditolak
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
