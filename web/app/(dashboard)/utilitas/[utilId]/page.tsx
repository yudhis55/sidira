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
  const monthParam = sp.month ? parseInt(sp.month, 10) : now.getMonth() + 1;
  const month0 = Math.min(Math.max(monthParam || 1, 1), 12) - 1;

  const items = getMockUtilItemsById(utilId);
  const state = getMockUtilStateForMonth(utilId, year, month0);
  const allMeta = getMockUtilitasMeta();

  const doneCount = state.checks.filter((c) => c.kind === "check").length;

  return (
    <div className="mx-auto max-w-[1100px] space-y-4">
      {/* Header — GAS .util-header */}
      <div className="flex flex-wrap items-center gap-3.5 rounded-lg border border-line bg-white px-6 py-5">
        <div
          className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] text-[26px] leading-none"
          style={{ background: utilMeta.bg || "var(--teal3)" }}
          aria-hidden
        >
          {utilMeta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold leading-tight text-ink">
            Pemeliharaan {utilMeta.label}
          </h1>
          <p className="mt-0.5 text-xs text-ink3">
            Puskesmas Baruharjo · {items.length} item pemeliharaan
          </p>
        </div>
        <div className="ml-auto flex gap-3.5">
          <div className="text-center">
            <div className="text-[22px] font-black leading-none text-teal">
              {items.length}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-ink3">
              Item
            </div>
          </div>
          <div className="text-center">
            <div className="text-[22px] font-black leading-none text-teal">
              {doneCount}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-ink3">
              Sudah Dikerjakan
            </div>
          </div>
        </div>
      </div>

      {/* Unit bar — GAS .util-unit-bar / .util-unit-btn */}
      <div className="flex flex-wrap gap-1.5">
        {allMeta.map((meta) => {
          const active = meta.util_id === utilId;
          const itemCount =
            meta.util_id === utilId
              ? items.length
              : getMockUtilItemsById(meta.util_id).length;
          return (
            <Link key={meta.util_id} href={`/utilitas/${meta.util_id}`}>
              <span
                className={
                  active
                    ? "inline-flex cursor-pointer items-center gap-[7px] rounded-[10px] border-2 border-transparent px-[18px] py-[9px] text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                    : "inline-flex cursor-pointer items-center gap-[7px] rounded-[10px] border-2 border-line bg-white px-[18px] py-[9px] text-[13px] font-bold text-ink2 transition-colors hover:border-ink3"
                }
                style={
                  active
                    ? { background: meta.bg || "var(--teal)" }
                    : undefined
                }
              >
                <span className="text-lg leading-none" aria-hidden>
                  {meta.icon}
                </span>
                <span>{meta.label}</span>
                <span
                  className={
                    active
                      ? "rounded-[10px] bg-white/25 px-[7px] py-px font-mono text-[10px] font-bold text-white"
                      : "rounded-[10px] bg-line2 px-[7px] py-px font-mono text-[10px] font-bold text-ink3"
                  }
                >
                  {itemCount}
                </span>
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
