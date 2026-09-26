/**
 * Rekonsiliasi KARTU INVENTARIS RUANGAN 2026 (1).xlsx → tabel items.
 *
 * Prinsip (disetujui): tiap baris sheet = 1 baris DB (terpisah per batch).
 * - Cocok (room_slug + nama ternormalisasi): update quantity + condition
 *   persis sheet; kolom kosong lain (merk/tahun/bahan/seri/kode/harga/ket)
 *   diisi bila DB masih kosong.
 * - Tak cocok: INSERT baris baru (kategori dari acuan Katalog_AI,
 *   fallback "lainnya"), index_in_room = max(room,kategori)+1 (unik —
 *   syarat histori ceklist).
 * - Kondisi sheet kosong → kondisi DB tidak diubah.
 * - Idempoten: run ulang hanya menyentuh yang berbeda.
 *
 * CARA JALANKAN:
 *   npx tsx scripts/migrate-rekonsiliasi.ts
 */
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const slug = (s: string) =>
  norm(s).replace(/ +/g, "-").replace(/-+/g, "-");

function condOf(row: unknown[]): string {
  const mark = (v: unknown) => {
    const s = String(v ?? "").trim().toLowerCase();
    return s === "√" || s === "v" || s === "1" || s === "x" || s === "ya";
  };
  if (mark(row[12])) return "rb";
  if (mark(row[11])) return "rr";
  if (mark(row[10])) return "baik";
  return "";
}

const numOr = (v: unknown, fb: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fb;
};

