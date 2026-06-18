"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import type { Pakta, PaktaItem } from "@/lib/auth/pakta";
import type { Room, Item } from "@/lib/types";

interface PaktaFormProps {
  pakta?: Pakta;
  rooms: Room[];
}

export function PaktaForm({ pakta, rooms }: PaktaFormProps) {
  const isEditMode = !!pakta;
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<PaktaItem[]>(pakta?.items || []);
  const [loading, setLoading] = useState(false);

  const handleRoomChange = async (roomId: string) => {
    setSelectedRoom(roomId);
    setLoading(true);

    try {
      const response = await fetch(`/api/items?room_id=${roomId}`);
      const data = await response.json();
      setAvailableItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: Item) => {
    const exists = selectedItems.find((i) => i.item_id === item.id);
    if (exists) return;

    const newItem: PaktaItem = {
      item_id: item.id,
      nama: item.name,
      kategori: item.category,
      kondisi: item.condition,
      keterangan: "",
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter((i) => i.item_id !== itemId));
  };

  const handleUpdateKeterangan = (itemId: number, keterangan: string) => {
    setSelectedItems(
      selectedItems.map((i) => (i.item_id === itemId ? { ...i, keterangan } : i))
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    formData.set("items", JSON.stringify(selectedItems));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pakta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomor">Nomor Pakta *</Label>
              <Input
                id="nomor"
                name="nomor"
                defaultValue={pakta?.nomor || ""}
                placeholder="PAKTA/2026/06/1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                defaultValue={pakta?.tanggal || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pj_nama">Nama Penanggung Jawab *</Label>
              <Input
                id="pj_nama"
                name="pj_nama"
                defaultValue={pakta?.pj_nama || ""}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pj_jabatan">Jabatan</Label>
              <Input
                id="pj_jabatan"
                name="pj_jabatan"
                defaultValue={pakta?.pj_jabatan || ""}
                placeholder="Jabatan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pj_nip">NIP</Label>
              <Input
                id="pj_nip"
                name="pj_nip"
                defaultValue={pakta?.pj_nip || ""}
                placeholder="NIP (opsional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input
                id="lokasi"
                name="lokasi"
                defaultValue={pakta?.lokasi || ""}
                placeholder="Lokasi penyimpanan aset"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih Ruangan</Label>
            <Select value={selectedRoom} onValueChange={handleRoomChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ruangan untuk menambah barang" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.icon} {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRoom && (
            <div className="space-y-2">
              <Label>Tambah Barang</Label>
              <Select
                onValueChange={(itemId) => {
                  const item = availableItems.find((i) => i.id === parseInt(itemId));
                  if (item) handleAddItem(item);
                }}
                disabled={loading || availableItems.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Pilih barang untuk ditambahkan"} />
                </SelectTrigger>
                <SelectContent>
                  {availableItems
                    .filter((item) => !selectedItems.find((i) => i.item_id === item.id))
                    .map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name} ({item.category})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada barang yang ditambahkan
            </p>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div key={item.item_id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.nama}</h4>
                      <p className="text-sm text-muted-foreground">
                        Kategori: {item.kategori} | Kondisi: {item.kondisi}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.item_id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`keterangan-${item.item_id}`}>Keterangan</Label>
                    <Textarea
                      id={`keterangan-${item.item_id}`}
                      value={item.keterangan || ""}
                      onChange={(e) => handleUpdateKeterangan(item.item_id, e.target.value)}
                      placeholder="Keterangan tambahan (opsional)"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <input type="hidden" name="items" value={JSON.stringify(selectedItems)} />

      <div className="flex justify-end gap-2">
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isEditMode ? "Update Pakta" : "Simpan Pakta"}
        </Button>
      </div>
    </form>
  );
}
