import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function UsulanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usulan</h1>
        <p className="text-muted-foreground">
          Proposal pengadaan barang per ruangan
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-12 w-12 text-muted-foreground/50" />
          <CardTitle className="mt-4">Module Dalam Pengembangan</CardTitle>
          <CardDescription className="mt-2 text-center">
            Fitur usulan pengadaan sedang dalam tahap implementasi.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
