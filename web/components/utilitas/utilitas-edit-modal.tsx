"use client";

/**
 * Modal Edit Utilitas — UtilitasForm mode telanjang di dalam Modal GAS,
 * dibuka dari halaman detail (tanpa pindah rute). Sukses → server action
 * redirect ke detail yang sama (data segar, modal tertutup).
 */
import * as React from "react";
import { Modal } from "@/components/gas/modal";
import { Button } from "@/components/gas/button";
import { UtilitasForm } from "./utilitas-form";
import type { UtilMeta } from "@/lib/auth/utilitas";

interface UtilitasEditModalProps {
  utilitas: UtilMeta;
}

export function UtilitasEditModal({ utilitas }: UtilitasEditModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-[20px] border-[1.5px] border-line bg-white px-3.5 py-1 text-xs font-bold text-ink2 transition-colors hover:border-ink3 hover:text-ink"
      >
        ✏️ Edit Nama
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        headVariant="gas"
        size="md"
        icon={utilitas.icon || "🔧"}
        title="Edit Utilitas"
        subtitle={`Ubah informasi ${utilitas.label}`}
        footer={
          <Button
            type="button"
            variant="modal-cancel"
            onClick={() => setOpen(false)}
          >
            Tutup
          </Button>
        }
      >
        <UtilitasForm
          utilitas={utilitas}
          bare
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
