import { getRoomById } from "@/lib/auth/rooms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RoomForm } from "@/components/inventaris/room-form";

interface EditRoomPageProps {
  params: { id: string };
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Ruangan tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventaris/${room.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Ruangan</h1>
          <p className="text-muted-foreground">Ubah informasi ruangan</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RoomForm room={room} />
        </CardContent>
      </Card>
    </div>
  );
}
