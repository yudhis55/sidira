import { getPaktaById } from "@/lib/auth/pakta";
import { PaktaForm } from "@/components/pakta/pakta-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaktaPage({ params }: PageProps) {
  const { id } = await params;
  const pakta = await getPaktaById(id);

  if (!pakta) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pakta/${id}`}>
          <Button variant="outline" size="icon" aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Edit Pakta</h1>
          <p className="text-xs text-muted-foreground">{pakta.nama}</p>
        </div>
      </div>

      <PaktaForm pakta={pakta} />
    </div>
  );
}
