import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { UserForm } from "@/components/admin/user-form";
import { getMockUserById } from "@/lib/mock-data/users";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
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

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/admin/users/${userId}`}>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0"
            aria-label="Kembali"
          >
            ←
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-teal4 text-sm font-bold text-teal">
            {userData.avatar}
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight text-ink">
              Edit User
            </h1>
            <p className="text-xs text-ink3">
              Ubah informasi · {userData.nama} · mode demo
            </p>
          </div>
        </div>
      </div>

      <UserForm user={userData} />
    </div>
  );
}
