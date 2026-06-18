"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSbbk, updateSbbk, type Sbbk, type SbbkItem } from "@/lib/auth/sbbk";
import { getItems } from "@/lib/auth/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SbbkFormProps {
  sbbk?: Sbbk;
  rooms: Array<{ id: string; name: string }>;
  initialItems?: Array<{ id: number; name: string; room_id: string }>;
}

export function SbbkForm({ sbbk, rooms, initialItems = [] }: SbbkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [availableItems, setAvailableItems] = useState(initialItems);
  const [formData, setFormData] = useState({
    no: sbbk?.no || "",
    tgl: sbbk?.tgl || new Date().toISOString().split("T")[0],
    kepada: sbbk?.kepada || "",
    jenis: sbbk?.jenis || "",
    anggaran: sbbk?.anggaran || "",
    ket_umum: sbbk?.ket_umum || "",
  });
  const [items, setItems] = useState<SbbkItem[]>(sbbk?.items || []);

  const handleRoomChange = async (roomId: string) => {
    setSelectedRoom(roomId);
    if (roomId) {
      const roomItems = await getItems(roomId);
      setAvailableItems(roomItems);
    } else {
      setAvailableItems([]);
    }
  };

  const addItem = () => {
    setItems([...items, {
      nama: "",
      merk: "",
      qty: 1,
      satuan: "unit",
      harga: 0,
      total: 0,
    }]);
  };

  const updateItem = (index: number, field: keyof SbbkItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total when qty or harga changes
    if (field === "qty" || field === "harga") {
      const item = newItems[index];
      item.total = item.qty * item.harga;
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sbbkData = {
        ...formData,
        items,
      };

      if (sbbk?.id) {
        await updateSbbk(sbbk.id, sbbkData);
        router.push(`/sbbk/${sbbk.id}`);
      } else {
        await createSbbk(sbbkData);
        router.push("/sbbk");
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to save SBBK:", error);
      alert("Gagal menyimpan SBBK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi SBBK</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="no">Nomor SBBK *</Label>
              <Input
                id="no"
                value={formData.no}
                onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                placeholder="SBBK/2026/06/0001"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tgl">Tanggal *</Label>
              <Input
                id="tgl"
                type="date"
                value={formData.tgl}
                onChange={(e) => setFormData({ ...formData, tgl: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kepada">Kepada *</Label>
            <Input
              id="kepada"
              value={formData.kepada}
              onChange={(e) => setFormData({ ...formData, kepada: e.target.value })}
              placeholder="Nama lengkap penerima"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis</Label>
              <Input
                id="jenis"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                placeholder="Jenis SBBK"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anggaran">Anggaran</Label>
              <Input
                id="anggaran"
                value={formData.anggaran}
                onChange={(e) => setFormData({ ...formData, anggaran: e.target.value })}
                placeholder="Sumber anggaran"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ket_umum">Keterangan Umum</Label>
            <Textarea
              id="ket_umum"
              value={formData.ket_umum}
              onChange={(e) => setFormData({ ...formData, ket_umum: e.target.value })}
              placeholder="Catatan tambahan"
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Barang</CardTitle>
          <Button type="button" onClick={addItem} size="sm" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Barang
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Belum ada barang. Klik "Tambah Barang" untuk menambahkan.
            </p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Barang #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Barang *</Label>
                    <Input
                      value={item.nama}
                      onChange={(e) => updateItem(index, "nama", e.target.value)}
                      placeholder="Nama barang"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Merk</Label>
                    <Input
                      value={item.merk}
                      onChange={(e) => updateItem(index, "merk", e.target.value)}
                      placeholder="Merk barang"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Jumlah *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", parseInt(e.target.value))}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Satuan *</Label>
                    <Input
                      value={item.satuan}
                      onChange={(e) => updateItem(index, "satuan", e.target.value)}
                      placeholder="unit, buah, set"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Satuan *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.harga}
                      onChange={(e) => updateItem(index, "harga", parseFloat(e.target.value))}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <Input
                    value={item.total.toLocaleString('id-ID')}
                    readOnly
                    disabled
                    className="bg-muted font-semibold"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={sbbk?.id ? `/sbbk/${sbbk.id}` : "/sbbk"}>
          <Button variant="outline" type="button" disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
