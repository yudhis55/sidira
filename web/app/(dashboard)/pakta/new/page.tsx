import { PaktaForm } from "@/components/pakta/pakta-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewPaktaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pakta">
          <Button variant="outline" size="icon" aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Entri Pakta Integritas Baru</h1>
          <p className="text-xs text-muted-foreground">Pakta Integritas Pemanfaatan BMD</p>
        </div>
      </div>

      <PaktaForm />
    </div>
  );
}
