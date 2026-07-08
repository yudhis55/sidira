import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { getMockRooms, getMockItemsByRoom } from "@/lib/mock-data";
import { ChecklistCalendar } from "@/components/checklist/checklist-calendar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React from "react";

const CardHeader = ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>;
const CardTitle = ({ children, ...p }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="font-mono font-bold" {...p}>{children}</h3>;
const CardDescription = ({ children, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-sm text-ink3" {...p}>{children}</p>;
const CardContent = ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>;

// Stub: no mock for checklist entries yet
function getChecklistEntries(_roomId: string, _start: string, _end: string) {
  return [];
}

interface ChecklistPageProps {
  searchParams: Promise<{ room?: string; year?: string; month?: string }>;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default async function ChecklistPage({ searchParams }: ChecklistPageProps) {
  const params = await searchParams;
  const rooms = getMockRooms();

  if (rooms.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card className="rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl">📋</span>
            <CardTitle className="mb-2 text-xl font-mono">Belum ada ruangan</CardTitle>
            <CardDescription className="mb-4 text-center">
              Tambahkan ruangan terlebih dahulu untuk mulai checklist
            </CardDescription>
            <Link href="/inventaris/new">
              <Button>
                ➕ Tambah Ruangan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resolve selected room (default first room).
  const selectedRoomId = params.room || rooms[0].id;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Resolve year/month (1-based month in URL; default to today).
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) || now.getFullYear() : now.getFullYear();
  const monthParam = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
  // Clamp month to 1..12 and convert to 0-based.
  const month = Math.min(Math.max(monthParam, 1), 12) - 1;

  // Fetch items for the selected room.
  const items = getMockItemsByRoom(selectedRoom.id);

  // Fetch checklist entries for the SELECTED year/month (fixes the
  // "only fetches current month" bug).
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDate = `${year}-${pad2(month + 1)}-01`;
  const endDate = `${year}-${pad2(month + 1)}-${pad2(daysInMonth)}`;

  const entries = await getChecklistEntries(selectedRoom.id, startDate, endDate);

  // Build a query-string helper preserving year/month when switching rooms.
  const roomHref = (roomId: string) =>
    `/checklist?room=${encodeURIComponent(roomId)}&year=${year}&month=${month + 1}`;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="font-mono text-3xl font-bold tracking-tight">Checklist Harian</h1>
        <p className="text-muted-foreground">Catat kondisi barang setiap hari</p>
      </div>

      {/* Room Selector */}
      {rooms.length > 1 && (
        <Card className="rounded-none">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  href={roomHref(room.id)}
                  className={cn(
                    "rounded-none px-3 py-1.5 font-mono text-xs transition-colors",
                    room.id === selectedRoom.id
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <span className="mr-1.5">{room.icon}</span>
                  {room.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="font-mono">
            {selectedRoom.icon} {selectedRoom.name}
          </CardTitle>
          <CardDescription>{items.length} barang di ruangan ini</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Belum ada barang di ruangan ini. Tambahkan barang terlebih dahulu.
              <div className="mt-4">
                <Link href={`/inventaris/${selectedRoom.id}/items/new`}>
                  <Button>
                    ➕
                    Tambah Barang
                  </Button>
                </Link>
              </div>
            </div>
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
              entries={entries}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
