import { getRooms } from "@/lib/auth/rooms";
import { UsulanForm } from "@/components/usulan/usulan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewUsulanPage() {
  const rooms = await getRooms();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/usulan">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Buat Usulan Baru</h1>
          <p className="text-muted-foreground">
            Ajukan usulan pengadaan barang untuk ruangan
          </p>
        </div>
      </div>

      <UsulanForm rooms={rooms} />
    </div>
  );
}
