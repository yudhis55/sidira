import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-elements";
import { getUtilSummaries } from "@/lib/auth/utilitas-summary";

export const dynamic = "force-dynamic";

export default async function UtilitasPage() {
  const summaries = await getUtilSummaries();
  const totalItems = summaries.reduce((s, x) => s + x.itemCount, 0);
  const totalDone = summaries.reduce((s, x) => s + x.doneThisMonth, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="⚙️"
        title="Pemeliharaan Utilitas"
        subtitle="Puskesmas Baruharjo · Checklist harian ambulance, genset, IPAL"
        stats={[
          { value: summaries.length, label: "Total Utilitas", tone: "teal" },
          { value: totalItems, label: "Item Pemeliharaan", tone: "blue" },
          { value: totalDone, label: "Done Bulan Ini", tone: "amber" },
        ]}
        actions={
          <Link href="/utilitas/new">
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Utilitas
            </Button>
          </Link>
        }
      />

      {summaries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-muted-foreground">
              Belum ada utilitas. Klik &quot;Tambah Utilitas&quot; untuk menambahkan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summaries.map(({ meta, itemCount, doneThisMonth }) => {
            // progress: done checks vs (itemCount * days-so-far-in-month) capped
            const now = new Date();
            const dayOfMonth = now.getDate();
            const target = itemCount * dayOfMonth;
            const pct = target > 0 ? Math.min(100, Math.round((doneThisMonth / target) * 100)) : 0;
            return (
              <Link key={meta.util_id} href={`/utilitas/${meta.util_id}`} className="group">
                <Card className="h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                  {/* color bar using util warna/bg */}
                  <div
                    className="h-1.5 w-full"
                    style={{ background: meta.warna || "var(--teal)" }}
                  />
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex size-12 items-center justify-center rounded-none text-2xl leading-none"
                        style={{ background: meta.bg || "var(--teal3)" }}
                      >
                        {meta.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-mono font-bold leading-tight">{meta.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {meta.custom ? "Custom" : "Bawaan"} · urutan {meta.order_no}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-none border border-border px-3 py-2">
                        <div className="font-mono text-lg font-bold text-[var(--teal)]">
                          {itemCount}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Item Pemeliharaan</div>
                      </div>
                      <div className="rounded-none border border-border px-3 py-2">
                        <div className="font-mono text-lg font-bold text-[var(--amber)]">
                          {doneThisMonth}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Done Bulan Ini</div>
                      </div>
                    </div>

                    {itemCount > 0 && (
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Progress bulan ini</span>
                          <span className="font-mono font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-none bg-muted">
                          <div
                            className="h-full rounded-none"
                            style={{
                              width: `${pct}%`,
                              background: meta.warna || "var(--teal)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
