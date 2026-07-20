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
    <div className="space-y-5">
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
          {/* ── Unit Selector Bar (GAS .util-unit-bar / .util-unit-btn) ── */}
          <div className="mb-1 flex flex-wrap gap-1.5">
            {summaries.map(({ meta, itemCount }) => (
              <Link key={meta.util_id} href={`/utilitas/${meta.util_id}`}>
                <span className="inline-flex cursor-pointer items-center gap-[7px] rounded-[10px] border-2 border-line bg-white px-[18px] py-[9px] text-[13px] font-bold text-ink2 transition-colors hover:border-ink3">
                  <span className="text-lg leading-none" aria-hidden>
                    {meta.icon}
                  </span>
                  <span>{meta.label}</span>
                  <span className="rounded-[10px] bg-line2 px-[7px] py-px font-mono text-[10px] font-bold text-ink3">
                    {itemCount}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {/* ── Per-Utilitas Detail Cards (GAS .util-card pattern) ── */}
          <div className="space-y-4">
            {summaries.map(({ meta, itemCount, doneThisMonth }) => {
              const items = allItems.find((i) => i.util_id === meta.util_id);
              const itemList = items?.items ?? [];

              const now = new Date();
              const dayOfMonth = now.getDate();
              const target = itemCount * dayOfMonth;
              const pct =
                target > 0
                  ? Math.min(100, Math.round((doneThisMonth / target) * 100))
                  : 0;

              return (
                <div
                  key={meta.util_id}
                  className="overflow-hidden rounded-lg border border-line bg-white"
                >
                  {/* Card header — GAS .util-card-head (white text on util.bg) */}
                  <div
                    className="flex items-center gap-3 px-5 py-3.5 text-white"
                    style={{ background: meta.bg || "var(--teal)" }}
                  >
                    <span className="text-[22px] leading-none" aria-hidden>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-extrabold leading-tight text-white">
                        Pemeliharaan {meta.label}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-white/75">
                        {itemCount} item pemeliharaan
                      </p>
                    </div>
                    <div className="ml-auto flex gap-4 text-right">
                      <div>
                        <div className="font-mono text-lg font-extrabold leading-none text-white">
                          {itemCount}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                          Item
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-lg font-extrabold leading-none text-white">
                          {doneThisMonth}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                          Selesai
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item table */}
                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr>
                          <th className="border-b border-line bg-[#f8fafc] px-3.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-ink3">
                            No
                          </th>
                          <th className="border-b border-line bg-[#f8fafc] px-3.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-ink3">
                            Nama Item
                          </th>
                          <th className="border-b border-line bg-[#f8fafc] px-3.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-ink3">
                            Keterangan
                          </th>
                          <th className="border-b border-line bg-[#f8fafc] px-3.5 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-ink3">
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
                              className="even:bg-[#fafafa] hover:bg-line2/60"
                            >
                              <td className="border-b border-line2 px-3.5 py-2 text-[11.5px] font-semibold tabular-nums text-ink">
                                {idx + 1}
                              </td>
                              <td className="border-b border-line2 px-3.5 py-2 text-[11.5px] font-semibold text-ink">
                                {item.nama}
                              </td>
                              <td className="border-b border-line2 px-3.5 py-2 text-[10px] text-ink3">
                                {item.ket || "—"}
                              </td>
                              <td className="border-b border-line2 px-3.5 py-2 text-center">
                                <span
                                  className="inline-flex items-center rounded-[10px] px-2 py-0.5 text-[10.5px] font-bold"
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
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-[#fafafa] px-5 py-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-ink3">
                        <span className="font-bold">Progress bulan ini</span>
                        <span className="font-mono font-extrabold text-teal">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line2">
                        <div
                          className="h-full rounded-full transition-[width]"
                          style={{
                            width: `${pct}%`,
                            background: meta.warna || "var(--teal)",
                          }}
                        />
                      </div>
                      <Link href={`/utilitas/${meta.util_id}`}>
                        <Button variant="ghost" size="sm">
                          Buka Checklist →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
