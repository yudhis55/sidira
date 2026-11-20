"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Minus,
  Plus,
  ShoppingCart,
  Trash,
  Warning,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { submitPengajuan } from "@/lib/auth/marketplace";
import type { KeranjangLine } from "@/lib/marketplace-types";
import type { Room } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: KeranjangLine[];
  rooms: Room[];
  stokById: Map<number, number>;
  count: number;
  onSetJumlah: (barangId: number, jumlah: number, max: number) => void;
  onRemove: (barangId: number) => void;
  onClear: () => void;
}

export function CartDrawer({
  open,
  onClose,
  lines,
  rooms,
  stokById,
  count,
  onSetJumlah,
  onRemove,
  onClear,
}: CartDrawerProps) {
  const [nama, setNama] = useState("");
  const [roomId, setRoomId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [nomor, setNomor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const closeDrawer = useCallback(() => {
    setNomor(null);
    setError("");
    setCopied(false);
    onClose();
  }, [onClose]);

  // Kunci scroll halaman + tutup dengan Escape selama drawer terbuka.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeDrawer]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const namaBersih = nama.trim();
    if (!namaBersih) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!roomId) {
      setError("Ruangan wajib dipilih.");
      return;
    }
    if (lines.length === 0) {
      setError("Keranjang masih kosong.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const result = await submitPengajuan({
        room_id: roomId,
        nama_pemohon: namaBersih,
        catatan: catatan.trim() || undefined,
        items: lines.map((line) => ({
          barang_id: line.barang_id,
          jumlah: line.jumlah,
        })),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setNomor(result.nomor ?? "—");
      setNama("");
      setRoomId("");
      setCatatan("");
      onClear();
    } catch {
      setError("Gagal mengirim pengajuan. Periksa koneksi lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function handleCopy() {
    if (!nomor || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(nomor);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup keranjang"
        onClick={closeDrawer}
        className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-[1px] animate-in fade-in duration-150 motion-reduce:animate-none"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="keranjang-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-xl animate-in slide-in-from-right-8 duration-200 ease-out motion-reduce:animate-none"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="keranjang-title"
              className="font-mono text-[15px] font-semibold tracking-tight text-foreground"
            >
              Keranjang
            </h2>
            <p className="mt-0.5 text-[12px] text-text-3">
              {count > 0
                ? `${count.toLocaleString("id-ID")} item · ${lines.length} jenis barang`
                : "Belum ada barang"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Tutup"
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {nomor ? (
            <SuccessPanel
              nomor={nomor}
              copied={copied}
              onCopy={handleCopy}
              onClose={closeDrawer}
            />
          ) : lines.length === 0 ? (
            <EmptyCart onClose={closeDrawer} />
          ) : (
            <div className="space-y-5">
              <ul className="space-y-2.5">
                {lines.map((line) => {
                  const stok = stokById.get(line.barang_id) ?? line.jumlah;
                  const max = Math.max(1, Math.trunc(stok));
                  return (
                    <li
                      key={line.barang_id}
                      className="rounded-md border border-border bg-surface-subtle p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold leading-snug text-foreground">
                            {line.nama}
                          </p>
                          <p className="mt-0.5 text-[11px] text-text-3">
                            Stok tersedia {stok.toLocaleString("id-ID")}{" "}
                            {line.satuan}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(line.barang_id)}
                          aria-label={`Hapus ${line.nama}`}
                          className="flex size-7 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash className="size-4" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-sm border border-border bg-surface">
                          <button
                            type="button"
                            onClick={() =>
                              onSetJumlah(
                                line.barang_id,
                                line.jumlah - 1,
                                max
                              )
                            }
                            disabled={line.jumlah <= 1}
                            aria-label="Kurangi jumlah"
                            className="flex size-7 items-center justify-center text-text-2 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={max}
                            value={line.jumlah}
                            onChange={(event) =>
                              onSetJumlah(
                                line.barang_id,
                                Number(event.target.value),
                                max
                              )
                            }
                            aria-label={`Jumlah ${line.nama}`}
                            className="h-7 w-11 border-x border-border bg-surface text-center font-mono text-[12px] text-foreground outline-none focus-visible:bg-primary-soft"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onSetJumlah(
                                line.barang_id,
                                line.jumlah + 1,
                                max
                              )
                            }
                            disabled={line.jumlah >= max}
                            aria-label="Tambah jumlah"
                            className="flex size-7 items-center justify-center text-text-2 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-[12px] font-semibold text-foreground">
                          {line.jumlah.toLocaleString("id-ID")} {line.satuan}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11.5px] text-text-3">
                  {count.toLocaleString("id-ID")} item siap diajukan
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[11.5px] font-semibold text-text-3 transition-colors hover:text-danger"
                >
                  Kosongkan
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-3.5 border-t border-border pt-4"
              >
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-text-3">
                  Data pemohon
                </h3>

                <div className="space-y-1.5">
                  <label
                    htmlFor="nama-pemohon"
                    className="block text-[12px] font-semibold text-foreground"
                  >
                    Nama Lengkap{" "}
                    <span aria-hidden className="text-danger">
                      *
                    </span>
                  </label>
                  <Input
                    id="nama-pemohon"
                    value={nama}
                    onChange={(event) => setNama(event.target.value)}
                    placeholder="Masukkan nama lengkap..."
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="ruangan-pemohon"
                    className="block text-[12px] font-semibold text-foreground"
                  >
                    Ruangan{" "}
                    <span aria-hidden className="text-danger">
                      *
                    </span>
                  </label>
                  <select
                    id="ruangan-pemohon"
                    value={roomId}
                    onChange={(event) => setRoomId(event.target.value)}
                    required
                    className="h-9 w-full rounded-sm border border-border bg-surface px-2.5 text-[13px] text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                  >
                    <option value="" disabled>
                      Pilih ruangan…
                    </option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.icon ? `${room.icon} ` : ""}
                        {room.name}
                      </option>
                    ))}
                  </select>
                  {rooms.length === 0 ? (
                    <p className="text-[11px] text-warning">
                      Daftar ruangan belum tersedia. Coba muat ulang halaman.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="catatan-pemohon"
                    className="block text-[12px] font-semibold text-foreground"
                  >
                    Catatan{" "}
                    <span className="font-normal text-text-3">(opsional)</span>
                  </label>
                  <Textarea
                    id="catatan-pemohon"
                    value={catatan}
                    onChange={(event) => setCatatan(event.target.value)}
                    rows={2}
                    placeholder="Kebutuhan atau keterangan tambahan…"
                    className="min-h-16"
                  />
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="flex items-start gap-1.5 rounded-sm bg-danger-soft px-2.5 py-2 text-[12px] text-danger"
                  >
                    <WarningCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{error}</span>
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={pending || lines.length === 0}
                  className="w-full"
                >
                  {pending ? (
                    <>
                      <CircleNotch className="size-4 animate-spin" />
                      Mengirim…
                    </>
                  ) : (
                    <>
                      Kirim pengajuan
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center px-2 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-text-3">
        <ShoppingCart className="size-6" />
      </span>
      <p className="mt-3 text-[14px] font-semibold text-foreground">
        Keranjang masih kosong
      </p>
      <p className="mt-1 max-w-[30ch] text-[12.5px] leading-relaxed text-text-3">
        Tambahkan barang dari katalog untuk mulai mengajukan permintaan.
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={onClose}
      >
        Kembali ke katalog
      </Button>
    </div>
  );
}

function SuccessPanel({
  nomor,
  copied,
  onCopy,
  onClose,
}: {
  nomor: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <CheckCircle className="size-8" weight="fill" />
      </span>
      <h3 className="mt-4 text-[17px] font-semibold text-foreground">
        Pengajuan terkirim
      </h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-text-3">
        Permintaan Anda sudah diterima dan menunggu keputusan admin.
      </p>

      <div className="mt-5 w-full rounded-md border border-border bg-surface-subtle p-4 text-left">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-3">
          Nomor pengajuan
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="min-w-0 break-all font-mono text-[17px] font-semibold tracking-tight text-foreground">
            {nomor}
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onCopy}
            className="shrink-0"
          >
            {copied ? "Tersalin" : "Salin"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex w-full items-start gap-2 rounded-md bg-warning-soft px-3 py-2.5 text-left text-warning">
        <Warning className="mt-0.5 size-4 shrink-0" weight="fill" />
        <p className="text-[11.5px] leading-relaxed">
          Simpan nomor ini. Nomor pengajuan diperlukan untuk melacak status dan
          membatalkan permintaan.
        </p>
      </div>

      <div className="mt-5 flex w-full flex-col gap-2">
        <Button asChild className="w-full">
          <Link href={`/lacak?nomor=${encodeURIComponent(nomor)}`}>
            Lacak pengajuan
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="w-full"
        >
          Tutup
        </Button>
      </div>
    </div>
  );
}
