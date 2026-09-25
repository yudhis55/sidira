"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { Input } from "@/components/gas/input";
import { Select } from "@/components/gas/select";
import { createUser, updateUser } from "@/lib/auth/admin";
import type { Profile } from "@/types/database";

interface UserFormProps {
  user?: Profile;
  /**
   * Dipanggil setelah tulis sukses (mode modal): pemilik menutup modal +
   * refresh. Tanpa ini (halaman), perilaku lama: pindah ke /admin/users.
   */
  onSuccess?: () => void;
}

const AVATAR_PRESETS = ["👤", "🛡️", "👩‍⚕️", "👨‍⚕️", "📦", "🔧", "📋", "💉"];

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin — akses penuh" },
  { value: "editor", label: "Editor — bisa ubah data" },
  { value: "viewer", label: "Viewer — hanya lihat" },
];

export function UserForm({ user, onSuccess }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || "👤");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Username dikunci saat edit (input disabled tidak ikut terkirim),
      // jadi setel manual dari data user.
      if (user?.id) {
        formData.set("username", user.username);
      }
      const result = user?.id
        ? await updateUser(user.id, formData)
        : await createUser(formData);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      toast.success(
        user?.id ? "User berhasil diperbarui" : "User berhasil dibuat",
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/users");
        router.refresh();
      }
    } catch {
      toast.error("Gagal menyimpan user. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Card className="space-y-5">
        <div className="border-b border-line pb-3">
          <p className="font-mono text-sm font-bold text-ink">
            {user?.id ? "✏️ Edit User" : "➕ Data User Baru"}
          </p>
          <p className="text-[11px] text-ink3">
            Pastikan data terisi dengan benar
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="username"
            name="username"
            label="Username *"
            defaultValue={user?.username}
            placeholder="username"
            required
            disabled={loading || !!user?.id}
            hint={
              user?.id
                ? "Username tidak dapat diubah"
                : "Akan jadi login: username@sidira.local"
            }
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email *"
            defaultValue={
              user?.username ? `${user.username}@sidira.local` : undefined
            }
            placeholder="user@sidira.local"
            required
            disabled={loading}
          />
        </div>

        <Input
          id="password"
          name="password"
          type="password"
          label={
            user?.id ? "Password (kosongkan jika tidak diubah)" : "Password *"
          }
          placeholder={
            user?.id ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"
          }
          required={!user?.id}
          disabled={loading}
          minLength={user?.id ? undefined : 6}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nama"
            name="nama"
            label="Nama Lengkap *"
            defaultValue={user?.nama}
            placeholder="Nama lengkap"
            required
            disabled={loading}
          />

          <Input
            id="jabatan"
            name="jabatan"
            label="Jabatan"
            defaultValue={user?.jabatan || undefined}
            placeholder="Jabatan"
            disabled={loading}
          />
        </div>

        <Select
          id="role"
          name="role"
          label="Role *"
          defaultValue={user?.role || "viewer"}
          options={ROLE_OPTIONS}
          required
          disabled={loading}
          hint="Admin = penuh · Editor = ubah data · Viewer = baca saja"
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink2">
            Avatar
          </span>
          <input type="hidden" name="avatar" value={avatar} />
          <div className="flex flex-wrap gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const active = avatar === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  disabled={loading}
                  className={`flex size-11 items-center justify-center rounded-md border text-xl transition-colors ${
                    active
                      ? "border-teal bg-teal4 ring-2 ring-teal/30"
                      : "border-line bg-white hover:bg-line2"
                  }`}
                  aria-label={`Pilih avatar ${preset}`}
                  aria-pressed={active}
                >
                  {preset}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink3">
            Dipilih: <span className="text-base">{avatar}</span>
          </p>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan…" : user?.id ? "💾 Simpan Perubahan" : "➕ Buat User"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => router.push("/admin/users")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
