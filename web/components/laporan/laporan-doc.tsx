"use client";

/**
 * Dokumen laporan siap cetak — port GAS `buildLaporanDoc()` (index.html ~23242)
 * beserta CSS `#laporanDoc` (~3097): kop surat, judul, tabel 7 kolom,
 * baris manual yang bisa diketik, blok tanda tangan, dan form isian TTD
 * yang tidak ikut tercetak.
 */
import * as React from "react";
import { useLocalStorageState } from "@/lib/use-local-storage";
import { LAPORAN_STATE_KEY } from "@/lib/storage-keys";
import {
  collectCeklistForMonth,
  collectGabungan,
  collectInventarisKondisi,
  emptyLaporanRow,
  type LaporanRow,
  type LaporanSumber,
} from "@/lib/laporan-collect";
import type { LaporanRoom } from "@/lib/auth/laporan";

const BULAN_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export interface ManualRow {
  sarpras: string;
  masalah: string;
  penyebab: string;
  tindak: string;
  evaluasi: string;
  ket: string;
}

type ManualField = keyof ManualRow;

interface LpState {
  kapus: string;
  jabKapus: string;
  nipKapus: string;
  pengurus: string;
  jabPengurus: string;
  nipPengurus: string;
  kota: string;
  /** key: "bulanIdx-tahun" → daftar baris manual */
  manualRows: Record<string, ManualRow[]>;
}

/** Nilai awal identik dengan GAS `lpState`. */
const DEFAULT_LP: LpState = {
  kapus: "",
  jabKapus: "Kepala UPTD Puskesmas Baruharjo",
  nipKapus: "",
  pengurus: "MUHAMMAD SYAIFULLOH M.",
  jabPengurus: "Pengurus Barang Pembantu",
  nipPengurus: "19960125 202012 1004",
  kota: "Trenggalek",
  manualRows: {},
};

function emptyManualRow(): ManualRow {
  return {
    sarpras: "",
    masalah: "",
    penyebab: "",
    tindak: "",
    evaluasi: "",
    ket: "",
  };
}

const STATUS_LABEL: Record<string, string> = {
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  rr: { background: "#fef3c7", color: "#92400e", borderColor: "#f59e0b" },
  rb: { background: "#fee2e2", color: "#b91c1c", borderColor: "#ef4444" },
  ta: { background: "#f1f5f9", color: "#475569", borderColor: "#94a3b8" },
};

const TH = "border-[1.5px] border-black bg-[#d0d0d0] px-2 py-1.5 text-center align-middle text-[10.5px] font-black uppercase text-black";
const TD = "border-[1.5px] border-black px-2 py-1.5 align-top text-[10.5px] text-black";
const CELL_INPUT =
  "w-full rounded border border-[#e5e7eb] px-1.5 py-[3px] font-sans text-[10.5px] outline-none focus:border-[#7c3aed]";

function lastDayOfMonth(bulanIdx: number, tahun: number) {
  return new Date(tahun, bulanIdx + 1, 0).getDate();
}

/** GAS `formatTglTtd` → "Trenggalek, 31 Januari 2026". */
function formatTglTtd(kota: string, bulanIdx: number, tahun: number) {
  return `${kota}, ${lastDayOfMonth(bulanIdx, tahun)} ${BULAN_FULL[bulanIdx]} ${tahun}`;
}

function TtdField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold text-[#374151]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border-[1.5px] border-[#e5e7eb] px-2.5 py-1.5 text-xs outline-none focus:border-[#7c3aed]"
      />
    </label>
  );
}

export interface LaporanDocProps {
  bulanIdx: number;
  tahun: number;
  sumber: LaporanSumber;
  /** Data live per ruangan dari `getLaporanPerRoom` (diteruskan modal). */
  rooms: LaporanRoom[];
}

