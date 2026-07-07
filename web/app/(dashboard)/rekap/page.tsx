import {
  getPemegangList,
  getAllAsetGrouped,
  getPaktaStatusMap,
  buatPaktaSemuaBelum,
} from "@/lib/auth/rekap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RekapTable } from "@/components/rekap/rekap-table";
import { PemegangFormDialog } from "@/components/rekap/pemegang-form-dialog";
import { PageHeader } from "@/components/shared/page-elements";
import { BarChart3, Plus, ScrollText, Search, Users } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ search?: string; filter?: string }>;
}

const FILTER_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "PNS", label: "PNS" },
  { key: "PPPK", label: "PPPK" },
  { key: "sudah", label: "✅ Sudah Pakta" },
  { key: "belum", label: "⚠ Belum Pakta" },
] as const;

/** Server action: buat pakta untuk semua pemegang yang belum. */
async function handleBuatSemuaBelum() {
  "use server";
  await buatPaktaSemuaBelum();
  revalidatePath("/rekap");
  redirect("/rekap");
}

export default async function RekapPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = (sp.search || "").trim().toLowerCase();
  const filter = sp.filter || "all";

  // Fetch semua data sekali (3 query paralel)
  const [pemegangList, asetGrouped, paktaStatusMap] = await Promise.all([
    getPemegangList(),
    getAllAsetGrouped(),
    getPaktaStatusMap(),
  ]);

  // Bangun baris dengan aset + status pakta
  let rows = pemegangList.map((pemegang) => {
    const asetList = asetGrouped[pemegang.id] || [];
    const status = paktaStatusMap[pemegang.id] || {
      hasPakta: false,
      paktaId: null,
    };
    return {
      pemegang,
      asetList,
      hasPakta: status.hasPakta,
      paktaId: status.paktaId,
    };
  });

  // Filter: search (nama / jabatan)
  if (search) {
    rows = rows.filter((r) => {
      if ((r.pemegang.nama || "").toLowerCase().includes(search)) return true;
      if ((r.pemegang.jabatan || "").toLowerCase().includes(search)) return true;
      return false;
    });
  }

  // Filter: chips (all / PNS / PPPK / sudah / belum)
  if (filter !== "all") {
    rows = rows.filter((r) => {
      if (filter === "PNS") return r.pemegang.status === "PNS";
      if (filter === "PPPK") return r.pemegang.status === "PPPK";
      if (filter === "sudah") return r.hasPakta;
      if (filter === "belum") return !r.hasPakta;
      return true;
    });
  }

  // Stats (atas SEMUA pemegang, buat hasil filter)
  const totalPemegang = pemegangList.length;
  const totalItem = pemegangList.reduce(
    (s, p) => s + (asetGrouped[p.id]?.length || 0),
    0,
  );
  const sudahPakta = pemegangList.filter(
    (p) => paktaStatusMap[p.id]?.hasPakta,
  ).length;
  const belumPakta = totalPemegang - sudahPakta;

  // Wrapper server action untuk RekapTable (client)

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📊"
        title={`Rekap Pemegang Inventaris ${new Date().getFullYear()}`}
        subtitle="Puskesmas Baruharjo · Peralatan Mesin & Rumah Dinas"
        stats={[
          { value: totalPemegang, label: "Pemegang", tone: "teal" },
          { value: totalItem, label: "Item", tone: "blue" },
          { value: sudahPakta, label: "Pakta Ada", tone: "teal" },
          { value: belumPakta, label: "Belum", tone: "red" },
        ]}
        actions={
          <PemegangFormDialog
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Tambah Pemegang
              </Button>
            }
          />
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <form action={handleBuatSemuaBelum}>
          <Button type="submit" size="sm" variant="outline" disabled={belumPakta === 0}>
            <ScrollText className="h-4 w-4 mr-1" />
            Buat Pakta Semua Belum{belumPakta > 0 ? ` (${belumPakta})` : ""}
          </Button>
        </form>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          const href = `/rekap?filter=${chip.key}${
            search ? `&search=${encodeURIComponent(search)}` : ""
          }`;
          return (
            <Link
              key={chip.key}
              href={href}
              className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                active
                  ? "bg-[var(--teal)] text-white"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
        <form className="ml-auto flex items-center" role="search">
          <div className="relative">
            <Search
              className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Cari nama / jabatan..."
              className="h-7 w-56 border-0 bg-transparent pl-7 pr-2 font-mono text-xs ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <input type="hidden" name="filter" value={filter} />
          <Button type="submit" size="sm" variant="outline" className="ml-1 h-7">
            Cari
          </Button>
        </form>
      </div>

      {/* Tabel */}
      {pemegangList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users
              className="mb-3 h-10 w-10 text-muted-foreground/50"
              aria-hidden
            />
            <p className="mb-1 font-mono text-sm font-semibold">
              Belum ada data pemegang
            </p>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Tambahkan pemegang inventaris untuk mulai mencatat aset yang
              dipegang.
            </p>
            <PemegangFormDialog
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Pemegang
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3
              className="mb-3 h-10 w-10 text-muted-foreground/50"
              aria-hidden
            />
            <p className="font-mono text-sm font-semibold">
              Tidak ada data yang cocok
            </p>
            <p className="text-xs text-muted-foreground">
              Ubah filter atau kata kunci pencarian.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <RekapTable rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
