"use client";

/**
 * Panel editor Lampiran Aset inline — port 1:1 GAS `openLampiranPanel` /
 * `lampiranBuildHTML` / `lampiranTabelKendaraan|Laptop|Alat` /
 * `lampiranSave` (gas-legacy/index.html CSS 6298-6444, JS 25243-25575).
 *
 * Tabel `.lamp-tbl` (th biru, input borderless), kepala navy, tombol
 * tambah dashed + hapus bulat, 3 seksi + 💾 Simpan Lampiran.
 * Simpan memakai overlay store (berlaku record bawaan maupun buatan).
 */
import * as React from "react";
import { toast } from "sonner";
import { updatePaktaRecord } from "@/lib/auth/pakta";
import type {
  Pakta,
  PaktaAsetAlat,
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
} from "@/types/database";

const LAMPIRAN_CSS = `
.lamp-panel { margin-top: 20px; background: #fff; border-radius: var(--r, 10px); border: 1px solid var(--line); box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
.lamp-panel-head { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: linear-gradient(135deg, #1e3a5f, #2563eb); color: #fff; }
.lamp-panel-head h3 { font-size: 14px; font-weight: 800; margin: 0; }
.lamp-btn-entri { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 16px; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.12); color: #fff; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.15s; white-space: nowrap; }
.lamp-btn-entri:hover { background: rgba(255,255,255,0.25); }
.lamp-aset-section { padding: 14px 20px; border-bottom: 1px solid var(--line); }
.lamp-aset-section:last-child { border-bottom: none; }
.lamp-aset-title { font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px; }
.lamp-tbl { width: 100%; border-collapse: collapse; font-size: 12px; }
.lamp-tbl th { padding: 6px 8px; background: #eff6ff; font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.3px; border: 1px solid #bfdbfe; text-align: center; white-space: nowrap; }
.lamp-tbl th.col-nama { text-align: left; }
.lamp-tbl td { border: 1px solid var(--line); padding: 5px 8px; vertical-align: middle; font-size: 12px; color: var(--ink2); }
.lamp-tbl td.td-no { text-align: center; width: 36px; color: var(--ink3); }
.lamp-tbl input { width: 100%; border: none; outline: none; background: transparent; font-family: inherit; font-size: 12px; color: var(--ink); padding: 0; }
.lamp-tbl input:focus { background: #eff6ff; padding: 1px 4px; border-radius: 3px; }
.lamp-tbl tr:hover td { background: #f8faff; }
.lamp-add-row-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; margin-top: 6px; border: 1.5px dashed #bfdbfe; border-radius: 6px; background: #eff6ff; color: #1e40af; font-family: inherit; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.12s; }
.lamp-add-row-btn:hover { background: #dbeafe; border-color: #2563eb; }
.lamp-del-row { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line); background: transparent; color: var(--ink3); font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.12s; line-height: 1; }
.lamp-del-row:hover { border-color: var(--red); color: var(--red); background: var(--red2); }
`;

