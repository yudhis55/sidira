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
import { Check, TriangleAlert, CircleX, Minus } from "lucide-react";
import {
  saveChecklistPayload,
  deleteChecklistEntry,
  type ChecklistEntry,
  type ChecklistPayload,
} from "@/lib/auth/checklist";
import type { ItemCondition, ItemCategory } from "@/types/database";
import { toast } from "sonner";

interface ChecklistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ChecklistEntry | null;
  roomId: string;
  itemId: number;
  itemName: string;
  itemCategory: ItemCategory;
  itemIndex: number;
  dateKey: string;
}

const CONDITIONS: Array<{
  value: ItemCondition;
  label: string;
  Icon: typeof Check;
}> = [
  { value: "baik", label: "Baik", Icon: Check },
  { value: "rr", label: "Rusak Ringan", Icon: TriangleAlert },
  { value: "rb", label: "Rusak Berat", Icon: CircleX },
  { value: "ta", label: "Tidak Ada", Icon: Minus },
];

const DAY_NAMES = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];
const MONTH_NAMES_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
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
  dateKey,
}: ChecklistFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<ChecklistPayload>({
    status: entry?.payload?.status || "baik",
    jenis_kerusakan: entry?.payload?.jenis_kerusakan || "",
    uraian_kerusakan: entry?.payload?.uraian_kerusakan || "",
    jenis_tindakan: entry?.payload?.jenis_tindakan || "",
    uraian_tindakan: entry?.payload?.uraian_tindakan || "",
    petugas: entry?.payload?.petugas || "",
    no_laporan: entry?.payload?.no_laporan || "",
  });

  const showDetailFields = payload.status === "rr" || payload.status === "rb";

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveChecklistPayload(
        roomId,
        itemId,
        itemCategory,
        itemIndex,
        dateKey,
        payload
      );
      onOpenChange(false);
      router.refresh();
      toast.success("Keterangan checklist disimpan");
    } catch (error) {
      console.error("Failed to save checklist:", error);
      toast.error("Gagal menyimpan checklist");
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
      toast.success("Checklist dihapus");
    } catch (error) {
      console.error("Failed to delete checklist:", error);
      toast.error("Gagal menghapus checklist");
    } finally {
      setLoading(false);
    }
  };

  // Pretty date label
  const dateLabel = (() => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dow = new Date(dateKey + "T00:00:00").getDay();
    return `${DAY_NAMES[dow]}, ${d} ${MONTH_NAMES_FULL[m - 1]} ${y}`;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-mono">
            Detail Checklist — {itemName}
          </DialogTitle>
          <DialogDescription>{dateLabel}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Condition picker — achromatic, active via ring + font-weight */}
          <div>
            <Label className="font-mono">Kondisi</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CONDITIONS.map(({ value, label, Icon }) => {
                const active = payload.status === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPayload({ ...payload, status: value })}
                    className={
                      "inline-flex h-9 items-center justify-center gap-1.5 rounded-none border px-2 font-mono text-xs transition-colors " +
                      (active
                        ? "border-foreground bg-muted font-semibold ring-2 ring-foreground ring-offset-0"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail fields (only for rr / rb) */}
          {showDetailFields && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="jenis-kerusakan" className="font-mono">
                    Jenis Kerusakan
                  </Label>
                  <Input
                    id="jenis-kerusakan"
                    value={payload.jenis_kerusakan || ""}
                    onChange={(e) =>
                      setPayload({ ...payload, jenis_kerusakan: e.target.value })
                    }
                    placeholder="Contoh: Retak, Patah, dll"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jenis-tindakan" className="font-mono">
                    Jenis Tindakan
                  </Label>
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

              <div className="space-y-1">
                <Label htmlFor="uraian-kerusakan" className="font-mono">
                  Uraian Kerusakan
                </Label>
                <Textarea
                  id="uraian-kerusakan"
                  value={payload.uraian_kerusakan || ""}
                  onChange={(e) =>
                    setPayload({ ...payload, uraian_kerusakan: e.target.value })
                  }
                  placeholder="Deskripsi detail kerusakan..."
                  rows={2}
                  className="rounded-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="uraian-tindakan" className="font-mono">
                  Uraian Tindakan
                </Label>
                <Textarea
                  id="uraian-tindakan"
                  value={payload.uraian_tindakan || ""}
                  onChange={(e) =>
                    setPayload({ ...payload, uraian_tindakan: e.target.value })
                  }
                  placeholder="Deskripsi tindakan yang diambil..."
                  rows={2}
                  className="rounded-none"
                />
              </div>
            </>
          )}

          {/* Petugas & No Laporan — always shown */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="petugas" className="font-mono">
                Petugas
              </Label>
              <Input
                id="petugas"
                value={payload.petugas || ""}
                onChange={(e) => setPayload({ ...payload, petugas: e.target.value })}
                placeholder="Nama petugas"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="no-laporan" className="font-mono">
                No. Laporan
              </Label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
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
