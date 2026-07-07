"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPemegang, updatePemegang } from "@/lib/auth/rekap";
import type { PemegangInventaris, PemegangStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Save } from "lucide-react";

interface PemegangFormDialogProps {
  pemegang?: PemegangInventaris;
  trigger?: React.ReactNode;
}

export function PemegangFormDialog({
  pemegang,
  trigger,
}: PemegangFormDialogProps) {
  const router = useRouter();
  const isEdit = !!pemegang;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [nama, setNama] = useState(pemegang?.nama || "");
  const [nip, setNip] = useState(pemegang?.nip || "");
  const [jabatan, setJabatan] = useState(pemegang?.jabatan || "");
  const [status, setStatus] = useState<PemegangStatus>(
    pemegang?.status || "PNS",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      if (!nama.trim()) {
        throw new Error("Nama pemegang wajib diisi");
      }
      if (isEdit && pemegang) {
        await updatePemegang(pemegang.id, { nama, nip, jabatan, status });
      } else {
        await createPemegang({ nama, nip, jabatan, status });
      }
      setOpen(false);
      router.refresh();
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = isEdit ? (
    <Button variant="outline" size="sm">
      <Pencil className="h-4 w-4 mr-1" />
      Edit
    </Button>
  ) : (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Tambah Pemegang
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-mono">
            {isEdit ? "Edit Pemegang" : "Tambah Pemegang"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ubah data pemegang inventaris."
              : "Tambah pemegang inventaris baru."}
          </DialogDescription>
        </DialogHeader>

        {err && (
          <p className="bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive ring-1 ring-destructive/20">
            {err}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pemegang-nama" className="font-mono text-xs">
              Nama *
            </Label>
            <Input
              id="pemegang-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama lengkap"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pemegang-nip" className="font-mono text-xs">
              NIP
            </Label>
            <Input
              id="pemegang-nip"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="NIP (opsional)"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pemegang-jabatan" className="font-mono text-xs">
              Jabatan
            </Label>
            <Input
              id="pemegang-jabatan"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Jabatan (opsional)"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-xs">Status</Label>
            <div className="flex items-center gap-2">
              {(["PNS", "PPPK"] as PemegangStatus[]).map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    disabled={loading}
                    className={`inline-flex h-8 items-center px-3 font-mono text-xs ring-1 transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-background text-foreground ring-border hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
