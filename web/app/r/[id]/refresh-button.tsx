"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Tombol muat-ulang data halaman publik. Server component di atasnya
 * di-render ulang (force-dynamic) sehingga angka + "terakhir diperbarui"
 * ikut segar. Khusus anon: tidak ada tulis ke DB, hanya baca ulang.
 */
export function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        router.refresh();
        // refresh() async tanpa promise: lepas disable setelah jeda singkat.
        window.setTimeout(() => setBusy(false), 1500);
      }}
      className="rounded-md border border-teal-700 bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-60"
    >
      {busy ? "Memperbarui…" : "🔄 Perbarui"}
    </button>
  );
}
