/**
 * Isi kolom items.spec dari "Ruangan Sidira.xlsx" sheet Katalog_AI (kolom Spesifikasi).
 *
 * - Kunci: slug ruangan + nama ternormalisasi (mayoritas bila duplikat).
 * - Hanya mengisi spec yang masih kosong (fill-empty). Tidak menimpa.
 * - Baris sampah header ("BAHAN" sebagai nilai) dilewati.
 *
 * CARA JALANKAN:
 *   npx tsx scripts/sync-spec-fill.ts            # dry-run
 *   npx tsx scripts/sync-spec-fill.ts --apply    # tulis ke DB
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

const APPLY = process.argv.includes("--apply");

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

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

async function main() {
  console.log(APPLY ? "✍️  MODE APPLY" : "🔍 MODE DRY-RUN (tanpa ubah DB)");
  const { data: rooms } = await sb.from("rooms").select("id,name");
  const { data: items } = await sb.from("items").select("id,room_id,name,spec");
  const slugByNormName = new Map((rooms ?? []).map((r) => [norm(r.name), r.id]));

  const wb = XLSX.readFile("C:/PKM/sidira/Ruangan Sidira.xlsx");
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["Katalog_AI"], {
    header: 1,
  }) as unknown[][];
  const votes = new Map<string, Map<string, number>>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    if (!Array.isArray(r) || !r[0]) continue;
    const nama = String(r[0]).trim();
    const spec = String(r[3] ?? "").trim();
    if (!spec || norm(spec) === "bahan") continue;
    if (norm(nama) === "nama barang") continue;
    const roomSlug =
      slugByNormName.get(norm(String(r[2] ?? ""))) ??
      ALIAS[norm(String(r[2] ?? ""))] ??
      null;
    if (!roomSlug) continue;
    const key = `${roomSlug}|${norm(nama)}`;
    if (!votes.has(key)) votes.set(key, new Map());
    const m = votes.get(key)!;
    m.set(spec, (m.get(spec) ?? 0) + 1);
  }
  const specByKey = new Map<string, string>();
  for (const [k, m] of votes) {
    specByKey.set(k, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }

  let filled = 0;
  let already = 0;
  let noRef = 0;
  for (const it of items ?? []) {
    if (it.spec) {
      already++;
      continue;
    }
    const spec = specByKey.get(`${it.room_id}|${norm(it.name)}`);
    if (!spec) {
      noRef++;
      continue;
    }
    filled++;
    if (APPLY) {
      const { error } = await sb.from("items").update({ spec }).eq("id", it.id);
      if (error) console.log(`   ❌ id=${it.id}: ${error.message}`);
    }
  }
  console.log(`\n📊 spec terisi: ${filled} | sudah ada: ${already} | tanpa acuan: ${noRef}`);
  console.log(APPLY ? "🎉 Selesai" : "(run --apply untuk menulis)");
}

main().catch((e) => {
  console.error("❌ FATAL:", e.message);
  process.exit(1);
});
