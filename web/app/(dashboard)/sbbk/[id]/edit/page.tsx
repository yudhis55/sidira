import { SbbkForm } from "@/components/sbbk/sbbk-form";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { getMockSbbk } from "@/lib/mock-data/sbbk";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSbbkPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = getMockSbbk().find((s) => s.id === id) ?? null;

  if (!sbbk) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-3" aria-hidden>📝</div>
          <p className="font-mono text-sm font-semibold mb-2">SBBK Tidak Ditemukan</p>
          <Link href="/sbbk">
            <Button variant="ghost">
              <span className="mr-1">⬅️</span> Kembali ke Daftar
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/sbbk/${sbbk.id}`}>
          <Button variant="ghost" aria-label="Kembali">
            <span className="mr-1">⬅️</span> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Edit SBBK</h1>
          <p className="text-xs text-ink3">{sbbk.no}</p>
        </div>
      </div>

      <SbbkForm sbbk={sbbk} />
    </div>
  );
}
