import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/auth/admin";
import { UserDetail } from "@/components/admin/user-detail";

interface UserDetailPageProps {
  params: { userId: string };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
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
    <div className="container mx-auto py-6">
      <UserDetail user={targetUser} />
    </div>
  );
}
