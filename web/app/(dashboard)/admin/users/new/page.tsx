import { UserForm } from "@/components/admin/user-form";
import { Button } from "@/components/gas/button";
import Link from "next/link";

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-3xl font-bold">Tambah User Baru</h1>
          <p className="text-muted-foreground">
            Buat akun user baru untuk aplikasi
          </p>
        </div>
      </div>

      <UserForm />
    </div>
  );
}
