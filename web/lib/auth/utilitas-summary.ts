"use server";

import { createClient } from "@/lib/supabase/server";
import type { UtilMeta } from "@/lib/auth/utilitas";

export interface UtilSummary {
  meta: UtilMeta;
  itemCount: number;
  doneThisMonth: number;
}

/**
 * Per-utilitas summary for the listing page:
 *  - itemCount: how many maintenance items the util has
 *  - doneThisMonth: how many checks were logged in the current month
 *
 * Mirrors the GAS util panel header stats (item count + "Sudah Dikerjakan
 * Bulan Ini").
 */
export async function getUtilSummaries(): Promise<UtilSummary[]> {
  const supabase = await createClient();

  const { data: metaList } = await supabase
    .from("util_meta")
    .select("*")
    .order("order_no");
  if (!metaList) return [];

  const { data: itemsRows } = await supabase
    .from("util_items")
    .select("util_id, items");

  const itemCountByUtil = new Map<string, number>();
  for (const r of (itemsRows ?? []) as Array<{ util_id: string; items?: unknown[] }>) {
    itemCountByUtil.set(r.util_id, Array.isArray(r.items) ? r.items.length : 0);
  }

  // current month range
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  const startKey = `${y}-${pad(m)}-01`;
  const endKey = `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`;

  const { data: checkRows } = await supabase
    .from("util_state")
    .select("util_id")
    .eq("kind", "check")
    .gte("state_key", startKey)
    .lte("state_key", endKey);

  const doneByUtil = new Map<string, number>();
  for (const r of (checkRows ?? []) as Array<{ util_id: string }>) {
    doneByUtil.set(r.util_id, (doneByUtil.get(r.util_id) ?? 0) + 1);
  }

  return (metaList as UtilMeta[]).map((meta) => ({
    meta,
    itemCount: itemCountByUtil.get(meta.util_id) ?? 0,
    doneThisMonth: doneByUtil.get(meta.util_id) ?? 0,
  }));
}
