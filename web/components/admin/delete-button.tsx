"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/gas/button";
import { deleteUser } from "@/lib/auth/admin";

interface DeleteUserButtonProps {
  userId: string;
  username: string;
}

export function DeleteUserButton({ userId, username }: DeleteUserButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${username}"?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteUser(userId);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    toast.success(`User "${username}" berhasil dihapus`);
    router.refresh();
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
