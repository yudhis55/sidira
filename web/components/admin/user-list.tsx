import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { DeleteUserButton } from "./delete-button";
import type { Profile } from "@/types/database";

interface UserListProps {
  users: Profile[];
}

const ROLE_LABELS = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export function UserList({ users }: UserListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Daftar User</CardTitle>
          <p className="text-sm text-muted-foreground">Total: {users.length} user</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada user</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-2xl">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-semibold">{user.nama}</h3>
                        <Badge variant="outline">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{user.username} • {user.username}@sidira.local
                      </p>
                      {user.jabatan && (
                        <p className="text-sm text-muted-foreground">
                          {user.jabatan}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.last_login
                          ? `Login terakhir: ${new Date(user.last_login).toLocaleString("id-ID")}`
                          : "Belum pernah login"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteUserButton userId={user.id} username={user.username} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
