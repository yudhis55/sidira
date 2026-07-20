"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/gas/button";

interface DeleteUserButtonProps {
  userId: string;
  username: string;
}

export function DeleteUserButton({ username }: DeleteUserButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    setLoading(true);
    toast.success("Mode demo — user tidak dihapus dari server");
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      className="text-xs px-3 py-1.5 text-red hover:bg-red2"
      onClick={handleDelete}
      disabled={loading}
      aria-label={`Hapus user ${username}`}
    >
      <span aria-hidden>🗑️</span>
      <span className="ml-1">Hapus</span>
    </Button>
  );
}
