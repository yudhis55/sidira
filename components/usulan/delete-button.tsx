"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUsulan } from "@/lib/auth/usulan";

interface DeleteUsulanButtonProps {
  id: number;
}

export function DeleteUsulanButton({ id }: DeleteUsulanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus usulan ini?")) {
      return;
    }

    setLoading(true);

    const result = await deleteUsulan(id);

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      router.push("/usulan");
      router.refresh();
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? "Menghapus..." : "Hapus"}
    </Button>
  );
}
