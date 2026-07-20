import * as React from "react";
import { getMockSbbk } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FILTER_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "Puskesmas", label: "🏥 Puskesmas" },
  { key: "Posyandu", label: "👶 Posyandu" },
  { key: "BLUD TH 2025", label: "BLUD" },
  { key: "APBD 2025", label: "APBD" },
];

function sumTotalNilai(items: { total: number }[]): number {
  return items.reduce((s, it) => s + (Number(it.total) || 0), 0);
}

function rpFull(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function rpShort(n: number): string {
  if (n >= 1_000_000_000) return "Rp " + (n / 1_000_000_000).toFixed(1) + " M";
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + " Jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + " Rb";
  return "Rp " + n;
}

function fmtDateShort(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function angBadgeClass(ang: string | undefined): string {
  if (!ang) return "";
  if (ang.includes("BLUD")) return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
  if (ang.includes("APBD")) return "bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]";
  return "bg-slate-100 text-slate-700 border border-slate-300";
}

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function SbbkPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = sp.filter || "all";
  const q = (sp.q || "").trim().toLowerCase();

  const all = getMockSbbk();

  let filtered = all;
  if (filter !== "all") {
    filtered = filtered.filter(
      (d) =>
        (d.jenis || "").toLowerCase() === filter.toLowerCase() ||
        (d.anggaran || "").toLowerCase() === filter.toLowerCase(),
    );
  }

  if (q) {
    filtered = filtered.filter((d) => {
      if ((d.no || "").toLowerCase().includes(q)) return true;
      if ((d.kepada || "").toLowerCase().includes(q)) return true;
      if (d.items.some((it) => (it.nama || "").toLowerCase().includes(q))) return true;
      return false;
    });
  }

  const totalSbbk = all.length;
  const totalItem = all.reduce((s, d) => s + d.items.length, 0);
  const totalNilaiAll = all.reduce((s, d) => s + sumTotalNilai(d.items), 0);
  const bludNilai = all
    .filter((d) => (d.anggaran || "").toUpperCase().includes("BLUD"))
    .reduce((s, d) => s + sumTotalNilai(d.items), 0);
  const apbdNilai = all
    .filter((d) => (d.anggaran || "").toUpperCase().includes("APBD"))
    .reduce((s, d) => s + sumTotalNilai(d.items), 0);
  const puskCount = all.filter((d) => (d.jenis || "") === "Puskesmas").length;
  const posCount = all.filter((d) => (d.jenis || "") === "Posyandu").length;

  const actBtn =
    "inline-flex items-center font-semibold transition-colors px-2.5 py-1 text-[11px] border-[1.5px] border-[var(--line)] bg-white text-[var(--ink2)] rounded-md hover:!border-[#7c3aed] hover:!text-[#7c3aed]";

  return (
    <div className="space-y-5">
      {/* ── Header — GAS .sbbk-header ── */}
      <div
        className="flex flex-wrap items-center gap-3.5 px-6 py-5 bg-white border border-line"
        style={{ borderRadius: "var(--r, 10px)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div
          className="flex items-center justify-center shrink-0 text-[26px]"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
          }}
          aria-hidden
        >
          📋
        </div>

        <div className="min-w-0">
          <div className="text-lg font-extrabold" style={{ color: "var(--ink)" }}>
            Surat Bukti Barang Keluar (SBBK)
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Puskesmas Baruharjo · Pencatatan barang keluar dari gudang
          </div>
        </div>

        <div className="ml-auto flex flex-wrap gap-3">
          <div
            className="text-center px-4 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div className="text-xl font-black font-mono leading-none" style={{ color: "#7c3aed" }}>
              {totalSbbk}
            </div>
            <div className="text-[10px] font-semibold mt-1" style={{ color: "var(--ink3)" }}>
              Total SBBK
            </div>
          </div>
          <div
            className="text-center px-4 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div className="text-xl font-black font-mono leading-none" style={{ color: "#7c3aed" }}>
              {totalItem}
            </div>
            <div className="text-[10px] font-semibold mt-1" style={{ color: "var(--ink3)" }}>
              Total Item
            </div>
          </div>
          <div
            className="text-center px-4 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div
              className="font-black font-mono leading-none"
              style={{ color: "#7c3aed", fontSize: 14 }}
            >
              {rpShort(totalNilaiAll)}
            </div>
            <div className="text-[10px] font-semibold mt-1" style={{ color: "var(--ink3)" }}>
              Total Nilai
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar — GAS .sbbk-toolbar ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Link href="/sbbk/new">
          <Button
            className="text-[13px] font-bold px-5 py-2.5 text-white"
            style={{
              borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              border: "none",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}
          >
            ＋ Entri SBBK Baru
          </Button>
        </Link>
        <Button variant="ghost" className="text-xs" title="Mode demo — export tidak aktif">
          📥 Export CSV
        </Button>
      </div>

      {/* ── Filter chips + Search — GAS .sbbk-filter-bar ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white border border-line"
        style={{ borderRadius: "var(--r, 10px)" }}
      >
        <span className="text-[11px] font-bold" style={{ color: "var(--ink3)" }}>
          Filter:
        </span>
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          const href = `/sbbk?filter=${encodeURIComponent(chip.key)}${
            q ? `&q=${encodeURIComponent(q)}` : ""
          }`;
          return (
            <Link
              key={chip.key}
              href={href}
              className="inline-flex items-center px-3 py-1 text-[11px] font-bold transition-colors"
              style={{
                borderRadius: 20,
                border: active ? "1.5px solid #7c3aed" : "1.5px solid var(--line)",
                background: active ? "#7c3aed" : "#fff",
                color: active ? "#fff" : "var(--ink3)",
              }}
              aria-pressed={active}
            >
              {chip.label}
            </Link>
          );
        })}
        <form className="ml-auto flex items-center gap-1" role="search">
          <input
            type="search"
            name="q"
            defaultValue={sp.q || ""}
            placeholder="🔍 Cari no/tujuan/barang..."
            className="h-8 w-[180px] px-3 text-xs outline-none bg-white"
            style={{
              borderRadius: 20,
              border: "1.5px solid var(--line)",
            }}
          />
          <input type="hidden" name="filter" value={filter} />
          <button
            type="submit"
            className="inline-flex h-8 items-center px-3 text-[11px] font-bold bg-white"
            style={{
              borderRadius: 20,
              border: "1.5px solid var(--line)",
              color: "var(--ink3)",
            }}
          >
            Cari
          </button>
        </form>
      </div>

      {/* ── Table / Empty — GAS .sbbk-list-wrap ── */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16" style={{ color: "#a78bfa" }}>
            <div className="text-5xl mb-3" aria-hidden>
              📋
            </div>
            <div className="text-[15px] font-bold mb-1.5" style={{ color: "#6d28d9" }}>
              Belum ada data SBBK
            </div>
            <div className="text-xs" style={{ color: "var(--ink3)" }}>
              {all.length === 0
                ? 'Klik "+ Entri SBBK Baru" untuk menambahkan surat bukti barang keluar'
                : "Tidak ada SBBK yang cocok dengan filter/pencarian."}
            </div>
          </div>
        </Card>
      ) : (
        <Card
          className="p-0 overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{ borderCollapse: "collapse", fontSize: "12.5px" }}
            >
              <thead>
                <tr>
                  {[
                    { h: "No. SBBK", min: 110 },
                    { h: "Ditujukan Kepada", min: 180 },
                    { h: "Anggaran", min: 110 },
                    { h: "Item", min: 80 },
                    { h: "Total Nilai", min: 130 },
                    { h: "Aksi", min: 170 },
                  ].map((col) => (
                    <th
                      key={col.h}
                      className="font-bold uppercase whitespace-nowrap text-left"
                      style={{
                        padding: "10px 14px",
                        background: "#f5f3ff",
                        fontSize: "10.5px",
                        color: "#6d28d9",
                        letterSpacing: "0.4px",
                        borderBottom: "2px solid #ddd6fe",
                        minWidth: col.min,
                      }}
                    >
                      {col.h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sbbk) => {
                  const nilai = sumTotalNilai(sbbk.items);
                  return (
                    <tr
                      key={sbbk.id}
                      className="border-b border-[var(--line)] last:border-b-0 hover:[&>td]:bg-[#faf5ff]"
                    >
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <Link href={`/sbbk/${sbbk.id}`}>
                          <span
                            className="inline-block font-mono font-extrabold"
                            style={{
                              padding: "2px 8px",
                              borderRadius: 8,
                              background: "#ede9fe",
                              color: "#6d28d9",
                              fontSize: 11,
                            }}
                          >
                            {sbbk.no || "-"}
                          </span>
                        </Link>
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <div className="font-bold" style={{ color: "var(--ink)" }}>
                          {sbbk.kepada || "-"}
                        </div>
                        <div className="mt-px" style={{ fontSize: "10.5px", color: "var(--ink3)" }}>
                          {sbbk.jenis || ""} · {fmtDateShort(sbbk.tgl)}
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        {sbbk.anggaran ? (
                          <span
                            className={`inline-block font-bold ${angBadgeClass(sbbk.anggaran)}`}
                            style={{
                              padding: "2px 9px",
                              borderRadius: 10,
                              fontSize: "10.5px",
                            }}
                          >
                            {sbbk.anggaran}
                          </span>
                        ) : (
                          <span style={{ color: "var(--ink3)" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <span
                          className="inline-block font-bold"
                          style={{
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: "#ede9fe",
                            color: "#6d28d9",
                            fontSize: 11,
                          }}
                        >
                          {sbbk.items.length} item
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <span
                          className="font-mono font-bold"
                          style={{ color: "#059669" }}
                        >
                          {rpFull(nilai)}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                        <div className="flex items-center flex-wrap gap-1">
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
                            className={`${actBtn} cursor-default opacity-70`}
                            title="Mode demo — hapus tidak aktif"
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

      {/* ── Rekap — GAS .sbbk-rekap-card ── */}
      <div
        className="overflow-hidden bg-white border border-line"
        style={{ borderRadius: "var(--r, 10px)" }}
      >
        <div
          className="flex items-center gap-2.5 px-5 py-3"
          style={{
            background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
            color: "#fff",
          }}
        >
          <span className="text-base" aria-hidden>
            📊
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Rekap SBBK Tahun 2025
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
          {[
            {
              label: "Total Nilai Seluruh",
              val: rpShort(totalNilaiAll),
              sub: `${totalSbbk} surat SBBK`,
              color: "#059669",
            },
            {
              label: "BLUD",
              val: rpShort(bludNilai),
              sub: "Sumber BLUD",
              color: "#92400e",
            },
            {
              label: "APBD",
              val: rpShort(apbdNilai),
              sub: "Sumber APBD",
              color: "#1e40af",
            },
            {
              label: "Ke Puskesmas / Posyandu",
              val: `${puskCount} pusk / ${posCount} pos`,
              sub: "Distribusi tujuan",
              color: "var(--teal, #0d9488)",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="px-5 py-4"
              style={{
                borderRight: i % 4 !== 3 ? "1px solid var(--line)" : undefined,
                borderTop: "1px solid var(--line)",
              }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--ink3)" }}
              >
                {item.label}
              </div>
              <div
                className="mt-1 font-mono text-sm font-bold"
                style={{ color: item.color }}
              >
                {item.val}
              </div>
              <div className="text-[10px]" style={{ color: "var(--ink3)" }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
