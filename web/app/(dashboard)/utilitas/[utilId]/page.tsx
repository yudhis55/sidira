import Link from "next/link";
import { notFound } from "next/navigation";
import { UtilChecklistMatrix } from "@/components/utilitas/util-checklist-matrix";
import {
  getMockUtilMetaById,
  getMockUtilItemsById,
  getMockUtilStateForMonth,
  getMockUtilitasMeta,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

interface UtilitasDetailPageProps {
  params: Promise<{ utilId: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function UtilitasDetailPage({
  params,
  searchParams,
}: UtilitasDetailPageProps) {
  const { utilId } = await params;
  const sp = await searchParams;

  const utilMeta = getMockUtilMetaById(utilId);
  if (!utilMeta) {
    notFound();
  }

  // URL month is 1-based; convert to 0-based for mock helpers + matrix.
  const now = new Date();
  const year = sp.year
    ? parseInt(sp.year, 10) || now.getFullYear()
    : now.getFullYear();
  const monthParam = sp.month
    ? parseInt(sp.month, 10)
    : now.getMonth() + 1;
  const month0 = Math.min(Math.max(monthParam || 1, 1), 12) - 1;

  const items = getMockUtilItemsById(utilId);
  const state = getMockUtilStateForMonth(utilId, year, month0);
  const allMeta = getMockUtilitasMeta();

  const doneCount = state.checks.filter((c) => c.kind === "check").length;

  return (
    <div className="space-y-4">
      {/* Header — GAS utilBuildPanel head */}
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="flex size-14 shrink-0 items-center justify-center text-3xl leading-none"
          style={{ background: utilMeta.bg || "var(--teal3)" }}
          aria-hidden
        >
          {utilMeta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-xl font-bold leading-tight text-ink">
            Pemeliharaan {utilMeta.label}
          </h1>
          <p className="mt-0.5 text-sm text-ink2">
            Checklist harian · Puskesmas Baruharjo
          </p>
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <div className="font-mono text-lg font-bold text-ink">
              {items.length}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Item
            </div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-ink">
              {doneCount}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
              Selesai
            </div>
          </div>
        </div>
      </div>

      {/* Unit bar — switch utilitas without leaving detail */}
      <div className="flex flex-wrap gap-2">
        {allMeta.map((meta) => {
          const active = meta.util_id === utilId;
          return (
            <Link key={meta.util_id} href={`/utilitas/${meta.util_id}`}>
              <span
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  background: meta.bg || "var(--teal3)",
                  borderColor: active ? (meta.warna || "var(--teal)") : "transparent",
                  color: "var(--ink)",
                  boxShadow: active
                    ? `inset 0 0 0 1.5px ${meta.warna || "var(--teal)"}`
                    : undefined,
                  opacity: active ? 1 : 0.85,
                }}
              >
                <span className="text-base leading-none" aria-hidden>
                  {meta.icon}
                </span>
                <span>{meta.label}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <UtilChecklistMatrix
        utilId={utilId}
        utilMeta={utilMeta}
        items={items}
        year={year}
        month0={month0}
        initialChecks={state.checks}
        initialNote={state.note}
      />
    </div>
  );
}
