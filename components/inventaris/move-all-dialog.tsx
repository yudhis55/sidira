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
import { moveItems } from "@/lib/auth/items";
import type { Item, Room } from "@/types/database";
import { cn } from "@/lib/utils";

interface MoveAllDialogProps {
  fromRoomId: string;
  rooms: Room[];
  items: Item[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoveAllDialog({
  fromRoomId,
  rooms,
  items,
  open,
  onOpenChange,
}: MoveAllDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [targetRoomId, setTargetRoomId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>(
    items.map((i) => i.id)
  );

  // Reset selection when dialog re-opens / items change.
  // (Triggered when `open` transitions to true.)
  function handleOpenChange(next: boolean) {
    if (next) {
      setSelectedIds(items.map((i) => i.id));
      setTargetRoomId("");
    }
    onOpenChange(next);
  }

  const otherRooms = rooms.filter((r) => r.id !== fromRoomId);

  function toggleItem(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.length === items.length ? [] : items.map((i) => i.id)
    );
  }

  function handleConfirm() {
    if (!targetRoomId) {
      toast.error("Pilih ruangan tujuan terlebih dahulu");
      return;
    }
    if (selectedIds.length === 0) {
      toast.error("Pilih minimal satu item untuk dipindahkan");
      return;
    }

    startTransition(async () => {
      const result = await moveItems(selectedIds, fromRoomId, targetRoomId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${selectedIds.length} item dipindahkan ke ruangan tujuan`);
        handleOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">Pindah Item</DialogTitle>
          <DialogDescription>
            Pilih item dan ruangan tujuan untuk memindahkan beberapa/sebagian
            item dari ruangan ini.
          </DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Tidak ada item di ruangan ini untuk dipindahkan.
          </p>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <label className="font-mono text-xs font-medium text-muted-foreground">
                Ruangan Tujuan
              </label>
              {otherRooms.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Tidak ada ruangan lain tersedia. Buat ruangan baru terlebih
                  dahulu.
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

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-medium text-muted-foreground">
                  Item ({selectedIds.length}/{items.length})
                </label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-mono text-xs underline-offset-2 hover:underline"
                >
                  {selectedIds.length === items.length ? "Kosongkan" : "Pilih Semua"}
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto ring-1 ring-foreground/10 divide-y divide-border">
                {items.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/50",
                        checked && "bg-muted/40"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(item.id)}
                        className="size-3.5 accent-foreground"
                      />
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="text-muted-foreground">{item.category}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              pending ||
              items.length === 0 ||
              otherRooms.length === 0 ||
              !targetRoomId ||
              selectedIds.length === 0
            }
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memindahkan...
              </>
            ) : (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Pindahkan ({selectedIds.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
