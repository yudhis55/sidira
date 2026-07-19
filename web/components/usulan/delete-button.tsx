"use client";

import { useState, useTransition } from "react";
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

interface DeleteUsulanButtonProps {
  id: number;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "xs";
}

export function DeleteUsulanButton({
  variant = "destructive",
  size = "sm",
}: DeleteUsulanButtonProps) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleDelete() {
    startTransition(() => {
      toast.success("Mode demo — usulan tidak dihapus dari server");
      setOpen(false);
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
