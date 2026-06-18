"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { createUsulan, updateUsulan } from "@/lib/auth/usulan";
import type { Usulan, UsulanItem } from "@/lib/auth/usulan";
import type { Room } from "@/lib/types";

interface UsulanFormProps {
  rooms: Room[];
  usulan?: Usulan;
}

export function UsulanForm({ rooms, usulan }: UsulanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>(
    usulan?.room_id || ""
  );
  const [items, setItems] = useState<UsulanItem[]>(usulan?.payload?.items || []);

  const addItem = () => {
    setItems([
      ...items,
      {
        nama: "",
        kategori: "alkes",
        prioritas: "penting",
        qty: 1,
        satuan: "Unit",
        harga: 0,
        total: 0,
        status: "pending",
        keterangan: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof UsulanItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total when qty or harga changes
    if (field === "qty" || field === "harga") {
      newItems[index].total = newItems[index].qty * newItems[index].harga;
    }

    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("room_id", selectedRoom);
    formData.append("items", JSON.stringify(items));

    let result;
    if (usulan?.id) {
      result = await updateUsulan(usulan.id, formData);
    } else {
      result = await createUsulan(formData);
    }

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Usulan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room_id">Ruangan *</Label>
            <Select
              value={selectedRoom}
              onValueChange={setSelectedRoom}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih ruangan" />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Barang yang Diusulkan</CardTitle>
          <Button
            type="button"
            onClick={addItem}
            size="sm"
            disabled={loading || !selectedRoom}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Barang
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada barang. Klik "Tambah Barang" untuk menambahkan usulan.
            </p>
          ) : (
            items.map((item, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Barang #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`nama-${index}`}>Nama Barang *</Label>
                      <Input
                        id={`nama-${index}`}
                        value={item.nama}
                        onChange={(e) =>
                          updateItem(index, "nama", e.target.value)
                        }
                        placeholder="Contoh: Stetoskop Digital"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`kategori-${index}`}>Kategori *</Label>
                      <Select
                        value={item.kategori}
                        onValueChange={(value) =>
                          updateItem(index, "kategori", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alkes">Alat Kesehatan</SelectItem>
                          <SelectItem value="meubelair">Meubelair</SelectItem>
                          <SelectItem value="elektronik">Elektronik</SelectItem>
                          <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`prioritas-${index}`}>Prioritas *</Label>
                      <Select
                        value={item.prioritas}
                        onValueChange={(value: any) =>
                          updateItem(index, "prioritas", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wajib">Wajib</SelectItem>
                          <SelectItem value="penting">Penting</SelectItem>
                          <SelectItem value="pendukung">Pendukung</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`qty-${index}`}>Jumlah *</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(index, "qty", parseInt(e.target.value))
                        }
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`satuan-${index}`}>Satuan *</Label>
                      <Input
                        id={`satuan-${index}`}
                        value={item.satuan}
                        onChange={(e) =>
                          updateItem(index, "satuan", e.target.value)
                        }
                        placeholder="Contoh: Unit, Buah, Set"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`harga-${index}`}>
                        Harga Satuan (Rp) *
                      </Label>
                      <Input
                        id={`harga-${index}`}
                        type="number"
                        min="0"
                        value={item.harga}
                        onChange={(e) =>
                          updateItem(index, "harga", parseInt(e.target.value))
                        }
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Total Harga</Label>
                    <Input
                      value={`Rp ${item.total.toLocaleString("id-ID")}`}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`keterangan-${index}`}>Keterangan</Label>
                    <Textarea
                      id={`keterangan-${index}`}
                      value={item.keterangan || ""}
                      onChange={(e) =>
                        updateItem(index, "keterangan", e.target.value)
                      }
                      placeholder="Alasan atau justifikasi pengadaan (opsional)"
                      disabled={loading}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {items.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total: {items.length} barang
                </p>
                <p className="text-lg font-bold">
                  Rp{" "}
                  {items
                    .reduce((sum, item) => sum + item.total, 0)
                    .toLocaleString("id-ID")}
                </p>
              </div>
              <Button type="submit" disabled={loading || items.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                {loading
                  ? "Menyimpan..."
                  : usulan?.id
                  ? "Update Usulan"
                  : "Simpan Usulan"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
