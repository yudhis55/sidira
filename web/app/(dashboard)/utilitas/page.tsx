import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
import { PageHeader } from "@/components/shared/page-elements";
import {
  getMockUtilitasMeta,
  getMockUtilitasItems,
  getMockUtilitasSummary,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function UtilitasPage() {
  const metas = getMockUtilitasMeta();
  const allItems = getMockUtilitasItems();
  const summaries = getMockUtilitasSummary();
  const totalItems = summaries.reduce((s, x) => s + x.itemCount, 0);
  const totalDone = summaries.reduce((s, x) => s + x.doneThisMonth, 0);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        icon="🔧"
        title="Pemeliharaan Utilitas"
        subtitle="Puskesmas Baruharjo · Checklist harian kebersihan, sterilisasi, AC"
        stats={[
          { value: metas.length, label: "Total Utilitas", tone: "teal" },
          { value: totalItems, label: "Item Pemeliharaan", tone: "blue" },
          { value: totalDone, label: "Selesai Bulan Ini", tone: "amber" },
        ]}
        actions={
          <Link href="/utilitas/new">
            <Button>
              <span aria-hidden className="mr-1">
                ➕
              </span>
              Tambah Utilitas
            </Button>
          </Link>
        }
      />

      {metas.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-muted-foreground">
              Belum ada utilitas. Klik &quot;Tambah Utilitas&quot; untuk
              menambahkan.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* ── Unit Selector Bar (GAS .util-unit-bar) ── */}
          <div className="flex flex-wrap gap-2">
            {summaries.map(({ meta, itemCount }) => (
              <Link key={meta.util_id} href={`/utilitas/${meta.util_id}`}>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink transition-colors hover:opacity-80"
                  style={{
                    background: meta.bg || "var(--teal3)",
                    borderColor: "transparent",
                  }}
                >
                  <span className="text-base leading-none">{meta.icon}</span>
                  <span>{meta.label}</span>
                  <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-white/70 font-mono text-[11px] font-bold">
                    {itemCount}
                  </span>
                </button>
              </Link>
            ))}
          </div>

          {/* ── Per-Utilitas Detail Cards (GAS .util-card pattern) ── */}
          {summaries.map(({ meta, itemCount, doneThisMonth }) => {
            const items = allItems.find((i) => i.util_id === meta.util_id);
            const itemList = items?.items ?? [];

            // progress: done checks vs (itemCount * days-so-far-in-month) capped
            const now = new Date();
            const dayOfMonth = now.getDate();
            const target = itemCount * dayOfMonth;
            const pct =
              target > 0
                ? Math.min(100, Math.round((doneThisMonth / target) * 100))
                : 0;

            return (
              <Card
                key={meta.util_id}
                className="overflow-hidden"
              >
                {/* Card header with colored accent bar (GAS .util-card-head) */}
                <div
                  className="flex items-center gap-3 border-b border-line px-5 py-3"
                  style={{ background: meta.bg || "var(--teal3)" }}
                >
                  <span className="text-xl leading-none">{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-mono text-sm font-bold leading-tight">
                      Pemeliharaan {meta.label}
                    </h3>
                    <p className="text-[11px] text-ink2">
                      {itemCount} item pemeliharaan
                    </p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="font-mono text-lg font-bold">
                        {itemCount}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
                        Item
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold">
                        {doneThisMonth}
                      </div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
                        Selesai
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item table (GAS .util-tbl-wrap) */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-line px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-ink3">
                          No
                        </th>
                        <th className="border-b border-line px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-ink3">
                          Nama Item
                        </th>
                        <th className="border-b border-line px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-ink3">
                          Keterangan
                        </th>
                        <th className="border-b border-line px-3.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-ink3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-sm text-ink3"
                          >
                            Belum ada item pemeliharaan
                          </td>
                        </tr>
                      ) : (
                        itemList.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-line2/50"
                          >
                            <td className="border-b border-line2 px-3.5 py-2.5 text-sm text-ink">
                              {idx + 1}
                            </td>
                            <td className="border-b border-line2 px-3.5 py-2.5 text-sm text-ink">
                              {item.nama}
                            </td>
                            <td className="border-b border-line2 px-3.5 py-2.5 text-sm text-ink2">
                              {item.ket || "—"}
                            </td>
                            <td className="border-b border-line2 px-3.5 py-2.5 text-center text-sm">
                              <span
                                className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-bold"
                                style={{
                                  background: meta.bg || "var(--teal3)",
                                  color: meta.warna || "var(--teal)",
                                }}
                              >
                                {pct > 0 ? "✓ Terjadwal" : "○ Belum"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Progress bar footer */}
                {itemCount > 0 && (
                  <div className="flex items-center justify-between border-t border-line2 px-5 py-3">
                    <div className="flex items-center gap-2 text-[11px] text-ink3">
                      <span>Progress bulan ini</span>
                      <span className="font-mono font-semibold text-ink">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-32 overflow-hidden rounded-none bg-muted">
                      <div
                        className="h-full rounded-none"
                        style={{
                          width: `${pct}%`,
                          background: meta.warna || "var(--teal)",
                        }}
                      />
                    </div>
                    <Link href={`/utilitas/${meta.util_id}`}>
                      <Button variant="ghost" size="sm">
                        Buka Detail →
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}
