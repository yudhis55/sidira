"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, updateRoom } from "@/lib/auth/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface RoomFormProps {
  room?: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
}

const ICON_OPTIONS = ["🏥", "🏨", "🏪", "🏫", "🏬", "🏭", "🏢", "🏠", "🛋️", "🪑", "💼", "📦"];

export function RoomForm({ room }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState(room?.icon || "🏥");

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
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setSelectedIcon(icon)}
              className={`h-12 w-12 rounded-lg border-2 text-2xl transition-all ${
                selectedIcon === icon
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50"
              }`}
              disabled={loading}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
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
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            room ? "Update" : "Simpan"
          )}
        </Button>
      </div>
    </form>
  );
}
