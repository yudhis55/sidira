import { getSbbkById } from "@/lib/auth/sbbk";
import { PrintTrigger } from "@/components/sbbk/print-trigger";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtTanggal(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SbbkPrintPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = await getSbbkById(id);

  if (!sbbk) {
    notFound();
  }

  const tglStr = fmtTanggal(sbbk.tgl);
  const totalNilai = sbbk.items.reduce((s, it) => s + (Number(it.total) || 0), 0);
  const minRows = 10;
  const blanksNeeded = Math.max(0, minRows - sbbk.items.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Print trigger (hidden when printing) */}
      <div className="mx-auto max-w-[210mm] px-4 pt-4">
        <PrintTrigger />
        <div className="print:hidden mb-4 text-center">
          <Link
            href={`/sbbk/${sbbk.id}`}
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            ← Kembali ke detail SBBK
          </Link>
        </div>
      </div>

      {/* Print-only styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 12mm; }
              body { background: #fff !important; }
              .no-print { display: none !important; }
              .sbbk-doc { box-shadow: none !important; }
            }
            .sbbk-doc {
              font-family: "Times New Roman", Times, serif;
              color: #000;
              max-width: 210mm;
              margin: 0 auto;
              padding: 0 4mm;
            }
            .sbbk-doc table { border-collapse: collapse; }
            .sbbk-doc .kop-line-thin { border-top: 1px solid #000; margin-top: 2px; }
            .sbbk-doc .kop-line-thick { border-top: 4px solid #000; margin-bottom: 10px; }
          `,
        }}
      />

      <div className="sbbk-doc">
        {/* ── KOP SURAT ── */}
        <table style={{ width: "100%", marginBottom: 0 }}>
          <tbody>
            <tr>
              {/* Logo kiri */}
              <td style={{ width: "95px", verticalAlign: "middle", padding: "4px 0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-puskesmas.svg"
                  alt="Logo Puskesmas Baruharjo"
                  style={{ width: "88px", height: "auto", display: "block" }}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.style.display = "none";
                    const ph = t.nextElementSibling as HTMLElement | null;
                    if (ph) ph.style.display = "flex";
                  }}
                />
                <div
                  style={{
                    width: "88px",
                    height: "88px",
                    display: "none",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #000",
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  LOGO
                </div>
              </td>
              {/* Teks kop */}
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

        {/* ── JUDUL ── */}
        <div
          style={{
            textAlign: "center",
            fontSize: "13px",
            fontWeight: "bold",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          SURAT BUKTI BARANG KELUAR (SBBK) DARI GUDANG
        </div>

        {/* ── INFO ── */}
        <table style={{ marginBottom: "10px", fontSize: "11px" }}>
          <tbody>
            <tr>
              <td style={{ width: "80px", padding: "1px 0" }}>KEPADA</td>
              <td style={{ width: "10px" }}>:</td>
              <td><b>{sbbk.kepada || "-"}</b></td>
              <td style={{ paddingLeft: "40px", width: "80px" }}>No. SBBK</td>
              <td style={{ width: "10px" }}>:</td>
              <td><b>{sbbk.no || "-"}</b></td>
            </tr>
            <tr>
              <td style={{ padding: "1px 0" }}>Tanggal</td>
              <td>:</td>
              <td>{tglStr}</td>
              <td style={{ paddingLeft: "40px" }}>Anggaran</td>
              <td>:</td>
              <td>{sbbk.anggaran || "-"}</td>
            </tr>
          </tbody>
        </table>

        {/* ── TABEL BARANG ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", marginBottom: 0 }}>
          <thead>
            <tr style={{ background: "#d0d0d0" }}>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "28px" }}>No.</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center" }}>Nama Barang</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "90px" }}>Merk</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "62px" }}>Banyaknya</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "52px" }}>Satuan</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "110px" }}>Harga Satuan</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "110px" }}>Jumlah Harga</th>
              <th style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center", width: "90px" }}>Keterangan</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "10.5px" }}>
            {sbbk.items.map((it, i) => (
              <tr key={i}>
                <td style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center" }}>{i + 1}</td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}>{it.nama || "-"}</td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}>{it.merk || "-"}</td>
                <td style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center" }}>{it.qty || 0}</td>
                <td style={{ border: "1.5px solid #000", padding: "5px", textAlign: "center" }}>{it.satuan || "Unit"}</td>
                <td style={{ border: "1.5px solid #000", padding: "5px", textAlign: "right" }}>
                  {(Number(it.harga) || 0).toLocaleString("id-ID")}
                </td>
                <td style={{ border: "1.5px solid #000", padding: "5px", textAlign: "right" }}>
                  {(Number(it.total) || 0).toLocaleString("id-ID")}
                </td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
              </tr>
            ))}
            {Array.from({ length: blanksNeeded }).map((_, i) => (
              <tr key={`blank-${i}`}>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}>&nbsp;</td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
                <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
              <td colSpan={6} style={{ border: "1.5px solid #000", padding: "5px", textAlign: "right" }}>
                TOTAL
              </td>
              <td style={{ border: "1.5px solid #000", padding: "5px", textAlign: "right" }}>
                {totalNilai.toLocaleString("id-ID")}
              </td>
              <td style={{ border: "1.5px solid #000", padding: "5px" }}></td>
            </tr>
          </tfoot>
        </table>

        {/* ── TANDA TANGAN ── */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", fontSize: "11px" }}>
          <tbody>
            {/* Baris: Trenggalek, tanggal di kolom kanan */}
            <tr>
              <td style={{ width: "38%", verticalAlign: "top" }}></td>
              <td style={{ width: "24%", verticalAlign: "top" }}></td>
              <td style={{ width: "38%", verticalAlign: "top", textAlign: "left" }}>
                Trenggalek,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tglStr}
              </td>
            </tr>
            {/* Baris: Yang Menyerahkan | (kosong) | Yang Menerima */}
            <tr>
              <td style={{ verticalAlign: "top", paddingTop: "8px" }}><b>Yang Menyerahkan,</b></td>
              <td style={{ verticalAlign: "top" }}></td>
              <td style={{ verticalAlign: "top", paddingTop: "8px" }}><b>Yang Menerima,</b></td>
            </tr>
            {/* Baris tanda tangan */}
            <tr>
              {/* Penyerah */}
              <td style={{ verticalAlign: "top", paddingTop: "24px" }}>
                <div style={{ height: "60px" }}></div>
                <div style={{ borderTop: "1.5px solid #000", width: "75%", marginBottom: "3px" }}></div>
                <div><b>MUHAMMAD SYAIFULLOH MAHDZUR</b></div>
                <div>NIP. 19960125 202012 1 004</div>
              </td>
              {/* Mengetahui - tengah */}
              <td style={{ verticalAlign: "top", textAlign: "center", paddingTop: "24px" }}>
                <div>Mengetahui,</div>
                <div><b>Kuasa Pengguna Barang</b></div>
                <div>Puskesmas Baruharjo</div>
                <div style={{ height: "60px" }}></div>
                <div style={{ borderTop: "1.5px solid #000", width: "80%", margin: "0 auto 3px" }}></div>
                <div><b>dr. RIANA WIDYASTUTI</b></div>
                <div>NIP. 19750516 201001 2 011</div>
              </td>
              {/* Penerima */}
              <td style={{ verticalAlign: "top", paddingTop: "24px" }}>
                <div style={{ height: "60px" }}></div>
                <div style={{ borderTop: "1.5px solid #000", width: "75%", marginBottom: "3px" }}></div>
                <div><b>{sbbk.kepada || "Penerima"}</b></div>
                <div>NIP. &nbsp;&nbsp;:</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