async function main() {
  // Acuan kategori (Ruangan Sidira.xlsx) — dibangun ulang di sini agar
  // script mandiri (lihat migrate-kategori.ts untuk asal-usul).
  const wbRef = XLSX.readFile("C:/PKM/sidira/Ruangan Sidira.xlsx");
  const refRows = XLSX.utils.sheet_to_json(wbRef.Sheets["Katalog_AI"], {
    header: 1,
  }) as unknown[][];
  const { data: rooms } = await sb.from("rooms").select("id,name");
  const slugByNormName = new Map((rooms ?? []).map((r) => [norm(r.name), r.id]));
  const catRef = new Map<string, string>();
  for (let i = 1; i < refRows.length; i++) {
    const r = refRows[i] as unknown[];
    if (!Array.isArray(r) || !r[0]) continue;
    const cat = String(r[1] ?? "").trim().toLowerCase();
    if (!["alkes", "meubelair", "elektronik", "lainnya"].includes(cat)) continue;
    // Cocokkan ruangan acuan ke slug DB via alias longgar: samakan dengan
    // slug sheet KARTU bila memungkinkan, fallback ke semua slug.
    catRef.set(`*|${norm(String(r[0]))}`, cat);
    const roomSlugGuess = slug(String(r[2] ?? ""));
    catRef.set(`${roomSlugGuess}|${norm(String(r[0]))}`, cat);
  }

  const { data: items } = await sb.from("items").select("*");
  const byKey = new Map<string, typeof items extends (infer T)[] | null ? T[] : never>();
  for (const it of items ?? []) {
    const k = `${it.room_id}|${norm(it.name)}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(it as never);
  }
  // Counter index per (room, category) dari data existing.
  const maxIdx = new Map<string, number>();
  for (const it of items ?? []) {
    const k = `${it.room_id}|${it.category}`;
    maxIdx.set(k, Math.max(maxIdx.get(k) ?? -1, it.index_in_room ?? -1));
  }

  interface SheetRow {
    nama: string;
    qty: number;
    cond: string;
    merk: string;
    seri: string;
    bahan: string;
    year: number | null;
    kode: string;
    harga: number | null;
    notes: string;
  }

  const wb = XLSX.readFile(
    "C:/PKM/sidira/KARTU INVENTARIS RUANGAN 2026 (1).xlsx"
  );
  // Kumpulkan baris sheet per kunci (urutan sheet dipertahankan).
  const sheetByKey = new Map<string, SheetRow[]>();
  const pushSheetRow = (roomSlug: string, r: unknown[]) => {
    const nama = String(r[1] ?? "").trim();
    if (!nama || /^\d+$/.test(nama)) return;
    const key = `${roomSlug}|${norm(nama)}`;
    if (!sheetByKey.has(key)) sheetByKey.set(key, []);
    sheetByKey.get(key)!.push({
      nama,
      qty: numOr(r[8], 0),
      cond: condOf(r),
      merk: String(r[3] ?? "").trim(),
      seri: String(r[4] ?? "").trim(),
      bahan: String(r[5] ?? "").trim(),
      year: Number(r[6]) || null,
      kode: String(r[7] ?? "").trim(),
      harga: Number(r[9]) || null,
      notes: String(r[13] ?? "").trim(),
    });
  };

  let updated = 0;
  let inserted = 0;
  const skipped = 0;
  const validSlugs = new Set((rooms ?? []).map((r) => r.id));
  let unknownRooms = 0;
  // Pass 1: kumpulkan SEMUA baris sheet per kunci (urutan sheet dijaga).
  for (const sheet of wb.SheetNames) {
    const roomSlug = slugByNormName.get(norm(sheet)) ?? slug(sheet);
    if (!validSlugs.has(roomSlug)) {
      console.log(`   ⚠️  sheet ruangan tak dikenal, dilewati: ${sheet}`);
      unknownRooms++;
      continue;
    }
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], {
      header: 1,
    }) as unknown[][];
    for (const r of rows) {
      if (!Array.isArray(r) || typeof r[0] !== "number") continue;
      pushSheetRow(roomSlug, r);
    }
  }
  // Pass 2: pasangkan per kunci — baris DB ke-i ← varian sheet ke-i
  // (urut id ASC). Kelebihan varian → INSERT; kelebihan baris DB → biarkan.
  // Ini yang membuat duplikat nama-beda-tahun tetap terpisah.
  for (const [key, variants] of sheetByKey) {
    const [roomSlug] = key.split("|");
    const existing = (byKey.get(key) ?? []).slice().sort((a, b) => a.id - b.id);
    const pairCount = Math.min(existing.length, variants.length);
    for (let i = 0; i < pairCount; i++) {
      const row = existing[i];
      const v = variants[i];
      const patch: Record<string, unknown> = {};
      if (v.qty > 0 && v.qty !== row.quantity) patch.quantity = v.qty;
      if (v.cond && v.cond !== row.condition) patch.condition = v.cond;
      // Sinkron penuh dari varian sheet (sumber kebenaran untuk batch ini).
      if ((v.merk || "") !== (row.merk || "")) patch.merk = v.merk || null;
      if ((v.year ?? null) !== (row.year ?? null)) patch.year = v.year;
      if ((v.bahan || "") !== (row.bahan || "")) patch.bahan = v.bahan || null;
      if ((v.seri || "") !== (row.no_seri || "")) patch.no_seri = v.seri || null;
      if ((v.kode || "") !== (row.kode_barang || ""))
        patch.kode_barang = v.kode || null;
      if ((v.harga ?? null) !== (row.harga ?? null)) patch.harga = v.harga;
      if ((v.notes || "") !== (row.notes || "")) patch.notes = v.notes || null;
      if (Object.keys(patch).length === 0) continue;
      const { error } = await sb.from("items").update(patch).eq("id", row.id);
      if (error) console.log(`   ❌ update id=${row.id}: ${error.message}`);
      else updated++;
    }
    for (let i = pairCount; i < variants.length; i++) {
      // INSERT varian berlebih — semua kolom dari sheet.
      const v = variants[i];
      const cat =
        catRef.get(key) ??
        catRef.get(`*|${norm(v.nama)}`) ??
        existing[0]?.category ??
        "lainnya";
      const idxKey = `${roomSlug}|${cat}`;
      const idx = (maxIdx.get(idxKey) ?? -1) + 1;
      maxIdx.set(idxKey, idx);
      const { error } = await sb.from("items").insert({
        room_id: roomSlug,
        category: cat,
        name: v.nama,
        merk: v.merk || null,
        no_seri: v.seri || null,
        bahan: v.bahan || null,
        year: v.year,
        kode_barang: v.kode || null,
        quantity: v.qty || 1,
        unit: "unit",
        condition: v.cond || "baik",
        harga: v.harga,
        notes: v.notes || null,
        index_in_room: idx,
      });
      if (error) console.log(`   ❌ insert ${key}: ${error.message}`);
      else inserted++;
    }
  }
  console.log(
    `✅ updated=${updated} inserted=${inserted} unknownRooms=${unknownRooms} skipped-junk=${skipped}`
  );
  console.log("\n🎉 Rekonsiliasi selesai");
}

main().catch((e) => {
  console.error("❌ FATAL:", e.message);
  process.exit(1);
});
