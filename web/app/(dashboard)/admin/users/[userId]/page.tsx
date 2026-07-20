import { Card } from "@/components/gas/card";
import { UserDetail } from "@/components/admin/user-detail";
import { getMockUserById } from "@/lib/mock-data/users";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const userData = getMockUserById(userId);

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