function Cell({
  value,
  placeholder,
  onChange,
  ariaLabel,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <input
      aria-label={ariaLabel}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function LampiranEditor({
  pakta,
  onClose,
  onSaved,
}: {
  pakta: Pakta;
  /** Tombol ✕ Tutup ala GAS (dipakai panel bawah-tabel di daftar). */
  onClose?: () => void;
  /** Dipanggil setelah lampiran tersimpan ke Supabase (untuk refresh daftar). */
  onSaved?: () => void;
}) {
  const [kendaraan, setKendaraan] = React.useState<PaktaAsetKendaraan[]>(
    pakta.aset_kendaraan?.length ? [...pakta.aset_kendaraan] : [{}]
  );
  const [laptop, setLaptop] = React.useState<PaktaAsetLaptop[]>(
    pakta.aset_laptop?.length ? [...pakta.aset_laptop] : [{}]
  );
  const [alat, setAlat] = React.useState<PaktaAsetAlat[]>(
    pakta.aset_alat?.length ? [...pakta.aset_alat] : [{}]
  );

  function patch<T>(list: T[], set: (v: T[]) => void, i: number, p: Partial<T>) {
    set(list.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }
  function del<T>(list: T[], set: (v: T[]) => void, i: number) {
    set(list.length === 1 ? ([{}] as T[]) : list.filter((_, idx) => idx !== i));
  }

  async function save() {
    const res = await updatePaktaRecord(pakta.id, {
      aset_kendaraan: kendaraan,
      aset_laptop: laptop,
      aset_alat: alat,
    });
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Lampiran aset berhasil disimpan");
    onSaved?.();
  }

  const str = (v: unknown) => String(v ?? "");

  return (
    <div className="lamp-panel">
      <style dangerouslySetInnerHTML={{ __html: LAMPIRAN_CSS }} />
      <div className="lamp-panel-head">
        <span style={{ fontSize: 18 }} aria-hidden>
          📋
        </span>
        <h3>Lampiran Aset — {pakta.nama || ""}</h3>
        <button type="button" className="lamp-btn-entri" onClick={save}>
          💾 Simpan Lampiran
        </button>
        {onClose ? (
          <button
            type="button"
            className="lamp-btn-entri"
            style={{ marginLeft: 6, background: "rgba(255,255,255,.08)" }}
            onClick={onClose}
          >
            ✕ Tutup
          </button>
        ) : null}
      </div>

      <div className="lamp-aset-section">
        <div className="lamp-aset-title">🚗 Kendaraan Dinas</div>
        <table className="lamp-tbl">
          <thead>
            <tr>
              <th className="td-no">No.</th>
              <th className="col-nama">Jenis Kendaraan</th>
              <th>Merk</th>
              <th>Tahun Perolehan</th>
              <th>No. Polisi</th>
              <th>Harga Perolehan</th>
              <th>Keterangan</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {kendaraan.map((r, i) => (
              <tr key={i}>
                <td className="td-no">{i + 1}</td>
                <td>
                  <Cell value={str(r.jenis)} placeholder="motor/mobil" ariaLabel="Jenis kendaraan"
                    onChange={(v) => patch(kendaraan, setKendaraan, i, { jenis: v })} />
                </td>
                <td>
                  <Cell value={str(r.merk)} placeholder="Merk" ariaLabel="Merk kendaraan"
                    onChange={(v) => patch(kendaraan, setKendaraan, i, { merk: v })} />
                </td>
                <td>
                  <Cell value={str(r.tahun)} placeholder="Tahun" ariaLabel="Tahun kendaraan"
                    onChange={(v) => patch(kendaraan, setKendaraan, i, { tahun: v })} />
                </td>
                <td>
                  <Cell value={str(r.nopol)} placeholder="AG 1234 XX" ariaLabel="No. Polisi"
                    onChange={(v) => patch(kendaraan, setKendaraan, i, { nopol: v })} />
                </td>
                <td>
                  <Cell value={str(r.harga)} placeholder="Rp" ariaLabel="Harga kendaraan"
                    onChange={(v) => patch(kendaraan, setKendaraan, i, { harga: v })} />
                </td>
                <td>
                  <Cell value={str(r.ket)} placeholder="—" ariaLabel="Keterangan kendaraan"
                    onChange={(v) => patch(kendaraan, setKendaraan, i, { ket: v })} />
                </td>
                <td>
                  <button type="button" className="lamp-del-row" aria-label="Hapus baris"
                    onClick={() => del(kendaraan, setKendaraan, i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="lamp-add-row-btn"
          onClick={() => setKendaraan([...kendaraan, {}])}>
          ＋ Tambah Baris
        </button>
      </div>

      <div className="lamp-aset-section">
        <div className="lamp-aset-title">💻 Laptop / Personal Komputer</div>
        <table className="lamp-tbl">
          <thead>
            <tr>
              <th className="td-no">No.</th>
              <th>Merk</th>
              <th className="col-nama">Type</th>
              <th>Tahun Perolehan</th>
              <th>No. Seri</th>
              <th>Harga Perolehan</th>
              <th>Keterangan</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {laptop.map((r, i) => (
              <tr key={i}>
                <td className="td-no">{i + 1}</td>
                <td>
                  <Cell value={str(r.merk)} placeholder="Merk" ariaLabel="Merk laptop"
                    onChange={(v) => patch(laptop, setLaptop, i, { merk: v })} />
                </td>
                <td>
                  <Cell value={str(r.type)} placeholder="Type/Model" ariaLabel="Type laptop"
                    onChange={(v) => patch(laptop, setLaptop, i, { type: v })} />
                </td>
                <td>
                  <Cell value={str(r.tahun)} placeholder="Tahun" ariaLabel="Tahun laptop"
                    onChange={(v) => patch(laptop, setLaptop, i, { tahun: v })} />
                </td>
                <td>
                  <Cell value={str(r.seri)} placeholder="No. Seri" ariaLabel="No. Seri laptop"
                    onChange={(v) => patch(laptop, setLaptop, i, { seri: v })} />
                </td>
                <td>
                  <Cell value={str(r.harga)} placeholder="Rp" ariaLabel="Harga laptop"
                    onChange={(v) => patch(laptop, setLaptop, i, { harga: v })} />
                </td>
                <td>
                  <Cell value={str(r.ket)} placeholder="—" ariaLabel="Keterangan laptop"
                    onChange={(v) => patch(laptop, setLaptop, i, { ket: v })} />
                </td>
                <td>
                  <button type="button" className="lamp-del-row" aria-label="Hapus baris"
                    onClick={() => del(laptop, setLaptop, i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="lamp-add-row-btn"
          onClick={() => setLaptop([...laptop, {}])}>
          ＋ Tambah Baris
        </button>
      </div>

      <div className="lamp-aset-section">
        <div className="lamp-aset-title">
          📱 Alat Penunjang (Tablet, Handphone, Handy Talky, External Hardisk)
        </div>
        <table className="lamp-tbl">
          <thead>
            <tr>
              <th className="td-no">No.</th>
              <th>Merk</th>
              <th className="col-nama">Type</th>
              <th>Tahun Perolehan</th>
              <th>No. Seri</th>
              <th>Harga Perolehan</th>
              <th>Keterangan</th>
              <th style={{ width: 28 }} />
            </tr>
          </thead>
          <tbody>
            {alat.map((r, i) => (
              <tr key={i}>
                <td className="td-no">{i + 1}</td>
                <td>
                  <Cell value={str(r.merk)} placeholder="Merk" ariaLabel="Merk alat"
                    onChange={(v) => patch(alat, setAlat, i, { merk: v })} />
                </td>
                <td>
                  <Cell value={str(r.type)} placeholder="Type/Jenis" ariaLabel="Type alat"
                    onChange={(v) => patch(alat, setAlat, i, { type: v })} />
                </td>
                <td>
                  <Cell value={str(r.tahun)} placeholder="Tahun" ariaLabel="Tahun alat"
                    onChange={(v) => patch(alat, setAlat, i, { tahun: v })} />
                </td>
                <td>
                  <Cell value={str(r.seri)} placeholder="No. Seri" ariaLabel="No. Seri alat"
                    onChange={(v) => patch(alat, setAlat, i, { seri: v })} />
                </td>
                <td>
                  <Cell value={str(r.harga)} placeholder="Rp" ariaLabel="Harga alat"
                    onChange={(v) => patch(alat, setAlat, i, { harga: v })} />
                </td>
                <td>
                  <Cell value={str(r.ket)} placeholder="—" ariaLabel="Keterangan alat"
                    onChange={(v) => patch(alat, setAlat, i, { ket: v })} />
                </td>
                <td>
                  <button type="button" className="lamp-del-row" aria-label="Hapus baris"
                    onClick={() => del(alat, setAlat, i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="lamp-add-row-btn"
          onClick={() => setAlat([...alat, {}])}>
          ＋ Tambah Baris
        </button>
      </div>
    </div>
  );
}
