import { Suspense } from "react";
import { getRooms } from "@/lib/auth/rooms";
import { getRiwayatList } from "@/lib/auth/riwayat";
import { RiwayatFilter } from "@/components/riwayat/riwayat-filter";
import { RiwayatList } from "@/components/riwayat/riwayat-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RiwayatPageProps {
  searchParams: Promise<{
    start_date?: string;
    end_date?: string;
    room_id?: string;
    kategori?: string;
  }>;
}

function RiwayatLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function RiwayatPage({ searchParams }: RiwayatPageProps) {
  const params = await searchParams;

  const start_date = params.start_date;
  const end_date = params.end_date;
  const room_id = params.room_id;
  const kategori = params.kategori;

  const rooms = await getRooms();
  const riwayat = await getRiwayatList({
    start_date,
    end_date,
    room_id,
    kategori,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Riwayat Perpindahan</h1>
        <p className="text-muted-foreground">
          Lihat riwayat perpindahan barang antar ruangan
        </p>
      </div>

      <RiwayatFilter
        start_date={start_date}
        end_date={end_date}
        room_id={room_id}
        kategori={kategori}
        rooms={rooms}
      />

      <Suspense fallback={<RiwayatLoading />}>
        <RiwayatList riwayat={riwayat} />
      </Suspense>
    </div>
  );
}
