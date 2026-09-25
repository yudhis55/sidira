import { InventarisOverview } from "@/components/inventaris/inventaris-overview";
import { Card } from "@/components/gas/card";
import { getRooms } from "@/lib/auth/rooms";
import { getAllItems } from "@/lib/auth/items";
import { getUsulanList } from "@/lib/auth/usulan";

export const dynamic = "force-dynamic";

export default async function InventarisPage() {
  // Paralel: 1 query rooms + 1 query semua items + usulan (ganti 51 getItems
  // per-room + usulan serial).
  const [roomsRes, itemsRes, usulan] = await Promise.all([
    getRooms().then(
      (v): { rooms: typeof v; error: false } => ({ rooms: v, error: false }),
      (): { rooms: null; error: true } => ({ rooms: null, error: true })
    ),
    getAllItems().catch(() => []),
    // Tabel `usulan` kosong → daftar kosong; halaman tetap tampil.
    getUsulanList().catch(
      () => [] as Awaited<ReturnType<typeof getUsulanList>>
    ),
  ]);
  const rooms = roomsRes.rooms;
  const items = itemsRes;
  if (!rooms) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <p className="text-center py-12 text-ink3">Gagal memuat data ruangan</p>
        </Card>
      </div>
    );
  }

  return (
    <InventarisOverview
      rooms={rooms}
      items={items}
      usulan={usulan}
    />
  );
}
