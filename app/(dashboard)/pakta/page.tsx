import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function PaktaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pakta Integritas</h1>
        <p className="text-muted-foreground">
          Dokumen pakta integritas penanggung jawab aset
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <CardTitle className="mt-4">Module Dalam Pengembangan</CardTitle>
          <CardDescription className="mt-2 text-center">
            Fitur Pakta Integritas sedang dalam tahap implementasi.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
