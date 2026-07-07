"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addAset,
  updateAset,
  deleteAset,
  type AsetInput,
} from "@/lib/auth/rekap";
import type { AsetPemegang, AsetPemegangJenis } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

interface AsetManagerProps {
  pemegangId: string;
  asetList: AsetPemegang[];
  readOnly?: boolean;
}

interface AsetRowState {
  merk: string;
  type: string;
  tahun: string;
  nopol: string;
  harga: string;
  ket: string;
}

function emptyRow(): AsetRowState {
  return { merk: "", type: "", tahun: "", nopol: "", harga: "", ket: "" };
}

function toRowState(a: AsetPemegang): AsetRowState {
  return {
    merk: a.merk || "",
    type: a.type || "",
    tahun: a.tahun || "",
    nopol: a.nopol || "",
    harga: a.harga || "",
    ket: a.ket || "",
  };
}

const JENIS_CONFIG: Record<
  AsetPemegangJenis,
  { icon: string; label: string }
> = {
  kendaraan: { icon: "🚗", label: "Kendaraan Dinas" },
  laptop: { icon: "💻", label: "Laptop / PC" },
  alat: { icon: "🔧", label: "Alat Penunjang" },
  rumah: { icon: "🏠", label: "Rumah Dinas" },
};

const JENIS_ORDER: AsetPemegangJenis[] = [
  "kendaraan",
  "laptop",
  "alat",
  "rumah",
];

