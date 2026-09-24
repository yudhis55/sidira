import Link from "next/link";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { DeleteUserButton } from "./delete-button";
import type { Profile } from "@/types/database";

interface UserDetailProps {
  user: Profile;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-teal4 text-teal",
  editor: "bg-blue2 text-blue",
  viewer: "bg-slate2 text-slate",
};

const ROLE_HINTS: Record<string, string> = {
  admin: "Akses penuh ke semua modul dan manajemen user",
  editor: "Bisa menambah dan mengubah data inventaris",
  viewer: "Hanya dapat melihat data (read-only)",
};

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserDetail({ user }: UserDetailProps) {
  const email = `${user.username}@sidira.local`;
  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const roleColor = ROLE_COLORS[user.role] || "bg-line2 text-ink2";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="h-9 w-9 p-0"
              aria-label="Kembali"
            >
              ←
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight text-ink">
              Detail User
            </h1>
            <p className="text-xs text-ink3">Informasi lengkap akun</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Button variant="ghost" className="text-xs px-3 py-1.5">
              ✏️ Edit
            </Button>
          </Link>
          <DeleteUserButton userId={user.id} username={user.username} />
        </div>
      </div>

      {/* Identity card */}
      <Card className="space-y-5">
        <div className="flex flex-wrap items-center gap-4 border-b border-line pb-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-teal4 text-2xl font-bold text-teal">
            {user.avatar}
          </div>
          <div className="min-w-0">
            <h2 className="font-mono text-lg font-bold text-ink">{user.nama}</h2>
            <p className="text-sm text-ink2">@{user.username}</p>
            <span
              className={`mt-2 inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold ${roleColor}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink3">
              <span aria-hidden>✉️</span> Email
            </p>
            <p className="font-mono text-sm font-medium text-ink">{email}</p>
          </div>

          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink3">
              <span aria-hidden>💼</span> Jabatan
            </p>
            <p className="text-sm font-medium text-ink">
              {user.jabatan || "—"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink3">
              <span aria-hidden>🔑</span> Role
            </p>
            <p className="text-sm font-medium text-ink">{roleLabel}</p>
            <p className="text-[11px] text-ink3">
              {ROLE_HINTS[user.role] || ""}
            </p>
          </div>

          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink3">
              <span aria-hidden>🕐</span> Login Terakhir
            </p>
            <p className="text-sm font-medium text-ink">
              {formatDateTime(user.last_login)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink3">
              <span aria-hidden>📅</span> Dibuat
            </p>
            <p className="text-sm font-medium text-ink">
              {formatDateTime(user.created_at)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink3">
              <span aria-hidden>🔄</span> Diperbarui
            </p>
            <p className="text-sm font-medium text-ink">
              {formatDateTime(user.updated_at)}
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
}
