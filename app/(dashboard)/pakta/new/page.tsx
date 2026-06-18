import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaktaForm } from "@/components/pakta/pakta-form";
import { getRooms } from "@/lib/auth/rooms";
import { generatePaktaNumber } from "@/lib/auth/pakta";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewPaktaPage() {
  const rooms = await getRooms();
  const nomor = await generatePaktaNumber();
  const tanggal = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pakta">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Pakta Baru</h1>
          <p className="text-muted-foreground">
            Buat surat perjanjian tanggung jawab atas aset
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pakta Integritas</CardTitle>
          <CardDescription>
            Isi informasi penanggung jawab dan pilih barang yang akan dipegang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaktaForm rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  );
}