/** Satu sub-tabel aset per jenis, dengan add/edit/delete inline. */
function AsetJenisTable({
  pemegangId,
  jenis,
  items,
  readOnly,
}: {
  pemegangId: string;
  jenis: AsetPemegangJenis;
  items: AsetPemegang[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const config = JENIS_CONFIG[jenis];
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<AsetRowState>(emptyRow());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<AsetRowState>(emptyRow());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const payload: AsetInput = {
        jenis,
        merk: newRow.merk,
        type: newRow.type,
        tahun: newRow.tahun,
        nopol: newRow.nopol,
        harga: newRow.harga,
        ket: newRow.ket,
      };
      await addAset(pemegangId, payload);
      setNewRow(emptyRow());
      setAdding(false);
      router.refresh();
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async (asetId: number) => {
    setBusy(true);
    setErr(null);
    try {
      await updateAset(asetId, { ...editRow }, pemegangId);
      setEditingId(null);
      setEditRow(emptyRow());
      router.refresh();
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (asetId: number) => {
    if (!confirm("Hapus aset ini?")) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteAset(asetId, pemegangId);
      router.refresh();
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const isKendaraan = jenis === "kendaraan";
  const isRumah = jenis === "rumah";

  return (
    <div className="ring-1 ring-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span aria-hidden>{config.icon}</span>
          <span className="font-mono text-xs font-semibold">
            {config.label} ({items.length})
          </span>
        </div>
        {!readOnly && !adding && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setAdding(true)}
            disabled={busy}
          >
            <Plus className="h-3 w-3" />
            Tambah
          </Button>
        )}
      </div>

      {err && (
        <p className="border-b border-destructive/20 bg-destructive/10 px-2 py-1 text-[10px] text-destructive">
          {err}
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="h-8 w-7 px-2 font-mono text-[10px]">No</TableHead>
            {isKendaraan ? (
              <>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Jenis</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Merk</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Tahun</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">No. Polisi</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Harga</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Ket</TableHead>
              </>
            ) : isRumah ? (
              <>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Ket</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Merk</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Tahun</TableHead>
              </>
            ) : (
              <>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Merk</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Type</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Tahun</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Harga</TableHead>
                <TableHead className="h-8 px-2 font-mono text-[10px]">Ket</TableHead>
              </>
            )}
            {!readOnly && (
              <TableHead className="h-8 w-16 px-2 text-center font-mono text-[10px]">
                Aksi
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && !adding && (
            <TableRow>
              <TableCell
                colSpan={isKendaraan ? 8 : isRumah ? 5 : 7}
                className="px-2 py-3 text-center text-[11px] text-muted-foreground"
              >
                Tidak ada data
              </TableCell>
            </TableRow>
          )}

          {items.map((a, i) => (
            <TableRow key={a.id} className="border-b border-border last:border-0">
              <TableCell className="px-2 py-1.5 font-mono text-[11px]">
                {i + 1}
              </TableCell>
              {editingId === a.id ? (
                <>
                  {isKendaraan && (
                    <>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.ket}
                          onChange={(e) =>
                            setEditRow({ ...editRow, ket: e.target.value })
                          }
                          placeholder="Jenis"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.merk}
                          onChange={(e) =>
                            setEditRow({ ...editRow, merk: e.target.value })
                          }
                          placeholder="Merk"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7 w-20"
                          value={editRow.tahun}
                          onChange={(e) =>
                            setEditRow({ ...editRow, tahun: e.target.value })
                          }
                          placeholder="Tahun"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.nopol}
                          onChange={(e) =>
                            setEditRow({ ...editRow, nopol: e.target.value })
                          }
                          placeholder="No. Polisi"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.harga}
                          onChange={(e) =>
                            setEditRow({ ...editRow, harga: e.target.value })
                          }
                          placeholder="Harga"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.ket}
                          onChange={(e) =>
                            setEditRow({ ...editRow, ket: e.target.value })
                          }
                          placeholder="Ket"
                          disabled={busy}
                        />
                      </TableCell>
                    </>
                  )}
                  {isRumah && (
                    <>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.ket}
                          onChange={(e) =>
                            setEditRow({ ...editRow, ket: e.target.value })
                          }
                          placeholder="Ket"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.merk}
                          onChange={(e) =>
                            setEditRow({ ...editRow, merk: e.target.value })
                          }
                          placeholder="Merk"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7 w-20"
                          value={editRow.tahun}
                          onChange={(e) =>
                            setEditRow({ ...editRow, tahun: e.target.value })
                          }
                          placeholder="Tahun"
                          disabled={busy}
                        />
                      </TableCell>
                    </>
                  )}
                  {!isKendaraan && !isRumah && (
                    <>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.merk}
                          onChange={(e) =>
                            setEditRow({ ...editRow, merk: e.target.value })
                          }
                          placeholder="Merk"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.type}
                          onChange={(e) =>
                            setEditRow({ ...editRow, type: e.target.value })
                          }
                          placeholder="Type"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7 w-20"
                          value={editRow.tahun}
                          onChange={(e) =>
                            setEditRow({ ...editRow, tahun: e.target.value })
                          }
                          placeholder="Tahun"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.harga}
                          onChange={(e) =>
                            setEditRow({ ...editRow, harga: e.target.value })
                          }
                          placeholder="Harga"
                          disabled={busy}
                        />
                      </TableCell>
                      <TableCell className="px-1 py-1">
                        <Input
                          className="h-7"
                          value={editRow.ket}
                          onChange={(e) =>
                            setEditRow({ ...editRow, ket: e.target.value })
                          }
                          placeholder="Ket"
                          disabled={busy}
                        />
                      </TableCell>
                    </>
                  )}
                  <TableCell className="px-1 py-1">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(a.id)}
                        disabled={busy}
                        className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                        title="Simpan"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditRow(emptyRow());
                        }}
                        disabled={busy}
                        className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                        title="Batal"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  {isKendaraan && (
                    <>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.ket || a.merk || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.nopol || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.harga || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px] text-muted-foreground">{a.ket || "-"}</TableCell>
                    </>
                  )}
                  {isRumah && (
                    <>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.ket || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                    </>
                  )}
                  {!isKendaraan && !isRumah && (
                    <>
                      <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.type || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px]">{a.harga || "-"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[11px] text-muted-foreground">{a.ket || "-"}</TableCell>
                    </>
                  )}
                  {!readOnly && (
                    <TableCell className="px-2 py-1.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(a.id);
                            setEditRow(toRowState(a));
                          }}
                          disabled={busy}
                          className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          disabled={busy}
                          className="inline-flex h-6 w-6 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/20"
                          title="Hapus"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </>
              )}
            </TableRow>
          ))}

          {adding && (
            <TableRow className="border-b border-border bg-muted/20">
              <TableCell className="px-2 py-1.5 font-mono text-[11px]">
                {items.length + 1}
              </TableCell>
              <TableCell className="px-1 py-1" colSpan={1}>
                {isKendaraan ? (
                  <Input
                    className="h-7"
                    value={newRow.ket}
                    onChange={(e) => setNewRow({ ...newRow, ket: e.target.value })}
                    placeholder="Jenis (motor/mobil)"
                    disabled={busy}
                  />
                ) : isRumah ? (
                  <Input
                    className="h-7"
                    value={newRow.ket}
                    onChange={(e) => setNewRow({ ...newRow, ket: e.target.value })}
                    placeholder="Keterangan"
                    disabled={busy}
                  />
                ) : (
                  <Input
                    className="h-7"
                    value={newRow.merk}
                    onChange={(e) => setNewRow({ ...newRow, merk: e.target.value })}
                    placeholder="Merk"
                    disabled={busy}
                  />
                )}
              </TableCell>
              <TableCell className="px-1 py-1">
                <Input
                  className="h-7"
                  value={newRow.merk}
                  onChange={(e) => setNewRow({ ...newRow, merk: e.target.value })}
                  placeholder="Merk"
                  disabled={busy}
                />
              </TableCell>
              <TableCell className="px-1 py-1">
                <Input
                  className="h-7 w-20"
                  value={newRow.tahun}
                  onChange={(e) => setNewRow({ ...newRow, tahun: e.target.value })}
                  placeholder="Tahun"
                  disabled={busy}
                />
              </TableCell>
              {isKendaraan && (
                <>
                  <TableCell className="px-1 py-1">
                    <Input
                      className="h-7"
                      value={newRow.nopol}
                      onChange={(e) => setNewRow({ ...newRow, nopol: e.target.value })}
                      placeholder="No. Polisi"
                      disabled={busy}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      className="h-7"
                      value={newRow.harga}
                      onChange={(e) => setNewRow({ ...newRow, harga: e.target.value })}
                      placeholder="Harga"
                      disabled={busy}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      className="h-7"
                      value={newRow.ket}
                      onChange={(e) => setNewRow({ ...newRow, ket: e.target.value })}
                      placeholder="Ket"
                      disabled={busy}
                    />
                  </TableCell>
                </>
              )}
              {!isKendaraan && !isRumah && (
                <>
                  <TableCell className="px-1 py-1">
                    <Input
                      className="h-7"
                      value={newRow.type}
                      onChange={(e) => setNewRow({ ...newRow, type: e.target.value })}
                      placeholder="Type"
                      disabled={busy}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      className="h-7"
                      value={newRow.harga}
                      onChange={(e) => setNewRow({ ...newRow, harga: e.target.value })}
                      placeholder="Harga"
                      disabled={busy}
                    />
                  </TableCell>
                  <TableCell className="px-1 py-1">
                    <Input
                      className="h-7"
                      value={newRow.ket}
                      onChange={(e) => setNewRow({ ...newRow, ket: e.target.value })}
                      placeholder="Ket"
                      disabled={busy}
                    />
                  </TableCell>
                </>
              )}
              <TableCell className="px-1 py-1">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={busy}
                    className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                    title="Simpan"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdding(false);
                      setNewRow(emptyRow());
                    }}
                    disabled={busy}
                    className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                    title="Batal"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function AsetManager({
  pemegangId,
  asetList,
  readOnly,
}: AsetManagerProps) {
  return (
    <div className="space-y-4">
      {JENIS_ORDER.map((jenis) => (
        <AsetJenisTable
          key={jenis}
          pemegangId={pemegangId}
          jenis={jenis}
          items={asetList.filter((a) => a.jenis === jenis)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
