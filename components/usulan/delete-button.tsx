"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUsulan } from "@/lib/auth/usulan";

interface DeleteUsulanButtonProps {
  id: number;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "xs";
}

export function DeleteUsulanButton({
  id,
  variant = "destructive",
  size = "sm",
}: DeleteUsulanButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUsulan(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Usulan dihapus");
        router.push("/usulan");
        router.refresh();
      }
    });
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        disabled={pending}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Hapus
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono">Hapus Usulan</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus usulan ini? Semua barang di dalam usulan
              akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Hapus Usulan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
