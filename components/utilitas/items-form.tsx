"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Item/Jadwal</CardTitle>
        <Button onClick={addItem} size="sm" disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada item. Klik "Tambah Item" untuk menambahkan.
          </p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="border rounded-none p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Item #{index + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`nama-${index}`}>Nama Item *</Label>
                <Input
                  id={`nama-${index}`}
                  value={item.nama}
                  onChange={(e) => updateItem(index, "nama", e.target.value)}
                  placeholder="Contoh: Cek Oli, Cek Aki, dll"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ket-${index}`}>Keterangan</Label>
                <Input
                  id={`ket-${index}`}
                  value={item.ket || ""}
                  onChange={(e) => updateItem(index, "ket", e.target.value)}
                  placeholder="Keterangan tambahan (opsional)"
                  disabled={loading}
                />
              </div>
            </div>
          ))
        )}

        {items.length > 0 && (
          <div className="flex justify-end gap-2">
            {success && (
              <span className="text-foreground text-sm self-center">
                ✓ Berhasil disimpan
              </span>
            )}
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
