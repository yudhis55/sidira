import { ItemsForm } from "@/components/utilitas/items-form";
import { Checklist } from "@/components/utilitas/checklist";
import { UtilHeader } from "@/components/utilitas/util-header";
import {
  getUtilMetaById,
  getUtilMetaList,
  getUtilItems,
  getUtilStateForMonth,
} from "@/lib/auth/utilitas";
import { notFound } from "next/navigation";

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

  let utilMeta;
  try {
    utilMeta = await getUtilMetaById(utilId);
  } catch {
    notFound();
  }

  // Resolve year/month (1-based month in URL; default to today).
  const now = new Date();
  const year = sp.year
    ? parseInt(sp.year, 10) || now.getFullYear()
    : now.getFullYear();
  const monthParam = sp.month
    ? parseInt(sp.month, 10)
    : now.getMonth() + 1;
  // Clamp month to 1..12 and convert to 0-based.
  const month = Math.min(Math.max(monthParam, 1), 12) - 1;

  const utilItems = await getUtilItems(utilId);
  const stateForMonth = await getUtilStateForMonth(utilId, year, month);

  // Fetch the utilitas list for the unit bar.
  const utilList = await getUtilMetaList();

  const items = utilItems.items ?? [];
  const doneCount = stateForMonth.checks.filter(
    (c) => c.kind === "check"
  ).length;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <UtilHeader
        utilMeta={utilMeta}
        itemCount={items.length}
        doneCount={doneCount}
        utilList={utilList}
      />

      <Checklist
        key={`${utilId}-${year}-${month}`}
        utilId={utilId}
        utilMeta={utilMeta}
        items={items}
        month={month}
        year={year}
        stateForMonth={stateForMonth}
      />

      <ItemsForm utilId={utilId} initialItems={items} />
    </div>
  );
}
