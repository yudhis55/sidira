import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LaporanRoom } from "@/lib/auth/laporan";

interface LaporanRoomDetailProps {
  rooms: LaporanRoom[];
}

const KONDISI_COLORS = {
  baik: "bg-green-100 text-green-800",
  rr: "bg-yellow-100 text-yellow-800",
  rb: "bg-red-100 text-red-800",
  ta: "bg-gray-100 text-gray-800",
};

const KONDISI_LABELS = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

export function LaporanRoomDetail({ rooms }: LaporanRoomDetailProps) {
  return (
    <div className="space-y-6">
      {rooms.map((room) => (
        <Card key={room.room_id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{room.room_icon}</span>
                <span>{room.room_name}</span>
              </CardTitle>
              <div className="flex gap-2 text-sm">
                <Badge variant="secondary">Total: {room.summary.total}</Badge>
                <Badge variant="outline" className="bg-green-50">
                  Baik: {room.summary.baik}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50">
                  RR: {room.summary.rr}
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  RB: {room.summary.rb}
                </Badge>
                <Badge variant="outline" className="bg-gray-50">
                  TA: {room.summary.ta}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {room.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada barang di ruangan ini
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kondisi Terbaru</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jumlah Checklist</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {room.items.map((item, index) => (
                    <TableRow key={item.item_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell className="capitalize">{item.kategori}</TableCell>
                      <TableCell>
                        <Badge className={KONDISI_COLORS[item.kondisi_terbaru as keyof typeof KONDISI_COLORS]}>
                          {KONDISI_LABELS[item.kondisi_terbaru as keyof typeof KONDISI_LABELS]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.tanggal_terbaru
                          ? new Date(item.tanggal_terbaru).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell>{item.riwayat_checklist.length} kali</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
