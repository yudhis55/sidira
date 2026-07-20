"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Save } from "lucide-react";
import type { Profile } from "@/types/database";

interface UserFormProps {
  user?: Profile;
}

const AVATAR_PRESETS = ["👤", "🛡️", "👩‍⚕️", "👨‍⚕️", "📦", "🔧", "📋", "💉"];

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    toast.success(
      user?.id
        ? "Mode demo — perubahan user tidak disimpan ke server"
        : "Mode demo — user baru tidak disimpan ke server"
    );
    setLoading(false);
    router.push("/admin/users");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">{user?.id ? "Edit User" : "Tambah User Baru"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                defaultValue={user?.username}
                placeholder="username"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={
                  user?.username ? `${user.username}@sidira.local` : undefined
                }
                placeholder="user@sidira.local"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {user?.id ? "(kosongkan jika tidak diubah)" : "*"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={user?.id ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
              required={!user?.id}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input
                id="nama"
                name="nama"
                defaultValue={user?.nama}
                placeholder="Nama lengkap"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                name="jabatan"
                defaultValue={user?.jabatan}
                placeholder="Jabatan"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select name="role" defaultValue={user?.role || "viewer"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar (emoji)</Label>
              <Input
                id="avatar"
                name="avatar"
                defaultValue={user?.avatar || "👤"}
                placeholder="👤"
                maxLength={4}
                disabled={loading}
              />
              <div className="flex flex-wrap gap-1">
                {AVATAR_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("avatar") as HTMLInputElement;
                      if (input) input.value = emoji;
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-border text-lg hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : user?.id ? "Update User" : "Simpan User"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
