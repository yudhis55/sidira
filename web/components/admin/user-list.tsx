import Link from "next/link";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { Table, type TableColumn } from "@/components/gas/table";
import { DeleteUserButton } from "./delete-button";
import type { Profile } from "@/types/database";

interface UserListProps {
  users: Profile[];
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

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-[8px] py-[2px] text-[11px] font-bold ${ROLE_COLORS[role] || "bg-line2 text-ink2"}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export function UserList({ users }: UserListProps) {
  const columns: TableColumn[] = [
    { key: "user", label: "User" },
    { key: "role", label: "Role", width: "100px" },
    { key: "jabatan", label: "Jabatan" },
    { key: "aksi", label: "Aksi", width: "180px" },
  ];

  const rows = users.map((user) => ({
    user: (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal4 text-sm font-bold text-teal">
          {user.avatar}
        </div>
        <div>
          <div className="font-mono font-semibold text-ink">{user.nama}</div>
          <div className="text-[11px] text-ink3">
            @{user.username} · {user.username}@sidira.local
          </div>
        </div>
      </div>
    ),
    role: <RoleBadge role={user.role} />,
    jabatan: <span className="text-ink2">{user.jabatan || "—"}</span>,
    aksi: (
      <div className="flex items-center gap-1">
        <Link href={`/admin/users/${user.id}`}>
          <Button variant="ghost" size="sm" className="text-[11px] px-2 py-1">
            Detail
          </Button>
        </Link>
        <Link href={`/admin/users/${user.id}/edit`}>
          <Button variant="ghost" size="sm" className="text-[11px] px-2 py-1">
            ✏️
          </Button>
        </Link>
        <DeleteUserButton userId={user.id} username={user.username} />
      </div>
    ),
  }));

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-sm font-bold text-ink">Daftar User</p>
          <p className="text-[11px] text-ink3">Total: {users.length} user</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <span className="mr-1" aria-hidden>
              ➕
            </span>
            Tambah User
          </Button>
        </Link>
      </div>
      {users.length === 0 ? (
        <div className="py-12 text-center text-ink3">📭 Belum ada user</div>
      ) : (
        <Table columns={columns} rows={rows} striped />
      )}
    </Card>
  );
}
