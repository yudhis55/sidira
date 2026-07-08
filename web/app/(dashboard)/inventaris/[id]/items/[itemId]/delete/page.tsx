import { getMockItems } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DeleteItemPageProps {
  params: { id: string; itemId: string };
}

async function handleDelete(formData: FormData) {
  "use server";
  const roomId = formData.get("roomId") as string;
  redirect(`/inventaris/${roomId}`);
}

export default async function DeleteItemPage({ params }: DeleteItemPageProps) {
  const { itemId, id } = await params;
  const item = getMockItems().find((i) => i.id === parseInt(itemId, 10));

  if (!item) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <p className="text-center py-12 text-ink3">Barang tidak ditemukan</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventaris/${id}`}>
          <Button variant="ghost">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-3xl font-bold tracking-tight">Hapus Barang</h1>
          <p className="text-sm text-ink3">Konfirmasi penghapusan barang</p>
        </div>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗑️</span>
            <h2 className="text-lg font-bold text-ink">Hapus Barang?</h2>
          </div>
          <p className="text-sm text-ink3">
            Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="bg-line2 p-4 rounded-lg">
            <p className="font-semibold text-ink">{item.name}</p>
            <p className="text-sm text-ink3">
              Kategori: {item.category} | Jumlah: {item.quantity}
            </p>
          </div>

          <form action={handleDelete} className="flex gap-2">
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="roomId" value={id} />
            <Link href={`/inventaris/${id}`}>
              <Button variant="ghost" type="button">
                Batal
              </Button>
            </Link>
            <Button type="submit" className="bg-red text-white hover:opacity-90">
              Ya, Hapus Barang
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
