import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUsulanById } from "@/lib/auth/usulan";
import { getRooms } from "@/lib/auth/rooms";
import { UsulanForm } from "@/components/usulan/usulan-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUsulanPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  let usulan;
  try {
    usulan = await getUsulanById(id);
  } catch {
    notFound();
  }

  const rooms = await getRooms();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/usulan/${usulan.id}`}>
          <Button variant="outline" size="icon" aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">
            Edit Usulan
          </h1>
          <p className="text-xs text-muted-foreground">
            {usulan.rooms?.name || usulan.room_id} ·{" "}
            {new Date(usulan.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {usulan.payload?.items?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden />
            <p className="font-mono text-sm font-semibold mb-1">
              Usulan kosong
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Usulan ini belum memiliki barang. Anda dapat menambahkannya di
              bawah ini.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <UsulanForm rooms={rooms} usulan={usulan} />
    </div>
  );
}
