"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSbbk, updateSbbk, type Sbbk, type SbbkItem } from "@/lib/auth/sbbk";
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
import Link from "next/link";

const SATUAN_OPTIONS = [
  "Unit", "Buah", "Set", "Pcs", "Lembar", "Botol", "Kotak", "Pak", "Lusin", "Lainnya",
];

const ANGGARAN_OPTIONS = ["BLUD TH 2025", "APBD 2025", "BLUD TH 2024", "APBD 2024"];
const JENIS_OPTIONS = ["Puskesmas", "Posyandu"];

interface SbbkFormProps {
  sbbk?: Partial<Sbbk>;
  // Kept for backward compat with the create/edit pages; the form no longer
  // pulls from the room item list, but the prop is accepted.
  rooms?: Array<{ id: string; name: string }>;
  initialItems?: Array<{ id: number; name: string; room_id: string }>;
}

export function SbbkForm({ sbbk }: SbbkFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    no: sbbk?.no || "",
    tgl: sbbk?.tgl || new Date().toISOString().split("T")[0],
    kepada: sbbk?.kepada || "",
    jenis: sbbk?.jenis || "",
    anggaran: sbbk?.anggaran || "",
    ket_umum: sbbk?.ket_umum || "",
  });
  const [items, setItems] = useState<SbbkItem[]>(
    sbbk?.items && sbbk.items.length > 0
      ? sbbk.items
      : [
          {
            nama: "",
            merk: "",
            qty: 1,
            satuan: "Unit",
            harga: 0,
            total: 0,
          },
        ]
  );

  const addItem = () => {
    setItems([
      ...items,
      { nama: "", merk: "", qty: 1, satuan: "Unit", harga: 0, total: 0 },
    ]);
  };

  const updateItem = (index: number, field: keyof SbbkItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value } as SbbkItem;
    if (field === "qty" || field === "harga") {
      const item = newItems[index];
      item.total = (Number(item.qty) || 0) * (Number(item.harga) || 0);
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((s, it) => s + (Number(it.total) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanItems = items
        .filter((it) => it.nama.trim() !== "")
        .map((it) => ({
          nama: it.nama,
          merk: it.merk || "",
          qty: Number(it.qty) || 0,
          satuan: it.satuan || "Unit",
          harga: Number(it.harga) || 0,
          total: (Number(it.qty) || 0) * (Number(it.harga) || 0),
        }));

      const sbbkData = {
        ...formData,
        items: cleanItems,
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
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">Informasi SBBK</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="no" className="font-mono text-xs">Nomor SBBK *</Label>
              <Input
                id="no"
                value={formData.no}
                onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                placeholder="SBBK/2026/06/0001"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tgl" className="font-mono text-xs">Tanggal *</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="kepada" className="font-mono text-xs">Kepada *</Label>
            <Input
              id="kepada"
              value={formData.kepada}
              onChange={(e) => setFormData({ ...formData, kepada: e.target.value })}
              placeholder="Nama lengkap penerima"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Jenis</Label>
              <Select
                value={formData.jenis}
                onValueChange={(v) => setFormData({ ...formData, jenis: v })}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-xs">Anggaran</Label>
              <Select
                value={formData.anggaran}
                onValueChange={(v) => setFormData({ ...formData, anggaran: v })}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Pilih anggaran" />
                </SelectTrigger>
                <SelectContent>
                  {ANGGARAN_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ket_umum" className="font-mono text-xs">Keterangan Umum</Label>
            <Textarea
              id="ket_umum"
              value={formData.ket_umum}
              onChange={(e) => setFormData({ ...formData, ket_umum: e.target.value })}
              placeholder="Catatan tambahan"
              rows={2}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-mono text-sm">Daftar Barang</CardTitle>
          <Button type="button" onClick={addItem} size="sm" variant="outline" disabled={loading}>
            <span aria-hidden>➕</span>
            Tambah Barang
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Belum ada barang. Klik &quot;Tambah Barang&quot; untuk menambahkan.
            </p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="ring-1 ring-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-semibold">Barang #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={loading}
                  >
                    <span aria-hidden>🗑</span>
                    <span className="sr-only">Hapus barang</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Nama Barang *</Label>
                    <Input
                      value={item.nama}
                      onChange={(e) => updateItem(index, "nama", e.target.value)}
                      placeholder="Nama barang"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Merk</Label>
                    <Input
                      value={item.merk || ""}
                      onChange={(e) => updateItem(index, "merk", e.target.value)}
                      placeholder="Merk barang"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Qty *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Satuan *</Label>
                    <Select
                      value={item.satuan}
                      onValueChange={(v) => updateItem(index, "satuan", v)}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="Satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {SATUAN_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Harga Satuan *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.harga}
                      onChange={(e) => updateItem(index, "harga", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs">Total</Label>
                    <Input
                      value={item.total.toLocaleString("id-ID")}
                      readOnly
                      disabled
                      className="bg-muted font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <span className="font-mono text-xs text-muted-foreground">Grand Total:</span>
            <span className="font-mono text-sm font-bold">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={sbbk?.id ? `/sbbk/${sbbk.id}` : "/sbbk"}>
          <Button variant="outline" type="button" disabled={loading}>
            <span aria-hidden>←</span>
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          <span aria-hidden>💾</span>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
