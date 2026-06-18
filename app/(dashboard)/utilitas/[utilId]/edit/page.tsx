import { Button } from "@/components/ui/button";
import { UtilitasForm } from "@/components/utilitas/utilitas-form";
import { getUtilMetaById } from "@/lib/auth/utilitas";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditUtilitasPageProps {
  params: { utilId: string };
}

export default async function EditUtilitasPage({ params }: EditUtilitasPageProps) {
  const { utilId } = params;

  let utilMeta;
  try {
    utilMeta = await getUtilMetaById(utilId);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/utilitas/${utilId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Utilitas</h1>
          <p className="text-muted-foreground">
            Edit informasi utilitas {utilMeta.label}
          </p>
        </div>
      </div>

      <UtilitasForm utilitas={utilMeta} />
    </div>
  );
}
