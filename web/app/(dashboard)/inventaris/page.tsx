import { InventarisOverview } from "@/components/inventaris/inventaris-overview";
import { Card } from "@/components/gas/card";
import { getRooms } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { getUsulanList } from "@/lib/auth/usulan";

export const dynamic = "force-dynamic";

export default async function InventarisPage() {
  let rooms;
  try {
    rooms = await getRooms();
  } catch {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <p className="text-center py-12 text-ink3">Gagal memuat data ruangan</p>
        </Card>
      </div>
    );
  }
  const itemsByRoom = await Promise.all(rooms.map((room) => getItems(room.id)));
  const items = itemsByRoom.flat();
  // Tabel `usulan` kosong → daftar kosong; halaman tetap tampil.
  const usulan = await getUsulanList().catch(
    () => [] as Awaited<ReturnType<typeof getUsulanList>>
  );

  return (
    <InventarisOverview
      rooms={rooms}
      items={items}
      usulan={usulan}
    />
  );
}
