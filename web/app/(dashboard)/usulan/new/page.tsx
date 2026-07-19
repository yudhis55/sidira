import { getMockRooms } from "@/lib/mock-data";
import { UsulanForm } from "@/components/usulan/usulan-form";
import Link from "next/link";
import { Button } from "@/components/gas/button";

interface NewUsulanPageProps {
  searchParams: Promise<{ room?: string }>;
}

export default async function NewUsulanPage({
  searchParams,
}: NewUsulanPageProps) {
  const sp = await searchParams;
  const defaultRoomId = sp.room || undefined;
  const rooms = getMockRooms();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/usulan">
          <Button variant="ghost" size="icon">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">
            Buat Usulan Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Ajukan usulan pengadaan barang untuk ruangan
          </p>
        </div>
      </div>

      <UsulanForm rooms={rooms} defaultRoomId={defaultRoomId} />
    </div>
  );
}
