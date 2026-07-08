import {
  getMockPemegang,
  getMockAsetPemegang,
} from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { RekapTable } from "@/components/rekap/rekap-table";
import { PemegangFormDialog } from "@/components/rekap/pemegang-form-dialog";
import { PageHeader } from "@/components/shared/page-elements";
import Link from "next/link";
import type { AsetPemegang } from "@/types/database";

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

export default async function RekapPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const search = (sp.search || "").trim().toLowerCase();
  const filter = sp.filter || "all";

  // Fetch data from mock
  const pemegangList = getMockPemegang();
  const allAset = getMockAsetPemegang();

  // Group aset by pemegang_id
  const asetGrouped: Record<string, AsetPemegang[]> = {};
  for (const aset of allAset) {
    if (!asetGrouped[aset.pemegang_id]) {
      asetGrouped[aset.pemegang_id] = [];
    }
    asetGrouped[aset.pemegang_id].push(aset);
  }

  // Mock pakta status (all false for mock)
  const paktaStatusMap: Record<string, { hasPakta: boolean; paktaId: string | null }> = {};
  for (const p of pemegangList) {
    paktaStatusMap[p.id] = { hasPakta: false, paktaId: null };
  }

  // Build rows
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

  // Filter: search
  if (search) {
    rows = rows.filter((r) => {
      if ((r.pemegang.nama || "").toLowerCase().includes(search)) return true;
      if ((r.pemegang.jabatan || "").toLowerCase().includes(search)) return true;
      return false;
    });
  }

  // Filter: chips
  if (filter !== "all") {
    rows = rows.filter((r) => {
      if (filter === "PNS") return r.pemegang.status === "PNS";
      if (filter === "PPPK") return r.pemegang.status === "PPPK";
      if (filter === "sudah") return r.hasPakta;
      if (filter === "belum") return !r.hasPakta;
      return true;
    });
  }

  // Stats
  const totalPemegang = pemegangList.length;
  const totalItem = pemegangList.reduce(
    (s, p) => s + (asetGrouped[p.id]?.length || 0),
    0,
  );
  const sudahPakta = pemegangList.filter(
    (p) => paktaStatusMap[p.id]?.hasPakta,
  ).length;
  const belumPakta = totalPemegang - sudahPakta;

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
              <Button>
                <span className="h-4 w-4 mr-1">➕</span>
                Tambah Pemegang
              </Button>
            }
          />
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" disabled={belumPakta === 0}>
          <span className="h-4 w-4 mr-1">📋</span>
          Buat Pakta Semua Belum{belumPakta > 0 ? ` (${belumPakta})` : ""}
        </Button>
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
            <span
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            >
              🔍
            </span>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Cari nama / jabatan..."
              className="h-7 w-56 border-0 bg-transparent pl-7 pr-2 font-mono text-xs ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <input type="hidden" name="filter" value={filter} />
          <Button type="submit" variant="ghost" className="ml-1 h-7">
            Cari
          </Button>
        </form>
      </div>

      {/* Table */}
      {pemegangList.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <span
              className="mb-3 text-4xl text-muted-foreground/50"
              aria-hidden
            >
              👥
            </span>
            <p className="mb-1 font-mono text-sm font-semibold">
              Belum ada data pemegang
            </p>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Tambahkan pemegang inventaris untuk mulai mencatat aset yang
              dipegang.
            </p>
            <PemegangFormDialog
              trigger={
                <Button>
                  <span className="h-4 w-4 mr-1">➕</span>
                  Tambah Pemegang
                </Button>
              }
            />
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <span
              className="mb-3 text-4xl text-muted-foreground/50"
              aria-hidden
            >
              📊
            </span>
            <p className="font-mono text-sm font-semibold">
              Tidak ada data yang cocok
            </p>
            <p className="text-xs text-muted-foreground">
              Ubah filter atau kata kunci pencarian.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-0">
            <RekapTable rows={rows} />
          </div>
        </Card>
      )}
    </div>
  );
}
