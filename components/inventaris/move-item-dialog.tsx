"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { moveItem } from "@/lib/auth/items";
import type { Room } from "@/types/database";

interface MoveItemDialogProps {
  itemId: number;
  itemName: string;
  itemCategory: string;
  fromRoomId: string;
  rooms: Room[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoveItemDialog({
  itemId,
  itemName,
  itemCategory,
  fromRoomId,
  rooms,
  open,
  onOpenChange,
}: MoveItemDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [targetRoomId, setTargetRoomId] = useState<string>("");

  // Other rooms (exclude current room).
  const otherRooms = rooms.filter((r) => r.id !== fromRoomId);

  function handleConfirm() {
    if (!targetRoomId) {
      toast.error("Pilih ruangan tujuan terlebih dahulu");
      return;
    }

    startTransition(async () => {
      const result = await moveItem(
        itemId,
        fromRoomId,
        targetRoomId,
        itemName,
        itemCategory
      );
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${itemName}" dipindahkan ke ruangan tujuan`);
        onOpenChange(false);
        setTargetRoomId("");
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">Pindah Item</DialogTitle>
          <DialogDescription>
            Pindahkan <span className="font-medium text-foreground">{itemName}</span> ke
            ruangan lain.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <label className="font-mono text-xs font-medium text-muted-foreground">
            Ruangan Tujuan
          </label>
          {otherRooms.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Tidak ada ruangan lain tersedia. Buat ruangan baru terlebih dahulu.
            </p>
          ) : (
            <Select value={targetRoomId} onValueChange={setTargetRoomId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih ruangan tujuan" />
              </SelectTrigger>
              <SelectContent>
                {otherRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    <span className="mr-1">{room.icon}</span>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={pending || otherRooms.length === 0 || !targetRoomId}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memindahkan...
              </>
            ) : (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Pindahkan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
