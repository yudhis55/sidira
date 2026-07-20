"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUtilItems } from "@/lib/auth/utilitas";

interface ItemsFormProps {
  utilId: string;
  initialItems: Array<{ nama: string; ket?: string }>;
}

export function ItemsForm({ utilId, initialItems }: ItemsFormProps) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addItem = () => {
    setItems([...items, { nama: "", ket: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: "nama" | "ket", value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);

    const result = await updateUtilItems(utilId, items);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-mono">Jadwal — Daftar Item Pemeliharaan</CardTitle>
        <Button onClick={addItem} size="sm" disabled={loading} className="h-8">
          ➕ Tambah Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Belum ada item. Klik &quot;Tambah Item&quot; untuk menambahkan.
          </p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-none border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-semibold">Item #{index + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={loading}
                  className="h-8 w-8 px-0"
                  aria-label="Hapus item"
                >
                  🗑️
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`nama-${index}`} className="font-mono">
                  Nama Item *
                </Label>
                <Input
                  id={`nama-${index}`}
                  value={item.nama}
                  onChange={(e) => updateItem(index, "nama", e.target.value)}
                  placeholder="Contoh: Cek Oli, Cek Aki, dll"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ket-${index}`} className="font-mono">
                  Keterangan
                </Label>
                <Input
                  id={`ket-${index}`}
                  value={item.ket || ""}
                  onChange={(e) => updateItem(index, "ket", e.target.value)}
                  placeholder="Frekuensi/keterangan (mis. Harian, Mingguan, Bulanan)"
                  disabled={loading}
                />
              </div>
            </div>
          ))
        )}

        {items.length > 0 && (
          <div className="flex justify-end gap-2">
            {success && (
              <span className="self-center font-mono text-xs text-foreground">
                ✓ Berhasil disimpan
              </span>
            )}
            <Button onClick={handleSubmit} disabled={loading} className="h-8">
              {loading ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
