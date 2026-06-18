import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RoomForm } from "@/components/inventaris/room-form";

export default function NewRoomPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventaris">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Ruangan</h1>
          <p className="text-muted-foreground">Buat ruangan baru untuk inventaris</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <RoomForm />
        </CardContent>
      </Card>
    </div>
  );
}
