import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/utils";
import { getRooms } from "@/lib/auth/rooms";
import { QrBulkPrint } from "@/components/inventaris/qr-bulk-print";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cetak QR Ruangan · SIDIRA",
};

/**
 * Cetak massal QR ruangan — di root app (lepas dari layout dashboard)
 * agar hasil print hanya berisi kartu QR. Gerbang admin + editor;
 * yang lain diarahkan ke "/".
 */
export default async function QrBulkPrintPage() {
  try {
    await requireRole(["admin", "editor"]);
  } catch {
    redirect("/");
  }

  const rooms = await getRooms().catch(() => []);

  return (
    <QrBulkPrint
      rooms={rooms.map((room) => ({
        id: room.id,
        name: room.name,
        icon: room.icon ?? null,
      }))}
    />
  );
}
