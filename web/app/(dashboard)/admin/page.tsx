import Link from "next/link";
import { getAllUsers } from "@/lib/auth/admin";
import { toProfile } from "@/lib/admin-utils";
import { Button } from "@/components/gas/button";
import { PageHeader } from "@/components/shared/page-elements";
import { UserList } from "@/components/admin/user-list";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const users = (await getAllUsers()).map(toProfile);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="🛡️"
        title="Admin Users"
        subtitle="Kelola pengguna SIDIRA · Admin, Editor, Viewer"
        actions={
          <Link href="/admin/users/new">
            <Button size="sm">➕ Tambah User</Button>
          </Link>
        }
      />
      <UserList users={users} />
    </div>
  );
}
