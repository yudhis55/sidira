import { getUsulanById } from "@/lib/auth/usulan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Package, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteUsulanButton } from "@/components/usulan/delete-button";
import { ItemStatusActions } from "@/components/usulan/item-status-actions";

interface UsulanDetailPageProps {
  params: { id: string };
}

export default async function UsulanDetailPage({ params }: UsulanDetailPageProps) {
  const usulanId = parseInt(params.id);

  if (isNaN(usulanId)) {
    notFound();
  }

  const usulan = await getUsulanById(usulanId);

  if (!usulan) {
    notFound();
  }

  const items = usulan.payload?.items || [];
  const totalValue = items.reduce((sum, item) => sum + item.total, 0);
  const pendingCount = items.filter((item) => item.status === "pending").length;
  const approvedCount = items.filter((item) => item.status === "approved").length;
  const rejectedCount = items.filter((item) => item.status === "rejected").length;

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case "wajib":
        return "destructive";
      case "penting":
        return "default";
      case "pendukung":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/usulan">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detail Usulan</h1>
            <p className="text-muted-foreground">
              {usulan.rooms?.icon} {usulan.rooms?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/usulan/${usulan.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteUsulanButton id={usulan.id} />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang yang Diusulkan</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Belum ada barang dalam usulan ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.nama}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={getPriorityColor(item.prioritas)}>
                            {item.prioritas}
                          </Badge>
                          <Badge variant="outline">{item.kategori}</Badge>
                          <Badge variant={getStatusColor(item.status)}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          Rp {item.total.toLocaleString("id-ID")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.qty} {item.satuan} @ Rp {item.harga.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.keterangan && (
                      <div>
                        <p className="text-sm font-medium mb-1">Keterangan:</p>
                        <p className="text-sm text-muted-foreground">{item.keterangan}</p>
                      </div>
                    )}
                    <ItemStatusActions
                      usulanId={usulan.id}
                      itemIndex={index}
                      currentStatus={item.status}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Dibuat pada:</span>
            <span className="text-sm">
              {new Date(usulan.created_at).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Terakhir diubah:</span>
            <span className="text-sm">
              {new Date(usulan.updated_at).toLocaleString("id-ID")}
            </span>
          </div>
          {rejectedCount > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900">
                ⚠️ {rejectedCount} barang ditolak
              </p>
              <p className="text-xs text-red-700 mt-1">
                Beberapa barang dalam usulan ini telah ditolak. Silakan edit usulan untuk melihat detail.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
