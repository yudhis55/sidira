"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { saveChecklistEntry, deleteChecklistEntry } from "@/lib/auth/checklist";
import type { ChecklistEntry, ChecklistPayload } from "@/lib/auth/checklist";

interface ChecklistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ChecklistEntry | null;
  roomId: string;
  itemId: number;
  itemName: string;
  itemCategory: string;
  itemIndex: number;
  checkDate: string;
  isCreating?: boolean;
  items?: Array<{
    id: number;
    name: string;
    category: string;
    index: number;
  }>;
}

const CONDITIONS = [
  { value: "baik", label: "Baik", color: "bg-green-500" },
  { value: "rr", label: "Rusak Ringan", color: "bg-yellow-500" },
  { value: "rb", label: "Rusak Berat", color: "bg-red-500" },
  { value: "ta", label: "Tidak Ada", color: "bg-gray-500" },
];

export function ChecklistFormDialog({
  open,
  onOpenChange,
  entry,
  roomId,
  itemId,
  itemName,
  itemCategory,
  itemIndex,
  checkDate,
  isCreating,
  items,
}: ChecklistFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number>(itemId);
  const [payload, setPayload] = useState<ChecklistPayload>({
    status: entry?.payload?.status || "baik",
    jenis_kerusakan: entry?.payload?.jenis_kerusakan || "",
    uraian_kerusakan: entry?.payload?.uraian_kerusakan || "",
    jenis_tindakan: entry?.payload?.jenis_tindakan || "",
    uraian_tindakan: entry?.payload?.uraian_tindakan || "",
    petugas: entry?.payload?.petugas || "",
    no_laporan: entry?.payload?.no_laporan || "",
  });

  const selectedItem = items?.find((i) => i.id === selectedItemId);

  const handleSave = async () => {
    if (isCreating && !selectedItemId) {
      alert("Pilih barang terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await saveChecklistEntry({
        room_id: roomId,
        item_id: entry?.item_id || selectedItemId,
        category: entry?.category || selectedItem!.category,
        item_index: entry?.item_index || selectedItem!.index,
        date_key: checkDate,
        payload: payload,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to save checklist:", error);
      alert("Gagal menyimpan checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    if (!confirm("Hapus checklist ini?")) return;

    setLoading(true);
    try {
      await deleteChecklistEntry(entry.id, roomId);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete checklist:", error);
      alert("Gagal menghapus checklist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Tambah Checklist" : "Edit Checklist"} - {itemName}
          </DialogTitle>
          <DialogDescription>
            Tanggal: {new Date(checkDate).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Selector (only when creating) */}
          {isCreating && items && (
            <div>
              <Label htmlFor="item-select">Pilih Barang</Label>
              <Select
                value={selectedItemId?.toString()}
                onValueChange={(value) => setSelectedItemId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih barang" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Selection */}
          <div>
            <Label>Kondisi</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => setPayload({ ...payload, status: cond.value as any })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    payload.status === cond.value
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${cond.color}`} />
                    <span>{cond.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Fields (only show if not "baik") */}
          {payload.status !== "baik" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jenis-kerusakan">Jenis Kerusakan</Label>
                  <Input
                    id="jenis-kerusakan"
                    value={payload.jenis_kerusakan || ""}
                    onChange={(e) =>
                      setPayload({ ...payload, jenis_kerusakan: e.target.value })
                    }
                    placeholder="Contoh: Retak, Patah, dll"
                  />
                </div>
                <div>
                  <Label htmlFor="jenis-tindakan">Jenis Tindakan</Label>
                  <Input
                    id="jenis-tindakan"
                    value={payload.jenis_tindakan || ""}
                    onChange={(e) =>
                      setPayload({ ...payload, jenis_tindakan: e.target.value })
                    }
                    placeholder="Contoh: Perbaikan, Penggantian, dll"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="uraian-kerusakan">Uraian Kerusakan</Label>
                <Textarea
                  id="uraian-kerusakan"
                  value={payload.uraian_kerusakan || ""}
                  onChange={(e) =>
                    setPayload({ ...payload, uraian_kerusakan: e.target.value })
                  }
                  placeholder="Deskripsi detail kerusakan..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="uraian-tindakan">Uraian Tindakan</Label>
                <Textarea
                  id="uraian-tindakan"
                  value={payload.uraian_tindakan || ""}
                  onChange={(e) =>
                    setPayload({ ...payload, uraian_tindakan: e.target.value })
                  }
                  placeholder="Deskripsi tindakan yang diambil..."
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Petugas dan No Laporan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="petugas">Petugas</Label>
              <Input
                id="petugas"
                value={payload.petugas || ""}
                onChange={(e) => setPayload({ ...payload, petugas: e.target.value })}
                placeholder="Nama petugas"
              />
            </div>
            <div>
              <Label htmlFor="no-laporan">No. Laporan</Label>
              <Input
                id="no-laporan"
                value={payload.no_laporan || ""}
                onChange={(e) => setPayload({ ...payload, no_laporan: e.target.value })}
                placeholder="Nomor laporan (opsional)"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {entry?.id && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Hapus
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
