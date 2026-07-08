import { Card } from "@/components/gas/card";
import { UserDetail } from "@/components/admin/user-detail";
import { getMockUsers } from "@/lib/mock-data/users";
import type { UserProfile } from "@/lib/auth/admin";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;

  const users = getMockUsers();
  const userData = users.find((u) => u.id === userId) as UserProfile | undefined;

  if (!userData) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <div className="py-12">
            <p className="text-center text-muted-foreground">User tidak ditemukan</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <UserDetail user={userData} />
    </div>
  );
}
