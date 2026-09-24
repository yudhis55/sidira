"use client";

import { useState } from "react";
import type { PemegangInventaris, PemegangStatus } from "@/types/database";
import { Button } from "@/components/gas/button";
import { Input } from "@/components/gas/input";
import { Select } from "@/components/gas/select";
import { Modal } from "@/components/gas/modal";

interface PemegangFormDialogProps {
  pemegang?: PemegangInventaris;
  trigger?: React.ReactNode;
  /** Mock-only: called on success with form values (no backend). */
  onSaved?: (values: {
    nama: string;
    nip: string;
    jabatan: string;
    status: PemegangStatus;
  }) => void;
}

export function PemegangFormDialog({
  pemegang,
  trigger,
  onSaved,
}: PemegangFormDialogProps) {
  const isEdit = !!pemegang;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [nama, setNama] = useState(pemegang?.nama || "");
  const [nip, setNip] = useState(pemegang?.nip || "");
  const [jabatan, setJabatan] = useState(pemegang?.jabatan || "");
  const [status, setStatus] = useState<PemegangStatus>(
    pemegang?.status || "PNS",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      if (!nama.trim()) {
        throw new Error("Nama pemegang wajib diisi");
      }
      // Mock-only — no auth/backend call
      onSaved?.({ nama, nip, jabatan, status });
      setOpen(false);
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = isEdit ? (
    <Button variant="ghost" type="button">
      <span aria-hidden className="mr-1">
        {"\u270F\uFE0F"}
      </span>
      Edit
    </Button>
  ) : (
    <Button type="button">
      <span aria-hidden className="mr-1">
        {"\u2795"}
      </span>
      Tambah Pemegang
    </Button>
  );

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="inline-flex"
      >
        {trigger || defaultTrigger}
      </span>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? "Edit Pemegang" : "Tambah Pemegang"}
        subtitle={
          isEdit
            ? "Ubah identitas pemegang inventaris."
            : "Tambah pemegang inventaris baru."
        }
        icon={isEdit ? "\u270F\uFE0F" : "\uD83D\uDC64"}
        iconVariant="teal"
        headVariant="gas"
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="modal-cancel"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="pemegang-form"
              variant="modal-ok"
              disabled={loading}
            >
              {loading ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
            </Button>
          </div>
        }
      >
        <form id="pemegang-form" onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama lengkap"
            required
          />
          <Input
            label="NIP"
            value={nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="NIP (opsional)"
          />
          <Input
            label="Jabatan"
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            placeholder="Jabatan"
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PemegangStatus)}
            options={[
              { value: "PNS", label: "PNS" },
              { value: "PPPK", label: "PPPK" },
            ]}
          />
          {err && (
            <p className="text-xs text-red" role="alert">
              {err}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
