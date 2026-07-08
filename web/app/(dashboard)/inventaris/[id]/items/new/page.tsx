import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";
import { ItemForm } from "@/components/inventaris/item-form";

interface NewItemPageProps {
  params: { id: string };
}

export default async function NewItemPage({ params }: NewItemPageProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventaris/${id}`}>
          <Button variant="ghost" className="!p-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Barang</h1>
          <p className="text-ink3">Tambah barang baru ke ruangan</p>
        </div>
      </div>

      <Card>
        <div className="pt-6 p-4">
          <ItemForm roomId={id} />
        </div>
      </Card>
    </div>
  );
}
