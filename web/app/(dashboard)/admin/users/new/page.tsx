import Link from "next/link";
import { UserForm } from "@/components/admin/user-form";
import { Button } from "@/components/gas/button";

export const dynamic = "force-dynamic";

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
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
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center bg-teal3 text-2xl leading-none">
            ➕
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight text-ink">
              Tambah User Baru
            </h1>
            <p className="text-xs text-ink3">
              Buat akun user baru · mode demo
            </p>
          </div>
        </div>
      </div>

      <UserForm />
    </div>
  );
}
