import * as React from "react";
import { getMockSbbk } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { Table, type TableColumn } from "@/components/gas/table";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FILTER_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "Puskesmas", label: "\u{1F3E5} Puskesmas" },
  { key: "Posyandu", label: "\u{1F476} Posyandu" },
  { key: "BLUD TH 2025", label: "BLUD TH 2025" },
  { key: "APBD 2025", label: "APBD 2025" },
];

function sumTotalNilai(items: { total: number }[]): number {
  return items.reduce((s, it) => s + (Number(it.total) || 0), 0);
}

function rpFull(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
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

function anggaranBadge(ang: string | undefined): React.ReactNode {
  if (!ang) return <span className="text-ink3">-</span>;
  let cls = "bg-slate-100 text-slate-700 border border-slate-300";
  if (ang.includes("BLUD"))
    cls = "bg-amber-100 text-amber-900 border border-amber-300";
  else if (ang.includes("APBD"))
    cls = "bg-blue-100 text-blue-900 border border-blue-300";
  return (
    <span
      className={`inline-block rounded-[10px] px-2 py-0.5 text-[10.5px] font-bold ${cls}`}
    >
      {ang}
    </span>
  );
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
      if (d.items.some((it) => (it.nama || "").toLowerCase().includes(q)))
        return true;
      return false;
    });
  }

  const totalSbbk = all.length;
  const totalNilaiAll = all.reduce(
    (s, d) => s + sumTotalNilai(d.items),
    0,
  );

  const columns: TableColumn[] = [
    { key: "no_seq", label: "No", width: "50px", align: "center" },
    { key: "tanggal", label: "Tanggal", width: "120px" },
    { key: "no_sbbk", label: "No SBBK", width: "160px" },
    { key: "kepada", label: "Kepada", width: "180px" },
    { key: "jenis", label: "Jenis", width: "100px" },
    { key: "anggaran", label: "Anggaran", width: "130px" },
    { key: "total_nilai", label: "Total Nilai", width: "150px", align: "right" },
    { key: "actions", label: "Actions", width: "260px" },
  ];

  const rows = filtered.map((sbbk, i) => {
    const nilai = sumTotalNilai(sbbk.items);
    return {
      no_seq: (
        <span className="font-mono text-[11px] font-bold text-ink2">
          {i + 1}
        </span>
      ),
      tanggal: (
        <span className="text-[12px] text-ink2">{fmtDateShort(sbbk.tgl)}</span>
      ),
      no_sbbk: (
        <Link href={`/sbbk/${sbbk.id}`}>
          <span className="inline-block rounded bg-violet-100 px-2 py-0.5 font-mono text-[11px] font-extrabold text-violet-700">
            {sbbk.no || "-"}
          </span>
        </Link>
      ),
      kepada: (
        <span className="font-semibold text-ink">{sbbk.kepada || "-"}</span>
      ),
      jenis: (
        <span className="text-[12px] text-ink2">{sbbk.jenis || "-"}</span>
      ),
      anggaran: anggaranBadge(sbbk.anggaran),
      total_nilai: (
        <span className="font-mono font-bold text-emerald-600">
          {rpFull(nilai)}
        </span>
      ),
      actions: (
        <div className="flex items-center gap-1">
          <Link href={`/sbbk/${sbbk.id}`}>
            <Button variant="ghost" size="sm">
              {"\u{1F4C4}"} Detail
            </Button>
          </Link>
          <Link
            href={`/sbbk/${sbbk.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              {"\u{1F5A8}\uFE0F"} Print
            </Button>
          </Link>
          <Link href={`/sbbk/${sbbk.id}/edit`}>
            <Button variant="ghost" size="sm">
              {"\u270F\uFE0F"} Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red hover:bg-red-50"
          >
            {"\u{1F5D1}\uFE0F"} Hapus
          </Button>
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      {/* ── Header + Summary Stats ── */}
      <Card className="flex flex-wrap items-start gap-4 p-5">
        <div className="flex size-12 items-center justify-center rounded-lg bg-violet-100 text-2xl">
          {"\u{1F4CB}"}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-lg font-bold text-ink">
            Surat Bukti Barang Keluar (SBBK)
          </h1>
          <p className="text-xs text-ink3">
            Puskesmas Baruharjo &middot; Pencatatan barang keluar dari gudang
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="font-mono text-xl font-bold text-violet-700">
              {totalSbbk}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total SBBK
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-emerald-600">
              {rpFull(totalNilaiAll)}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total Nilai
            </div>
          </div>
        </div>
      </Card>

      {/* ── Toolbar: Buat SBBK Baru at top right ── */}
      <div className="flex items-center justify-end gap-2">
        <Link href="/sbbk/new">
          <Button variant="primary" size="default">
            {"\uFF0B"} Buat SBBK Baru
          </Button>
        </Link>
      </div>

      {/* ── Filter chips + Search ── */}
      <Card className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-[11px] font-bold text-ink3">Filter:</span>
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          const href = `/sbbk?filter=${encodeURIComponent(chip.key)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={chip.key}
              href={href}
              className={`inline-flex h-7 items-center rounded-full border-[1.5px] px-3 text-[11px] font-bold transition-colors ${
                active
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-line bg-white text-ink3 hover:border-violet-600 hover:text-violet-600"
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
              placeholder="Cari no/kepada/item nama..."
              className="h-8 w-52 rounded-full border-[1.5px] border-line bg-white pl-8 pr-3 text-xs outline-none focus:border-violet-600"
            />
          </div>
          <input type="hidden" name="filter" value={filter} />
          <button
            type="submit"
            className="ml-1 inline-flex h-8 items-center rounded-full border-[1.5px] border-line bg-white px-3 text-[11px] font-bold text-ink3 hover:border-violet-600 hover:text-violet-600"
          >
            Cari
          </button>
        </form>
      </Card>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <span className="mb-3 text-4xl">{"\u{1F4CB}"}</span>
          <p className="mb-1 font-mono text-sm font-bold text-ink">
            Belum ada data SBBK
          </p>
          <p className="text-xs text-ink3">
            {all.length === 0
              ? 'Klik "Buat SBBK Baru" untuk menambahkan surat bukti barang keluar'
              : "Tidak ada SBBK yang cocok dengan filter/pencarian."}
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <Table
            columns={columns}
            rows={rows}
            striped
            emptyMessage="Tidak ada data SBBK"
          />
        </Card>
      )}

      {/* ── Rekap ── */}
      <Card className="px-5 py-4">
        <h3 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink3">
          <span className="text-base">{"\u{1F4CA}"}</span>
          Rekap SBBK Tahun 2025
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total Nilai Seluruh
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-emerald-600">
              {rpFull(totalNilaiAll)}
            </div>
            <div className="text-[10px] text-ink3">
              {totalSbbk} surat SBBK
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              BLUD
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-amber-700">
              {rpFull(
                all
                  .filter((d) =>
                    (d.anggaran || "").toUpperCase().includes("BLUD"),
                  )
                  .reduce((s, d) => s + sumTotalNilai(d.items), 0),
              )}
            </div>
            <div className="text-[10px] text-ink3">Sumber BLUD</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              APBD
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-blue-700">
              {rpFull(
                all
                  .filter((d) =>
                    (d.anggaran || "").toUpperCase().includes("APBD"),
                  )
                  .reduce((s, d) => s + sumTotalNilai(d.items), 0),
              )}
            </div>
            <div className="text-[10px] text-ink3">Sumber APBD</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Ke Puskesmas / Posyandu
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-teal">
              {all.filter((d) => d.jenis !== "Posyandu").length} pusk /{" "}
              {all.filter((d) => d.jenis === "Posyandu").length} pos
            </div>
            <div className="text-[10px] text-ink3">Distribusi tujuan</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
