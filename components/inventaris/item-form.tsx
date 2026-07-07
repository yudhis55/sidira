"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createItem, updateItem } from "@/lib/auth/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { Item } from "@/types/database";
import {
  CATEGORIES,
  CONDITIONS,
  PRIORITIES,
} from "./constants";

interface ItemFormProps {
  roomId: string;
  item?: Item;
}

export function ItemForm({ roomId, item }: ItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(item?.category || "");
  const [condition, setCondition] = useState(item?.condition || "baik");
  const [prio, setPrio] = useState(item?.prio || "");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("room_id", roomId);
    formData.set("category", category);
    formData.set("condition", condition);
    formData.set("prio", prio);

    const result = item
      ? await updateItem(item.id, formData)
      : await createItem(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/inventaris/${roomId}`);
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Barang *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={item?.name}
            placeholder="Contoh: Monitor LED"
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Kategori *</Label>
          <Select
            value={category}
            onValueChange={setCategory}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="spec">Spesifikasi</Label>
        <Input
          id="spec"
          name="spec"
          defaultValue={item?.spec}
          placeholder="Spesifikasi singkat (opsional)"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="merk">Merk</Label>
          <Input
            id="merk"
            name="merk"
            defaultValue={item?.merk}
            placeholder="Contoh: Samsung"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="model">Tipe</Label>
          <Input
            id="model"
            name="model"
            defaultValue={item?.type}
            placeholder="Contoh: LS24R350"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="year">Tahun</Label>
          <Input
            id="year"
            name="year"
            type="number"
            defaultValue={item?.year}
            placeholder="2024"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="noreg">No. Register</Label>
          <Input
            id="noreg"
            name="noreg"
            defaultValue={item?.noreg}
            placeholder="Nomor register"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="std">Standar</Label>
          <Input
            id="std"
            name="std"
            type="number"
            min="0"
            defaultValue={item?.std ?? 0}
            placeholder="0"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="quantity">Jumlah *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            defaultValue={item?.quantity || 1}
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unit">Satuan *</Label>
          <Input
            id="unit"
            name="unit"
            defaultValue={item?.unit || "unit"}
            placeholder="unit, buah, set"
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="prio">Prioritas</Label>
          <Select
            value={prio}
            onValueChange={setPrio}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih prioritas" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <span className="mr-1">{p.icon}</span>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="condition">Kondisi *</Label>
        <Select
          value={condition}
          onValueChange={(value) =>
            setCondition(value as "baik" | "rr" | "rb" | "ta")
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kondisi" />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((cond) => (
              <SelectItem key={cond.value} value={cond.value}>
                <span className="mr-1">{cond.icon}</span>
                {cond.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="index_in_room">Urutan di Ruangan</Label>
        <Input
          id="index_in_room"
          name="index_in_room"
          type="number"
          min="0"
          defaultValue={item?.index_in_room || 0}
          placeholder="0"
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={item?.notes}
          placeholder="Catatan tambahan (opsional)"
          disabled={loading}
        />
      </div>
      {error && (
        <div className="rounded-none bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Link href={`/inventaris/${roomId}`}>
          <Button variant="outline" type="button" disabled={loading}>
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            item ? "Update" : "Simpan"
          )}
        </Button>
      </div>
    </form>
  );
}
