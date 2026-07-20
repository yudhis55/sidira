"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  bulkSetCondition,
} from "@/lib/auth/items";
import { deleteRoom, updateRoomName, updateRoomPj } from "@/lib/auth/rooms";
import type { Room } from "@/types/database";

interface RoomHeaderProps {
  room: Room;
  itemCount: number;
  totalUnits: number;
  onOpenMoveAll: () => void;
}

export function RoomHeader({
  room,
  itemCount,
  totalUnits,
  onOpenMoveAll,
}: RoomHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // PJ inline edit
  const [editingPj, setEditingPj] = useState(false);
  const [pjValue, setPjValue] = useState(room.pj || "");

  // Name inline edit
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(room.name);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleSavePj() {
    startTransition(async () => {
      const result = await updateRoomPj(room.id, pjValue.trim());
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Penanggung Jawab diperbarui");
        setEditingPj(false);
        router.refresh();
      }
    });
  }

  function handleSaveName() {
    if (!nameValue.trim()) {
      toast.error("Nama ruangan tidak boleh kosong");
      return;
    }
    startTransition(async () => {
      const result = await updateRoomName(room.id, nameValue.trim());
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Nama ruangan diperbarui");
        setEditingName(false);
        router.refresh();
      }
    });
  }

  function handleSetAllBaik() {
    startTransition(async () => {
      const result = await bulkSetCondition(room.id, "baik");
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Semua kondisi di ruangan ini diset menjadi Baik");
        router.refresh();
      }
    });
  }

  function handleDeleteRoom() {
    startTransition(async () => {
      const result = await deleteRoom(room.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Ruangan dihapus");
        router.push("/inventaris");
        router.refresh();
      }
    });
  }

  return (
    <div className="ring-1 ring-foreground/10 bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-start gap-4">
        {/* Big room icon */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-none text-3xl"
          style={room.bg ? { backgroundColor: room.bg } : undefined}
          aria-hidden
        >
          {room.icon}
        </div>

        {/* Title + description */}
        <div className="min-w-0 flex-1 space-y-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="h-8 max-w-xs font-mono text-xl"
                disabled={pending}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setNameValue(room.name);
                    setEditingName(false);
                  }
                }}
              />
              <Button
                size="icon-sm"
                onClick={handleSaveName}
                disabled={pending}
              >
                {pending ? "⏳" : "✅"}
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => {
                  setNameValue(room.name);
                  setEditingName(false);
                }}
                disabled={pending}
              >
                ✕
              </Button>
            </div>
          ) : (
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {room.name}
            </h1>
          )}
          {room.description && (
            <p className="text-sm text-muted-foreground">{room.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div>
            <div className="font-mono text-2xl font-bold">{itemCount}</div>
            <div className="font-mono text-xs text-muted-foreground">
              Jenis Item
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold">{totalUnits}</div>
            <div className="font-mono text-xs text-muted-foreground">
              Total Unit
            </div>
          </div>
        </div>
      </div>

      {/* PJ block */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground" aria-hidden>👤</span>
          <div>
            <div className="font-mono text-xs text-muted-foreground">
              Penanggung Jawab
            </div>
            {editingPj ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={pjValue}
                  onChange={(e) => setPjValue(e.target.value)}
                  placeholder="Nama penanggung jawab"
                  className="h-7 max-w-xs"
                  disabled={pending}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSavePj();
                    if (e.key === "Escape") {
                      setPjValue(room.pj || "");
                      setEditingPj(false);
                    }
                  }}
                />
                <Button
                  size="icon-sm"
                  onClick={handleSavePj}
                  disabled={pending}
                >
                  {pending ? "⏳" : "✅"}
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setPjValue(room.pj || "");
                    setEditingPj(false);
                  }}
                  disabled={pending}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingPj(true)}
                className="group flex items-center gap-1 text-sm hover:text-foreground"
                title="Klik untuk ubah penanggung jawab"
              >
                <span className={room.pj ? "" : "text-muted-foreground italic"}>
                  {room.pj || "Belum diisi"}
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-muted-foreground text-xs" aria-hidden>✏️</span>
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetAllBaik}
            disabled={pending}
          >
✅ Semua Kondisi Baik
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingName(true)}
            disabled={pending || editingName}
          >
✏️ Edit Nama
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMoveAll}
            disabled={pending}
          >
↗️ Pindah Item
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={pending}
          >
🗑️ Hapus
          </Button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono">Hapus Ruangan</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus ruangan{" "}
              <span className="font-medium text-foreground">{room.name}</span>?
              Semua item dan data checklist di ruangan ini akan ikut terhapus.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRoom}
              disabled={pending}
            >
              {pending ? (
                <>
                  
                  Menghapus...
                </>
              ) : (
                <>
                  
                  Hapus Ruangan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
