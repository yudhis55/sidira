/**
 * Reklasifikasi kategori items dari acuan "Ruangan Sidira.xlsx" (sheet Katalog_AI).
 *
 * - Kunci: slug ruangan + nama ternormalisasi → kategori (mayoritas bila duplikat).
 * - Alias nama panjang sheet → slug DB (termasuk typo "Gudang BMHP").
 * - Baris DB tanpa padanan (termasuk baris sampah header) TIDAK diubah.
 * - Idempoten: hanya update baris yang kategorinya berbeda.
 *
 * CARA JALANKAN:
 *   npx tsx scripts/migrate-kategori.ts
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

// Nama panjang di sheet acuan → slug DB (lowercase semua).
const ALIAS: Record<string, string> = {
  "gudang bmhp": "gudang-bhp",
  "dapur": "dapur-2",
  "ruang cuci linen": "r-cuci-linen",
  "tata usaha 1": "ruang-tata-usaha-1",
  "ruang kepala puskesmas": "r-kapus",
  "ruang imunisasi": "immunisasi",
  "tata usaha 3": "tu-3",
  "klinik sanitasi kesling": "r-kesling",
  "ruang promkes": "r-promkes",
  "ruang ukp": "r-ukp",
  "ruang ukm": "r-ukm",
  "ruang ptm": "r-ptm",
  "ruang sterilisasi": "r-sterilisasi",
  "ruang raflesia": "raflesia",
  "pendaftaran rekam medis": "loket",
  "kasir lantai 1": "kasir",
  "kasir lantai 2": "kasir-lt-2",
  "ruang gizi pojok asi": "r-gizi",
  "pelayanan umum bp": "bp",
  "pelayanan gigi mulut": "r-gigi",
  "pelayanan mtbs": "r-mtbs",
  "ruang pelayanan kb": "r-kb",
  "pelayanan kia": "bkia",
  "apotek lantai 1": "apotik",
  "apotek lantai 2": "apotik-lt-2",
  "unit gawat darurat ugd": "u-g-d",
  "ponkesdes karanganom": "polindes-karanganom",
  "ponkesdes pakis": "polindes-pakis",
  "ponkesdes sumberejo": "sumberejo",
  "ruang akreditasi 1": "r-akreditasi-1",
  "ruang akreditasi 2": "r-alkreditasi-2",
  "ruang pertemuan aula": "ruang-pertemuan",
  "ruang nakula rawat inap": "ruang-nakula",
  "ruang sadewa rawat inap": "sadewa",
  "ruang bima rawat inap": "r-bima",
  "ruang arjuna rawat inap": "r-arjuna",
  "ruang srikandi rawat inap": "r-srikandi",
  "ruang melati rawat inap": "melati",
  "ruang gas medik": "ruang-gas-02",
  "rekam medis lantai 2": "rekam-medis-lt-2",
  "radiologi rontgen": "rontgen",
};

const VALID = ["alkes", "meubelair", "elektronik", "lainnya"];

async function main() {
  const { data: rooms } = await sb.from("rooms").select("id,name");
  const { data: items } = await sb.from("items").select("id,room_id,name,category");
  const slugByNormName = new Map((rooms ?? []).map((r) => [norm(r.name), r.id]));

  const wb = XLSX.readFile("C:/PKM/sidira/Ruangan Sidira.xlsx");
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["Katalog_AI"], {
    header: 1,
  }) as unknown[][];
  // key -> {cat -> count}
  const votes = new Map<string, Map<string, number>>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    if (!Array.isArray(r) || !r[0]) continue;
    const nama = String(r[0]).trim();
    const cat = String(r[1] ?? "").trim().toLowerCase();
    const ruang = String(r[2] ?? "").trim();
    if (!VALID.includes(cat)) continue;
    const roomSlug = slugByNormName.get(norm(ruang)) ?? ALIAS[norm(ruang)] ?? null;
    if (!roomSlug) {
      console.log(`   ⚠️  ruang tak dikenal: ${ruang}`);
      continue;
    }
    const key = `${roomSlug}|${norm(nama)}`;
    if (!votes.has(key)) votes.set(key, new Map());
    const m = votes.get(key)!;
    m.set(cat, (m.get(cat) ?? 0) + 1);
  }
  // Mayoritas menang (konflik = 0 di audit, tapi tetap aman).
  const catByKey = new Map<string, string>();
  for (const [k, m] of votes) {
    const best = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    catByKey.set(k, best);
  }

  let updated = 0;
  let skipped = 0;
  const skippedNames: string[] = [];
  for (const it of items ?? []) {
    const cat = catByKey.get(`${it.room_id}|${norm(it.name)}`);
    if (!cat) {
      skipped++;
      if (skippedNames.length < 12) skippedNames.push(`${it.room_id} / ${it.name}`);
      continue;
    }
    if (cat === it.category) continue;
    const { error } = await sb.from("items").update({ category: cat }).eq("id", it.id);
    if (error) {
      console.log(`   ❌ id=${it.id}: ${error.message}`);
    } else {
      updated++;
    }
  }
  console.log(`✅ updated=${updated} tanpa-padanan=${skipped}`);
  console.log("Tanpa padanan: " + JSON.stringify(skippedNames));
  console.log("\n🎉 Reklasifikasi selesai");
}

main().catch((e) => {
  console.error("❌ FATAL:", e.message);
  process.exit(1);
});
