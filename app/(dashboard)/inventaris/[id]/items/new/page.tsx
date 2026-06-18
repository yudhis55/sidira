import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ItemForm } from "@/components/inventaris/item-form";

interface NewItemPageProps {
  params: { id: string };
}

export default function NewItemPage({ params }: NewItemPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventaris/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Barang</h1>
          <p className="text-muted-foreground">Tambah barang baru ke ruangan</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ItemForm roomId={params.id} />
        </CardContent>
      </Card>
    </div>
  );
}
