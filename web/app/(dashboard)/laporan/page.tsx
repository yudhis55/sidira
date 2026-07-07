import { Suspense } from "react";
import { getRooms } from "@/lib/auth/rooms";
import { getLaporanSummary, getLaporanPerRoom } from "@/lib/auth/laporan";
import { LaporanFilter } from "@/components/laporan/laporan-filter";
import { LaporanSummary } from "@/components/laporan/laporan-summary";
import { LaporanRoomDetail } from "@/components/laporan/laporan-room-detail";
import { ExportButtons } from "@/components/laporan/export-buttons";
import { PageHeader } from "@/components/shared/page-elements";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LaporanPageProps {
  searchParams: Promise<{
    bulan?: string;
    tahun?: string;
    room_id?: string;
    kategori?: string;
  }>;
}

function LaporanLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;
  const now = new Date();

  const bulan = params.bulan ? parseInt(params.bulan) : now.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : now.getFullYear();
  const room_id = params.room_id;
  const kategori = params.kategori;

  const rooms = await getRooms();
  const summary = await getLaporanSummary({ bulan, tahun, room_id, kategori });
  const laporanRooms = await getLaporanPerRoom({ bulan, tahun, room_id, kategori });

  const bulanNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        icon="📈"
        title="Laporan Inventaris"
        subtitle={`Laporan kondisi inventaris bulan ${bulanNames[bulan - 1]} ${tahun}`}
        actions={
          <ExportButtons
            bulan={bulan}
            tahun={tahun}
            room_id={room_id}
            kategori={kategori}
            summary={summary}
            rooms={laporanRooms}
          />
        }
      />

      <LaporanFilter
        bulan={bulan}
        tahun={tahun}
        room_id={room_id}
        kategori={kategori}
        rooms={rooms}
      />

      <Suspense fallback={<LaporanLoading />}>
        <LaporanSummary summary={summary} />
        <LaporanRoomDetail rooms={laporanRooms} />
      </Suspense>
    </div>
  );
}
