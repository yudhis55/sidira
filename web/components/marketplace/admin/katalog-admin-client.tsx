"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createBarang,
  deleteBarang,
  koreksiStok,
  tambahStok,
  updateBarang,
} from "@/lib/auth/marketplace";
import {
  MUTASI_TIPE_LABELS,
  type Barang,
  type KategoriBarang,
  type MutasiStok,
} from "@/lib/marketplace-types";
import { cn } from "@/lib/utils";

interface Props {
  barang: Barang[];
  kategori: KategoriBarang[];
  ledger: MutasiStok[];
}

type StockMode = "masuk" | "koreksi";

export function KatalogAdminClient({ barang, kategori, ledger }: Props) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Barang | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const [stockTarget, setStockTarget] = React.useState<Barang | null>(null);
  const [stockMode, setStockMode] = React.useState<StockMode>("masuk");
  const [stockQty, setStockQty] = React.useState("1");
  const [stockNote, setStockNote] = React.useState("");

  const [search, setSearch] = React.useState("");

  const rows = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return barang;
    return barang.filter(
      (b) =>
        b.nama.toLowerCase().includes(needle) ||
        b.kode.toLowerCase().includes(needle) ||
        (b.kategori_nama ?? "").toLowerCase().includes(needle)
    );
  }, [barang, search]);

  const openCreate = () => {
    setEditing(null);
    setError(null);
    setOpen(true);
  };

  const openEdit = (item: Barang) => {
    setEditing(item);
    setError(null);
    setOpen(true);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const result = editing
        ? await updateBarang(editing.id, formData)
        : await createBarang(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(editing ? "Barang diperbarui" : "Barang ditambahkan");
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const onDelete = async (item: Barang) => {
    if (!window.confirm(`Hapus barang "${item.nama}"? Tindakan ini permanen.`)) {
      return;
    }
    const result = await deleteBarang(item.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Barang dihapus");
    router.refresh();
  };

  const openStock = (item: Barang, mode: StockMode) => {
    setStockTarget(item);
    setStockMode(mode);
    setStockQty(mode === "koreksi" ? String(item.stok) : "1");
    setStockNote("");
    setError(null);
  };

  const submitStock = async () => {
    if (!stockTarget) return;
    const qty = Number(stockQty);
    setPending(true);
    setError(null);
    try {
      const result =
        stockMode === "masuk"
          ? await tambahStok({
              barang_id: stockTarget.id,
              jumlah: qty,
              keterangan: stockNote,
            })
          : await koreksiStok({
              barang_id: stockTarget.id,
              stok_baru: qty,
              keterangan: stockNote,
            });
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success(
        stockMode === "masuk"
          ? `Stok masuk. Stok sekarang ${result.stok}`
          : `Stok dikoreksi menjadi ${result.stok}`
      );
      setStockTarget(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, kode, atau kategori..."
          className="h-9 w-full max-w-sm rounded-sm border border-border bg-surface px-3 text-[13px] text-foreground outline-none placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
        />
        <button
          type="button"
          onClick={openCreate}
          className="ml-auto inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Tambah Barang
        </button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <table className="w-full min-w-[900px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-[11px] uppercase tracking-[0.04em] text-text-3">
              <th className="px-3 py-2.5 font-semibold">Kode</th>
              <th className="px-3 py-2.5 font-semibold">Nama</th>
              <th className="px-3 py-2.5 font-semibold">Kategori</th>
              <th className="px-3 py-2.5 font-semibold">Satuan</th>
              <th className="px-3 py-2.5 font-semibold text-right">Stok</th>
              <th className="px-3 py-2.5 font-semibold text-right">Min</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const low = item.stok <= item.stok_minimum;
              return (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-muted"
                >
                  <td className="px-3 py-2.5 font-mono text-[12px] text-text-2">
                    {item.kode}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-foreground">
                    {item.nama}
                  </td>
                  <td className="px-3 py-2.5 text-text-2">
                    {item.kategori_nama ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-text-2">{item.satuan}</td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right font-mono tabular-nums",
                      low ? "font-bold text-danger" : "text-foreground"
                    )}
                  >
                    {item.stok}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-text-3">
                    {item.stok_minimum}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        item.aktif
                          ? "bg-teal4 text-teal"
                          : "bg-surface-muted text-text-2"
                      )}
                    >
                      {item.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openStock(item, "masuk")}
                        className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-muted"
                      >
                        + Stok
                      </button>
                      <button
                        type="button"
                        onClick={() => openStock(item, "koreksi")}
                        className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-muted"
                      >
                        Koreksi
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-surface-muted"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-danger hover:bg-danger-soft"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-text-3">
                  Belum ada barang di katalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Ledger mutasi stok ── */}
      <div className="rounded-md border border-border bg-surface">
        <div className="border-b border-border bg-surface-subtle px-4 py-3">
          <h2 className="text-[13px] font-bold text-foreground">
            Riwayat Mutasi Stok (200 terakhir)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.04em] text-text-3">
                <th className="px-4 py-2 font-semibold">Waktu</th>
                <th className="px-4 py-2 font-semibold">Barang</th>
                <th className="px-4 py-2 font-semibold">Tipe</th>
                <th className="px-4 py-2 font-semibold text-right">Jumlah</th>
                <th className="px-4 py-2 font-semibold text-right">Stok</th>
                <th className="px-4 py-2 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="whitespace-nowrap px-4 py-2 text-text-3">
                    {new Date(m.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2 text-foreground">
                    {m.barang_nama ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-text-2">
                    {MUTASI_TIPE_LABELS[m.tipe]}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2 text-right font-mono tabular-nums",
                      m.jumlah < 0 ? "text-danger" : "text-primary"
                    )}
                  >
                    {m.jumlah > 0 ? `+${m.jumlah}` : m.jumlah}
                  </td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-text-2">
                    {m.stok_sebelum} → {m.stok_sesudah}
                  </td>
                  <td className="px-4 py-2 text-text-3">{m.keterangan}</td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-3">
                    Belum ada mutasi stok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Form barang ── */}
      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-foreground/40 p-3 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit barang" : "Tambah barang"}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <form
            onSubmit={submitForm}
            className="w-full max-w-[520px] rounded-lg border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <h2 className="mb-4 text-[15px] font-bold text-foreground">
              {editing ? "Edit Barang" : "Tambah Barang"}
            </h2>

            {error && (
              <div className="mb-3 rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] font-medium text-danger">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Kode
                </span>
                <input
                  name="kode"
                  defaultValue={editing?.kode ?? ""}
                  required
                  className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Satuan
                </span>
                <input
                  name="satuan"
                  defaultValue={editing?.satuan ?? "Pcs"}
                  className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Nama barang
                </span>
                <input
                  name="nama"
                  defaultValue={editing?.nama ?? ""}
                  required
                  className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Kategori
                </span>
                <select
                  name="kategori_id"
                  defaultValue={editing?.kategori_id ?? ""}
                  className="h-9 w-full rounded-sm border border-border bg-surface px-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                >
                  <option value="">— Tanpa kategori —</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Stok minimum
                </span>
                <input
                  name="stok_minimum"
                  type="number"
                  min={0}
                  defaultValue={editing?.stok_minimum ?? 0}
                  className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                />
              </label>
              {!editing && (
                <label className="block">
                  <span className="mb-1 block text-[12px] font-semibold text-text-2">
                    Stok awal
                  </span>
                  <input
                    name="stok"
                    type="number"
                    min={0}
                    defaultValue={0}
                    className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Status
                </span>
                <select
                  name="aktif"
                  defaultValue={editing ? String(editing.aktif) : "true"}
                  className="h-9 w-full rounded-sm border border-border bg-surface px-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[12px] font-semibold text-text-2">
                  Deskripsi
                </span>
                <textarea
                  name="deskripsi"
                  rows={2}
                  defaultValue={editing?.deskripsi ?? ""}
                  className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Dialog stok ── */}
      {stockTarget && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-foreground/40 p-3 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-label="Ubah stok"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStockTarget(null);
          }}
        >
          <div className="w-full max-w-[420px] rounded-lg border border-border bg-surface p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
            <h2 className="text-[15px] font-bold text-foreground">
              {stockMode === "masuk" ? "Tambah Stok" : "Koreksi Stok"}
            </h2>
            <p className="mt-1 text-[12px] text-text-2">
              {stockTarget.nama} · stok sekarang{" "}
              <span className="font-mono font-semibold">
                {stockTarget.stok}
              </span>{" "}
              {stockTarget.satuan}
            </p>

            {error && (
              <div className="mt-3 rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] font-medium text-danger">
                {error}
              </div>
            )}

            <label className="mt-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-text-2">
                {stockMode === "masuk" ? "Jumlah masuk" : "Stok baru"}
              </span>
              <input
                type="number"
                min={stockMode === "masuk" ? 1 : 0}
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="h-9 w-full rounded-sm border border-border bg-surface px-3 font-mono text-[13px] tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-text-2">
                Keterangan
              </span>
              <input
                type="text"
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
                placeholder={
                  stockMode === "masuk"
                    ? "Contoh: penerimaan dari gudang"
                    : "Contoh: hasil stock opname"
                }
                className="h-9 w-full rounded-sm border border-border bg-surface px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
              />
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStockTarget(null)}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitStock}
                disabled={pending}
                className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
