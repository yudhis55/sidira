import Link from "next/link";
import { getMockUsers } from "@/lib/mock-data/users";
import { Table } from "@/components/gas/table";
import type { TableColumn } from "@/components/gas/table";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { PageHeader } from "@/components/shared/page-elements";
import type { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-teal4 text-teal",
    editor: "bg-blue2 text-blue",
    viewer: "bg-slate2 text-slate",
  };

  const labels: Record<string, string> = {
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
  };

  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-[8px] py-[2px] text-[11px] font-bold ${colors[role] || "bg-line2 text-ink2"}`}
    >
      {labels[role] || role}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal4 text-sm font-bold text-teal">
      {initials}
    </div>
  );
}

function formatLastLogin(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminUsersPage() {
  const users = getMockUsers();

  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

  const columns: TableColumn[] = [
    { key: "avatar", label: "", width: "52px" },
    { key: "nama", label: "Nama" },
    { key: "username", label: "Username", width: "140px" },
    { key: "role", label: "Role", width: "100px" },
    { key: "jabatan", label: "Jabatan" },
    { key: "last_login", label: "Login Terakhir", width: "160px" },
    { key: "aksi", label: "Aksi", width: "160px" },
  ];

  const rows = users.map((user: Profile) => ({
    avatar: (
      <Link href={`/admin/users/${user.id}`}>
        <Avatar initials={user.avatar} />
      </Link>
    ),
    nama: (
      <Link href={`/admin/users/${user.id}`} className="block">
        <div className="font-mono font-semibold text-ink hover:text-teal">
          {user.nama}
        </div>
        <div className="text-[11px] text-ink3">
          {user.username}@sidira.local
        </div>
      </Link>
    ),
    username: (
      <span className="font-mono text-[12px] text-ink2">@{user.username}</span>
    ),
    role: <RoleBadge role={user.role} />,
    jabatan: <span className="text-ink2">{user.jabatan || "—"}</span>,
    last_login: (
      <span className="text-[12px] text-ink3">
        {formatLastLogin(user.last_login)}
      </span>
    ),
      aksi: (
        <div className="flex items-center gap-1">
          <Link href={`/admin/users/${user.id}`}>
            <Button variant="ghost" className="text-[12px] px-3 py-1.5">
              👁️ Lihat
            </Button>
          </Link>
          <Link href={`/admin/users/${user.id}/edit`}>
            <Button variant="ghost" className="text-[12px] px-3 py-1.5">
              ✏️ Edit
            </Button>
          </Link>
        </div>
      ),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        icon="👥"
        title="Manajemen User"
        subtitle="Puskesmas Baruharjo · Kelola user dan hak akses aplikasi"
        stats={[
          { value: users.length, label: "Total User", tone: "teal" },
          { value: adminCount, label: "Admin", tone: "teal" },
          { value: editorCount, label: "Editor", tone: "blue" },
          { value: viewerCount, label: "Viewer", tone: "slate" },
        ]}
        actions={
          <Link href="/admin/users/new">
            <Button>
              <span aria-hidden className="mr-1">
                ➕
              </span>
              Tambah User
            </Button>
          </Link>
        }
      />

      {/* Role legend */}
      <Card className="flex flex-wrap items-center gap-4 px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink3">
          Role:
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink2">
          <RoleBadge role="admin" />
          <span>akses penuh</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink2">
          <RoleBadge role="editor" />
          <span>bisa ubah data</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink2">
          <RoleBadge role="viewer" />
          <span>hanya lihat</span>
        </span>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-line px-4 py-3">
          <p className="font-mono text-sm font-bold text-ink">Daftar User</p>
          <p className="text-[11px] text-ink3">
            {users.length} user terdaftar · mode demo (tanpa auth server)
          </p>
        </div>
        <Table
          columns={columns}
          rows={rows}
          striped
          emptyMessage="📭 Belum ada user terdaftar"
        />
      </Card>
    </div>
  );
}
