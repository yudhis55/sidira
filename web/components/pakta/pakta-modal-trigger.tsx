"use client";

/**
 * Tombol pemicu modal Pakta (GAS `openPaktaModal`) untuk halaman list
 * yang merupakan Server Component — state modal hidup di sini.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { PaktaModal } from "./pakta-modal";
import type { Pakta } from "@/types/database";

const NAVY_BTN = {
  borderRadius: 10,
  background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
  border: "none",
  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
} as const;

export function PaktaEntriButton({ onSaved }: { onSaved?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] font-bold px-5 py-2.5 text-white"
        style={NAVY_BTN}
      >
        {"\uFF0B"} Entri Pakta Integritas Baru
      </button>
      {open && (
        <PaktaModal
          key="pakta-new"
          open
          onClose={() => setOpen(false)}
          onSaved={() => {
            onSaved?.();
            router.refresh();
          }}
        />
      )}
    </>
  );
}

export function PaktaEditButton({
  pakta,
  onSaved,
}: {
  pakta: Pakta;
  onSaved?: () => void;
}) {  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center font-semibold transition-colors hover:!border-[#2563eb] hover:!text-[#2563eb]"
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          border: "1.5px solid var(--line)",
          background: "var(--white)",
          color: "var(--ink2)",
          fontSize: 11,
        }}
      >
        {"\u270F\uFE0F"} Edit
      </button>
      {open && (
        <PaktaModal
          key={`pakta-${pakta.id}`}
          open
          pakta={pakta}
          onClose={() => setOpen(false)}
          onSaved={() => {
            onSaved?.();
            router.refresh();
          }}
        />
      )}
    </>
  );
}

/**
 * Catatan: GAS tidak memiliki route entri/edit terpisah — modal hidup di
 * panel Pakta. Karena itu `PaktaPageModal` (dulu dipakai `/pakta/new` &
 * `/pakta/[id]/edit`) sudah dihapus bersama route-nya.
 */
