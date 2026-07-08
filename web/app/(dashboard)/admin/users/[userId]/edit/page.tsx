import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { UserForm } from "@/components/admin/user-form";
import { getMockUsers } from "@/lib/mock-data/users";
import type { UserProfile } from "@/lib/auth/admin";
import Link from "next/link";

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/users/${userId}`}>
          <Button variant="ghost" size="icon">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            Ubah informasi user {userData.nama}
          </p>
        </div>
      </div>

      <UserForm user={userData} />
    </div>
  );
}
