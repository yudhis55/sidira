"use client";

import * as React from "react";
import { toast } from "sonner";
import { deleteUtilMeta } from "@/lib/auth/utilitas";

/**
 * Tombol hapus utilitas + seluruh jadwal/state-nya.
 * `deleteUtilMeta` me-redirect (throw NEXT_REDIRECT) saat sukses —
 * itu bukan error, jadi hanya error non-redirect yang di-toast.
 */
export function UtilDeleteButton({
  utilId,
  label,
}: {
  utilId: string;
  label: string;
}) {
  const [busy, setBusy] = React.useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        `Hapus utilitas "${label}" beserta seluruh jadwal dan riwayat ceklistnya?\nTindakan ini tidak bisa dibatalkan.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await deleteUtilMeta(utilId);
      if (res?.error) {
        toast.error(`Gagal menghapus: ${res.error}`);
        setBusy(false);
      }
      // Sukses → redirect ke /utilitas (dilempar sebagai error di bawah).
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.includes("NEXT_REDIRECT") || "digest" in e)
      ) {
        return;
      }
      toast.error("Gagal menghapus utilitas");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      title={`Hapus ${label}`}
      aria-label={`Hapus ${label}`}
      className="px-[14px] py-[6px] rounded-lg text-xs font-bold border-[1.5px] border-red/30 bg-red2 text-red hover:bg-red hover:text-white transition-colors disabled:opacity-60"
    >
      {busy ? "Menghapus…" : "🗑️ Hapus"}
    </button>
  );
}
