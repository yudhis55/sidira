import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRooms } from "@/lib/auth/rooms";
import { getItems } from "@/lib/auth/items";
import { getChecklistEntries } from "@/lib/auth/checklist";
import { ChecklistCalendar } from "@/components/checklist/checklist-calendar";
import { ClipboardCheck, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChecklistPageProps {
  searchParams: Promise<{ room?: string }>;
}

export default async function ChecklistPage({ searchParams }: ChecklistPageProps) {
  const params = await searchParams;
  const rooms = await getRooms();

  if (rooms.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl mb-2">Belum ada ruangan</CardTitle>
            <CardDescription className="text-center mb-4">
              Tambahkan ruangan terlebih dahulu untuk mulai checklist
            </CardDescription>
            <Link href="/inventaris/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Ruangan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get selected room from URL or default to first room
  const selectedRoomId = params.room || rooms[0].id;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Get items for selected room
  const items = await getItems(selectedRoom.id);

  // Get entries for current month
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

  const entries = await getChecklistEntries(selectedRoom.id, startDate, endDate);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checklist Harian</h1>
        <p className="text-muted-foreground">
          Catat kondisi barang setiap hari
        </p>
      </div>

      {/* Room Selector */}
      {rooms.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/checklist?room=${room.id}`}
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors",
                    room.id === selectedRoom.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <span className="mr-2">{room.icon}</span>
                  {room.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedRoom.icon} {selectedRoom.name}
                </CardTitle>
                <CardDescription>
                  {items.length} barang di ruangan ini
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada barang di ruangan ini. Tambahkan barang terlebih dahulu.
                <div className="mt-4">
                  <Link href={`/inventaris/${selectedRoom.id}/items/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Barang
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ChecklistCalendar
                roomId={selectedRoom.id}
                items={items.map((i, index) => ({
                  id: i.id,
                  name: i.name,
                  merk: i.merk,
                  model: i.model,
                  category: i.category,
                  index: i.index_in_room ?? index,
                }))}
                entries={entries}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
