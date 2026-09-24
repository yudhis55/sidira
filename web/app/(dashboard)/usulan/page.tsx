import type { Usulan, UsulanItem } from "@/lib/usulan-types";
import { getUsulanList } from "@/lib/auth/usulan";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";
import { UsulanCsvExport } from "@/components/usulan/usulan-csv-export";
import { UsulanListFilters } from "@/components/usulan/usulan-list-filters";
import { StatusBadge } from "@/components/usulan/usulan-badges";
import { PageHeader } from "@/components/shared/page-elements";
import { Suspense } from "react";

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={className}>{children}</h3>;
}
function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

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

function itemMatch(item: UsulanItem, prioritas: string, status: string): boolean {
  if (prioritas !== "all" && item.prioritas !== prioritas) return false;
  if (status !== "all" && item.status !== status) return false;
  return true;
}

interface PageProps {
  searchParams: Promise<{ prioritas?: string; status?: string }>;
}

export default async function UsulanPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const prioritasFilter = sp.prioritas || "all";
  const statusFilter = sp.status || "all";

  let usulanList: Usulan[];
  let usulanError = false;
  try {
    usulanList = await getUsulanList();
  } catch {
    usulanList = [];
    usulanError = true;
  }

  const totalItems = usulanList.reduce(
    (sum, usulan) => sum + (usulan.payload?.items?.length || 0),
    0
  );
  const totalValue = usulanList.reduce((sum, usulan) => {
    const itemsTotal =
      usulan.payload?.items?.reduce(
        (itemSum, item) => itemSum + (item.total || 0),
        0
      ) || 0;
    return sum + itemsTotal;
  }, 0);
  const diajukanCount = usulanList.reduce(
    (sum, usulan) =>
      sum +
      (usulan.payload?.items?.filter((i) => i.status === "diajukan").length ||
        0),
    0
  );

  const filtered = usulanList
    .map((usulan) => {
      if (prioritasFilter === "all" && statusFilter === "all") {
        return usulan;
      }
      const matchingItems =
        usulan.payload?.items?.filter((it) =>
          itemMatch(it, prioritasFilter, statusFilter)
        ) || [];
      if (matchingItems.length === 0) return null;
      return {
        ...usulan,
        payload: { items: matchingItems },
      } as Usulan;
    })
    .filter((u): u is Usulan => u !== null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="💡"
        title="Usulan Pengadaan"
        subtitle="Sarana Prasarana & Alkes · Kelola usulan dari setiap ruangan"
        actions={
          <>
            <Link href="/usulan/new">
              <Button size="sm">
                ➕ Buat Usulan
              </Button>
            </Link>
            <UsulanCsvExport />
          </>
        }
      />

      {usulanError && (
        <p role="alert" className="text-center py-4 text-[12.5px] text-ink3">
          Gagal memuat data usulan. Silakan muat ulang halaman.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs font-medium">
              Total Usulan
            </CardTitle>
            💡
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">
              {usulanList.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalItems} barang diusulkan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs font-medium">
              Total Nilai
            </CardTitle>
            📈
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">
              Rp {totalValue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimasi total biaya pengadaan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-xs font-medium">
              Diajukan
            </CardTitle>
            📦
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold">{diajukanCount}</div>
            <p className="text-xs text-muted-foreground">
              barang menunggu persetujuan
            </p>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={null}>
        <UsulanListFilters />
      </Suspense>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">
            Daftar Usulan{" "}
            <span className="text-muted-foreground font-normal">
              ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              💡
              <h3 className="font-mono text-sm font-semibold mb-1">
                {usulanList.length === 0
                  ? "Belum Ada Usulan"
                  : "Tidak Ada Usulan Cocok"}
              </h3>
              <p className="text-xs text-muted-foreground text-center mb-4">
                {usulanList.length === 0
                  ? "Kelola usulan dari detail inventaris ruangan, atau buat usulan baru di sini."
                  : "Coba ubah filter pencarian Anda."}
              </p>
              {usulanList.length === 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link href="/inventaris">
                    <Button size="sm">
                      🏥 Ke Inventaris Ruangan
                    </Button>
                  </Link>
                  <Link href="/usulan/new">
                    <Button size="sm" variant="ghost">
                      ➕ Buat Usulan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((usulan) => {
                const items = usulan.payload?.items || [];
                const itemCount = items.length;
                const totalValueItem = items.reduce(
                  (sum, item) => sum + (item.total || 0),
                  0
                );
                const diajukanItems = items.filter(
                  (i) => i.status === "diajukan"
                ).length;
                const disetujuiItems = items.filter(
                  (i) => i.status === "disetujui"
                ).length;
                const ditolakItems = items.filter(
                  (i) => i.status === "ditolak"
                ).length;

                return (
                  <Link
                    key={usulan.id}
                    href={`/usulan/${usulan.id}`}
                    className="block hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        🏥
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-semibold truncate">
                            {usulan.rooms?.icon || "📦"}{" "}
                            {usulan.rooms?.name || "Unknown Room"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {fmtDate(usulan.created_at)} · {itemCount} barang
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">
                          Rp {totalValueItem.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap px-3 pb-3">
                      {diajukanItems > 0 && (
                        <StatusBadge status="diajukan" />
                      )}
                      {disetujuiItems > 0 && (
                        <StatusBadge status="disetujui" />
                      )}
                      {ditolakItems > 0 && (
                        <StatusBadge status="ditolak" />
                      )}
                      <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] ring-1 ring-border text-muted-foreground">
                        {diajukanItems + disetujuiItems + ditolakItems} total
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
