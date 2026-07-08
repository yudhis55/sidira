import { getMockPakta } from "@/lib/mock-data";
import { countAset } from "@/lib/pakta-utils";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
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
    <div className="space-y-5">
      {/* ── Header — matches GAS .pakta-header ── */}
      <div
        className="flex items-center gap-3.5 px-6 py-5 bg-white border border-line"
        style={{ borderRadius: "var(--r, 10px)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        {/* Icon box — blue gradient like GAS */}
        <div
          className="flex items-center justify-center shrink-0 text-[26px]"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
          }}
        >
          📜
        </div>

        <div className="min-w-0">
          <div className="text-lg font-extrabold" style={{ color: "var(--ink)" }}>
            Pakta Integritas Pemanfaatan BMD
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Puskesmas Baruharjo · Barang Milik Daerah
          </div>
        </div>

        {/* Stat */}
        <div className="ml-auto flex gap-3">
          <div
            className="text-center px-4 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div
              className="text-xl font-black font-mono leading-none"
              style={{ color: "#2563eb" }}
            >
              {total}
            </div>
            <div
              className="text-[10px] font-semibold mt-1"
              style={{ color: "var(--ink3)" }}
            >
              Total Pakta
            </div>
          </div>
        </div>
      </div>

      {/* ── Action buttons — GAS .pakta-btn-new + ghost ── */}
      <div className="flex gap-2.5 mb-4">
        <Link href="/pakta/new">
          <Button
            className="text-[13px] font-bold px-5 py-2.5 text-white"
            style={{
              borderRadius: 10,
              background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
              border: "none",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            }}
          >
            ＋ Entri Pakta Integritas Baru
          </Button>
        </Link>
        <Button variant="ghost" className="text-xs">
          📥 Export CSV
        </Button>
      </div>

      {/* ── Table / Empty ── */}
      {paktaList.length === 0 ? (
        <Card>
          <div className="text-center py-16" style={{ color: "#93c5fd" }}>
            <div className="text-5xl mb-3">📜</div>
            <div className="text-[15px] font-bold mb-1.5" style={{ color: "#2563eb" }}>
              Belum ada data Pakta Integritas
            </div>
            <div className="text-xs" style={{ color: "var(--ink3)" }}>
              Klik &quot;+ Entri Pakta Integritas Baru&quot; untuk menambahkan
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "12.5px" }}>
              <thead>
                <tr>
                  {["No.", "Nama / NIP", "Jabatan", "Tanggal", "Aset", "Aksi"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className="font-bold uppercase whitespace-nowrap text-left"
                        style={{
                          padding: "10px 14px",
                          background: "#eff6ff",
                          fontSize: "10.5px",
                          color: "#1e40af",
                          letterSpacing: "0.4px",
                          borderBottom: "2px solid #bfdbfe",
                          width: i === 0 ? 60 : i === 4 ? 80 : undefined,
                          minWidth: i === 5 ? 220 : undefined,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paktaList.map((pakta, i) => {
                  const asetCount = countAset(pakta);
                  return (
                    <tr
                      key={pakta.id}
                      className="group"
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      {/* No */}
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <span
                          className="inline-block font-mono font-extrabold"
                          style={{
                            padding: "2px 8px",
                            borderRadius: 8,
                            background: "#dbeafe",
                            color: "#1e40af",
                            fontSize: 11,
                          }}
                        >
                          {String(i + 1).padStart(3, "0")}
                        </span>
                      </td>

                      {/* Nama / NIP */}
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <Link
                          href={`/pakta/${pakta.id}`}
                          className="font-bold hover:underline"
                          style={{ color: "var(--ink)" }}
                        >
                          {pakta.nama || "-"}
                        </Link>
                        <div className="mt-px" style={{ fontSize: "10.5px", color: "var(--ink3)" }}>
                          {pakta.nip ? `NIP. ${pakta.nip}` : "NIP. —"}
                        </div>
                      </td>

                      {/* Jabatan */}
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <div className="font-semibold" style={{ color: "var(--ink)" }}>
                          {pakta.jabatan || "-"}
                        </div>
                      </td>

                      {/* Tanggal */}
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <div style={{ color: "var(--ink2)" }}>{fmtDate(pakta.tgl)}</div>
                        <div className="mt-px" style={{ fontSize: "10.5px", color: "var(--ink3)" }}>
                          {pakta.hari || "-"}
                        </div>
                      </td>

                      {/* Aset count badge */}
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <span
                          className="inline-block font-bold"
                          style={{
                            padding: "2px 9px",
                            borderRadius: 10,
                            fontSize: 11,
                            background: "#dbeafe",
                            color: "#1e40af",
                          }}
                        >
                          {asetCount} aset
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <div className="flex items-center flex-wrap gap-1">
                          <Link
                            href={`/pakta/${pakta.id}/edit`}
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
                            ✏️ Edit
                          </Link>
                          <Link
                            href={`/pakta/${pakta.id}/print?lampiran=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center font-semibold transition-colors hover:!border-[#2563eb] hover:!text-[#2563eb]"
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1.5px solid #bfdbfe",
                              background: "var(--white)",
                              color: "#1e40af",
                              fontSize: 11,
                            }}
                          >
                            📋 Lampiran
                          </Link>
                          <Link
                            href={`/pakta/${pakta.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
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
                            🖨️ Cetak
                          </Link>
                          <span
                            className="inline-flex items-center font-semibold cursor-not-allowed opacity-50"
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: "1.5px solid var(--line)",
                              background: "var(--white)",
                              color: "var(--ink2)",
                              fontSize: 11,
                            }}
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
