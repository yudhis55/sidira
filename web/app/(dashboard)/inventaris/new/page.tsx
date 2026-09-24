"use client";

/**
 * Rute `/inventaris/new` — GAS tidak punya halaman khusus, tambah ruangan
 * dilakukan lewat modal. Rute ini dipertahankan (tautan lama tetap hidup)
 * dengan membuka modal yang sama di atas daftar ruangan.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { AddRoomModal } from "@/components/inventaris/add-room-modal";

export default function NewRoomPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  return (
    <AddRoomModal
      open={open}
      onClose={() => {
        setOpen(false);
        router.push("/inventaris");
      }}
      onCreated={(roomId) => router.push(`/inventaris/${roomId}`)}
    />
  );
}
