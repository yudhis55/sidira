import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtilitasForm } from "@/components/utilitas/utilitas-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewUtilitasPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/utilitas">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
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
