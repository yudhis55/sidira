"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  addWhitelist,
  deleteWhitelist,
  setWhitelistAktif,
  updateWhitelist,
} from "@/lib/auth/marketplace";
import type { WhitelistPemohon } from "@/lib/marketplace-types";
import { cn } from "@/lib/utils";

export function WhitelistClient({ list }: { list: WhitelistPemohon[] }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<WhitelistPemohon | null>(null);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [editPending, setEditPending] = React.useState(false);

  const rows = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((w) => w.nama.toLowerCase().includes(needle));
  }, [list, search]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    setError(null);
    try {
      const result = await addWhitelist(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Nama ditambahkan ke whitelist");
      form.reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const toggle = async (row: WhitelistPemohon) => {
    const result = await setWhitelistAktif(row.id, !row.aktif);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  };

  const remove = async (row: WhitelistPemohon) => {
    if (!window.confirm(`Hapus "${row.nama}" dari whitelist?`)) return;
    const result = await deleteWhitelist(row.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Nama dihapus dari whitelist");
    router.refresh();
  };

  const submitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const formData = new FormData(e.currentTarget);
    setEditPending(true);
    setEditError(null);
    try {
      const result = await updateWhitelist(editing.id, formData);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      toast.success("Data whitelist diperbarui");
      setEditing(null);
      router.refresh();
    } finally {
      setEditPending(false);
    }
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={submit}
        className="rounded-md border border-border bg-surface p-4"
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[220px] flex-1">
            <span className="mb-1 block text-[12px] font-semibold text-text-2">
              Nama lengkap
            </span>
            <input
              name="nama"
              required
              placeholder="Contoh: Siti Aminah"
              className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
            />
          </label>
          <label className="min-w-[200px] flex-1">
            <span className="mb-1 block text-[12px] font-semibold text-text-2">
              Keterangan (opsional)
            </span>
            <input
              name="keterangan"
              placeholder="Contoh: Pengurus barang"
              className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "+ Tambah"}
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] font-medium text-danger">
            {error}
          </div>
        )}
        <p className="mt-2 text-[11px] text-text-3">
          Hanya nama yang terdaftar di sini yang bisa mengirim pengajuan.
        </p>
      </form>

      <div className="flex items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama..."
          className="h-9 w-full max-w-sm rounded-sm border border-border bg-surface px-3 text-[13px] outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
        />
        <span className="text-[12px] text-text-3">{rows.length} nama</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-[11px] uppercase tracking-[0.04em] text-text-3">
              <th className="px-4 py-2.5 font-semibold">Nama</th>
              <th className="px-4 py-2.5 font-semibold">Keterangan</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-surface-muted"
              >
                <td className="px-4 py-2.5 font-semibold text-foreground">
                  {row.nama}
                </td>
                <td className="px-4 py-2.5 text-text-2">
                  {row.keterangan || "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      row.aktif
                        ? "bg-teal4 text-teal"
                        : "bg-surface-muted text-text-2"
                    )}
                  >
                    {row.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditError(null);
                        setEditing(row);
                      }}
                      className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-muted"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(row)}
                      className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-muted"
                    >
                      {row.aktif ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row)}
                      className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-danger hover:bg-danger-soft"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-text-3">
                  Whitelist masih kosong. Tambahkan nama pemohon di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal edit nama whitelist */}
      {editing ? (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-foreground/40 p-3 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label="Edit nama whitelist"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form
            onSubmit={submitEdit}
            className="w-full max-w-[440px] rounded-lg border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <h2 className="mb-4 text-[15px] font-bold text-foreground">
              Edit Nama Whitelist
            </h2>

            {editError && (
              <div className="mb-3 rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] font-medium text-danger">
                {editError}
              </div>
            )}

            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-text-2">
                Nama lengkap
              </span>
              <input
                name="nama"
                defaultValue={editing.nama}
                required
                autoFocus
                className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-text-2">
                Keterangan
              </span>
              <input
                name="keterangan"
                defaultValue={editing.keterangan ?? ""}
                placeholder="Contoh: Pengurus barang"
                className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none placeholder:text-text-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={editPending}
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {editPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
