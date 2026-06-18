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
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import type { RiwayatPindah } from "@/lib/auth/riwayat";

interface RiwayatListProps {
  riwayat: RiwayatPindah[];
}

const KATEGORI_LABELS = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

export function RiwayatList({ riwayat }: RiwayatListProps) {
  if (riwayat.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <CardTitle className="text-xl mb-2">Belum Ada Riwayat</CardTitle>
          <p className="text-muted-foreground text-center">
            Riwayat perpindahan barang akan muncul di sini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Perpindahan Barang</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {riwayat.length} perpindahan
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Dari</TableHead>
              <TableHead></TableHead>
              <TableHead>Ke</TableHead>
              <TableHead>Oleh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riwayat.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {new Date(item.ts).toLocaleDateString("id-ID")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.ts).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {KATEGORI_LABELS[item.kat as keyof typeof KATEGORI_LABELS] || item.kat}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.dari_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.ke_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.user_id ? `User ${item.user_id.slice(0, 8)}` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
