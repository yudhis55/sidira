import { getUsulanById } from "@/lib/auth/usulan";
import { getRooms } from "@/lib/auth/rooms";
import { UsulanForm } from "@/components/usulan/usulan-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

interface EditUsulanPageProps {
  params: { id: string };
}

export default async function EditUsulanPage({ params }: EditUsulanPageProps) {
  const { id } = await params;
  const usulanId = parseInt(id);

  if (isNaN(usulanId)) {
    notFound();
  }

  const usulan = await getUsulanById(usulanId);

  if (!usulan) {
    notFound();
  }

  const rooms = await getRooms();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/usulan/${usulan.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Usulan</h1>
          <p className="text-muted-foreground">
            Ubah usulan pengadaan untuk {usulan.rooms?.name}
          </p>
        </div>
      </div>

      <UsulanForm rooms={rooms} usulan={usulan} />
    </div>
  );
}
