import { Plus, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageHeader,
  LegendBar,
  StatChip,
  CategoryBadge,
} from "@/components/shared/page-elements";
import { PrintButton } from "@/components/shared/print-button";
import { InventarisCsvExport, UsulanRekapCsvExport } from "@/components/inventaris/csv-export";
import { getRoomSummaries, getInventarisStats } from "@/lib/auth/inventaris-stats";

export const dynamic = "force-dynamic";

export default async function InventarisPage() {
  const [summaries, stats] = await Promise.all([
    getRoomSummaries(),
    getInventarisStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📦"
        title="Inventaris Ruangan"
        subtitle="Puskesmas Baruharjo · Pemeliharaan aset per ruangan"
        stats={[
          { value: stats.totalRooms, label: "Total Ruangan", tone: "teal" },
          { value: stats.perluPerhatian, label: "Perlu Perhatian", tone: "red" },
          { value: stats.usulanAktif, label: "Usulan Aktif", tone: "amber" },
        ]}
        actions={
          <Link href="/inventaris/new">
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Ruangan
            </Button>
          </Link>
        }
      />

      {/* Global stats bar — mirrors GAS .gstats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatChip icon="📦" value={stats.totalItem} label="Total Item" tone="teal" />
        <StatChip icon="🩺" value={stats.alkes} label="Alat Kesehatan" tone="red" />
        <StatChip icon="🪑" value={stats.meubelair} label="Meubelair" tone="amber" />
        <StatChip icon="💻" value={stats.elektronik} label="Elektronik" tone="blue" />
        <StatChip icon="🔧" value={stats.lainnya} label="Lainnya" tone="slate" />
        <StatChip icon="⚠️" value={stats.perluPerhatian} label="Perlu Perhatian" tone="red" />
      </div>

      <LegendBar />

      {/* Page-actions toolbar — mirrors GAS .page-actions */}
      <div className="flex flex-wrap items-center gap-2">
        <InventarisCsvExport />
        <UsulanRekapCsvExport />
        <PrintButton label="🖨️ Cetak" />
      </div>

      {summaries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 size-12 text-muted-foreground/50" />
            <CardTitle className="mb-2 text-xl">Belum ada ruangan</CardTitle>
            <CardDescription className="mb-4 text-center">
              Mulai dengan menambahkan ruangan pertama Anda
            </CardDescription>
            <Link href="/inventaris/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tambah Ruangan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ room, total, alkes, meubelair, elektronik, lainnya, perluPerhatian }) => (
            <Link key={room.id} href={`/inventaris/${room.id}`} className="group">
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl leading-none">{room.icon || "🏥"}</div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate">{room.name}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {room.description || room.pj || "Tidak ada deskripsi"}
                      </CardDescription>
                    </div>
                    {perluPerhatian > 0 && (
                      <span className="shrink-0 rounded-full bg-[var(--red2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--red)]">
                        {perluPerhatian}⚠️
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-[var(--teal)]">
                      {total}
                    </span>
                    <span className="text-xs text-muted-foreground">total item</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {alkes > 0 && <CategoryBadge category="alkes" label={`🩺 ${alkes}`} />}
                    {meubelair > 0 && <CategoryBadge category="meubelair" label={`🪑 ${meubelair}`} />}
                    {elektronik > 0 && <CategoryBadge category="elektronik" label={`💻 ${elektronik}`} />}
                    {lainnya > 0 && <CategoryBadge category="lainnya" label={`🔧 ${lainnya}`} />}
                    {total === 0 && (
                      <span className="text-xs text-muted-foreground">Belum ada item</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
