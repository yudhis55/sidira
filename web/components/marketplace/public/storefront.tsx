"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  MagnifyingGlass,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Warning,
  X,
  XCircle,
} from "@phosphor-icons/react";
import type { Barang, KategoriBarang } from "@/lib/marketplace-types";
import type { Room } from "@/types/database";
import { cn } from "@/lib/utils";
import { CartDrawer } from "./cart-drawer";
import { useCart } from "./use-cart";

interface StorefrontProps {
  barang: Barang[];
  kategori: KategoriBarang[];
  rooms: Room[];
}

/**
 * Etalase publik (landing `/`).
 *
 * Tata letak marketplace: hero berwarna, pencarian menonjol, tab kategori
 * yang bisa digeser, dan grid kartu barang. Berbeda dari tampilan
 * pengelolaan di dashboard yang berbentuk tabel.
 */
export function Storefront({ barang, kategori, rooms }: StorefrontProps) {
  const cart = useCart();
  const [query, setQuery] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<Barang | null>(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const tabs = useMemo(
    () => [
      { key: "all", label: "Semua" },
      ...kategori.map((item) => ({ key: String(item.id), label: item.nama })),
    ],
    [kategori]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const kategoriId = kategoriAktif === "all" ? null : Number(kategoriAktif);
    return barang.filter((item) => {
      if (kategoriId !== null && item.kategori_id !== kategoriId) return false;
      if (!q) return true;
      return [item.nama, item.kode, item.kategori_nama ?? ""].some((value) =>
        value.toLowerCase().includes(q)
      );
    });
  }, [barang, kategoriAktif, query]);

  const qtyById = useMemo(() => {
    const map = new Map<number, number>();
    for (const line of cart.lines) map.set(line.barang_id, line.jumlah);
    return map;
  }, [cart.lines]);

  const stokById = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of barang) map.set(item.id, item.stok);
    return map;
  }, [barang]);

  const totalQty = cart.lines.reduce((sum, line) => sum + line.jumlah, 0);
  const adaFilter = query.trim().length > 0 || kategoriAktif !== "all";

  function resetFilter() {
    setQuery("");
    setKategoriAktif("all");
  }

  return (
    <div className="space-y-5">
      {/* ── Hero etalase ── */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary to-teal px-5 py-6 text-primary-foreground sm:px-7 sm:py-8">
        <div className="relative max-w-xl">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] opacity-75">
            SIDIRA · PUSKESMAS BARUHARJO
          </p>
          <h1 className="mt-1.5 text-[23px] font-extrabold leading-snug tracking-tight sm:text-[30px]">
            Sistem Digital Inventaris Ruangan Aset
          </h1>
          <p className="mt-2 max-w-[46ch] text-[12.5px] leading-relaxed opacity-90 sm:text-[13.5px]">
            Mau minta BMHP, alkes, atau ATK? Pilih barangnya di bawah, ajukan,
            lalu petugas akan menindaklanjuti.
          </p>

          <div className="relative mt-4 w-full max-w-md">
            <MagnifyingGlass
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama atau kode barang…"
              aria-label="Cari barang"
              className="h-11 w-full rounded-md border border-transparent bg-surface pl-10 pr-9 text-[13px] text-foreground shadow-sm outline-none placeholder:text-text-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-white/50"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-text-3 transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Tab kategori + aksi keranjang ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex-1 overflow-x-auto px-1 pb-0.5 sm:overflow-visible sm:pb-0">
          <div className="flex items-center gap-1.5">
            {tabs.map((tab) => {
              const on = kategoriAktif === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setKategoriAktif(tab.key)}
                  aria-pressed={on}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-text-2 hover:bg-surface-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="text-[11.5px] text-text-3 sm:mr-1">
            {filtered.length.toLocaleString("id-ID")} barang
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-surface px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            <ShoppingCart size={16} weight="bold" aria-hidden />
            Keranjang
            {totalQty > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                {totalQty.toLocaleString("id-ID")}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* ── Grid barang ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-md bg-surface-muted text-text-3">
            <MagnifyingGlass size={20} />
          </span>
          <p className="mt-3 text-[14px] font-semibold text-foreground">
            {barang.length === 0
              ? "Katalog belum tersedia"
              : "Barang tidak ditemukan"}
          </p>
          <p className="mt-1 max-w-[44ch] text-[12.5px] leading-relaxed text-text-3">
            {barang.length === 0
              ? "Belum ada barang aktif di katalog. Silakan coba lagi nanti."
              : "Coba kata kunci lain atau ubah filter kategori."}
          </p>
          {adaFilter ? (
            <button
              type="button"
              onClick={resetFilter}
              className="mt-4 inline-flex h-8 items-center rounded-sm border border-border bg-surface px-3 text-[12px] font-semibold text-foreground hover:bg-surface-muted"
            >
              Reset pencarian
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <BarangCard
              key={item.id}
              barang={item}
              diKeranjang={qtyById.get(item.id) ?? 0}
              onOpenDetail={() => setDetail(item)}
              onAdd={(qty) => {
                cart.addLine(
                  {
                    barang_id: item.id,
                    nama: item.nama,
                    satuan: item.satuan,
                  },
                  item.stok,
                  qty
                );
                toast.success(
                  `${qty.toLocaleString("id-ID")} ${item.satuan.toLowerCase()} ${item.nama} ditambahkan ke keranjang`
                );
              }}
            />
          ))}
        </div>
      )}

      {/* Bar keranjang lengket — hanya di ponsel, di atas bottom nav. */}
      {totalQty > 0 ? (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface px-4 py-2.5 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-full items-center justify-between rounded-sm bg-primary px-4 text-primary-foreground"
          >
            <span className="flex items-center gap-2 text-[13px] font-semibold">
              <ShoppingCart size={16} weight="bold" aria-hidden />
              {totalQty.toLocaleString("id-ID")} barang
            </span>
            <span className="text-[12px] font-semibold">Lihat keranjang</span>
          </button>
        </div>
      ) : null}

      {detail ? (
        <BarangDetailDialog
          barang={detail}
          onClose={() => setDetail(null)}
          onAdd={(qty) => {
            cart.addLine(
              {
                barang_id: detail.id,
                nama: detail.nama,
                satuan: detail.satuan,
              },
              detail.stok,
              qty
            );
            toast.success(
              `${qty.toLocaleString("id-ID")} ${detail.satuan.toLowerCase()} ${detail.nama} ditambahkan ke keranjang`
            );
            setDetail(null);
          }}
        />
      ) : null}

      <CartDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        lines={cart.lines}
        rooms={rooms}
        stokById={stokById}
        count={cart.count}
        onSetJumlah={cart.setJumlah}
        onRemove={cart.removeLine}
        onClear={cart.clearCart}
      />
    </div>
  );
}

