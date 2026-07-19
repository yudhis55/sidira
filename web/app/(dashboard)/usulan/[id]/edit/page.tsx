import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { getMockUsulan, getMockRooms } from "@/lib/mock-data";
import { UsulanForm } from "@/components/usulan/usulan-form";

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUsulanPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const usulan = getMockUsulan().find((u) => u.id === id);
  if (!usulan) notFound();

  const rooms = getMockRooms();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/usulan/${usulan.id}`}>
          <Button variant="ghost" size="icon" aria-label="Kembali">
            ←
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
            💡
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
