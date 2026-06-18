import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRooms } from "@/lib/auth/rooms";
import { Plus, Package } from "lucide-react";
import Link from "next/link";

export default async function InventarisPage() {
  const rooms = await getRooms();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventaris</h1>
          <p className="text-muted-foreground">
            Kelola ruangan dan barang inventaris
          </p>
        </div>
        <Link href="/inventaris/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Ruangan
          </Button>
        </Link>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <CardTitle className="text-xl mb-2">Belum ada ruangan</CardTitle>
            <CardDescription className="text-center mb-4">
              Mulai dengan menambahkan ruangan pertama Anda
            </CardDescription>
            <Link href="/inventaris/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Ruangan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/inventaris/${room.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{room.icon}</div>
                    <div className="flex-1">
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription>
                        {room.description || "Tidak ada deskripsi"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Klik untuk melihat detail
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
