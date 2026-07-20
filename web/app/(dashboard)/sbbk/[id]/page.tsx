import React from "react";
import { getMockSbbkById } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function angBadgeClass(ang: string | undefined): string {
  if (!ang) return "bg-slate-100 text-slate-700 border border-slate-300";
  if (ang.includes("BLUD")) return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
  if (ang.includes("APBD")) return "bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]";
  return "bg-slate-100 text-slate-700 border border-slate-300";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SbbkDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = getMockSbbkById(id);

  if (!sbbk) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3" aria-hidden>
              📋
            </span>
            <p className="text-sm font-bold mb-1" style={{ color: "#6d28d9" }}>
              SBBK Tidak Ditemukan
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--ink3)" }}>
              Data mock tidak tersedia untuk ID ini.
            </p>
            <Link href="/sbbk">
              <Button size="sm" variant="ghost">
                ← Kembali ke Daftar
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalValue = sbbk.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  const actBtn =
    "inline-flex items-center gap-1.5 font-semibold transition-colors px-3 py-1.5 text-[12px] border-[1.5px] border-[var(--line)] bg-white text-[var(--ink2)] rounded-md hover:!border-[#7c3aed] hover:!text-[#7c3aed]";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sbbk">
            <Button variant="ghost" size="icon" aria-label="Kembali">
              ←
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center shrink-0 text-xl"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
              }}
              aria-hidden
            >
              📋
            </div>
            <div>
              <h1 className="font-mono text-lg font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                {sbbk.no}
              </h1>
              <p className="text-xs" style={{ color: "var(--ink3)" }}>
                Detail SBBK · {fmtDate(sbbk.tgl)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/sbbk/${sbbk.id}/edit`} className={actBtn}>
            ✏️ Edit
          </Link>
          <Link
            href={`/sbbk/${sbbk.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${actBtn} hover:!border-[var(--blue)] hover:!text-[var(--blue)]`}
          >
            🖨️ Cetak
          </Link>
          <span
            className={`${actBtn} cursor-default opacity-70 hover:!border-[var(--red)] hover:!text-[var(--red)]`}
            title="Mode demo — hapus tidak aktif"
          >
            🗑️ Hapus
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="pb-3 mb-3 border-b border-line">
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>
              Informasi SBBK
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                Nomor SBBK
              </p>
              <p className="font-mono font-semibold">{sbbk.no}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                Tanggal
              </p>
              <p>{fmtDate(sbbk.tgl)}</p>
            </div>
            {sbbk.anggaran && (
              <div>
                <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                  Anggaran
                </p>
                <span
                  className={`inline-block font-bold ${angBadgeClass(sbbk.anggaran)}`}
                  style={{ padding: "2px 9px", borderRadius: 10, fontSize: "10.5px" }}
                >
                  {sbbk.anggaran}
                </span>
              </div>
            )}
            {sbbk.jenis && (
              <div>
                <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                  Jenis
                </p>
                <p>{sbbk.jenis}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="pb-3 mb-3 border-b border-line">
            <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>
              Penerima
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                Kepada
              </p>
              <p className="font-semibold">{sbbk.kepada}</p>
            </div>
            {sbbk.ket_umum && (
              <div>
                <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                  Keterangan Umum
                </p>
                <p style={{ color: "var(--ink2)" }}>{sbbk.ket_umum}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase font-semibold" style={{ color: "var(--ink3)" }}>
                Total Nilai
              </p>
              <p className="font-mono font-bold text-sm" style={{ color: "#059669" }}>
                Rp {totalValue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Items table */}
      <Card className="p-0 overflow-hidden">
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{
            background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
            color: "#fff",
          }}
        >
          <span aria-hidden>📦</span>
          <p className="text-xs font-bold uppercase tracking-wider">
            Daftar Barang ({sbbk.items.length} item)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["No", "Nama Barang", "Merk", "Qty", "Satuan", "Harga", "Total"].map((h, i) => (
                  <th
                    key={h}
                    className="font-bold uppercase whitespace-nowrap"
                    style={{
                      padding: "10px 14px",
                      background: "#f5f3ff",
                      fontSize: "10.5px",
                      color: "#6d28d9",
                      letterSpacing: "0.4px",
                      borderBottom: "2px solid #ddd6fe",
                      textAlign: i >= 3 && i !== 4 ? "right" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sbbk.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[var(--line)] last:border-b-0 hover:bg-[#faf5ff]"
                >
                  <td style={{ padding: "10px 14px", color: "var(--ink3)" }}>{idx + 1}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{item.nama}</td>
                  <td style={{ padding: "10px 14px", color: "var(--ink3)" }}>{item.merk || "-"}</td>
                  <td className="font-mono text-right" style={{ padding: "10px 14px" }}>
                    {item.qty}
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--ink3)" }}>{item.satuan || "-"}</td>
                  <td className="font-mono text-right" style={{ padding: "10px 14px" }}>
                    {Number(item.harga || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="font-mono font-semibold text-right" style={{ padding: "10px 14px" }}>
                    {Number(item.total || 0).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f5f3ff" }}>
                <td
                  colSpan={6}
                  className="text-right font-bold uppercase"
                  style={{
                    padding: "10px 14px",
                    fontSize: "10.5px",
                    color: "#6d28d9",
                  }}
                >
                  Total Nilai
                </td>
                <td
                  className="font-mono font-bold text-right"
                  style={{ padding: "10px 14px", color: "#059669" }}
                >
                  Rp {totalValue.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
