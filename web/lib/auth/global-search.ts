"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  group: "Ruangan" | "Item" | "Usulan";
  label: string;
  sub?: string;
  href: string;
}

/**
 * Global search across rooms, items, and usulan.
 * Mirrors GAS Ctrl+K global search scope.
 *
 * @param q query string (min 2 chars to search)
 */
export async function globalSearch(q: string): Promise<SearchResult[]> {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];

  const supabase = await createClient();
  const results: SearchResult[] = [];

  // ── Rooms (by name) ──
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, icon")
    .ilike("name", `%${query}%`)
    .limit(8);

  for (const r of (rooms ?? []) as Array<{ id: string; name: string; icon: string }>) {
    results.push({
      group: "Ruangan",
      label: `${r.icon || "🏥"} ${r.name}`,
      href: `/inventaris/${r.id}`,
    });
  }

  // ── Items (by name / merk / noreg) ──
  const { data: items } = await supabase
    .from("items")
    .select("id, room_id, name, merk, noreg, category")
    .or(
      `name.ilike.%${query}%,merk.ilike.%${query}%,noreg.ilike.%${query}%`
    )
    .limit(12);

  for (const it of (items ?? []) as Array<{
    id: number;
    room_id: string;
    name: string;
    merk?: string;
    noreg?: string;
    category: string;
  }>) {
    results.push({
      group: "Item",
      label: it.name,
      sub: [it.merk, it.noreg].filter(Boolean).join(" · ") || it.category,
      href: `/inventaris/${it.room_id}`,
    });
  }

  // ── Usulan (by item name inside payload) ──
  // usulan stores items in a jsonb payload; query with jsonb filter.
  const { data: usulanRows } = await supabase
    .from("usulan")
    .select("id, room_id, payload")
    .limit(200);

  for (const u of (usulanRows ?? []) as Array<{
    id: number;
    room_id: string;
    payload?: { items?: Array<{ nama?: string; status?: string }> };
  }>) {
    const list = u.payload?.items ?? [];
    for (const it of list) {
      if (it.nama && it.nama.toLowerCase().includes(query)) {
        results.push({
          group: "Usulan",
          label: it.nama,
          sub: it.status,
          href: `/usulan/${u.id}`,
        });
        if (results.filter((r) => r.group === "Usulan").length >= 8) break;
      }
    }
  }

  return results.slice(0, 30);
}
