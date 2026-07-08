import { getMockPakta } from "@/lib/mock-data";
import { countAset } from "@/lib/pakta-utils";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { PageHeader } from "@/components/shared/page-elements";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PaktaPage() {
  const paktaList = getMockPakta();
  const total = paktaList.length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📜"
        title="Pakta Integritas Pemanfaatan BMD"
        subtitle="Puskesmas Baruharjo · Barang Milik Daerah"
        stats={[{ value: total, label: "Total Pakta", tone: "teal" }]}
        actions={
          <Link href="/pakta/new">
            <Button className="text-xs px-3 py-1.5">
              ＋ Entri Pakta Integritas Baru
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" className="text-xs px-3 py-1.5">
          📥 Export CSV
        </Button>
      </div>

      {/* List */}
      {paktaList.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 text-3xl" aria-hidden>📜</div>
            <p className="mb-1 font-mono text-sm font-semibold">Belum ada data Pakta Integritas</p>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Klik &quot;+ Entri Pakta Integritas Baru&quot; untuk menambahkan
            </p>
            <Link href="/pakta/new">
              <Button className="text-xs px-3 py-1.5">
                ＋ Entri Pakta Integritas Baru
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line bg-[var(--bg)]">
                  <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap w-16">No.</th>
                  <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Nama / NIP</th>
                  <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Jabatan</th>
                  <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Tanggal</th>
                  <th className="h-9 px-2 text-center font-mono font-medium whitespace-nowrap w-20">Aset</th>
                  <th className="h-9 px-2 text-center font-mono font-medium whitespace-nowrap min-w-[220px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paktaList.map((pakta, i) => {
                  const asetCount = countAset(pakta);
                  return (
                    <tr key={pakta.id} className="border-b border-line last:border-0 hover:bg-[var(--bg)]">
                      <td className="px-2 py-2 align-top">
                        <span className="inline-flex h-5 items-center px-1.5 font-mono text-[10px] ring-1 ring-line">
                          {String(i + 1).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <Link
                          href={`/pakta/${pakta.id}`}
                          className="font-semibold hover:underline"
                          style={{ color: "var(--ink)" }}
                        >
                          {pakta.nama || "-"}
                        </Link>
                        <div className="text-[10px]" style={{ color: "var(--ink2)" }}>
                          {pakta.nip ? `NIP. ${pakta.nip}` : "NIP. —"}
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div className="font-semibold" style={{ color: "var(--ink)" }}>
                          {pakta.jabatan || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div style={{ color: "var(--ink2)" }}>{fmtDate(pakta.tgl)}</div>
                        <div className="text-[10px]" style={{ color: "var(--ink2)" }}>{pakta.hari || "-"}</div>
                      </td>
                      <td className="px-2 py-2 text-center align-top">
                        <span className="inline-flex items-center px-[9px] py-[2px] text-[11px] font-bold" style={{ borderRadius: "10px", background: "#dbeafe", color: "#1e40af" }}>
                          {asetCount} aset
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        <div className="flex items-center justify-center flex-wrap gap-1">
                          <Link
                            href={`/pakta/${pakta.id}/edit`}
                            className="inline-flex items-center px-[7px] py-[3px] text-[10px] hover:opacity-80"
                            style={{ border: "1px solid var(--line)", borderRadius: "4px", color: "var(--ink2)", background: "var(--bg2)" }}
                          >
                            ✏️ Edit
                          </Link>
                          <Link
                            href={`/pakta/${pakta.id}/print?lampiran=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-[7px] py-[3px] text-[10px] hover:opacity-80"
                            style={{ border: "1px solid #bfdbfe", borderRadius: "4px", color: "#1e40af" }}
                          >
                            📋 Lampiran
                          </Link>
                          <Link
                            href={`/pakta/${pakta.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-[7px] py-[3px] text-[10px] hover:opacity-80"
                            style={{ border: "1px solid var(--line)", borderRadius: "4px", color: "var(--ink2)" }}
                          >
                            🖨️ Cetak
                          </Link>
                          <span
                            className="inline-flex items-center px-[7px] py-[3px] text-[10px] opacity-50 cursor-not-allowed"
                            style={{ border: "1px solid var(--line)", borderRadius: "4px", color: "var(--red)" }}
                          >
                            ✕
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
