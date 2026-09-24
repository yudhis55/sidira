import { notFound } from "next/navigation";
import { UserDetail } from "@/components/admin/user-detail";
import { getUserById } from "@/lib/auth/admin";
import { toProfile } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const userData = await getUserById(userId);

  if (!userData) {
    notFound();
  }

  return <UserDetail user={toProfile(userData)} />;
}
