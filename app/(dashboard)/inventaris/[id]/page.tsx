import { createClient } from "@/lib/supabase/server";
import { getRoomById } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface RoomDetailPageProps {
  params: { id: string };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const room = await getRoomById(params.id);
  const items = await getItems(params.id);

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "baik":
        return <Badge className="bg-green-500">Baik</Badge>;
      case "rusak_ringan":
        return <Badge className="bg-yellow-500">Rusak Ringan</Badge>;
      case "rusak_berat":
        return <Badge className="bg-red-500">Rusak Berat</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!room) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Ruangan tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventaris">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{room.icon}</div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
              <p className="text-muted-foreground">{room.description || "Tidak ada deskripsi"}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/inventaris/${room.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Ruangan
            </Button>
          </Link>
          <Link href={`/inventaris/${room.id}/items/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Barang
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
          <CardDescription>
            Total {items.length} barang di ruangan ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada barang di ruangan ini</p>
              <Link href={`/inventaris/${room.id}/items/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Barang
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Merk/Model</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Tgl Perolehan</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>
                      {item.merk || "-"} {item.model && `/ ${item.model}`}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{getConditionBadge(item.condition)}</TableCell>
                    <TableCell>{formatDate(item.purchase_date)}</TableCell>
                    <TableCell>{formatCurrency(item.purchase_price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/inventaris/${room.id}/items/${item.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/inventaris/${room.id}/items/${item.id}/delete`}>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
