/**
 * Sinkronisasi isi-dari-Excel yang terlewat (fill-empty, non-destruktif).
 *
 * Latar: migrate-rekonsiliasi.ts hanya memproses baris sheet yang kolom A-nya
 * angka. Di sheet format KARTU (mis. APOTIK) baris barang kolom A-nya kosong
 * (angka hanya di baris section) sehingga merk/tahun/kode ~350 barang tak masuk DB.
 *
 * Yang dilakukan (--apply):
 * - Isi field KOSONG saja dari KARTU: merk, type, year, no_seri, bahan,
 *   kode_barang, harga, notes. Field yang sudah ada (termasuk edit manual)
 *   TIDAK pernah ditimpa. quantity/condition TIDAK disentuh.
 * - Sesuaikan category dari acuan Katalog_AI (Ruangan Sidira.xlsx),
 *   hanya bila berbeda (logika sama dengan migrate-kategori.ts).
 * - Hapus baris sampah: header/section sheet yang ikut keimpor sebagai barang
 *   ("NAMA BARANG/JENIS BARANG", "SET FARMASI", ...).
 * - TIDAK insert barang baru, TIDAK hapus selain sampah di atas.
 *
 * CARA JALANKAN:
 *   npx tsx scripts/sync-excel-fill.ts            # dry-run (laporan saja)
 *   npx tsx scripts/sync-excel-fill.ts --apply    # tulis ke DB
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
const slug = (s: string) =>
  norm(s).replace(/ +/g, "-").replace(/-+/g, "-");

// Nama panjang di sheet acuan → slug DB (disalin dari migrate-kategori.ts).
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
const VALID_CAT = ["alkes", "meubelair", "elektronik", "lainnya"];

interface SheetVar {
  nama: string;
  merk: string;
  seri: string;
  bahan: string;
  year: number | null;
  kode: string;
  harga: number | null;
  notes: string;
}

async function main() {
  console.log(APPLY ? "✍️  MODE APPLY" : "🔍 MODE DRY-RUN (tanpa ubah DB)");
  const { data: rooms } = await sb.from("rooms").select("id,name");
  const { data: items } = await sb.from("items").select("*");
  const validSlugs = new Set((rooms ?? []).map((r) => r.id));
  const slugByNormName = new Map((rooms ?? []).map((r) => [norm(r.name), r.id]));

  // ── 1. Katalog kategori ──
  const wbRef = XLSX.readFile("C:/PKM/sidira/Ruangan Sidira.xlsx");
  const refRows = XLSX.utils.sheet_to_json(wbRef.Sheets["Katalog_AI"], {
    header: 1,
  }) as unknown[][];
  const votes = new Map<string, Map<string, number>>();
  for (let i = 1; i < refRows.length; i++) {
    const r = refRows[i] as unknown[];
    if (!Array.isArray(r) || !r[0]) continue;
    const cat = String(r[1] ?? "").trim().toLowerCase();
    if (!VALID_CAT.includes(cat)) continue;
    const roomSlug =
      slugByNormName.get(norm(String(r[2] ?? ""))) ??
      ALIAS[norm(String(r[2] ?? ""))] ??
      null;
    if (!roomSlug) continue;
    const key = `${roomSlug}|${norm(String(r[0]))}`;
    if (!votes.has(key)) votes.set(key, new Map());
    const m = votes.get(key)!;
    m.set(cat, (m.get(cat) ?? 0) + 1);
  }
  const catByKey = new Map<string, string>();
  for (const [k, m] of votes) {
    catByKey.set(k, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }

  // ── 2. Parse KARTU (kedua format) ──
  const wb = XLSX.readFile(
    "C:/PKM/sidira/KARTU INVENTARIS RUANGAN 2026 (1).xlsx"
  );
  const sheetByKey = new Map<string, SheetVar[]>();
  const junkNames = new Set<string>(["nama barang jenis barang"]);
  let unknownRooms = 0;
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
    let hdr = -1;
    rows.forEach((r, i) => {
      if (
        Array.isArray(r) &&
        (r as unknown[]).some(
          (c) => typeof c === "string" && c.toUpperCase().includes("MERK")
        )
      )
        hdr = i;
    });
    for (let i = hdr + 1; i < rows.length; i++) {
      const r = rows[i] as unknown[];
      if (!Array.isArray(r)) continue;
      const b = String(r[1] ?? "").trim();
      if (!b || /^\d+$/.test(b)) continue; // legenda [1,2,3..]
      // Baris section (kolom data kosong semua) → catat sebagai sampah, lewati.
      const restEmpty = (r.slice(2) as unknown[]).every(
        (c) => c === null || c === undefined || c === ""
      );
      if (restEmpty) {
        junkNames.add(norm(b));
        continue;
      }
      const key = `${roomSlug}|${norm(b)}`;
      if (!sheetByKey.has(key)) sheetByKey.set(key, []);
      sheetByKey.get(key)!.push({
        nama: b,
        merk: String(r[3] ?? "").trim(),
        seri: String(r[4] ?? "").trim(),
        bahan: String(r[5] ?? "").trim(),
        year: Number(r[6]) || null,
        kode: String(r[7] ?? "").trim(),
        harga: Number(r[9]) || null,
        notes: String(r[13] ?? "").trim(),
      });
    }
  }

  const byKey = new Map<string, typeof items>();
  for (const it of items ?? []) {
    const k = `${it.room_id}|${norm(it.name)}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(it);
  }

  // ── 3. Fill-empty (pairwise per kunci, DB id ASC ↔ urutan sheet) ──
  let fillCount = 0;
  const fillSamples: string[] = [];
  for (const [key, variants] of sheetByKey) {
    const existing = (byKey.get(key) ?? [])
      .slice()
      .sort((a, b) => a.id - b.id);
    const n = Math.min(existing.length, variants.length);
    for (let i = 0; i < n; i++) {
      const row = existing[i];
      const v = variants[i];
      const patch: Record<string, unknown> = {};
      if (v.merk && !row.merk) patch.merk = v.merk;
      if (v.merk && !row.type) patch.type = v.merk;
      if (v.year && !row.year) patch.year = v.year;
      if (v.seri && !row.no_seri) patch.no_seri = v.seri;
      if (v.bahan && !row.bahan) patch.bahan = v.bahan;
      if (v.kode && !row.kode_barang) patch.kode_barang = v.kode;
      if (v.harga && !row.harga) patch.harga = v.harga;
      if (v.notes && !row.notes) patch.notes = v.notes;
      if (Object.keys(patch).length === 0) continue;
      fillCount++;
      if (fillSamples.length < 10)
        fillSamples.push(
          `${row.room_id}|${row.name} ← ${Object.keys(patch).join(",")}`
        );
      if (APPLY) {
        const { error } = await sb.from("items").update(patch).eq("id", row.id);
        if (error) console.log(`   ❌ fill id=${row.id}: ${error.message}`);
      }
    }
  }

  // ── 4. Kategori dari acuan ──
  let catCount = 0;
  for (const it of items ?? []) {
    if (junkNames.has(norm(it.name))) continue; // sampah ditangani di §5
    const cat = catByKey.get(`${it.room_id}|${norm(it.name)}`);
    if (!cat || cat === it.category) continue;
    catCount++;
    if (APPLY) {
      const { error } = await sb
        .from("items")
        .update({ category: cat })
        .eq("id", it.id);
      if (error) console.log(`   ❌ cat id=${it.id}: ${error.message}`);
    }
  }

  // ── 5. Hapus sampah ──
  const junk = (items ?? []).filter((it) => junkNames.has(norm(it.name)));
  if (APPLY && junk.length > 0) {
    const { error } = await sb
      .from("items")
      .delete()
      .in("id", junk.map((j) => j.id));
    if (error) console.log(`   ❌ hapus sampah: ${error.message}`);
  }

  console.log(`\n📊 fill-empty: ${fillCount} sel`);
  console.log("   contoh: " + JSON.stringify(fillSamples.slice(0, 10)));
  console.log(`📊 kategori diubah: ${catCount} baris`);
  console.log(`📊 sampah dihapus: ${junk.length} baris`);
  console.log(
    "   contoh: " +
      JSON.stringify(junk.slice(0, 12).map((j) => `${j.room_id}|${j.name}`))
  );
  console.log(`📊 sheet tak dikenal: ${unknownRooms}`);
  console.log(APPLY ? "\n🎉 Sinkronisasi selesai" : "\n(run --apply untuk menulis)");
}

main().catch((e) => {
  console.error("❌ FATAL:", e.message);
  process.exit(1);
});
