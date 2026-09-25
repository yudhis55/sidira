import Link from "next/link";
import { notFound } from "next/navigation";
import { UtilDetailPanels } from "@/components/utilitas/util-detail-panels";
import { AddedUtilDetail } from "@/components/utilitas/added-util-detail";
import {
  getUtilItems,
  getUtilMetaById,
  getUtilState,
  type UtilState,
} from "@/lib/auth/utilitas";
import { getUtilSummaries } from "@/lib/auth/utilitas-summary";

export const dynamic = "force-dynamic";

interface UtilitasDetailPageProps {
  params: Promise<{ utilId: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

/** Catatan `util_state` berkunci `${utilId}_${year}_${month0}` (0-based) —
 *  dipetakan ke `YYYY-MM` untuk panel; format lawas `YYYY-MM` ikut didukung. */
function toNotesByMonth(rows: UtilState[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.kind !== "note") continue;
    const key = r.state_key;
    if (/^\d{4}-\d{2}$/.test(key)) {
      map[key] = r.value ?? "";
      continue;
    }
    const parts = key.split("_");
    if (parts.length >= 3) {
      const m0 = Number(parts[parts.length - 1]);
      const y = Number(parts[parts.length - 2]);
      if (Number.isInteger(y) && Number.isInteger(m0) && m0 >= 0 && m0 <= 11) {
        map[`${y}-${String(m0 + 1).padStart(2, "0")}`] = r.value ?? "";
      }
    }
  }
  return map;
}

export default async function UtilitasDetailPage({
  params,
  searchParams,
}: UtilitasDetailPageProps) {
  const { utilId } = await params;
  const sp = await searchParams;

  // URL month is 1-based; convert to 0-based for matrix.
  const now = new Date();
  const year = sp.year
    ? parseInt(sp.year, 10) || now.getFullYear()
    : now.getFullYear();
  const monthParam = sp.month ? parseInt(sp.month, 10) : now.getMonth() + 1;
  const month0 = Math.min(Math.max(monthParam || 1, 1), 12) - 1;

  let utilMeta: Awaited<ReturnType<typeof getUtilMetaById>> | null = null;
  try {
    utilMeta = await getUtilMetaById(utilId);
  } catch {
    utilMeta = null;
  }

  // Utilitas hasil "Tambah Utilitas" lama hanya ada di localStorage
  // (id `custom_*`), jadi resolusinya di klien — bukan 404.
  // Cabang lokal ini dipertahankan; utilitas Supabase baru memakai slug nama
  // (tanpa awalan `custom_`) sehingga tidak pernah tabrakan.
  if (!utilMeta) {
    if (!utilId.startsWith("custom_")) notFound();
    const summaries = await getUtilSummaries().catch(() => []);
    const baseMetas = summaries.map((s) => ({
      util_id: s.meta.util_id,
      label: s.meta.label,
      icon: s.meta.icon,
      warna: s.meta.warna,
      bg: s.meta.bg,
      custom: s.meta.custom,
      order_no: s.meta.order_no,
      created_at: s.meta.created_at,
      updated_at: s.meta.updated_at,
    }));
    const itemCounts: Record<string, number> = {};
    for (const s of summaries) {
      itemCounts[s.meta.util_id] = s.itemCount;
    }
    return (
      <AddedUtilDetail
        utilId={utilId}
        baseMetas={baseMetas}
        itemCounts={itemCounts}
        year={year}
        month0={month0}
      />
    );
  }

  // Paralel: 3 roundtrip jadi 1 gelombang.
  const [itemsRow, stateRows, summaries] = await Promise.all([
    getUtilItems(utilId).catch(() => ({ items: [] })),
    getUtilState(utilId).catch(
      () => [] as Awaited<ReturnType<typeof getUtilState>>
    ),
    getUtilSummaries().catch(() => []),
  ]);
  const items = (itemsRow.items ?? []).map((it) => ({
    nama: it.nama,
    ket: it.ket,
  }));
  // `util_state` kosong → ceklist kosong — tampilan yang jujur.
  const checks = stateRows.filter((r) => r.kind === "check");
  const notesByMonth = toNotesByMonth(stateRows);
  const allMeta = summaries.map((s) => s.meta);
  const itemCountByUtil = new Map(summaries.map((s) => [s.meta.util_id, s.itemCount]));

  const monthPrefix = `${year}-${String(month0 + 1).padStart(2, "0")}`;
  const doneCount = checks.filter((c) =>
    c.state_key.startsWith(monthPrefix)
  ).length;

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
          <h1 className="flex flex-wrap items-center gap-2.5 text-lg font-extrabold leading-tight text-ink">
            Pemeliharaan {utilMeta.label}
            <Link
              href={`/utilitas/${utilId}/edit`}
              className="inline-flex items-center gap-1.5 rounded-[20px] border-[1.5px] border-line bg-white px-3.5 py-1 text-xs font-bold text-ink2 transition-colors hover:border-ink3 hover:text-ink"
            >
              ✏️ Edit Nama
            </Link>
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
              Sudah Dikerjakan Bulan Ini
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
              : (itemCountByUtil.get(meta.util_id) ?? 0);
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

      <UtilDetailPanels
        utilId={utilId}
        utilMeta={utilMeta}
        initialItems={items}
        year={year}
        month0={month0}
        initialChecks={checks}
        initialNotesByMonth={notesByMonth}
      />
    </div>
  );
}
