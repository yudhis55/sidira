import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/auth/admin";
import { UserForm } from "@/components/admin/user-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditUserPageProps {
  params: { userId: string };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { userId } = await params;
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

  const targetUser = await getUserById(userId);

  if (!targetUser) {
    redirect("/admin/users");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/users/${userId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            Ubah informasi user {targetUser.nama}
          </p>
        </div>
      </div>

      <UserForm user={targetUser} />
    </div>
  );
}
