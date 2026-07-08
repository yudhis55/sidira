import { PaktaForm } from "@/components/pakta/pakta-form";
import { Button } from "@/components/gas/button";
import { getMockPaktaById } from "@/lib/mock-data/pakta";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPaktaPage({ params }: PageProps) {
  const { id } = await params;
  const pakta = getMockPaktaById(id) ?? null;

  if (!pakta) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/pakta/${id}`}>
          <Button variant="ghost" aria-label="Kembali">
            <span className="mr-1">⬅️</span> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Edit Pakta</h1>
          <p className="text-xs text-ink3">{pakta.nama}</p>
        </div>
      </div>

      <PaktaForm pakta={pakta} />
    </div>
  );
}
