import { getSbbkById } from "@/lib/auth/sbbk";
import { SbbkForm } from "@/components/sbbk/sbbk-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSbbkPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = await getSbbkById(id);

  if (!sbbk) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden />
            <p className="font-mono text-sm font-semibold mb-2">SBBK Tidak Ditemukan</p>
            <Link href="/sbbk">
              <Button size="sm" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali ke Daftar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/sbbk/${sbbk.id}`}>
          <Button variant="outline" size="icon" aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Edit SBBK</h1>
          <p className="text-xs text-muted-foreground">{sbbk.no}</p>
        </div>
      </div>

      <SbbkForm sbbk={sbbk} />
    </div>
  );
}
