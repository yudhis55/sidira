"use client";

/**
 * Modal Entri / Edit SBBK — port GAS `#sbbkModal` (index.html 8407–8508,
 * 24474–24697). Palet violet, tabel barang padat 9 kolom, dan "Total Nilai"
 * selalu terlihat di footer.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/gas/dialog";
import { createSbbk, updateSbbk } from "@/lib/auth/sbbk";
import type { SBBK, SBBKItem } from "@/types/database";

const SATUAN_OPTIONS = [
  "Unit",
  "Buah",
  "Set",
  "Pcs",
  "Lembar",
  "Botol",
  "Kotak",
  "Pak",
  "Lusin",
  "Lainnya",
];

/** GAS memakai tahun anggaran berjalan; tahun lama tetap ada untuk sunting. */
const ANGGARAN_OPTIONS = [
  "BLUD TH 2026",
  "APBD 2026",
  "DAK 2026",
  "BLUD TH 2025",
  "APBD 2025",
  "Lainnya",
];

const JENIS_OPTIONS = [
  { value: "Puskesmas", label: "Ruangan Puskesmas" },
  { value: "Posyandu", label: "Posyandu" },
];

/** Baris kerja modal — harga & qty disimpan sebagai teks agar input tetap bebas. */
interface DraftItem {
  nama: string;
  merk: string;
  qty: string;
  satuan: string;
  harga: string;
  ket: string;
}

function toDraft(item: SBBKItem): DraftItem {
  return {
    nama: item.nama || "",
    merk: item.merk || "",
    qty: String(item.qty ?? 1),
    satuan: item.satuan || "Unit",
    harga: item.harga ? String(item.harga) : "",
    ket: item.ket || "",
  };
}

function emptyDraft(): DraftItem {
  return { nama: "", merk: "", qty: "1", satuan: "Unit", harga: "", ket: "" };
}

function rp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function rowTotal(d: DraftItem): number {
  return (parseFloat(d.qty) || 0) * (parseFloat(d.harga) || 0);
}

const FIELD_INPUT =
  "rounded-lg border-[1.5px] border-line bg-white px-3 py-[9px] text-[13px] text-ink outline-none transition-colors focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]";
const CELL_INPUT =
  "w-full rounded-md border-[1.5px] border-line bg-white px-2 py-[5px] text-xs text-ink outline-none transition-colors focus:border-[#7c3aed]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[5px]">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.4px] text-ink2">
        {label}
        {required && <span className="ml-0.5 text-red">*</span>}
      </span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 border-b-2 border-[#ddd6fe] pb-0.5 pt-1.5 text-[10px] font-extrabold uppercase tracking-[0.8px] text-[#6d28d9]">
      {children}
    </div>
  );
}

const TH_CLASS =
  "whitespace-nowrap border-b-2 border-[#ddd6fe] bg-[#f5f3ff] px-2.5 py-[7px] text-left text-[10px] font-bold uppercase text-[#6d28d9]";

export interface SbbkModalProps {
  open: boolean;
  onClose: () => void;
  /** Rekaman yang disunting; kosong berarti entri baru. */
  sbbk?: SBBK | null;
  onSaved?: (record: SBBK) => void;
}

