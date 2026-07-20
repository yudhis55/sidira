import * as React from "react";
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

const FILTER_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "kendaraan", label: "\u{1F697} Kendaraan" },
  { key: "laptop", label: "\u{1F4BB} Laptop/PC" },
  { key: "alat", label: "\u{1F4F1} Alat Penunjang" },
];

function fmtDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function hasKendaraan(p: {
  aset_kendaraan?: { merk?: string; jenis?: string }[] | null;
}): boolean {
  return (p.aset_kendaraan || []).some((r) => !!(r && (r.merk || r.jenis)));
}

function hasLaptop(p: {
  aset_laptop?: { merk?: string; type?: string }[] | null;
}): boolean {
  return (p.aset_laptop || []).some((r) => !!(r && (r.merk || r.type)));
}

function hasAlat(p: {
  aset_alat?: { merk?: string; type?: string }[] | null;
}): boolean {
  return (p.aset_alat || []).some((r) => !!(r && (r.merk || r.type)));
}

function ActBtn({
  href,
  children,
  accent,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      target={href.includes("/print") ? "_blank" : undefined}
      rel={href.includes("/print") ? "noopener noreferrer" : undefined}
      className="inline-flex items-center font-semibold transition-colors hover:!border-[#2563eb] hover:!text-[#2563eb]"
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        border: accent ? "1.5px solid #bfdbfe" : "1.5px solid var(--line)",
        background: "var(--white)",
        color: accent ? "#1e40af" : "var(--ink2)",
        fontSize: 11,
      }}
    >
      {children}
    </Link>
  );
}

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function PaktaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = sp.filter || "all";
  const q = (sp.q || "").trim().toLowerCase();

  const all = getMockPakta();

  let filtered = all;
  if (filter === "kendaraan") filtered = filtered.filter(hasKendaraan);
  else if (filter === "laptop") filtered = filtered.filter(hasLaptop);
  else if (filter === "alat") filtered = filtered.filter(hasAlat);

  if (q) {
    filtered = filtered.filter((p) => {
      if ((p.nama || "").toLowerCase().includes(q)) return true;
      if ((p.nip || "").toLowerCase().includes(q)) return true;
      if ((p.jabatan || "").toLowerCase().includes(q)) return true;
      return false;
    });
  }

  const total = all.length;
  const nKend = all.filter(hasKendaraan).length;
  const nLapt = all.filter(hasLaptop).length;
  const nAlat = all.filter(hasAlat).length;

  return (
    <div className="space-y-4">
      {/* Header — GAS .pakta-header */}
      <div
        className="flex flex-wrap items-center gap-3.5 px-6 py-5 bg-white border border-line"
        style={{
          borderRadius: "var(--r, 10px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="flex items-center justify-center shrink-0 text-[26px]"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
          }}
          aria-hidden
        >
          {"\u{1F4DC}"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-lg font-extrabold" style={{ color: "var(--ink)" }}>
            Pakta Integritas Pemanfaatan BMD
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--ink3)" }}>
            Puskesmas Baruharjo · Barang Milik Daerah
          </div>
        </div>

        <div className="ml-auto flex flex-wrap gap-3">
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
          <div
            className="text-center px-3 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div className="text-base font-black font-mono leading-none text-blue-800">
              {nKend}
            </div>
            <div className="text-[10px] font-semibold mt-1 text-ink3">
              {"\u{1F697}"} Kendaraan
            </div>
          </div>
          <div
            className="text-center px-3 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div className="text-base font-black font-mono leading-none text-blue-800">
              {nLapt}
            </div>
            <div className="text-[10px] font-semibold mt-1 text-ink3">
              {"\u{1F4BB}"} Laptop
            </div>
          </div>
          <div
            className="text-center px-3 py-2"
            style={{ borderRadius: 8, background: "var(--line2)" }}
          >
            <div className="text-base font-black font-mono leading-none text-blue-800">
              {nAlat}
            </div>
            <div className="text-[10px] font-semibold mt-1 text-ink3">
              {"\u{1F4F1}"} Alat
            </div>
          </div>
        </div>
      </div>

      {/* Actions — GAS .pakta-btn-new + ghost */}
      <div className="flex flex-wrap gap-2.5">
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
            {"\uFF0B"} Entri Pakta Integritas Baru
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="text-xs"
          title="Mode demo — export CSV belum aktif"
          type="button"
        >
          {"\u{1F4E5}"} Export CSV
        </Button>
      </div>

      {/* Filter chips + Search — aligned with SBBK pattern, blue theme */}
      <Card className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-[11px] font-bold text-ink3">Filter:</span>
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          const href = `/pakta?filter=${encodeURIComponent(chip.key)}${
            q ? `&q=${encodeURIComponent(q)}` : ""
          }`;
          return (
            <Link
              key={chip.key}
              href={href}
              className={`inline-flex h-7 items-center rounded-full border-[1.5px] px-3 text-[11px] font-bold transition-colors ${
                active
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-line bg-white text-ink3 hover:border-blue-600 hover:text-blue-700"
              }`}
              aria-pressed={active}
            >
              {chip.label}
            </Link>
          );
        })}
        <form className="ml-auto flex items-center" role="search">
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink3"
              aria-hidden
            >
              {"\u{1F50D}"}
            </span>
            <input
              type="search"
              name="q"
              defaultValue={sp.q || ""}
              placeholder={"\u{1F50D} Cari nama/NIP/jabatan..."}
              className="h-8 w-56 rounded-full border-[1.5px] border-line bg-white pl-8 pr-3 text-xs outline-none focus:border-blue-600"
            />
          </div>
          <input type="hidden" name="filter" value={filter} />
          <button
            type="submit"
            className="ml-1 inline-flex h-8 items-center rounded-full border-[1.5px] border-line bg-white px-3 text-[11px] font-bold text-ink3 hover:border-blue-600 hover:text-blue-700"
          >
            Cari
          </button>
        </form>
      </Card>

      {/* Table / Empty — GAS .pakta-list-table */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16" style={{ color: "#93c5fd" }}>
            <div className="text-5xl mb-3" aria-hidden>
              {"\u{1F4DC}"}
            </div>
            <div
              className="text-[15px] font-bold mb-1.5"
              style={{ color: "#2563eb" }}
            >
              {all.length === 0
                ? "Belum ada data Pakta Integritas"
                : "Tidak ada pakta yang cocok"}
            </div>
            <div className="text-xs" style={{ color: "var(--ink3)" }}>
              {all.length === 0
                ? 'Klik "+ Entri Pakta Integritas Baru" untuk menambahkan'
                : "Coba ubah filter atau kata kunci pencarian."}
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pakta, i) => {
                  const asetCount = countAset(pakta);
                  const chips: string[] = [];
                  if (hasKendaraan(pakta)) chips.push("\u{1F697}");
                  if (hasLaptop(pakta)) chips.push("\u{1F4BB}");
                  if (hasAlat(pakta)) chips.push("\u{1F4F1}");

                  return (
                    <tr
                      key={pakta.id}
                      className="group"
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      <td
                        style={{ padding: "10px 14px", verticalAlign: "middle" }}
                      >
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

                      <td
                        style={{ padding: "10px 14px", verticalAlign: "middle" }}
                      >
                        <Link
                          href={`/pakta/${pakta.id}`}
                          className="font-bold hover:underline"
                          style={{ color: "var(--ink)" }}
                        >
                          {pakta.nama || "-"}
                        </Link>
                        <div
                          className="mt-px"
                          style={{ fontSize: "10.5px", color: "var(--ink3)" }}
                        >
                          {pakta.nip ? `NIP. ${pakta.nip}` : "NIP. —"}
                        </div>
                      </td>

                      <td
                        style={{ padding: "10px 14px", verticalAlign: "middle" }}
                      >
                        <div
                          className="font-semibold"
                          style={{ color: "var(--ink)" }}
                        >
                          {pakta.jabatan || "-"}
                        </div>
                      </td>

                      <td
                        style={{ padding: "10px 14px", verticalAlign: "middle" }}
                      >
                        <div style={{ color: "var(--ink2)" }}>
                          {fmtDate(pakta.tgl)}
                        </div>
                        <div
                          className="mt-px"
                          style={{ fontSize: "10.5px", color: "var(--ink3)" }}
                        >
                          {pakta.hari || "-"}
                        </div>
                      </td>

                      <td
                        style={{ padding: "10px 14px", verticalAlign: "middle" }}
                      >
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
                        {chips.length > 0 && (
                          <div
                            className="mt-1 text-[11px] tracking-wide"
                            title="Jenis aset"
                            aria-hidden
                          >
                            {chips.join(" ")}
                          </div>
                        )}
                      </td>

                      <td
                        style={{ padding: "10px 14px", verticalAlign: "middle" }}
                      >
                        <div className="flex items-center flex-wrap gap-1">
                          <ActBtn href={`/pakta/${pakta.id}/edit`}>
                            {"\u270F\uFE0F"} Edit
                          </ActBtn>
                          <ActBtn
                            href={`/pakta/${pakta.id}/print?lampiran=1`}
                            accent
                          >
                            {"\u{1F4CB}"} Lampiran
                          </ActBtn>
                          <ActBtn href={`/pakta/${pakta.id}/print`}>
                            {"\u{1F5A8}\uFE0F"} Cetak
                          </ActBtn>
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
                            title="Mode demo — hapus tidak aktif"
                          >
                            {"\u2715"}
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

      {/* Summary chips */}
      {all.length > 0 && (
        <Card className="px-5 py-4">
          <h3 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink3">
            <span className="text-base" aria-hidden>
              {"\u{1F4CA}"}
            </span>
            Ringkasan Pakta
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
                Ditampilkan
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-blue-700">
                {filtered.length} / {total}
              </div>
              <div className="text-[10px] text-ink3">pakta</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
                Ada Kendaraan
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-blue-800">
                {nKend}
              </div>
              <div className="text-[10px] text-ink3">pemegang</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
                Ada Laptop/PC
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-blue-800">
                {nLapt}
              </div>
              <div className="text-[10px] text-ink3">pemegang</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
                Ada Alat Penunjang
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-blue-800">
                {nAlat}
              </div>
              <div className="text-[10px] text-ink3">pemegang</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
