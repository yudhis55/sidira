"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