export function SbbkModal({ open, onClose, sbbk, onSaved }: SbbkModalProps) {
  const isEdit = !!sbbk;
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [saving, setSaving] = React.useState(false);

  const [no, setNo] = React.useState(sbbk?.no ?? "");
  const [tgl, setTgl] = React.useState(sbbk?.tgl ?? today);
  const [anggaran, setAnggaran] = React.useState(
    sbbk?.anggaran ?? ANGGARAN_OPTIONS[0]
  );
  const [kepada, setKepada] = React.useState(sbbk?.kepada ?? "");
  const [jenis, setJenis] = React.useState(sbbk?.jenis ?? "Puskesmas");
  const [ketUmum, setKetUmum] = React.useState(sbbk?.ket_umum ?? "");
  const [items, setItems] = React.useState<DraftItem[]>(
    sbbk?.items?.length ? sbbk.items.map(toDraft) : [emptyDraft()]
  );

  // Nilai anggaran lama (mis. "DAK 2024") tetap bisa dipilih saat menyunting.
  const anggaranOptions = ANGGARAN_OPTIONS.includes(anggaran)
    ? ANGGARAN_OPTIONS
    : [anggaran, ...ANGGARAN_OPTIONS];

  const total = items.reduce((s, d) => s + rowTotal(d), 0);

  function patchItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d))
    );
  }

  function addRow() {
    setItems((prev) => [...prev, emptyDraft()]);
  }

  function delRow(index: number) {
    setItems((prev) =>
      prev.length === 1 ? [emptyDraft()] : prev.filter((_, i) => i !== index)
    );
  }

  /** GAS `sbbkSave` — validasi No., Kepada, lalu minimal satu barang bernama.
   *  Simpan via server actions Supabase; gagal → toast error, modal tetap terbuka. */
  async function save() {
    if (saving) return;
    const noVal = no.trim();
    if (!noVal) {
      toast.warning("No. SBBK harus diisi");
      return;
    }
    const kepadaVal = kepada.trim();
    if (!kepadaVal) {
      toast.warning("Ditujukan Kepada harus diisi");
      return;
    }

    const cleanItems: SBBKItem[] = items
      .filter((d) => d.nama.trim() !== "")
      .map((d) => {
        const qty = parseFloat(d.qty) || 0;
        const harga = parseFloat(d.harga) || 0;
        return {
          nama: d.nama.trim(),
          merk: d.merk.trim(),
          qty,
          satuan: d.satuan || "Unit",
          harga,
          total: qty * harga,
          // GAS mengisi keterangan kosong dengan sumber anggaran.
          ket: d.ket.trim() || anggaran,
        };
      });

    if (cleanItems.length === 0) {
      toast.warning("Minimal harus ada 1 barang");
      return;
    }

    const now = new Date().toISOString();
    setSaving(true);
    try {
      const payload = {
        no: noVal,
        tgl,
        kepada: kepadaVal,
        jenis,
        anggaran,
        ket_umum: ketUmum,
        items: cleanItems,
      };

      if (isEdit && sbbk) {
        await updateSbbk(sbbk.id, payload);
        toast.success(`SBBK ${noVal} berhasil disimpan`);
        onSaved?.({
          id: sbbk.id,
          ...payload,
          created_at: sbbk.created_at,
          updated_at: now,
        });
      } else {
        const created = await createSbbk(payload);
        toast.success(`SBBK ${noVal} berhasil disimpan`);
        onSaved?.({
          id:
            typeof created?.id === "string"
              ? created.id
              : `sbbk-${Date.now()}`,
          ...payload,
          created_at:
            typeof created?.created_at === "string"
              ? created.created_at
              : now,
          updated_at:
            typeof created?.updated_at === "string"
              ? created.updated_at
              : now,
        });
      }
      router.refresh();
      onClose();
    } catch (err) {
      const detail =
        err instanceof Error && err.message ? err.message : "";
      toast.error(
        detail
          ? `Gagal menyimpan SBBK: ${detail}`
          : "Gagal menyimpan SBBK. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      overlayClassName="items-start overflow-y-auto px-4 py-7"
      panelClassName="max-w-[760px] rounded-2xl shadow-[0_28px_72px_rgba(0,0,0,0.22)]"
    >
      {/* GAS .sbbk-modal-head */}
      <div
        className="flex shrink-0 items-center gap-3 px-[22px] py-4 text-white"
        style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
      >
        <span className="text-[22px] leading-none" aria-hidden>
          📋
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-extrabold">
            {isEdit ? "Edit SBBK" : "Entri SBBK Baru"}
          </div>
          <div className="mt-px text-[11px] opacity-70">
            Surat Bukti Barang Keluar dari Gudang
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="ml-auto flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/30 bg-transparent text-base text-white transition-colors hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      {/* GAS .sbbk-modal-body */}
      <div className="flex-1 overflow-y-auto px-[22px] py-5">
        <SectionLabel>📄 Informasi SBBK</SectionLabel>

        <div className="mb-3.5 grid gap-3.5 sm:grid-cols-3">
          <Field label="No. SBBK" required>
            <input
              value={no}
              onChange={(e) => setNo(e.target.value)}
              placeholder="cth: 001/SBBK/2026"
              className={FIELD_INPUT}
            />
          </Field>
          <Field label="Tanggal" required>
            <input
              type="date"
              value={tgl}
              onChange={(e) => setTgl(e.target.value)}
              className={FIELD_INPUT}
            />
          </Field>
          <Field label="Sumber Anggaran">
            <select
              value={anggaran}
              onChange={(e) => setAnggaran(e.target.value)}
              className={FIELD_INPUT}
            >
              {anggaranOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mb-3.5 grid gap-3.5 sm:grid-cols-2">
          <Field label="Ditujukan Kepada" required>
            <input
              value={kepada}
              onChange={(e) => setKepada(e.target.value)}
              placeholder="cth: PJ Ruang KB"
              className={FIELD_INPUT}
            />
          </Field>
          <Field label="Jenis Penerima">
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className={FIELD_INPUT}
            >
              {JENIS_OPTIONS.map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mb-3.5">
          <Field label="Keterangan Umum">
            <textarea
              value={ketUmum}
              onChange={(e) => setKetUmum(e.target.value)}
              placeholder="Keterangan tambahan..."
              className={`${FIELD_INPUT} min-h-[60px] resize-y`}
            />
          </Field>
        </div>

        <SectionLabel>📦 Daftar Barang</SectionLabel>

        {/* GAS .sbbk-items-tbl — tabel padat 9 kolom */}
        <div className="mb-2.5 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-xs">
            <thead>
              <tr>
                <th className={`${TH_CLASS} w-9 text-center`}>No</th>
                <th className={`${TH_CLASS} min-w-[160px]`}>Nama Barang</th>
                <th className={`${TH_CLASS} min-w-[90px]`}>Merk/Tipe</th>
                <th className={`${TH_CLASS} w-[72px]`}>Banyaknya</th>
                <th className={`${TH_CLASS} w-20`}>Satuan</th>
                <th className={`${TH_CLASS} w-[110px]`}>Harga Satuan (Rp)</th>
                <th className={`${TH_CLASS} w-[110px]`}>Jumlah (Rp)</th>
                <th className={`${TH_CLASS} min-w-[90px]`}>Keterangan</th>
                <th className={`${TH_CLASS} w-[34px]`} />
              </tr>
            </thead>
            <tbody>
              {items.map((d, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="px-1 py-1 text-center text-[10px] text-ink3">
                    {i + 1}
                  </td>
                  <td className="p-1">
                    <input
                      value={d.nama}
                      onChange={(e) => patchItem(i, { nama: e.target.value })}
                      placeholder="Nama barang"
                      className={CELL_INPUT}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      value={d.merk}
                      onChange={(e) => patchItem(i, { merk: e.target.value })}
                      placeholder="Merk"
                      className={CELL_INPUT}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      min={0}
                      value={d.qty}
                      onChange={(e) => patchItem(i, { qty: e.target.value })}
                      className={CELL_INPUT}
                    />
                  </td>
                  <td className="p-1">
                    <select
                      value={d.satuan}
                      onChange={(e) => patchItem(i, { satuan: e.target.value })}
                      className={CELL_INPUT}
                    >
                      {SATUAN_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      min={0}
                      value={d.harga}
                      onChange={(e) => patchItem(i, { harga: e.target.value })}
                      placeholder="0"
                      className={CELL_INPUT}
                    />
                  </td>
                  <td className="px-2 py-1 font-mono text-[11px] font-bold text-[#059669]">
                    {rp(rowTotal(d))}
                  </td>
                  <td className="p-1">
                    <input
                      value={d.ket}
                      onChange={(e) => patchItem(i, { ket: e.target.value })}
                      placeholder="Ket."
                      className={CELL_INPUT}
                    />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => delRow(i)}
                      aria-label={`Hapus barang ${i + 1}`}
                      className="flex size-6 items-center justify-center rounded-full border-[1.5px] border-line bg-transparent text-xs text-ink3 transition-colors hover:border-red hover:bg-red2 hover:text-red"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GAS .sbbk-add-item-btn */}
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-[#c4b5fd] bg-[#faf5ff] px-3.5 py-[7px] text-xs font-bold text-[#7c3aed] transition-colors hover:border-[#7c3aed] hover:bg-[#ede9fe]"
        >
          ＋ Tambah Barang
        </button>
      </div>

      {/* GAS .sbbk-modal-footer — total selalu terlihat */}
      <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t border-line bg-[#fafafa] px-[22px] py-3.5">
        <div className="text-[13px] font-bold text-ink2">
          Total Nilai:{" "}
          <span className="font-mono text-[15px] text-[#059669]">
            {rp(total)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-[10px] border-[1.5px] border-line bg-white px-[18px] py-[9px] text-xs font-bold text-ink2 transition-colors hover:border-ink3"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-[10px] border-none px-6 py-[9px] text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-[filter] hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          💾 Simpan SBBK
        </button>
      </div>
    </Dialog>
  );
}
