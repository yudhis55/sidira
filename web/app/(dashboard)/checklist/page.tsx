import Link from "next/link";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { PageHeader } from "@/components/shared/page-elements";
import { ChecklistCalendar } from "@/components/checklist/checklist-calendar";
import { getMockRooms, getMockItemsByRoom } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ChecklistPageProps {
  searchParams: Promise<{ room?: string; year?: string; month?: string }>;
}

export default async function ChecklistPage({ searchParams }: ChecklistPageProps) {
  const params = await searchParams;
  const rooms = getMockRooms();

  if (rooms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon="📋"
          title="Checklist Harian"
          subtitle="Catat kondisi barang setiap hari · klik sel untuk ubah status"
        />
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="mb-3 text-4xl" aria-hidden>
              📋
            </span>
            <h3 className="mb-2 text-base font-extrabold text-ink">
              Belum ada ruangan
            </h3>
            <p className="mb-4 text-sm text-ink3">
              Tambahkan ruangan terlebih dahulu untuk mulai checklist
            </p>
            <Link href="/inventaris/new">
              <Button>➕ Tambah Ruangan</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const selectedRoomId = params.room || rooms[0].id;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const now = new Date();
  const year = params.year
    ? parseInt(params.year, 10) || now.getFullYear()
    : now.getFullYear();
  const monthParam = params.month
    ? parseInt(params.month, 10)
    : now.getMonth() + 1;
  const month = Math.min(Math.max(monthParam, 1), 12) - 1;

  const items = getMockItemsByRoom(selectedRoom.id);

  const roomHref = (roomId: string) =>
    `/checklist?room=${encodeURIComponent(roomId)}&year=${year}&month=${month + 1}`;

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📋"
        title="Checklist Harian"
        subtitle="Klik sel untuk ubah status · Klik kanan / tahan untuk isi keterangan detail"
        stats={[
          { value: rooms.length, label: "Ruangan", tone: "teal" },
          { value: items.length, label: "Barang di ruangan", tone: "blue" },
        ]}
      />

      {rooms.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => {
            const active = room.id === selectedRoom.id;
            return (
              <Link
                key={room.id}
                href={roomHref(room.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-2xl border-[1.5px] px-3 py-1.5 text-[12px] font-bold transition-colors",
                  active
                    ? "border-teal bg-teal4 text-teal"
                    : "border-line bg-white text-ink3 hover:border-teal2 hover:text-teal"
                )}
              >
                <span aria-hidden>{room.icon}</span>
                {room.name}
              </Link>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm text-ink3">
              Belum ada barang di ruangan ini. Tambahkan barang terlebih dahulu.
            </p>
            <div className="mt-4">
              <Link href={`/inventaris/${selectedRoom.id}/items/new`}>
                <Button>➕ Tambah Barang</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <ChecklistCalendar
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          roomIcon={selectedRoom.icon}
          year={year}
          month={month}
          items={items.map((i) => ({
            id: i.id,
            name: i.name,
            spec: i.spec,
            merk: i.merk,
            type: i.type,
            category: i.category,
            index_in_room: i.index_in_room ?? 0,
          }))}
        />
      )}
    </div>
  );
}