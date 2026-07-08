import { Button } from "@/components/gas/button";
import { UtilitasForm } from "@/components/utilitas/utilitas-form";
import { getMockUtilitasMeta } from "@/lib/mock-data";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditUtilitasPageProps {
  params: { utilId: string };
}

export default async function EditUtilitasPage({ params }: EditUtilitasPageProps) {
  const { utilId } = await params;

  const metaList = getMockUtilitasMeta();
  const utilMeta = metaList.find((m) => m.util_id === utilId);

  if (!utilMeta) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/utilitas/${utilId}`}>
          <Button variant="ghost">
            <span className="h-4 w-4">←</span>
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
