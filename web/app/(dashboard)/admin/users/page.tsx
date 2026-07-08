import { getMockUsers } from "@/lib/mock-data/users";
import { Table } from "@/components/gas/table";
import type { TableColumn } from "@/components/gas/table";
import { Button } from "@/components/gas/button";
import type { Profile } from "@/types/database";

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

  const columns: TableColumn[] = [
    { key: "avatar", label: "", width: "50px" },
    { key: "nama", label: "Nama" },
    { key: "username", label: "Username" },
    { key: "role", label: "Role" },
    { key: "jabatan", label: "Jabatan" },
    { key: "last_login", label: "Login Terakhir" },
  ];

  const rows = users.map((user: Profile) => ({
    avatar: <Avatar initials={user.avatar} />,
    nama: (
      <div className="font-mono font-semibold text-ink">{user.nama}</div>
    ),
    username: <span className="text-ink2">@{user.username}</span>,
    role: <RoleBadge role={user.role} />,
    jabatan: <span className="text-ink2">{user.jabatan || "—"}</span>,
    last_login: (
      <span className="text-[12px] text-ink3">
        {formatLastLogin(user.last_login)}
      </span>
    ),
  }));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-mono text-3xl font-bold">Manajemen User</h1>
          <p className="text-muted-foreground">
            Kelola user dan hak akses aplikasi
          </p>
        </div>
        <Button>
          <span className="mr-2 font-bold">+</span>
          Tambah User
        </Button>
      </div>

      <div className="rounded-lg border border-line bg-white">
        <Table
          columns={columns}
          rows={rows}
          striped
          emptyMessage="Belum ada user terdaftar"
        />
      </div>
    </div>
  );
}
