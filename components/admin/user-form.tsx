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
import { Save, User, UserCircle, Users } from "lucide-react";
import { createUser, updateUser } from "@/lib/auth/admin";
import type { UserProfile } from "@/lib/auth/admin";

interface UserFormProps {
  user?: UserProfile;
}

const AVATAR_OPTIONS = [
  { id: "user", label: "User", icon: User },
  { id: "user-circle", label: "User Circle", icon: UserCircle },
  { id: "users", label: "Users", icon: Users },
];

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    let result;
    if (user?.id) {
      result = await updateUser(user.id, formData);
    } else {
      result = await createUser(formData);
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
          <CardTitle>{user?.id ? "Edit User" : "Tambah User Baru"}</CardTitle>
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
                defaultValue={user?.email}
                placeholder="user@example.com"
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
              <Label htmlFor="avatar">Avatar</Label>
              <Select name="avatar" defaultValue={user?.avatar || "user"} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih avatar" />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <SelectItem key={avatar.id} value={avatar.id}>
                      <div className="flex items-center gap-2">
                        <avatar.icon className="h-5 w-5" />
                        <span>{avatar.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
