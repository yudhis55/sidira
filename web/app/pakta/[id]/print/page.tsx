"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getPaktaById } from "@/lib/auth/pakta";
import type { Pakta } from "@/types/database";
import { PrintTrigger } from "@/components/sbbk/print-trigger";
import { useIsClient } from "@/lib/use-is-client";
import Link from "next/link";
import { notFound } from "next/navigation";
import type {
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const SATUAN = [
  "", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh",
  "delapan", "sembilan", "sepuluh", "sebelas", "dua belas", "tiga belas",
  "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas",
  "sembilan belas",
];
const PULUHAN = [
  "", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh",
  "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh",
];

function angkaKeKata(n: number): string {
  if (n === 0) return "nol";
  if (n < 20) return SATUAN[n];
  if (n < 100) return PULUHAN[Math.floor(n / 10)] + (n % 10 ? " " + SATUAN[n % 10] : "");
  if (n < 200) return "seratus" + (n % 100 ? " " + angkaKeKata(n % 100) : "");
  if (n < 1000)
    return SATUAN[Math.floor(n / 100)] + " ratus" + (n % 100 ? " " + angkaKeKata(n % 100) : "");
  if (n < 2000) return "seribu" + (n % 1000 ? " " + angkaKeKata(n % 1000) : "");
  return angkaKeKata(Math.floor(n / 1000)) + " ribu" + (n % 1000 ? " " + angkaKeKata(n % 1000) : "");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtTanggal(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function PaktaPrintPage() {
  const mounted = useIsClient();
  const { id } = useParams<{ id: string }>();
  const sp = Object.fromEntries(useSearchParams().entries());
  // Print mode: default = both sheets. ?pakta=1 only Pakta. ?lampiran=1 only Lampiran.
  const onlyPakta = sp.pakta === "1";
  const onlyLampiran = sp.lampiran === "1";
  const showPakta = !onlyLampiran;
  const showLampiran = !onlyPakta;

  // Data live Supabase (hasil "Buat Pakta" dari rekap kini baris DB).
  const [pakta, setPakta] = React.useState<Pakta | null>(null);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    getPaktaById(id)
      .then((row) => {
        if (!cancelled) {
          if (row) setPakta(row);
          else setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!mounted) return null;

  if (failed) {
    notFound();
  }

  // Memuat dari Supabase — tampilkan halaman kosong sementara (di-print
  // hanya setelah data tiba; PrintTrigger diklik manual oleh pengguna).
  if (!pakta) {
    return <div className="min-h-screen bg-white" />;
  }

  const tglObj = pakta.tgl ? new Date(pakta.tgl) : new Date();
  const hariStr = pakta.hari || "";
  const tglAngka = tglObj.getDate();
  const bulanStr = BULAN[tglObj.getMonth()];
  const tahunStr = tglObj.getFullYear();
  const tglPendek = fmtTanggal(pakta.tgl);
  const tglKata = capitalize(angkaKeKata(tglAngka));
  const tahunKata = capitalize(angkaKeKata(tahunStr));

  const kend = (pakta.aset_kendaraan || []) as PaktaAsetKendaraan[];
  const lapt = (pakta.aset_laptop || []) as PaktaAsetLaptop[];
  const alat = (pakta.aset_alat || []) as PaktaAsetAlat[];

  function buildAsetTable(
    cols: string[],
    rows: string[][],
    emptyNote: string,
  ) {
    const thHtml = cols
      .map(
        (c) =>
          `<th style="border:1px solid #000;padding:4px 5px;text-align:center;background:#d0d0d0;font-size:9pt">${esc(c)}</th>`,
      )
      .join("");
    const tdCount = cols.length;
    let tbodyHtml: string;
    if (rows.length > 0) {
      tbodyHtml = rows
        .map(
          (row, ri) =>
            "<tr>" +
            `<td style="border:1px solid #000;padding:3px 5px;text-align:center;font-size:9pt">${ri + 1}.</td>` +
            row
              .map(
                (v) =>
                  `<td style="border:1px solid #000;padding:3px 5px;font-size:9pt">${esc(v || "")}</td>`,
              )
              .join("") +
            "</tr>",
        )
        .join("");
    } else {
      tbodyHtml = `<tr><td colspan="${tdCount}" style="border:1px solid #000;padding:6px;text-align:center;color:#888;font-size:9pt;font-style:italic">${esc(emptyNote)}</td></tr>`;
    }
    return (
      `<table style="width:100%;border-collapse:collapse;margin-bottom:12px">` +
      `<thead><tr>${thHtml}</tr></thead>` +
      `<tbody>${tbodyHtml}</tbody>` +
      `</table>`
    );
  }

  const kendRows = kend.map((r) => [
    r.jenis || "",
    r.merk || "",
    r.tahun?.toString() || "",
    r.nopol || "",
    r.harga || "",
    r.ket || "",
  ]);
  const laptRows = lapt.map((r) => [
    r.merk || "",
    r.type || "",
    r.tahun?.toString() || "",
    r.seri || "",
    r.harga || "",
    r.ket || "",
  ]);
  const alatRows = alat.map((r) => [
    r.merk || "",
    r.type || "",
    r.tahun?.toString() || "",
    r.seri || "",
    r.harga || "",
    r.ket || "",
  ]);

  const lampiranHtml =
    `<div style="font-family:Times New Roman,Times,serif;font-size:10pt;color:#000;line-height:1.5">` +
    `<p style="margin:0 0 1px 0">LAMPIRAN</p>` +
    `<p style="margin:0 0 1px 0">PAKTA INTEGRITAS PEMANFAATAN BMD</p>` +
    `<p style="margin:0 0 12px 0">PEMERINTAH KABUPATEN TRENGGALEK</p>` +
    `<table style="margin-bottom:12px;border-collapse:collapse;font-size:10pt">` +
    `<tr><td style="width:72px;padding:1px 0">Nama</td><td style="width:12px">:</td><td><b>${esc(pakta.nama || "")}</b></td></tr>` +
    `<tr><td style="padding:1px 0">Jabatan</td><td>:</td><td>${esc(pakta.jabatan || "")}</td></tr>` +
    (pakta.alamat
      ? `<tr><td style="padding:1px 0">Alamat</td><td>:</td><td>${esc(pakta.alamat || "")}</td></tr>`
      : "") +
    `</table>` +
    `<p style="margin:0 0 4px 0;font-weight:bold;font-size:10pt">Kendaraan Dinas</p>` +
    buildAsetTable(
      ["No.", "Jenis Kendaraan", "Merk", "Tahun Perolehan", "No. Polisi", "Harga Perolehan", "Keterangan"],
      kendRows,
      "— tidak ada data —",
    ) +
    `<p style="margin:0 0 4px 0;font-weight:bold;font-size:10pt">Laptop/Personal Komputer</p>` +
    buildAsetTable(
      ["No.", "Merk", "Type", "Tahun Perolehan", "No. Seri", "Harga Perolehan", "Keterangan"],
      laptRows,
      "— tidak ada data —",
    ) +
    `<p style="margin:0 0 4px 0;font-weight:bold;font-size:10pt">Alat Penunjang (Tablet, Handphone, Handy talky dan External Hardisk)</p>` +
    buildAsetTable(
      ["No.", "Merk", "Type", "Tahun Perolehan", "No. Seri", "Harga Perolehan", "Keterangan"],
      alatRows,
      "— tidak ada data —",
    ) +
    `</div>`;

  const modeChip = (active: boolean) =>
    active
      ? "border-blue-700 bg-blue-50 text-blue-800"
      : "border-neutral-300 text-neutral-500 hover:bg-neutral-50";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[210mm] px-4 pt-4 print:hidden">
        <PrintTrigger />
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/pakta/${pakta.id}/print`}
            className={`rounded border px-3 py-1 text-xs font-semibold ${modeChip(!onlyPakta && !onlyLampiran)}`}
          >
            Pakta + Lampiran
          </Link>
          <Link
            href={`/pakta/${pakta.id}/print?pakta=1`}
            className={`rounded border px-3 py-1 text-xs font-semibold ${modeChip(onlyPakta)}`}
          >
            Pakta saja
          </Link>
          <Link
            href={`/pakta/${pakta.id}/print?lampiran=1`}
            className={`rounded border px-3 py-1 text-xs font-semibold ${modeChip(onlyLampiran)}`}
          >
            Lampiran BMD saja
          </Link>
          <span className="mx-2 text-neutral-300">|</span>
          <Link
            href={`/pakta?lampiran=${pakta.id}`}
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            {"\u2190"} Kembali ke daftar Pakta
          </Link>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 14mm; }
              body { background: #fff !important; }
              .no-print, .print\\:hidden { display: none !important; }
              .pakta-lembar2 { page-break-before: always; }
            }
            .pakta-doc {
              font-family: "Times New Roman", Times, serif;
              color: #000;
              max-width: 210mm;
              margin: 0 auto;
              padding: 0 4mm;
              font-size: 11pt;
              line-height: 1.6;
            }
            .pakta-doc table { border-collapse: collapse; }
            .pakta-doc .kop-line-thin { border-top: 1px solid #000; margin-top: 2px; }
            .pakta-doc .kop-line-thick { border-top: 4px solid #000; margin-bottom: 10px; }
            .pakta-doc-judul { text-align: center; font-weight: bold; font-size: 12pt; text-transform: uppercase; margin-bottom: 2px; }
            .pakta-doc-instansi { text-align: center; font-size: 11pt; margin-bottom: 12px; }
            .pakta-doc-pembuka { margin: 0 0 8px 0; text-align: justify; }
            .pakta-doc-identitas table { margin-bottom: 10px; }
            .pakta-doc-identitas td { padding: 1px 0; vertical-align: top; }
            .pakta-doc-identitas .td-label { width: 72px; }
            .pakta-doc-identitas .td-sep { width: 12px; }
            .pakta-doc-menyatakan { margin: 0 0 8px 0; text-align: justify; }
            .pakta-doc-butir { margin: 0 0 8px 0; padding-left: 0; list-style: none; }
            .pakta-doc-butir li { margin-bottom: 6px; text-align: justify; padding-left: 0; display: flex; gap: 6px; }
            .pakta-doc-butir .no { font-weight: bold; flex-shrink: 0; }
            .pakta-doc-penutup { margin: 0 0 16px 0; text-align: justify; }
            .pakta-doc-ttd { display: flex; margin-top: 12px; }
            .pakta-doc-ttd-kiri { width: 50%; }
            .pakta-doc-ttd-kanan { width: 50%; text-align: left; }
            .pakta-doc-ttd-kanan p { margin: 0 0 2px 0; }
            .pakta-doc-ttd-space { height: 70px; }
            .pakta-doc-ttd-line { border-top: 1.5px solid #000; width: 60%; margin-bottom: 3px; }
            .pakta-doc-ttd-nama { font-weight: bold; }
            .pakta-doc-ttd-nip { font-size: 10pt; }
          `,
        }}
      />

      {showPakta ? (
        <div className="pakta-doc">
          <table style={{ width: "100%", marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={{ width: "95px", verticalAlign: "middle", padding: "4px 0" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-puskesmas.png"
                    alt="Logo Puskesmas Baruharjo"
                    style={{ width: "88px", height: "auto", display: "block" }}
                  />
                </td>
                <td style={{ textAlign: "center", verticalAlign: "middle", padding: "4px 0" }}>
                  <div style={{ fontSize: "10.5pt", lineHeight: 1.5 }}>
                    PEMERINTAH KABUPATEN TRENGGALEK
                  </div>
                  <div style={{ fontSize: "10.5pt", lineHeight: 1.5 }}>
                    DINAS KESEHATAN, PENGENDALIAN PENDUDUK DAN KELUARGA BERENCANA
                  </div>
                  <div style={{ fontSize: "10.5pt", fontWeight: "bold", lineHeight: 1.5 }}>
                    PUSKESMAS BARUHARJO
                  </div>
                  <div style={{ fontSize: "10.5pt", lineHeight: 1.5 }}>
                    Jl. Raya Desa Baruharjo Telp. (0355) 879630
                  </div>
                  <div style={{ fontSize: "10.5pt", lineHeight: 1.5 }}>
                    Email : puskesmasbaruharjo@gmail.com
                  </div>
                  <div style={{ fontSize: "10.5pt", lineHeight: 1.5 }}>
                    TRENGGALEK 66381
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="kop-line-thin" />
          <div className="kop-line-thick" />

          <div className="pakta-doc-judul">PAKTA INTEGRITAS PEMANFAATAN BMD</div>
          <div className="pakta-doc-instansi">PEMERINTAH KABUPATEN TRENGGALEK</div>

          <div className="pakta-doc-pembuka">
            Pada hari <b>{hariStr}</b> tanggal <b>{tglKata}</b> bulan <b>{bulanStr}</b>{" "}
            tahun <b>{tahunKata}</b> saya yang bertanda tangan di bawah ini:
          </div>

          <div className="pakta-doc-identitas">
            <table>
              <tbody>
                <tr>
                  <td className="td-label">Nama</td>
                  <td className="td-sep">:</td>
                  <td><b>{pakta.nama || ""}</b></td>
                </tr>
                <tr>
                  <td className="td-label">Jabatan</td>
                  <td className="td-sep">:</td>
                  <td>{pakta.jabatan || ""}</td>
                </tr>
                {pakta.alamat ? (
                  <tr>
                    <td className="td-label">Alamat</td>
                    <td className="td-sep">:</td>
                    <td>{pakta.alamat}</td>
                  </tr>
                ) : null}
                {pakta.nip ? (
                  <tr>
                    <td className="td-label">NIP</td>
                    <td className="td-sep">:</td>
                    <td>{pakta.nip}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="pakta-doc-menyatakan">
            Dengan penuh kesadaran dan komitmen tinggi dengan menjunjung nilai integritas
            menyatakan:
          </div>

          <ol className="pakta-doc-butir">
            <li>
              <span className="no">1.</span>
              <span>
                Saya akan menjaga aset yang saya manfaatkan ketika saya bertugas sebagai{" "}
                <b>{pakta.jabatan || "—"}</b> dengan penuh tanggungjawab, termasuk
                bertanggungjawab apabila terjadi kerusakan atau kekurangan.
              </span>
            </li>
            <li>
              <span className="no">2.</span>
              <span>
                Setelah menjalankan tugas sebagai <b>{pakta.jabatan || "—"}</b>, saya akan
                menyerahkan kembali semua aset milik/ tercatat sebagai Barang Milik Daerah yang
                bergerak maupun tidak bergerak serta semua yang digunakan dalam rangka membantu
                tugas jabatan.
              </span>
            </li>
            <li>
              <span className="no">3.</span>
              <span>
                Pakta Integritas ini berlaku sebagai Surat Kuasa kepada Pengelola Barang
                melalui Kepala Badan Keuangan Daerah selaku Pejabat Penatausahaan Barang untuk
                menarik kembali secara langsung Barang Milik Daerah bergerak dan tidak bergerak
                seketika saat saya tidak menjabat.
              </span>
            </li>
            <li>
              <span className="no">4.</span>
              <span>
                Apabila saya melanggar pernyataan dalam Pakta Integritas ini, saya bersedia
                bertanggungjawab mutlak dan siap dikenakan sanksi sesuai peraturan
                perundang-undangan yang berlaku.
              </span>
            </li>
          </ol>

          <div className="pakta-doc-penutup">
            Demikian Pakta Integritas dan Surat Kuasa ini saya buat dengan sebenar-benarnya
            untuk dipergunakan sebagaimana mestinya.
          </div>

          <div className="pakta-doc-ttd">
            <div className="pakta-doc-ttd-kiri" />
            <div className="pakta-doc-ttd-kanan">
              <p>Trenggalek, {tglPendek}</p>
              <p>Yang Membuat Pernyataan</p>
              <div className="pakta-doc-ttd-space" />
              <div className="pakta-doc-ttd-line" />
              <p className="pakta-doc-ttd-nama">( {pakta.nama || ""} )</p>
              {pakta.nip ? <p className="pakta-doc-ttd-nip">NIP. {pakta.nip}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {showLampiran ? (
        <div
          className={showPakta ? "pakta-lembar2 mx-auto max-w-[210mm] px-1" : "mx-auto max-w-[210mm] px-1"}
          dangerouslySetInnerHTML={{ __html: lampiranHtml }}
        />
      ) : null}
    </div>
  );
}