import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ItemForm } from "@/components/inventaris/item-form";
import type { Item } from "@/types/database";

interface EditItemPageProps {
  params: { id: string; itemId: string };
}

export default async function EditItemPage({ params }: EditItemPageProps) {
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Barang</h1>
          <p className="text-muted-foreground">Ubah informasi barang</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ItemForm roomId={params.id} item={item as Item} />
        </CardContent>
      </Card>
    </div>
  );
}
