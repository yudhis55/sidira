import { Suspense } from "react";
import { getMockRooms } from "@/lib/mock-data";
import { getMockRiwayat } from "@/lib/mock-data";
import { RiwayatFilter } from "@/components/riwayat/riwayat-filter";
import { RiwayatList } from "@/components/riwayat/riwayat-list";
import { Card } from "@/components/gas/card";
import { PageHeader } from "@/components/shared/page-elements";

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
        <div className="h-6 w-48 bg-line2 animate-pulse"></div>
        <div className="mt-4 space-y-4">
          <div className="h-16 w-full bg-line2 animate-pulse"></div>
          <div className="h-16 w-full bg-line2 animate-pulse"></div>
          <div className="h-16 w-full bg-line2 animate-pulse"></div>
        </div>
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

  const rooms = getMockRooms();
  const riwayat = getMockRiwayat();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon="🔁"
        title="Riwayat Perpindahan"
        subtitle="Lihat riwayat perpindahan barang antar ruangan"
        stats={[{ value: riwayat.length, label: "Total Catatan", tone: "teal" }]}
      />

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
