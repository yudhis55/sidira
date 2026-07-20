import { Card } from "@/components/gas/card";
import { UserDetail } from "@/components/admin/user-detail";
import { getMockUserById } from "@/lib/mock-data/users";
import Link from "next/link";
import { Button } from "@/components/gas/button";

export const dynamic = "force-dynamic";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const userData = getMockUserById(userId);

  if (!userData) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="h-9 w-9 p-0"
              aria-label="Kembali"
            >
              ←
            </Button>
          </Link>
          <h1 className="font-mono text-xl font-bold text-ink">
            User tidak ditemukan
          </h1>
        </div>
        <Card>
          <div className="py-12 text-center">
            <p className="text-4xl" aria-hidden>
              📭
            </p>
            <p className="mt-3 text-ink3">
              User dengan ID tersebut tidak ada di data mock.
            </p>
            <Link href="/admin/users" className="mt-4 inline-block">
              <Button variant="ghost">← Kembali ke daftar</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <UserDetail user={userData} />;
}
