import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/lib/auth/admin";
import { UserList } from "@/components/admin/user-list";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const users = await getAllUsers();

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
