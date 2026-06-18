import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaktaForm } from "@/components/pakta/pakta-form";
import { getPaktaById } from "@/lib/auth/pakta";
import { getRooms } from "@/lib/auth/rooms";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditPaktaPage({ params }: { params: { id: string } }) {
  const pakta = await getPaktaById(params.id);
  const rooms = await getRooms();

  if (!pakta) {
    redirect("/pakta");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/pakta/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Pakta</h1>
          <p className="text-muted-foreground">Ubah informasi pakta integritas</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pakta Integritas</CardTitle>
          <CardDescription>
            Update informasi penanggung jawab dan daftar barang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaktaForm pakta={pakta} rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  );
}
