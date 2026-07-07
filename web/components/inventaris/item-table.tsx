"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  Check,
  Plus,
  ArrowUpRight,
  Trash2,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  bulkSetCondition,
  createItem,
  deleteItem,
  updateItemField,
} from "@/lib/auth/items";
import { MoveItemDialog } from "./move-item-dialog";
import {
  CATEGORY_LABELS,
  CONDITIONS,
  PRIORITIES,
} from "./constants";
import { cn } from "@/lib/utils";
import type { Item, ItemCategory, ItemCondition, Room } from "@/types/database";

interface ItemTableProps {
  roomId: string;
  category: ItemCategory;
  items: Item[];
  rooms: Room[];
}

export function ItemTable({ roomId, category, items, rooms }: ItemTableProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [collapsed, setCollapsed] = useState(false);

  // Move dialog state
  const [moveTarget, setMoveTarget] = useState<Item | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  // Add item dialog state
  const [addOpen, setAddOpen] = useState(false);

  const label = CATEGORY_LABELS[category];

  function handleSetAllBaik() {
    startTransition(async () => {
      const result = await bulkSetCondition(roomId, "baik", category);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Semua kondisi ${label} diset menjadi Baik`);
        router.refresh();
      }
    });
  }

  function handleDelete(item: Item) {
    startTransition(async () => {
      const result = await deleteItem(item.id, roomId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${item.name}" dihapus`);
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="ring-1 ring-foreground/10 bg-card">
      {/* Category header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/40"
      >
        <span className="size-2 bg-foreground" aria-hidden />
        <span className="font-mono text-sm font-semibold">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {items.length} item
        </span>
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            handleSetAllBaik();
          }}
          disabled={pending || items.length === 0}
          className="ml-2"
        >
          <Check className="mr-1 h-3 w-3" />
          Semua Baik
        </Button>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-muted-foreground transition-transform",
            collapsed && "-rotate-90"
          )}
        />
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="border-t border-border">
          {items.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              Belum ada item di kategori {label}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10">No</TableHead>
                    <TableHead>Nama &amp; Spesifikasi</TableHead>
                    <TableHead className="w-20">Tahun</TableHead>
                    <TableHead className="w-28">Merek / Tipe</TableHead>
                    <TableHead className="w-28">No. Register</TableHead>
                    <TableHead className="w-16">Satuan</TableHead>
                    <TableHead className="w-16">Standar</TableHead>
                    <TableHead className="w-16">Jml Ada</TableHead>
                    <TableHead className="w-32">Prioritas</TableHead>
                    <TableHead className="w-36">Kondisi</TableHead>
                    <TableHead className="w-32">Keterangan</TableHead>
                    <TableHead className="w-20">Ceklist</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      index={idx + 1}
                      roomId={roomId}
                      onMove={() => setMoveTarget(item)}
                      onDelete={() => setDeleteTarget(item)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="border-t border-border p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(true)}
              disabled={pending}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Tambah {label}
            </Button>
          </div>
        </div>
      )}

      {/* Move dialog */}
      {moveTarget && (
        <MoveItemDialog
          itemId={moveTarget.id}
          itemName={moveTarget.name}
          itemCategory={moveTarget.category}
          fromRoomId={roomId}
          rooms={rooms}
          open={!!moveTarget}
          onOpenChange={(o) => !o && setMoveTarget(null)}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono">Hapus Item</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add item dialog */}
      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        roomId={roomId}
        category={category}
        label={label}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  Item row — inline-editable cells
// ══════════════════════════════════════════════════════════════════════
interface ItemRowProps {
  item: Item;
  index: number;
  roomId: string;
  onMove: () => void;
  onDelete: () => void;
}

function ItemRow({ item, index, roomId, onMove, onDelete }: ItemRowProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function saveField(field: string, value: string | number) {
    startTransition(async () => {
      const result = await updateItemField(item.id, roomId, field, value);
      if (result?.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-muted-foreground">{index}</TableCell>

      {/* Name + spec */}
      <TableCell className="max-w-[220px]">
        <div className="font-medium">{item.name}</div>
        {item.spec && (
          <div className="text-xs text-muted-foreground">{item.spec}</div>
        )}
      </TableCell>

      {/* Tahun */}
      <TableCell>
        <InlineNumber
          defaultValue={item.year}
          placeholder="—"
          min={1990}
          max={2099}
          onCommit={(v) => saveField("year", v)}
        />
      </TableCell>

      {/* Merek / Tipe */}
      <TableCell>
        <InlineText
          defaultValue={item.merk || ""}
          placeholder="Merek/Tipe"
          onCommit={(v) => saveField("merk", v)}
        />
      </TableCell>

      {/* No. Register */}
      <TableCell>
        <InlineText
          defaultValue={item.noreg || ""}
          placeholder="No. Register"
          onCommit={(v) => saveField("noreg", v)}
        />
      </TableCell>

      {/* Satuan */}
      <TableCell className="text-muted-foreground">{item.unit}</TableCell>

      {/* Standar */}
      <TableCell>
        <InlineNumber
          defaultValue={item.std ?? 0}
          placeholder="—"
          min={0}
          onCommit={(v) => saveField("std", v)}
        />
      </TableCell>

      {/* Jml Ada */}
      <TableCell>
        <InlineNumber
          defaultValue={item.quantity}
          min={0}
          className="w-14 text-center font-mono font-bold"
          onCommit={(v) => saveField("quantity", v)}
        />
      </TableCell>

      {/* Prioritas */}
      <TableCell>
        <Select
          value={item.prio || undefined}
          onValueChange={(v) => saveField("prio", v)}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <span className="mr-1">{p.icon}</span>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Kondisi */}
      <TableCell>
        <Select
          value={item.condition}
          onValueChange={(v) => saveField("condition", v as ItemCondition)}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                <span className="mr-1">{c.icon}</span>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Keterangan */}
      <TableCell>
        <InlineText
          defaultValue={item.notes || ""}
          placeholder="Catatan..."
          onCommit={(v) => saveField("notes", v)}
        />
      </TableCell>

      {/* Ceklist */}
      <TableCell>
        <Button variant="outline" size="icon-sm" asChild title="Buka checklist">
          <Link href={`/checklist?room=${roomId}`}>
            <Calendar className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </TableCell>

      {/* Move + Delete */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onMove}
            title="Pindah ke ruangan lain"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={onDelete}
            title="Hapus item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  Inline-editable primitives (uncontrolled, save on blur/Enter)
// ══════════════════════════════════════════════════════════════════════
function InlineText({
  defaultValue,
  placeholder,
  onCommit,
  className,
}: {
  defaultValue: string;
  placeholder?: string;
  onCommit: (value: string) => void;
  className?: string;
}) {
  return (
    <Input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={cn("h-7 w-full min-w-[100px]", className)}
      onBlur={(e) => {
        if (e.target.value !== defaultValue) onCommit(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

function InlineNumber({
  defaultValue,
  placeholder,
  min,
  max,
  onCommit,
  className,
}: {
  defaultValue?: number;
  placeholder?: string;
  min?: number;
  max?: number;
  onCommit: (value: string) => void;
  className?: string;
}) {
  const value =
    defaultValue === undefined || defaultValue === null
      ? ""
      : String(defaultValue);
  return (
    <Input
      type="number"
      defaultValue={value}
      placeholder={placeholder}
      min={min}
      max={max}
      className={cn("h-7 w-16", className)}
      onBlur={(e) => {
        if (e.target.value !== value) onCommit(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════
//  Add item dialog — quick inline create with roomId + category preset
// ══════════════════════════════════════════════════════════════════════
function AddItemDialog({
  open,
  onOpenChange,
  roomId,
  category,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  category: ItemCategory;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formId = useId();

  function handleSubmit(formData: FormData) {
    formData.set("room_id", roomId);
    formData.set("category", category);
    formData.set("quantity", formData.get("quantity")?.toString() || "1");
    formData.set("unit", formData.get("unit")?.toString() || "unit");
    formData.set("condition", formData.get("condition")?.toString() || "baik");

    startTransition(async () => {
      const result = await createItem(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Item ${label} ditambahkan`);
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">
            Tambah {label}
          </DialogTitle>
          <DialogDescription>
            Tambahkan item baru ke kategori {label}.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} action={handleSubmit} className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-name`}>Nama Barang *</Label>
            <Input
              id={`${formId}-name`}
              name="name"
              required
              placeholder="Contoh: Monitor LED"
              disabled={pending}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-merk`}>Merek</Label>
              <Input
                id={`${formId}-merk`}
                name="merk"
                placeholder="Merek"
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-model`}>Tipe</Label>
              <Input
                id={`${formId}-model`}
                name="model"
                placeholder="Tipe"
                disabled={pending}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-year`}>Tahun</Label>
              <Input
                id={`${formId}-year`}
                name="year"
                type="number"
                placeholder="2024"
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-quantity`}>Jumlah</Label>
              <Input
                id={`${formId}-quantity`}
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
                required
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-unit`}>Satuan</Label>
              <Input
                id={`${formId}-unit`}
                name="unit"
                defaultValue="unit"
                disabled={pending}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-notes`}>Catatan</Label>
            <Input
              id={`${formId}-notes`}
              name="notes"
              placeholder="Catatan (opsional)"
              disabled={pending}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
