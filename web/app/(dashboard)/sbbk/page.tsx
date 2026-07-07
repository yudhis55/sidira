import { getSbbkListFull } from "@/lib/auth/sbbk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SbbkCsvExport } from "@/components/sbbk/sbbk-csv-export";
import { PageHeader } from "@/components/shared/page-elements";
import { Plus, FileText, Printer, Pencil, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteSbbk } from "@/lib/auth/sbbk";

export const dynamic = "force-dynamic";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const FILTER_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "Puskesmas", label: "🏥 Puskesmas" },
  { key: "Posyandu", label: "👶 Posyandu" },
  { key: "BLUD TH 2025", label: "BLUD TH 2025" },
  { key: "APBD 2025", label: "APBD 2025" },
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

function fmtDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteSbbk(id);
  revalidatePath("/sbbk");
  redirect("/sbbk");
}

export default async function SbbkPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = sp.filter || "all";
  const q = (sp.q || "").trim().toLowerCase();

  const all = await getSbbkListFull();

  // Filter: matches jenis OR anggaran (case-insensitive, exact-ish on known chips)
  let filtered = all;
  if (filter !== "all") {
    filtered = filtered.filter(
      (d) =>
        (d.jenis || "").toLowerCase() === filter.toLowerCase() ||
        (d.anggaran || "").toLowerCase() === filter.toLowerCase()
    );
  }

  // Search: no / kepada / any item nama
  if (q) {
    filtered = filtered.filter((d) => {
      if ((d.no || "").toLowerCase().includes(q)) return true;
      if ((d.kepada || "").toLowerCase().includes(q)) return true;
      if (d.items.some((it) => (it.nama || "").toLowerCase().includes(q))) return true;
      return false;
    });
  }

  // Stats (over ALL sbbk, not filtered)
  const totalSbbk = all.length;
  const totalItem = all.reduce((s, d) => s + d.items.length, 0);
  const totalNilaiAll = all.reduce((s, d) => s + totalNilai(d.items), 0);

  // Rekap
  const bludTotal = all
    .filter((d) => (d.anggaran || "").toUpperCase().includes("BLUD"))
    .reduce((s, d) => s + totalNilai(d.items), 0);
  const apbdTotal = all
    .filter((d) => (d.anggaran || "").toUpperCase().includes("APBD"))
    .reduce((s, d) => s + totalNilai(d.items), 0);
  const puskCount = all.filter((d) => (d.jenis || "").toLowerCase() === "puskesmas").length;
  const posCount = all.filter((d) => (d.jenis || "").toLowerCase() === "posyandu").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📋"
        title="Surat Bukti Barang Keluar (SBBK)"
        subtitle="Puskesmas Baruharjo · Pencatatan barang keluar dari gudang"
        stats={[
          { value: totalSbbk, label: "Total SBBK", tone: "teal" },
          { value: totalItem, label: "Total Item", tone: "blue" },
          { value: rpShort(totalNilaiAll), label: "Total Nilai", tone: "amber" },
        ]}
        actions={
          <Link href="/sbbk/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Entri SBBK Baru
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <SbbkCsvExport />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          return (
            <Link
              key={chip.key}
              href={`/sbbk?filter=${chip.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                active
                  ? "bg-[var(--teal)] text-white"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              {chip.label}
            </Link>
          );
        })}
        <form className="ml-auto flex items-center" role="search">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari no / tujuan / barang..."
              className="h-7 w-56 border-0 bg-transparent pl-7 pr-2 font-mono text-xs ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <input type="hidden" name="filter" value={filter} />
          <Button type="submit" size="sm" variant="outline" className="ml-1 h-7">
            Cari
          </Button>
        </form>
      </div>

      {/* Rekap card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">Rekap SBBK</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Total Nilai Seluruh</div>
            <div className="font-mono text-sm font-bold">
              Rp {totalNilaiAll.toLocaleString("id-ID")}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">BLUD</div>
            <div className="font-mono text-sm font-bold">
              Rp {bludTotal.toLocaleString("id-ID")}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">APBD</div>
            <div className="font-mono text-sm font-bold">
              Rp {apbdTotal.toLocaleString("id-ID")}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Distribusi</div>
            <div className="font-mono text-sm font-bold">
              {puskCount} Pusk · {posCount} Pos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden />
            <p className="font-mono text-sm font-semibold mb-1">Belum ada SBBK</p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              {all.length === 0
                ? "Buat SBBK pertama untuk mencatat pengeluaran barang."
                : "Tidak ada SBBK yang cocok dengan filter/pencarian."}
            </p>
            {all.length === 0 && (
              <Link href="/sbbk/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Entri SBBK Baru
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">No. SBBK</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Ditujukan Kepada</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Anggaran</th>
                    <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">Item</th>
                    <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">Total Nilai</th>
                    <th className="h-9 px-2 text-center font-mono font-medium whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sbbk) => {
                    const nilai = totalNilai(sbbk.items);
                    return (
                      <tr key={sbbk.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="px-2 py-2 align-top">
                          <Link
                            href={`/sbbk/${sbbk.id}`}
                            className="font-mono font-medium hover:underline"
                          >
                            {sbbk.no || "-"}
                          </Link>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="font-medium">{sbbk.kepada || "-"}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {sbbk.jenis && <span>{sbbk.jenis}</span>}
                            {sbbk.jenis && <span> · </span>}
                            <span>{fmtDate(sbbk.tgl)}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top">
                          {sbbk.anggaran ? (
                            <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] ring-1 ring-border">
                              {sbbk.anggaran}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right align-top font-mono">
                          {sbbk.items.length}
                        </td>
                        <td className="px-2 py-2 text-right align-top font-mono font-medium">
                          Rp {nilai.toLocaleString("id-ID")}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`/sbbk/${sbbk.id}/edit`}
                              className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3" aria-hidden />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <Link
                              href={`/sbbk/${sbbk.id}/print`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                              title="Cetak"
                            >
                              <Printer className="h-3 w-3" aria-hidden />
                              <span className="sr-only">Cetak</span>
                            </Link>
                            <form action={handleDelete}>
                              <input type="hidden" name="id" value={sbbk.id} />
                              <button
                                type="submit"
                                className="inline-flex h-6 w-6 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/20"
                                title="Hapus"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden />
                                <span className="sr-only">Hapus</span>
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
