"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, updateRoom } from "@/lib/auth/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import type { Room } from "@/types/database";

interface RoomFormProps {
  room?: Pick<Room, "id" | "name" | "description" | "icon">;
}

interface IconOption {
  id: string;
  emoji: string;
  label: string;
}

const ICON_OPTIONS: IconOption[] = [
  { id: "building2", emoji: "🏢", label: "Gedung" },
  { id: "home", emoji: "🏠", label: "Rumah" },
  { id: "hospital", emoji: "🏥", label: "RS" },
  { id: "store", emoji: "🏪", label: "Toko" },
  { id: "school", emoji: "🏫", label: "Sekolah" },
  { id: "warehouse", emoji: "🏭", label: "Gudang" },
  { id: "factory", emoji: "🏭", label: "Pabrik" },
  { id: "building", emoji: "🏢", label: "Kantor" },
  { id: "sofa", emoji: "🛋", label: "Sofa" },
  { id: "armchair", emoji: "🪑", label: "Kursi" },
  { id: "briefcase", emoji: "💼", label: "Tas" },
  { id: "package", emoji: "📦", label: "Paket" },
];

export function RoomForm({ room }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState(room?.icon || "hospital");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("icon", selectedIcon);

    const result = room
      ? await updateRoom(room.id, formData)
      : await createRoom(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/inventaris");
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Nama Ruangan *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={room?.name}
          placeholder="Contoh: Ruang Periksa 1"
          required
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={room?.description}
          placeholder="Deskripsi ruangan (opsional)"
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-6 gap-2">
          {ICON_OPTIONS.map((iconOption) => {
            return (
              <button
                key={iconOption.id}
                type="button"
                onClick={() => setSelectedIcon(iconOption.id)}
                className={`h-12 w-12 rounded-none border-2 transition-all flex items-center justify-center text-2xl ${
                  selectedIcon === iconOption.id
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
                disabled={loading}
                title={iconOption.label}
              >
                {iconOption.emoji}
              </button>
            );
          })}
        </div>
      </div>
      {error && (
        <div className="rounded-none bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Link href="/inventaris">
          <Button variant="outline" type="button" disabled={loading}>
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "⏳ Menyimpan..." : room ? "Update" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
