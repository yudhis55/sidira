import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, ArrowLeft, Calendar, Mail, Briefcase } from "lucide-react";
import Link from "next/link";
import { DeleteUserButton } from "./delete-button";
import type { UserProfile } from "@/lib/auth/admin";

interface UserDetailProps {
  user: UserProfile;
}

const ROLE_LABELS = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export function UserDetail({ user }: UserDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-mono text-3xl font-bold">Detail User</h1>
          <p className="text-muted-foreground">Informasi lengkap user</p>
        </div>
        <Link href={`/admin/users/${user.id}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
        <DeleteUserButton userId={user.id} username={user.username} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-4xl">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-mono text-2xl font-bold">{user.nama}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
              <Badge variant="outline" className="mt-2">
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{user.email}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>Jabatan</span>
              </div>
              <p className="font-medium">{user.jabatan || "-"}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Terdaftar Sejak</span>
              </div>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Login Terakhir</span>
              </div>
              <p className="font-medium">
                {user.last_login
                  ? new Date(user.last_login).toLocaleString("id-ID")
                  : "Belum pernah login"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-mono font-semibold mb-2">Hak Akses</h3>
            <div className="space-y-2 text-sm">
              {user.role === "admin" && (
                <>
                  <p>✅ Akses penuh ke semua fitur</p>
                  <p>✅ Kelola user dan role</p>
                  <p>✅ Tambah, edit, dan hapus data</p>
                  <p>✅ Lihat laporan dan riwayat</p>
                </>
              )}
              {user.role === "editor" && (
                <>
                  <p>✅ Tambah dan edit data inventaris</p>
                  <p>✅ Buat checklist dan SBBK</p>
                  <p>✅ Buat usulan pengadaan</p>
                  <p>❌ Tidak bisa kelola user</p>
                  <p>❌ Tidak bisa hapus data</p>
                </>
              )}
              {user.role === "viewer" && (
                <>
                  <p>✅ Lihat semua data inventaris</p>
                  <p>✅ Lihat laporan dan riwayat</p>
                  <p>❌ Tidak bisa tambah/edit data</p>
                  <p>❌ Tidak bisa kelola user</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
