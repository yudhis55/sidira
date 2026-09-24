"use client";

/**
 * Modal Entri / Edit Pakta Integritas — port GAS `#paktaModal`
 * (gas-legacy/index.html CSS 5885+, `openPaktaModal`/`paktaSave` 25580+).
 *
 * Kepala navy (#1e3a5f → #2563eb), lebar 640px, dan — sama seperti GAS —
 * HANYA berisi identitas pemegang. Aset tidak diedit dari sini; GAS
 * mempertahankan aset lama saat menyunting (`paktaSave` 25656) dan
 * mengarahkan pengguna ke panel 📋 Lampiran untuk mengisi aset.
 */
import * as React from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/gas/dialog";
import { Input } from "@/components/gas/input";
import { Select } from "@/components/gas/select";
import { Button } from "@/components/gas/button";
import { createPaktaRecord, updatePaktaRecord } from "@/lib/auth/pakta";
import type { Pakta } from "@/types/database";

const HARI_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b-2 border-[#bfdbfe] pb-1 pt-3 text-[10px] font-extrabold uppercase tracking-[0.8px] text-[#1d4ed8]">
      {children}
    </div>
  );
}

export interface PaktaModalProps {
  open: boolean;
  onClose: () => void;
  /** Data yang disunting; kosong berarti entri baru. */
  pakta?: Pakta | null;
  onSaved?: () => void;
}

export function PaktaModal({ open, onClose, pakta, onSaved }: PaktaModalProps) {
  // Draft pre-filled dari rekap (`?dari=`) punya id kosong → tetap mode entri baru.
  const isEdit = !!pakta?.id;
  const today = new Date();
  const todayHari = HARI_OPTIONS[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const todayIso = today.toISOString().split("T")[0];

  const [hari, setHari] = React.useState(pakta?.hari || todayHari);
  const [tgl, setTgl] = React.useState(pakta?.tgl || todayIso);
  const [nama, setNama] = React.useState(pakta?.nama || "");
  const [nip, setNip] = React.useState(pakta?.nip || "");
  const [jabatan, setJabatan] = React.useState(pakta?.jabatan || "");
  const [alamat, setAlamat] = React.useState(pakta?.alamat || "");

  /** GAS `paktaSave` — nama, jabatan, tanggal wajib. */
  async function save() {
    if (!nama.trim()) {
      toast.warning("Nama lengkap harus diisi");
      return;
    }
    if (!jabatan.trim()) {
      toast.warning("Jabatan/Tugas harus diisi");
      return;
    }
    if (!tgl) {
      toast.warning("Tanggal harus diisi");
      return;
    }

    if (isEdit) {
      // GAS 25656-25668: identitas diganti, aset lama DIPERTAHANKAN.
      const res = await updatePaktaRecord(pakta!.id, {
        hari,
        tgl,
        nama: nama.trim(),
        nip: nip.trim(),
        jabatan: jabatan.trim(),
        alamat: alamat.trim(),
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
    } else {
      // GAS 25666-25669: entri baru mulai dengan satu baris aset kosong.
      const res = await createPaktaRecord({
        hari,
        tgl,
        nama: nama.trim(),
        nip: nip.trim(),
        jabatan: jabatan.trim(),
        alamat: alamat.trim(),
        aset_kendaraan: [{}],
        aset_laptop: [{}],
        aset_alat: [{}],
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
    }

    // GAS `paktaSave` toast (25674-25679) — mengarahkan ke panel Lampiran.
    toast.success(
      `Pakta Integritas ${nama.trim()} berhasil disimpan — klik Lampiran untuk input aset`
    );
    onSaved?.();
    onClose();
  }

  const rowGrid = "grid grid-cols-2 gap-2 md:grid-cols-3";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      panelClassName="max-w-[640px] overflow-hidden rounded-2xl"
    >
      {/* ── Kepala navy — GAS `.pakta-modal-head` ── */}
      <div
        className="flex shrink-0 items-center gap-3 px-6 py-4"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-white/20 bg-white/15 text-xl">
          📜
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-white">
            {isEdit ? "Edit Pakta Integritas" : "Entri Pakta Integritas Baru"}
          </h3>
          <p className="mt-0.5 text-[11px] text-white/70">
            Barang Milik Daerah · Puskesmas Baruharjo
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="ml-auto flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/30 bg-transparent text-base text-white transition-colors hover:bg-white/20"
        >
          ×
        </button>
      </div>

      {/* ── Isi: identitas saja (GAS `#paktaModal`) ── */}
      <div className="max-h-[70vh] space-y-1 overflow-y-auto px-6 py-4">
        <SectionTitle>Identitas Pemegang</SectionTitle>
        <div className={rowGrid}>
          <Select label="Hari" value={hari} onChange={(e) => setHari(e.target.value)}
            options={HARI_OPTIONS.map((h) => ({ value: h, label: h }))} />
          <Input label="Tanggal" type="date" value={tgl} onChange={(e) => setTgl(e.target.value)} />
          <Input label="Nama Lengkap *" value={nama} onChange={(e) => setNama(e.target.value)}
            placeholder="Nama pemegang" autoFocus={!isEdit} />
          <Input label="NIP" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="Opsional" />
          <Input label="Jabatan *" value={jabatan} onChange={(e) => setJabatan(e.target.value)}
            placeholder="Jabatan/tugas" />
          <Input label="Alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Opsional" />
        </div>

        {/* GAS memisahkan aset ke panel 📋 Lampiran — bukan di modal. */}
        <p className="pt-2 text-[11px] leading-relaxed text-ink3">
          Data aset (kendaraan, laptop/PC, alat penunjang) diisi lewat tombol{" "}
          <span className="font-semibold text-[#1e40af]">📋 Lampiran</span> pada
          baris daftar setelah pakta disimpan.
        </p>
      </div>

      {/* ── Footer ── */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-white px-6 py-3">
        <Button variant="modal-cancel" type="button" onClick={onClose}>
          Tutup
        </Button>
        <button
          type="button"
          onClick={save}
          className="rounded-lg border-none bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] px-[22px] py-[9px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] transition-all duration-[180ms] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(37,99,235,0.45)]"
        >
          💾 Simpan
        </button>
      </div>
    </Dialog>
  );
}