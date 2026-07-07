import { createClient } from "@/lib/supabase/server";
import { deleteItem } from "@/lib/auth/items";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DeleteItemPageProps {
  params: { id: string; itemId: string };
}

async function handleDelete(formData: FormData) {
  "use server";
  const itemId = formData.get("itemId") as string;
  const roomId = formData.get("roomId") as string;
  await deleteItem(parseInt(itemId, 10), roomId);
  redirect(`/inventaris/${roomId}`);
}

export default async function DeleteItemPage({ params }: DeleteItemPageProps) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", parseInt(itemId, 10))
    .single();

  if (!item) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Barang tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventaris/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-3xl font-bold tracking-tight">Hapus Barang</h1>
          <p className="text-muted-foreground">Konfirmasi penghapusan barang</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Hapus Barang?
          </CardTitle>
          <CardDescription>
            Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              Kategori: {item.category} | Jumlah: {item.quantity}
            </p>
          </div>
          <form action={handleDelete} className="flex gap-2">
            <input type="hidden" name="itemId" value={params.itemId} />
            <input type="hidden" name="roomId" value={params.id} />
            <Link href={`/inventaris/${params.id}`}>
              <Button variant="outline" type="button">
                Batal
              </Button>
            </Link>
            <Button type="submit" variant="destructive">
              Ya, Hapus Barang
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
