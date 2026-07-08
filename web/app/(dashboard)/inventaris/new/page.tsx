import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { RoomForm } from "@/components/inventaris/room-form";

export default function NewRoomPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventaris">
          <Button variant="ghost" className="!px-2 !py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Tambah Ruangan</h1>
          <p className="text-sm text-ink3">Buat ruangan baru untuk inventaris</p>
        </div>
      </div>

      <Card>
        <div className="pt-2">
          <RoomForm />
        </div>
      </Card>
    </div>
  );
}
