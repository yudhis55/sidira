"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface RiwayatFilterProps {
  start_date?: string;
  end_date?: string;
  room_id?: string;
  kategori?: string;
  rooms: Array<{ id: string; name: string; icon: string }>;
}

const KATEGORI_OPTIONS = [
  { value: "all", label: "Semua Kategori" },
  { value: "alkes", label: "Alat Kesehatan" },
  { value: "meubelair", label: "Meubelair" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

export function RiwayatFilter({
  start_date,
  end_date,
  room_id,
  kategori,
  rooms,
}: RiwayatFilterProps) {
  const router = useRouter();

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const newStartDate = formData.get("start_date") as string;
    const newEndDate = formData.get("end_date") as string;
    const newRoomId = formData.get("room_id") as string;
    const newKategori = formData.get("kategori") as string;

    if (newStartDate) params.set("start_date", newStartDate);
    if (newEndDate) params.set("end_date", newEndDate);
    if (newRoomId && newRoomId !== "all") params.set("room_id", newRoomId);
    if (newKategori && newKategori !== "all") params.set("kategori", newKategori);

    router.push(`/riwayat?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Riwayat</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFilter} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={start_date}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Akhir</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={end_date}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_id">Ruangan</Label>
              <Select name="room_id" defaultValue={room_id || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih ruangan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Ruangan</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.icon} {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select name="kategori" defaultValue={kategori || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Filter Riwayat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
