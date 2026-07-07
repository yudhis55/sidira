import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, TriangleAlert, CircleX, Minus } from "lucide-react";
import type { LaporanRoom } from "@/lib/auth/laporan";

interface LaporanRoomDetailProps {
  rooms: LaporanRoom[];
}

type KondisiKey = "baik" | "rr" | "rb" | "ta";

interface KondisiMeta {
  label: string;
  Icon: typeof Check;
  short: string;
}

const KONDISI_META: Record<KondisiKey, KondisiMeta> = {
  baik: { label: "Baik", Icon: Check, short: "Baik" },
  rr: { label: "Rusak Ringan", Icon: TriangleAlert, short: "RR" },
  rb: { label: "Rusak Berat", Icon: CircleX, short: "RB" },
  ta: { label: "Tidak Ada", Icon: Minus, short: "TA" },
};

/**
 * Achromatic condition label — text + icon inside a ring border, no color fill.
 */
function KondisiLabel({ kondisi }: { kondisi: string }) {
  const meta = KONDISI_META[kondisi as KondisiKey] || KONDISI_META.baik;
  const { Icon, label } = meta;
  return (
    <span className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] ring-1 ring-border whitespace-nowrap">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

/**
 * Achromatic summary chip — count + short label inside a ring border.
 */
function SummaryChip({
  short,
  count,
}: {
  short: string;
  count: number;
}) {
  return (
    <span className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] ring-1 ring-border whitespace-nowrap">
      <span className="tabular-nums font-semibold">{count}</span>
      {short}
    </span>
  );
}

export function LaporanRoomDetail({ rooms }: LaporanRoomDetailProps) {
  return (
    <div className="space-y-6">
      {rooms.map((room) => (
        <Card key={room.room_id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-mono">
                <span className="text-2xl">{room.room_icon}</span>
                <span>{room.room_name}</span>
              </CardTitle>
              <div className="flex flex-wrap gap-2 text-sm">
                <SummaryChip short="" count={room.summary.total} />
                <SummaryChip short="Baik" count={room.summary.baik} />
                <SummaryChip short="RR" count={room.summary.rr} />
                <SummaryChip short="RB" count={room.summary.rb} />
                <SummaryChip short="TA" count={room.summary.ta} />
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
                      <TableCell className="font-mono tabular-nums">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell className="capitalize">{item.kategori}</TableCell>
                      <TableCell>
                        <KondisiLabel kondisi={item.kondisi_terbaru} />
                      </TableCell>
                      <TableCell>
                        {item.tanggal_terbaru
                          ? new Date(item.tanggal_terbaru).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">
                        {item.riwayat_checklist.length} kali
                      </TableCell>
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
