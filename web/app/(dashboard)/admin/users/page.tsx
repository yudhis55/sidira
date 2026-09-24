import Link from "next/link";
import { getAllUsers } from "@/lib/auth/admin";
import { toProfile } from "@/lib/admin-utils";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { PageHeader } from "@/components/shared/page-elements";
import { UserList } from "@/components/admin/user-list";

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

export default async function AdminUsersPage() {
  const users = (await getAllUsers()).map(toProfile);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

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

      <UserList users={users} />
    </div>
  );
}
