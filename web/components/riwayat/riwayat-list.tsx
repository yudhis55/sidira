"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Calendar, MapPin, Trash2, Download, Loader2 } from "lucide-react";
import { deleteRiwayat } from "@/lib/auth/riwayat";
import type { RiwayatPindah } from "@/lib/auth/riwayat";

interface RiwayatListProps {
  riwayat: RiwayatPindah[];
}

const KATEGORI_LABELS: Record<string, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

export function RiwayatList({ riwayat }: RiwayatListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus riwayat perpindahan "${nama}"?`)) return;
    setDeletingId(id);
    const result = await deleteRiwayat(id);
    setDeletingId(null);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Riwayat dihapus");
      router.refresh();
    }
  };

  const exportToCSV = () => {
    const headers = ["Tanggal", "Nama Barang", "Kategori", "Dari", "Ke", "Oleh"];
    const rows: string[][] = riwayat.map((item) => [
      new Date(item.ts).toLocaleString("id-ID"),
      item.nama,
      (item.kat ? KATEGORI_LABELS[item.kat] || item.kat : "-"),
      item.dari_name || "-",
      item.ke_name || "-",
      item.user_id ? `User ${item.user_id.slice(0, 8)}` : "-",
    ]);

    // Escape CSV fields containing commas/quotes
    const escape = (val: string) =>
      /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `riwayat_perpindahan_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Riwayat Perpindahan Barang</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total: {riwayat.length} perpindahan
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
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
              <TableHead></TableHead>
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
                  <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] ring-1 ring-border whitespace-nowrap">
                    {(item.kat ? KATEGORI_LABELS[item.kat] : undefined) || item.kat || "-"}
                  </span>
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
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => handleDelete(item.id, item.nama)}
                    disabled={deletingId === item.id}
                    title="Hapus riwayat"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
