"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import type { Usulan, UsulanItem, UsulanPrioritas } from "@/lib/usulan-types";
import type { ItemCategory, Room } from "@/types/database";

interface UsulanFormProps {
  rooms: Room[];
  usulan?: Usulan;
  /** Pre-selected room id (e.g. from ?room= query param on the new page). */
  defaultRoomId?: string;
}

const KATEGORI_OPTIONS: { value: ItemCategory; label: string }[] = [
  { value: "alkes", label: "Alat Kesehatan" },
  { value: "meubelair", label: "Meubelair" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

const PRIORITAS_OPTIONS: { value: UsulanPrioritas; label: string }[] = [
  { value: "mendesak", label: "⚠ Mendesak" },
  { value: "penting", label: "Penting" },
  { value: "rencana", label: "Rencana" },
];

function emptyItem(): UsulanItem {
  return {
    nama: "",
    kategori: "alkes",
    prioritas: "penting",
    qty: 1,
    satuan: "Unit",
    harga: 0,
    total: 0,
    status: "diajukan",
    keterangan: "",
  };
}

export function UsulanForm({ rooms, usulan, defaultRoomId }: UsulanFormProps) {
  const [pending, startTransition] = useTransition();
  const [selectedRoom, setSelectedRoom] = useState<string>(
    usulan?.room_id || defaultRoomId || ""
  );
  const [items, setItems] = useState<UsulanItem[]>(
    usulan?.payload?.items?.length ? usulan.payload.items : []
  );

  const addItem = () => {
    setItems([...items, emptyItem()]);
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
    newItems[index] = { ...newItems[index], [field]: value } as UsulanItem;

    // Recalculate total when qty or harga changes
    if (field === "qty" || field === "harga") {
      newItems[index].total = newItems[index].qty * newItems[index].harga;
    }

    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      toast.error("Ruangan wajib dipilih");
      return;
    }
    if (items.length === 0) {
      toast.error("Minimal satu barang harus ditambahkan");
      return;
    }

    startTransition(() => {
      // Mock mode: no backend — form stays client-only.
      toast.success(
        usulan?.id
          ? "Usulan diperbarui (mode demo)"
          : "Usulan disimpan (mode demo)"
      );
    });
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Room selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">Informasi Usulan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="room_id" className="font-mono text-xs">
              Ruangan *
            </Label>
            <Select
              value={selectedRoom}
              onValueChange={setSelectedRoom}
              disabled={pending}
            >
              <SelectTrigger id="room_id">
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

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-mono text-sm">
            Daftar Barang yang Diusulkan
          </CardTitle>
          <Button
            type="button"
            onClick={addItem}
            size="sm"
            variant="outline"
            disabled={pending || !selectedRoom}
          >
            <span className="mr-1" aria-hidden>➕</span>
            Tambah Barang
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">
              Belum ada barang. Klik &quot;Tambah Barang&quot; untuk menambahkan
              usulan.
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="ring-1 ring-foreground/10 bg-card p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    Barang #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                    disabled={pending}
                    title="Hapus barang ini"
                  >
                    <span aria-hidden>🗑️</span>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`nama-${index}`}
                      className="font-mono text-xs"
                    >
                      Nama Barang *
                    </Label>
                    <Input
                      id={`nama-${index}`}
                      value={item.nama}
                      onChange={(e) =>
                        updateItem(index, "nama", e.target.value)
                      }
                      placeholder="Contoh: Stetoskop Digital"
                      required
                      disabled={pending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`kategori-${index}`}
                      className="font-mono text-xs"
                    >
                      Kategori *
                    </Label>
                    <Select
                      value={item.kategori}
                      onValueChange={(value) =>
                        updateItem(index, "kategori", value)
                      }
                      disabled={pending}
                    >
                      <SelectTrigger id={`kategori-${index}`}>
                        <SelectValue />
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`prioritas-${index}`}
                      className="font-mono text-xs"
                    >
                      Prioritas *
                    </Label>
                    <Select
                      value={item.prioritas}
                      onValueChange={(value) =>
                        updateItem(index, "prioritas", value)
                      }
                      disabled={pending}
                    >
                      <SelectTrigger id={`prioritas-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITAS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`qty-${index}`}
                      className="font-mono text-xs"
                    >
                      Jumlah *
                    </Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, "qty", parseInt(e.target.value) || 0)
                      }
                      required
                      disabled={pending}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`satuan-${index}`}
                      className="font-mono text-xs"
                    >
                      Satuan *
                    </Label>
                    <Input
                      id={`satuan-${index}`}
                      value={item.satuan}
                      onChange={(e) =>
                        updateItem(index, "satuan", e.target.value)
                      }
                      placeholder="Contoh: Unit, Buah, Set"
                      required
                      disabled={pending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`harga-${index}`}
                      className="font-mono text-xs"
                    >
                      Harga Satuan (Rp) *
                    </Label>
                    <Input
                      id={`harga-${index}`}
                      type="number"
                      min="0"
                      value={item.harga}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "harga",
                          parseInt(e.target.value) || 0
                        )
                      }
                      required
                      disabled={pending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mono text-xs">Total Harga</Label>
                  <Input
                    value={`Rp ${item.total.toLocaleString("id-ID")}`}
                    readOnly
                    disabled
                    className="font-mono font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={`keterangan-${index}`}
                    className="font-mono text-xs"
                  >
                    Keterangan / Justifikasi
                  </Label>
                  <Textarea
                    id={`keterangan-${index}`}
                    value={item.keterangan || ""}
                    onChange={(e) =>
                      updateItem(index, "keterangan", e.target.value)
                    }
                    placeholder="Alasan atau justifikasi pengadaan (opsional)"
                    disabled={pending}
                    rows={2}
                  />
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-border">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  Total: {items.length} barang
                </p>
                <p className="font-mono text-lg font-bold">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                type="submit"
                disabled={pending || items.length === 0}
              >
                {pending ? (
                  <span className="mr-1.5" aria-hidden>⏳</span>
                ) : (
                  <span className="mr-1.5" aria-hidden>💾</span>
                )}
                {usulan?.id ? "Update Usulan" : "Simpan Usulan"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
