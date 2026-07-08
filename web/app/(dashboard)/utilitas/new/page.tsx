import { Button } from "@/components/gas/button";
import { UtilitasForm } from "@/components/utilitas/utilitas-form";
import Link from "next/link";

export default function NewUtilitasPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/utilitas">
          <Button variant="ghost">
            <span className="h-4 w-4">←</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tambah Utilitas</h1>
          <p className="text-muted-foreground">
            Tambah utilitas baru untuk checklist harian
          </p>
        </div>
      </div>

      <UtilitasForm />
    </div>
  );
}