function BarangCard({
  barang,
  diKeranjang,
  onAdd,
  onOpenDetail,
}: {
  barang: Barang;
  diKeranjang: number;
  onAdd: (qty: number) => void;
  onOpenDetail: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);

  const habis = barang.stok <= 0;
  const menipis = !habis && barang.stok <= barang.stok_minimum;
  // Sisa yang masih bisa ditambahkan, memperhitungkan isi keranjang.
  const sisa = Math.max(1, barang.stok - diKeranjang);

  const status = habis
    ? { label: "Habis", cls: "text-danger", icon: <XCircle size={13} weight="fill" /> }
    : menipis
      ? { label: "Menipis", cls: "text-warning", icon: <Warning size={13} weight="fill" /> }
      : { label: "Tersedia", cls: "text-teal", icon: <CheckCircle size={13} weight="fill" /> };

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      {/* Gambar / fallback ikon (kebijakan tanpa gambar rusak) */}
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label={`Lihat detail ${barang.nama}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-muted text-left"
      >
        {barang.foto && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={barang.foto}
            alt={barang.nama}
            onError={() => setImgError(true)}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-surface-muted to-border/50 p-3 text-center">
            <Package size={26} weight="duotone" className="text-text-3" aria-hidden />
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-3">
              {barang.kode}
            </span>
          </div>
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-surface/95 px-2 py-1 text-[10.5px] font-semibold backdrop-blur">
          <span className={status.cls} aria-hidden>
            {status.icon}
          </span>
          <span className="text-text-2">{status.label}</span>
        </span>

        {diKeranjang > 0 ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-1 text-[10px] font-bold text-primary-foreground">
            <ShoppingCart size={11} weight="bold" aria-hidden />
            {diKeranjang.toLocaleString("id-ID")}
          </span>
        ) : null}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex items-center gap-1 text-[10.5px] font-medium text-text-3">
          <span className="max-w-[9rem] truncate">
            {barang.kategori_nama ?? "Umum"}
          </span>
          <span aria-hidden>·</span>
          <span className="font-mono">{barang.kode}</span>
        </div>

        <h3
          title={barang.nama}
          className="line-clamp-2 min-h-[2.4rem] text-[13px] font-bold leading-snug text-foreground"
        >
          {barang.nama}
        </h3>

        <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2 text-[11px]">
          <span className="text-text-3">Stok</span>
          <span
            className={cn(
              "font-mono text-[13px] font-semibold tabular-nums",
              habis ? "text-danger" : menipis ? "text-warning" : "text-foreground"
            )}
          >
            {barang.stok.toLocaleString("id-ID")}{" "}
            <span className="text-[11px] font-normal text-text-3">
              {barang.satuan}
            </span>
          </span>
        </div>
      </div>

      {/* Footer aksi */}
      <div className="p-3 pt-0">
        {habis ? (
          <div className="flex h-9 items-center justify-center rounded-sm bg-surface-muted text-[12px] font-semibold text-text-3">
            Stok habis
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-sm border border-border bg-surface-subtle">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Kurangi jumlah"
                className="flex size-9 items-center justify-center text-text-2 transition-colors hover:bg-surface-muted disabled:opacity-40"
              >
                <Minus size={13} weight="bold" />
              </button>
              <span
                aria-live="polite"
                className="w-8 text-center font-mono text-[12px] font-semibold tabular-nums text-foreground"
              >
                {qty.toLocaleString("id-ID")}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(sisa, q + 1))}
                disabled={qty >= sisa}
                aria-label="Tambah jumlah"
                className="flex size-9 items-center justify-center text-text-2 transition-colors hover:bg-surface-muted disabled:opacity-40"
              >
                <Plus size={13} weight="bold" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onAdd(qty);
                setQty(1);
              }}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-sm bg-primary text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ShoppingCart size={13} weight="bold" aria-hidden />
              Tambah
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function BarangDetailDialog({
  barang,
  onClose,
  onAdd,
}: {
  barang: Barang;
  onClose: () => void;
  onAdd: (qty: number) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [qty, setQty] = useState(1);
  const habis = barang.stok <= 0;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${barang.nama}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
          {barang.foto && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={barang.foto}
              alt={barang.nama}
              onError={() => setImgError(true)}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-surface-muted to-border/50">
              <Package size={34} weight="duotone" className="text-text-3" aria-hidden />
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                {barang.kode}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border border-border bg-surface/90 text-text-2 backdrop-blur transition-colors hover:bg-surface hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-text-3">
              {barang.kode}
            </p>
            <h2 className="mt-0.5 text-[15px] font-bold leading-snug text-foreground">
              {barang.nama}
            </h2>
          </div>

          <p className="text-[12.5px] leading-relaxed text-text-2">
            {barang.deskripsi || "Tidak ada deskripsi tambahan."}
          </p>

          <div className="flex items-center justify-between rounded-sm border border-border bg-surface-subtle px-3 py-2 text-[12px]">
            <span className="text-text-3">Ketersediaan stok</span>
            <span
              className={cn(
                "font-mono font-semibold tabular-nums",
                habis ? "text-danger" : "text-foreground"
              )}
            >
              {barang.stok.toLocaleString("id-ID")} {barang.satuan}
            </span>
          </div>

          {habis ? (
            <div className="flex h-11 items-center justify-center rounded-sm bg-surface-muted text-[13px] font-semibold text-text-3">
              Stok habis
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center overflow-hidden rounded-sm border border-border bg-surface-subtle">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Kurangi jumlah"
                  className="flex size-11 items-center justify-center text-text-2 transition-colors hover:bg-surface-muted disabled:opacity-40"
                >
                  <Minus size={14} weight="bold" />
                </button>
                <span className="w-9 text-center font-mono text-[13px] font-semibold tabular-nums text-foreground">
                  {qty.toLocaleString("id-ID")}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(barang.stok, q + 1))}
                  disabled={qty >= barang.stok}
                  aria-label="Tambah jumlah"
                  className="flex size-11 items-center justify-center text-text-2 transition-colors hover:bg-surface-muted disabled:opacity-40"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onAdd(qty)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ShoppingCart size={15} weight="bold" aria-hidden />
                Tambahkan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
