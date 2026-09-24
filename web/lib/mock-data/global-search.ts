import type { SearchResult } from "@/lib/auth/global-search";
import { getMockRooms } from "./rooms";
import { getMockItems } from "./items";
import { getMockUsulan } from "./usulan";

/**
 * Pencarian global versi mock — cakupan sama dengan server action
 * globalSearch (ruangan, item, usulan) supaya Ctrl+K berfungsi
 * selama fase mock tanpa Supabase.
 */
export function mockGlobalSearch(q: string): SearchResult[] {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];

  const results: SearchResult[] = [];

  for (const r of getMockRooms()) {
    if (!r.name.toLowerCase().includes(query)) continue;
    results.push({
      group: "Ruangan",
      label: `${r.icon || "\u{1F3E5}"} ${r.name}`,
      href: `/inventaris/${r.id}`,
    });
    if (results.length >= 8) break;
  }

  let itemCount = 0;
  for (const it of getMockItems()) {
    const hit =
      it.name.toLowerCase().includes(query) ||
      (it.merk ?? "").toLowerCase().includes(query) ||
      (it.noreg ?? "").toLowerCase().includes(query);
    if (!hit) continue;
    results.push({
      group: "Item",
      label: it.name,
      sub: [it.merk, it.noreg].filter(Boolean).join(" · ") || it.category,
      href: `/inventaris/${it.room_id}`,
    });
    if (++itemCount >= 12) break;
  }

  let usulanCount = 0;
  outer: for (const u of getMockUsulan()) {
    for (const it of u.payload?.items ?? []) {
      if (!it.nama || !it.nama.toLowerCase().includes(query)) continue;
      results.push({
        group: "Usulan",
        label: it.nama,
        sub: it.status,
        href: `/usulan/${u.id}`,
      });
      if (++usulanCount >= 8) break outer;
    }
  }

  return results.slice(0, 30);
}
