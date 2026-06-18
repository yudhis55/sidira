import { getRooms } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { generateSbbkNumber } from "@/lib/auth/sbbk";
import { SbbkForm } from "@/components/sbbk/sbbk-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewSBBKPage() {
  const rooms = await getRooms();

  // Generate SBBK number
  const sbbkNumber = await generateSbbkNumber();

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

  // Create initial SBBK data
  const initialSbbk = {
    no: sbbkNumber,
    tgl: new Date().toISOString().split("T")[0],
    kepada: "",
    jenis: "",
    anggaran: "",
    ket_umum: "",
    items: [],
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/sbbk">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat SBBK Baru</h1>
          <p className="text-muted-foreground">Surat Bukti Barang Keluar</p>
        </div>
      </div>

      <SbbkForm sbbk={initialSbbk as any} rooms={rooms} initialItems={initialItems} />
    </div>
  );
}
