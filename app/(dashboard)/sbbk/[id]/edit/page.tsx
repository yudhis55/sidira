import { getSbbkById } from "@/lib/auth/sbbk";
import { getRooms } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { SbbkForm } from "@/components/sbbk/sbbk-form";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

interface EditSBBKPageProps {
  params: { id: string };
}

export default async function EditSBBKPage({ params }: EditSBBKPageProps) {
  const sbbk = await getSbbkById(params.id);
  const rooms = await getRooms();

  if (!sbbk) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl mb-2">SBBK Tidak Ditemukan</CardTitle>
            <Link href="/sbbk">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Daftar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get items from first room if available
  let initialItems: Array<{ id: number; name: string; room_id: string }> = [];
  if (rooms.length > 0) {
    const roomItems = await getItems(rooms[0].id);
    initialItems = roomItems.map((item) => ({
      id: item.id,
      name: item.name,
      room_id: item.room_id,
    }));
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/sbbk/${sbbk.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit SBBK</h1>
          <p className="text-muted-foreground">{sbbk.no}</p>
        </div>
      </div>

      <SbbkForm sbbk={sbbk} rooms={rooms} initialItems={initialItems} />
    </div>
  );
}
