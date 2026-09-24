import { getRoomById } from "@/lib/auth/rooms";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";
import { RoomForm } from "@/components/inventaris/room-form";

interface EditRoomPageProps {
  params: { id: string };
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;
  let room;
  try {
    room = await getRoomById(id);
  } catch {
    room = null;
  }

  if (!room) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <p className="text-center py-12 text-ink3">Ruangan tidak ditemukan</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventaris/${room.id}`}>
          <Button variant="ghost" className="h-9 w-9 p-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Ruangan</h1>
          <p className="text-ink3">Ubah informasi ruangan</p>
        </div>
      </div>

      <Card>
        <div className="pt-6 p-4">
          <RoomForm room={room} />
        </div>
      </Card>
    </div>
  );
}
