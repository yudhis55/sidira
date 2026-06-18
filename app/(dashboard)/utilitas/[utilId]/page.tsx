import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemsForm } from "@/components/utilitas/items-form";
import { Checklist } from "@/components/utilitas/checklist";
import { UtilitasForm } from "@/components/utilitas/utilitas-form";
import {
  getUtilMetaById,
  getUtilItems,
  getUtilState,
} from "@/lib/auth/utilitas";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface UtilitasDetailPageProps {
  params: { utilId: string };
}

export default async function UtilitasDetailPage({ params }: UtilitasDetailPageProps) {
  const { utilId } = params;

  let utilMeta;
  try {
    utilMeta = await getUtilMetaById(utilId);
  } catch (error) {
    notFound();
  }

  const utilItems = await getUtilItems(utilId);
  const utilStates = await getUtilState(utilId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/utilitas">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-4xl">{utilMeta.icon}</span>
              <span>{utilMeta.label}</span>
            </h1>
            <p className="text-muted-foreground">ID: {utilMeta.util_id}</p>
          </div>
        </div>
        <Link href={`/utilitas/${utilId}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist">Checklist Harian</TabsTrigger>
          <TabsTrigger value="items">Daftar Item</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <Checklist
            utilId={utilId}
            items={utilItems.items}
            states={utilStates}
          />
        </TabsContent>

        <TabsContent value="items">
          <ItemsForm utilId={utilId} initialItems={utilItems.items} />
        </TabsContent>

        <TabsContent value="settings">
          <UtilitasForm utilitas={utilMeta} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
