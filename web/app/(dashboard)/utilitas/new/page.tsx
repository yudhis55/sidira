"use client";

/**
 * Rute `/utilitas/new` — sama seperti `/inventaris/new`: GAS memakai modal,
 * rute ini hanya membukanya agar tautan lama tetap berfungsi.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { AddUtilitasModal } from "@/components/utilitas/add-utilitas-modal";

export default function NewUtilitasPage() {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  return (
    <AddUtilitasModal
      open={open}
      onClose={() => {
        setOpen(false);
        router.push("/utilitas");
      }}
      onCreated={(utilId) => router.push(`/utilitas/${utilId}`)}
    />
  );
}
