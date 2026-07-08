import { PaktaForm } from "@/components/pakta/pakta-form";
import { Button } from "@/components/gas/button";
import Link from "next/link";

export default function NewPaktaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pakta">
          <Button variant="ghost" aria-label="Kembali">
            <span className="mr-1">⬅️</span> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Entri Pakta Integritas Baru</h1>
          <p className="text-xs text-ink3">Pakta Integritas Pemanfaatan BMD</p>
        </div>
      </div>

      <PaktaForm />
    </div>
  );
}
