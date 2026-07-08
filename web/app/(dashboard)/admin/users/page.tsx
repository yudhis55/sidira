import { getMockUsers } from "@/lib/mock-data/users";
import { UserList } from "@/components/admin/user-list";

export default async function AdminUsersPage() {
  const users = getMockUsers() as any;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold">Manajemen User</h1>
        <p className="text-muted-foreground">
          Kelola user dan hak akses aplikasi
        </p>
      </div>

      <UserList users={users} />
    </div>
  );
}
