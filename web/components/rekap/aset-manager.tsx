"use client";

import { useState } from "react";
import type { AsetPemegang, AsetPemegangJenis } from "@/types/database";
import { Button } from "@/components/gas/button";
import { Input } from "@/components/gas/input";

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

const JENIS_CONFIG: Record<AsetPemegangJenis, { icon: string; label: string }> =
  {
    kendaraan: { icon: "\uD83D\uDE97", label: "Kendaraan Dinas" },
    laptop: { icon: "\uD83D\uDCBB", label: "Laptop / PC" },
    alat: { icon: "\uD83D\uDD27", label: "Alat Penunjang" },
    rumah: { icon: "\uD83C\uDFE0", label: "Rumah Dinas" },
  };

const JENIS_ORDER: AsetPemegangJenis[] = [
  "kendaraan",
  "laptop",
  "alat",
  "rumah",
];

/** Satu sub-tabel aset per jenis — mock-only (no backend). */
function AsetJenisTable({
  jenis,
  items: initialItems,
  readOnly,
}: {
  pemegangId: string;
  jenis: AsetPemegangJenis;
  items: AsetPemegang[];
  readOnly?: boolean;
}) {
  const config = JENIS_CONFIG[jenis];
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<AsetRowState>(emptyRow());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<AsetRowState>(emptyRow());
  const [err, setErr] = useState<string | null>(null);

  const showNopol = jenis === "kendaraan";

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!newRow.merk.trim() && !newRow.ket.trim()) {
      setErr("Isi minimal merk atau keterangan");
      return;
    }
    const next: AsetPemegang = {
      id: Date.now(),
      pemegang_id: initialItems[0]?.pemegang_id || "mock",
      jenis,
      merk: newRow.merk || undefined,
      type: newRow.type || undefined,
      tahun: newRow.tahun || undefined,
      nopol: newRow.nopol || undefined,
      harga: newRow.harga || undefined,
      ket: newRow.ket || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setItems((prev) => [...prev, next]);
    setNewRow(emptyRow());
    setAdding(false);
  };

  const handleUpdate = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    setErr(null);
    setItems((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              merk: editRow.merk || undefined,
              type: editRow.type || undefined,
              tahun: editRow.tahun || undefined,
              nopol: editRow.nopol || undefined,
              harga: editRow.harga || undefined,
              ket: editRow.ket || undefined,
              updated_at: new Date().toISOString(),
            }
          : a,
      ),
    );
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus aset ini?")) return;
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="rounded-lg border border-line bg-white overflow-hidden">
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b border-line"
        style={{ background: "#ecfdf5" }}
      >
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-base">
            {config.icon}
          </span>
          <span
            className="text-[11px] font-extrabold uppercase tracking-[0.4px]"
            style={{ color: "#065f46" }}
          >
            {config.label} ({items.length})
          </span>
        </div>
        {!readOnly && !adding && (
          <Button
            type="button"
            variant="ghost"
            className="text-[11px] px-2 py-0.5 h-auto"
            onClick={() => {
              setAdding(true);
              setErr(null);
            }}
          >
            {"\u2795"} Tambah
          </Button>
        )}
      </div>

      {err && (
        <p className="px-3 py-2 text-xs text-red border-b border-line" role="alert">
          {err}
        </p>
      )}

      {items.length === 0 && !adding ? (
        <p className="px-3 py-6 text-center text-[11.5px] text-ink3">
          Tidak ada data
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {(showNopol
                  ? ["Merk", "Tipe", "Tahun", "Nopol", "Harga", "Ket", ""]
                  : ["Merk", "Tipe", "Tahun", "Harga", "Ket", ""]
                ).map((h) => (
                  <th
                    key={h || "act"}
                    className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-left text-ink3 border-b border-line"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) =>
                editingId === item.id ? (
                  <tr key={item.id} className="border-b border-line">
                    <td className="px-2 py-1.5" colSpan={showNopol ? 7 : 6}>
                      <form
                        onSubmit={(e) => handleUpdate(e, item.id)}
                        className="grid grid-cols-2 md:grid-cols-3 gap-2"
                      >
                        <Input
                          label="Merk"
                          value={editRow.merk}
                          onChange={(e) =>
                            setEditRow((r) => ({ ...r, merk: e.target.value }))
                          }
                        />
                        <Input
                          label="Tipe"
                          value={editRow.type}
                          onChange={(e) =>
                            setEditRow((r) => ({ ...r, type: e.target.value }))
                          }
                        />
                        <Input
                          label="Tahun"
                          value={editRow.tahun}
                          onChange={(e) =>
                            setEditRow((r) => ({ ...r, tahun: e.target.value }))
                          }
                        />
                        {showNopol && (
                          <Input
                            label="Nopol"
                            value={editRow.nopol}
                            onChange={(e) =>
                              setEditRow((r) => ({
                                ...r,
                                nopol: e.target.value,
                              }))
                            }
                          />
                        )}
                        <Input
                          label="Harga"
                          value={editRow.harga}
                          onChange={(e) =>
                            setEditRow((r) => ({ ...r, harga: e.target.value }))
                          }
                        />
                        <Input
                          label="Ket"
                          value={editRow.ket}
                          onChange={(e) =>
                            setEditRow((r) => ({ ...r, ket: e.target.value }))
                          }
                        />
                        <div className="col-span-full flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="modal-cancel"
                            className="text-[11px] px-3 py-1.5"
                            onClick={() => setEditingId(null)}
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            variant="modal-ok"
                            className="text-[11px] px-3 py-1.5"
                          >
                            Simpan
                          </Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={item.id}
                    className="border-b border-line last:border-0 hover:bg-line2/40"
                  >
                    <td className="px-2.5 py-2 text-ink font-semibold">
                      {item.merk || "—"}
                    </td>
                    <td className="px-2.5 py-2 text-ink2">{item.type || "—"}</td>
                    <td className="px-2.5 py-2 text-ink2 font-mono text-[11px]">
                      {item.tahun || "—"}
                    </td>
                    {showNopol && (
                      <td className="px-2.5 py-2 text-ink2 font-mono text-[11px]">
                        {item.nopol || "—"}
                      </td>
                    )}
                    <td className="px-2.5 py-2 text-ink2">
                      {item.harga ? `Rp ${item.harga}` : "—"}
                    </td>
                    <td className="px-2.5 py-2 text-ink3 text-[11px]">
                      {item.ket || "—"}
                    </td>
                    {!readOnly && (
                      <td className="px-2.5 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="mr-1 py-0.5 px-2 rounded border border-line text-[10.5px] font-semibold text-ink2 hover:border-teal hover:text-teal"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditRow(toRowState(item));
                            setErr(null);
                          }}
                        >
                          {"\u270F\uFE0F"}
                        </button>
                        <button
                          type="button"
                          className="py-0.5 px-2 rounded border border-line text-[10.5px] font-semibold text-ink2 hover:border-red hover:text-red"
                          onClick={() => handleDelete(item.id)}
                        >
                          {"\uD83D\uDDD1\uFE0F"}
                        </button>
                      </td>
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {adding && !readOnly && (
        <form
          onSubmit={handleAdd}
          className="border-t border-line p-3 grid grid-cols-2 md:grid-cols-3 gap-2"
          style={{ background: "#f8fafc" }}
        >
          <Input
            label="Merk"
            value={newRow.merk}
            onChange={(e) => setNewRow((r) => ({ ...r, merk: e.target.value }))}
            placeholder="Merk"
          />
          <Input
            label="Tipe"
            value={newRow.type}
            onChange={(e) => setNewRow((r) => ({ ...r, type: e.target.value }))}
            placeholder="Tipe / model"
          />
          <Input
            label="Tahun"
            value={newRow.tahun}
            onChange={(e) =>
              setNewRow((r) => ({ ...r, tahun: e.target.value }))
            }
            placeholder="Tahun"
          />
          {showNopol && (
            <Input
              label="Nopol"
              value={newRow.nopol}
              onChange={(e) =>
                setNewRow((r) => ({ ...r, nopol: e.target.value }))
              }
              placeholder="Nopol"
            />
          )}
          <Input
            label="Harga"
            value={newRow.harga}
            onChange={(e) =>
              setNewRow((r) => ({ ...r, harga: e.target.value }))
            }
            placeholder="Harga"
          />
          <Input
            label="Ket"
            value={newRow.ket}
            onChange={(e) => setNewRow((r) => ({ ...r, ket: e.target.value }))}
            placeholder="Keterangan"
          />
          <div className="col-span-full flex gap-2 justify-end">
            <Button
              type="button"
              variant="modal-cancel"
              className="text-[11px] px-3 py-1.5"
              onClick={() => {
                setAdding(false);
                setNewRow(emptyRow());
                setErr(null);
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="modal-ok"
              className="text-[11px] px-3 py-1.5"
            >
              {"\u2795"} Simpan
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AsetManager({
  pemegangId,
  asetList,
  readOnly,
}: AsetManagerProps) {
  const byJenis = (jenis: AsetPemegangJenis) =>
    asetList.filter((a) => a.jenis === jenis);

  return (
    <div className="space-y-3">
      {JENIS_ORDER.map((jenis) => (
        <AsetJenisTable
          key={jenis}
          pemegangId={pemegangId}
          jenis={jenis}
          items={byJenis(jenis)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
