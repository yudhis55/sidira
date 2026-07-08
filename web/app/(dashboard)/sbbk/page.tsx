import { getMockSbbk } from "@/lib/mock-data";
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
  { key: "Puskesmas", label: "\u{1F3E5} Puskesmas" },
  { key: "Posyandu", label: "\u{1F476} Posyandu" },
  { key: "BLUD TH 2025", label: "BLUD" },
  { key: "APBD 2025", label: "APBD" },
];

function totalNilai(items: { total: number }[]): number {
  return items.reduce((s, it) => s + (Number(it.total) || 0), 0);
}

function rpShort(n: number): string {
  if (n >= 1_000_000_000) return "Rp " + (n / 1_000_000_000).toFixed(1) + " M";
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + " Jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + " rb";
  return "Rp " + n.toLocaleString("id-ID");
}

function rpFull(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function fmtDateShort(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function anggaranBadge(ang: string | undefined): { text: string; cls: string } {
  if (!ang) return { text: "-", cls: "" };
  if (ang.includes("BLUD")) return { text: ang, cls: "bg-amber-100 text-amber-900 border border-amber-300" };
  if (ang.includes("APBD")) return { text: ang, cls: "bg-blue-100 text-blue-900 border border-blue-300" };
  return { text: ang, cls: "bg-slate-100 text-slate-700 border border-slate-300" };
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
        (d.anggaran || "").toLowerCase() === filter.toLowerCase()
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
  const totalNilaiAll = all.reduce((s, d) => s + totalNilai(d.items), 0);

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start gap-4 rounded-lg border border-line bg-white p-5">
        <div className="flex size-12 items-center justify-center rounded-lg bg-violet-100 text-2xl">
          {"\u{1F4CB}"}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-lg font-bold text-ink">
            Surat Bukti Barang Keluar (SBBK)
          </h1>
          <p className="text-xs text-ink3">
            Puskesmas Baruharjo · Pencatatan barang keluar dari gudang
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="font-mono text-xl font-bold text-violet-700">{totalSbbk}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total SBBK
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-xl font-bold text-blue-700">{totalItem}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total Item
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-emerald-600">
              {rpShort(totalNilaiAll)}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total Nilai
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/sbbk/new">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all hover:brightness-110 hover:-translate-y-px"
          >
            {"\uFF0B"} Entri SBBK Baru
          </button>
        </Link>
        <Link href="/sbbk/export">
          <Button variant="ghost" size="sm">
            {"\u{1F4E5}"} Export CSV
          </Button>
        </Link>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white px-4 py-3">
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
              placeholder="Cari no/tujuan/barang..."
              className="h-8 w-48 rounded-full border-[1.5px] border-line bg-white pl-8 pr-3 text-xs font-normal outline-none focus:border-violet-600"
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
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <span className="mb-3 text-4xl">{"\u{1F4CB}"}</span>
          <p className="mb-1 font-mono text-sm font-bold text-ink">
            Belum ada data SBBK
          </p>
          <p className="text-xs text-ink3">
            {all.length === 0
              ? 'Klik "+ Entri SBBK Baru" untuk menambahkan surat bukti barang keluar'
              : "Tidak ada SBBK yang cocok dengan filter/pencarian."}
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b-2 border-violet-200 bg-violet-50">
                  <th className="min-w-[110px] whitespace-nowrap px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-violet-700">
                    No. SBBK
                  </th>
                  <th className="min-w-[180px] whitespace-nowrap px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-violet-700">
                    Ditujukan Kepada
                  </th>
                  <th className="min-w-[110px] whitespace-nowrap px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-violet-700">
                    Anggaran
                  </th>
                  <th className="min-w-[80px] whitespace-nowrap px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-violet-700">
                    Item
                  </th>
                  <th className="min-w-[130px] whitespace-nowrap px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-violet-700">
                    Total Nilai
                  </th>
                  <th className="whitespace-nowrap px-3.5 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-violet-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sbbk) => {
                  const nilai = totalNilai(sbbk.items);
                  const badge = anggaranBadge(sbbk.anggaran);
                  return (
                    <tr
                      key={sbbk.id}
                      className="border-b border-line last:border-b-0 hover:bg-violet-50/50"
                    >
                      {/* No. SBBK */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <Link href={`/sbbk/${sbbk.id}`}>
                          <span className="inline-block rounded-lg bg-violet-100 px-2 py-0.5 font-mono text-[11px] font-extrabold text-violet-700">
                            {sbbk.no || "-"}
                          </span>
                        </Link>
                      </td>

                      {/* Kepada + sub */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="font-bold text-ink">{sbbk.kepada || "-"}</div>
                        <div className="mt-0.5 text-[10.5px] text-ink3">
                          {sbbk.jenis || ""} · {fmtDateShort(sbbk.tgl)}
                        </div>
                      </td>

                      {/* Anggaran badge */}
                      <td className="px-3.5 py-2.5 align-middle">
                        {badge.text !== "-" ? (
                          <span
                            className={`inline-block rounded-[10px] px-2 py-0.5 text-[10.5px] font-bold ${badge.cls}`}
                          >
                            {badge.text}
                          </span>
                        ) : (
                          <span className="text-ink3">-</span>
                        )}
                      </td>

                      {/* Item count */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                          {sbbk.items.length} item
                        </span>
                      </td>

                      {/* Nilai */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <span className="font-mono font-bold text-emerald-600">
                          {rpFull(nilai)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/sbbk/${sbbk.id}/edit`}
                            className="inline-flex items-center rounded-md border-[1.5px] border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink2 transition-colors hover:border-violet-600 hover:text-violet-600"
                            title="Edit"
                          >
                            {"\u{270F}\uFE0F"} Edit
                          </Link>
                          <Link
                            href={`/sbbk/${sbbk.id}/print`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-md border-[1.5px] border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink2 transition-colors hover:border-blue-500 hover:text-blue-500"
                            title="Cetak"
                          >
                            {"\u{1F5A8}\uFE0F"} Cetak
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border-[1.5px] border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink2 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                            title="Hapus"
                          >
                            {"\u2715"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Rekap ── */}
      <Card className="px-5 py-4">
        <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-ink3">
          Rekap SBBK
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Total Nilai Seluruh
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-emerald-600">
              {rpFull(totalNilaiAll)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              BLUD
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-amber-700">
              {rpFull(
                all
                  .filter((d) => (d.anggaran || "").toUpperCase().includes("BLUD"))
                  .reduce((s, d) => s + totalNilai(d.items), 0)
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              APBD
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-blue-700">
              {rpFull(
                all
                  .filter((d) => (d.anggaran || "").toUpperCase().includes("APBD"))
                  .reduce((s, d) => s + totalNilai(d.items), 0)
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Distribusi
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-violet-700">
              {all.filter((d) => (d.jenis || "").toLowerCase() === "puskesmas").length} Pusk ·{" "}
              {all.filter((d) => (d.jenis || "").toLowerCase() === "posyandu").length} Pos
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
