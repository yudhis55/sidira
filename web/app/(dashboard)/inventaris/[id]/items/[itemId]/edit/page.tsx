import { getItems } from "@/lib/auth/items";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";
import { ItemForm } from "@/components/inventaris/item-form";

interface EditItemPageProps {
  params: { id: string; itemId: string };
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { itemId, id } = await params;
  let item;
  try {
    const items = await getItems(id);
    item = items.find((i) => i.id === parseInt(itemId, 10));
  } catch {
    item = undefined;
  }

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
          <Button variant="ghost" className="h-9 w-9 p-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Barang</h1>
          <p className="text-ink3">Ubah informasi barang</p>
        </div>
      </div>

      <Card>
        <div className="pt-6 p-4">
          <ItemForm roomId={id} item={item} />
        </div>
      </Card>
    </div>
  );
}