export function LaporanDoc({ bulanIdx, tahun, sumber, rooms }: LaporanDocProps) {
  const [lp, setLp] = useLocalStorageState<LpState>(
    LAPORAN_STATE_KEY,
    DEFAULT_LP
  );
  const bulanKey = `${bulanIdx}-${tahun}`;
  const isManual = sumber === "manual";

  const setTtd = (patch: Partial<LpState>) =>
    setLp((prev) => ({ ...prev, ...patch }));

  const storedManual = React.useMemo(
    () => lp.manualRows?.[bulanKey] ?? [],
    [lp.manualRows, bulanKey]
  );

  const setManual = (next: ManualRow[]) =>
    setLp((prev) => ({
      ...prev,
      manualRows: { ...prev.manualRows, [bulanKey]: next },
    }));

  /** GAS `updateLpManual` — baris di-pad sampai indeks yang diedit. */
  const updateManual = (idx: number, field: ManualField, value: string) => {
    const next = storedManual.slice();
    while (next.length <= idx) next.push(emptyManualRow());
    next[idx] = { ...next[idx], [field]: value };
    setManual(next);
  };

  const deleteManualRow = (idx: number) => {
    const next = storedManual.slice();
    next.splice(idx, 1);
    setManual(next);
  };

  const addManualRow = () => setManual([...storedManual, emptyManualRow()]);

  // GAS: mode manual tampil minimal 10 baris, sumber lain di-pad sampai 8.
  const manualRows = React.useMemo(() => {
    const rows = storedManual.slice();
    while (rows.length < 10) rows.push(emptyManualRow());
    return rows;
  }, [storedManual]);

  const dataRows = React.useMemo(() => {
    if (isManual) return [];
    const rows =
      sumber === "inventaris"
        ? collectInventarisKondisi(rooms)
        : sumber === "ceklist"
          ? collectCeklistForMonth(bulanIdx, tahun, rooms)
          : collectGabungan(bulanIdx, tahun, rooms);
    const padded = rows.slice();
    for (let i = padded.length; i < 8; i++) padded.push(emptyLaporanRow());
    return padded;
  }, [isManual, sumber, bulanIdx, tahun, rooms]);

  const dataCount = dataRows.filter((r) => r.sarpras).length;
  const periode = `${BULAN_FULL[bulanIdx]} ${tahun}`;

  const badgeText =
    sumber === "gabungan"
      ? `🔗 Gabungan: ${dataCount} item bermasalah (Inventaris + Ceklist ${periode})`
      : sumber === "inventaris"
        ? `📋 ${dataCount} item kondisi bermasalah dari seluruh inventaris ruangan`
        : sumber === "ceklist"
          ? `📅 ${dataCount} kejadian tercatat di Ceklist Harian bulan ${periode}`
          : "";

  const emptyText =
    sumber === "gabungan"
      ? "Tidak ada item bermasalah di inventaris maupun ceklist bulan ini."
      : sumber === "inventaris"
        ? "Semua item inventaris dalam kondisi Baik."
        : `Tidak ada catatan kerusakan di ceklist bulan ${periode}.`;

  return (
    <div
      id="laporanDoc"
      className="font-sans text-[11px] leading-[1.45] text-black"
    >
      {/* Kop surat — GAS .lp-kop */}
      <div className="mb-1 flex items-start gap-3.5 border-b-4 border-black pb-2.5">
        <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded border-2 border-black bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-puskesmas.png"
            alt="Logo Puskesmas Baruharjo"
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="flex-1 text-center">
          <div className="text-[11px] font-bold uppercase leading-[1.6]">
            Pemerintah Kabupaten Trenggalek
          </div>
          <div className="text-[11px] font-bold uppercase leading-[1.6]">
            Dinas Kesehatan Pengendalian Penduduk dan Keluarga Berencana
          </div>
          <div className="text-[16px] font-black uppercase tracking-[0.3px]">
            Puskesmas Baruharjo
          </div>
          <div className="mt-0.5 text-[10px] leading-[1.5] text-[#333]">
            Jl. Raya Desa Baruharjo Telp. (0355) 879630
            <br />
            Email : puskesmasbaruharjo@gmail.com &nbsp;·&nbsp; TRENGGALEK 66381
          </div>
        </div>
      </div>

      {/* Judul — GAS .lp-judul */}
      <div className="my-3 border-2 border-black px-3 py-2 text-center">
        <h2 className="m-0 mb-[3px] text-[12px] font-black uppercase tracking-[0.3px]">
          Bukti Pelaksanaan Monitoring, Tindak Lanjut dan Evaluasi
          <br />
          Pemeliharaan Sarana Prasarana dan Alkes
        </h2>
        <div className="text-[11.5px] font-bold">
          BULAN : {BULAN_FULL[bulanIdx].toUpperCase()} {tahun}
        </div>
      </div>

      {/* Badge sumber — GAS .lp-src-badge (tidak ikut tercetak) */}
      {!isManual && (
        <div
          className="mb-2.5 inline-flex items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-[10.5px] font-semibold print:hidden"
          style={
            dataCount > 0
              ? {
                  background: "#ede9fe",
                  borderColor: "#c4b5fd",
                  color: "#6d28d9",
                }
              : {
                  background: "#fff7ed",
                  borderColor: "#fed7aa",
                  color: "#c2410c",
                }
          }
        >
          {dataCount > 0 ? badgeText : `ℹ️ ${emptyText}`}
        </div>
      )}

      {/* Tabel utama — GAS .lp-table */}
      <table className="w-full border-collapse text-[10.5px]">
        <thead>
          <tr>
            <th className={`${TH} w-8`}>NO</th>
            <th className={TH}>NAMA SARPRAS</th>
            <th className={TH}>PERMASALAHAN</th>
            <th className={TH}>PENYEBAB</th>
            <th className={TH}>TINDAK LANJUT</th>
            <th className={TH}>EVALUASI</th>
            <th className={`${TH} w-[90px]`}>KET.</th>
            {isManual && <th className={`${TH} w-8 print:hidden`} />}
          </tr>
        </thead>
        <tbody>
          {isManual
            ? manualRows.map((row, i) => (
                <tr key={i} className="even:bg-[#f9f9f9]">
                  <td className={`${TD} w-7 text-center font-bold`}>{i + 1}</td>
                  <td className={`${TD} min-w-[100px] font-semibold`}>
                    <input
                      type="text"
                      value={row.sarpras}
                      placeholder="Nama sarpras..."
                      aria-label={`Nama sarpras baris ${i + 1}`}
                      onChange={(e) =>
                        updateManual(i, "sarpras", e.target.value)
                      }
                      className={`${CELL_INPUT} min-w-[110px]`}
                    />
                  </td>
                  {(
                    [
                      ["masalah", "Permasalahan..."],
                      ["penyebab", "Penyebab..."],
                      ["tindak", "Tindak lanjut..."],
                      ["evaluasi", "Evaluasi..."],
                    ] as [ManualField, string][]
                  ).map(([field, ph]) => (
                    <td key={field} className={`${TD} min-w-[120px]`}>
                      <textarea
                        rows={2}
                        value={row[field]}
                        placeholder={ph}
                        aria-label={`${ph.replace("...", "")} baris ${i + 1}`}
                        onChange={(e) =>
                          updateManual(i, field, e.target.value)
                        }
                        className={`${CELL_INPUT} resize-y`}
                      />
                    </td>
                  ))}
                  <td className={`${TD} min-w-[70px]`}>
                    <input
                      type="text"
                      value={row.ket}
                      placeholder="Ket..."
                      aria-label={`Keterangan baris ${i + 1}`}
                      onChange={(e) => updateManual(i, "ket", e.target.value)}
                      className={CELL_INPUT}
                    />
                  </td>
                  <td className={`${TD} w-8 text-center print:hidden`}>
                    <button
                      type="button"
                      onClick={() => deleteManualRow(i)}
                      title="Hapus baris"
                      className="rounded border border-[#fca5a5] bg-[#fee2e2] px-1.5 py-0.5 text-[10px] font-bold text-[#b91c1c] transition-colors hover:bg-[#fca5a5]"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            : null}

          {!isManual && dataCount === 0 ? (
            <tr>
              <td
                colSpan={7}
                className={`${TD} px-2 py-3.5 text-center text-[10px] italic text-[#888]`}
              >
                Tidak ada data kerusakan/masalah yang tercatat pada ceklist bulan{" "}
                {periode}.
                <br />
                Gunakan mode &quot;✏️ Isi Manual&quot; untuk mengisi data secara
                langsung.
              </td>
            </tr>
          ) : null}

          {!isManual && dataCount > 0
            ? dataRows.map((row: LaporanRow, i) => (
                <tr key={i} className="even:bg-[#f9f9f9]">
                  <td className={`${TD} w-7 text-center font-bold`}>{i + 1}</td>
                  <td className={`${TD} min-w-[100px] font-semibold`}>
                    {row.sarpras}
                  </td>
                  <td className={`${TD} min-w-[120px]`}>
                    {row.status && STATUS_LABEL[row.status] && (
                      <>
                        <span
                          className="inline-block whitespace-nowrap rounded border px-1.5 py-px text-[9px] font-bold"
                          style={STATUS_STYLE[row.status]}
                        >
                          {STATUS_LABEL[row.status]}
                        </span>
                        <br />
                      </>
                    )}
                    {row.masalah}
                  </td>
                  <td className={`${TD} min-w-[120px]`}>{row.penyebab}</td>
                  <td className={`${TD} min-w-[120px]`}>{row.tindak}</td>
                  <td className={`${TD} min-w-[120px]`}>{row.evaluasi}</td>
                  <td className={`${TD} min-w-[70px]`}>{row.ket}</td>
                </tr>
              ))
            : null}
        </tbody>
      </table>

      {/* Tambah baris — GAS addLpManualRow (tidak ikut tercetak) */}
      {isManual && (
        <div className="mt-2 flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={addManualRow}
            className="rounded-[7px] border-2 border-dashed border-[#a78bfa] bg-[#faf5ff] px-4 py-1.5 text-xs font-bold text-[#7c3aed] transition-colors hover:bg-[#f3e8ff]"
          >
            ＋ Tambah Baris
          </button>
          <span className="text-[10.5px] text-[#9ca3af]">
            Data tersimpan otomatis saat diketik
          </span>
        </div>
      )}

      {/* Tanda tangan — GAS .lp-ttd */}
      <div className="mt-7 flex items-start justify-between">
        <div className="w-[44%] text-center">
          <div className="mb-0.5 text-[11px]">&nbsp;</div>
          <div className="mb-[70px] text-[11px] font-bold">{lp.jabKapus}</div>
          <div className="mx-auto mb-1 w-4/5 border-t-[1.5px] border-black" />
          <div className="text-[11.5px] font-black">
            {lp.kapus || (
              <span className="italic text-[#9ca3af]">
                Nama Kepala Puskesmas
              </span>
            )}
          </div>
          <div className="text-[10px]">NIP. {lp.nipKapus || " "}</div>
        </div>
        <div className="w-[44%] text-center">
          <div className="mb-0.5 text-[11px]">
            {formatTglTtd(lp.kota, bulanIdx, tahun)}
          </div>
          <div className="mb-[70px] text-[11px] font-bold">
            {lp.jabPengurus}
          </div>
          <div className="mx-auto mb-1 w-4/5 border-t-[1.5px] border-black" />
          <div className="text-[11.5px] font-black">
            {lp.pengurus || (
              <span className="italic text-[#9ca3af]">Nama Pengurus</span>
            )}
          </div>
          <div className="text-[10px]">NIP. {lp.nipPengurus || " "}</div>
        </div>
      </div>

      {/* Form isian TTD — GAS #lp-ttd-form (tidak ikut tercetak) */}
      <div className="mt-3.5 rounded-[10px] border-[1.5px] border-[#d8b4fe] bg-[#faf5ff] p-3.5 print:hidden">
        <h4 className="m-0 mb-2.5 text-[11.5px] font-bold text-[#6d28d9]">
          ✏️ Isi data tanda tangan — tidak ikut tercetak
        </h4>
        <div className="grid gap-2.5 md:grid-cols-3">
          <div className="space-y-1.5">
            <TtdField
              label="Jabatan Kepala Puskesmas"
              value={lp.jabKapus}
              onChange={(v) => setTtd({ jabKapus: v })}
            />
            <TtdField
              label="Nama Kepala Puskesmas"
              value={lp.kapus}
              placeholder="dr. Nama Kapus, M.Kes"
              onChange={(v) => setTtd({ kapus: v })}
            />
            <TtdField
              label="NIP Kepala Puskesmas"
              value={lp.nipKapus}
              placeholder="19XXXXXX XXXXXX X XXX"
              onChange={(v) => setTtd({ nipKapus: v })}
            />
          </div>
          <div className="space-y-1.5">
            <TtdField
              label="Jabatan Pengurus Barang"
              value={lp.jabPengurus}
              onChange={(v) => setTtd({ jabPengurus: v })}
            />
            <TtdField
              label="Nama Pengurus Barang"
              value={lp.pengurus}
              placeholder="Nama Pengurus, S.Kep"
              onChange={(v) => setTtd({ pengurus: v })}
            />
            <TtdField
              label="NIP Pengurus Barang"
              value={lp.nipPengurus}
              placeholder="19XXXXXX XXXXXX X XXX"
              onChange={(v) => setTtd({ nipPengurus: v })}
            />
          </div>
          <div className="space-y-1.5">
            <TtdField
              label="Kota Penandatanganan"
              value={lp.kota}
              placeholder="Trenggalek"
              onChange={(v) => setTtd({ kota: v })}
            />
            <div className="mt-3 rounded-md border border-[#e5e7eb] bg-white p-2.5 text-[10px] leading-[1.6] text-[#6b7280]">
              <b className="text-[#374151]">💡 Tips sumber data:</b>
              <br />• <b>Gabungan:</b> ambil semua item bermasalah dari
              inventaris <i>dan</i> ceklist bulan ini
              <br />• <b>Kondisi Inventaris:</b> hanya dari kolom kondisi
              (RR/RB/TA) di tabel inventaris
              <br />• <b>Ceklist Harian:</b> hanya dari tombol Ceklist yang
              sudah diisi detail kerusakan
              <br />• <b>Manual:</b> ketik langsung, cocok tanpa data digital
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
