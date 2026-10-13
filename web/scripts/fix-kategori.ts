/**
 * Koreksi kategori hasil audit (opsi B).
 *
 * - elektronik: AC, blender/shaker, hygrometer, sealing, amplifier, setrika,
 *   vaccine refrigerator (peralatan bertenaga listrik).
 * - alkes: gelas/corong/pipet/mortir lab, USG, THT, snellen, tempat tidur
 *   periksa, almari instrumen, sonde uterus, kaca mulut, beker/erlenmeyer,
 *   sterilisator.
 * - Tetap meubelair: almari kaca, vaccine carrier/coolpack (box non-listrik),
 *   pallet, filing cabinet, tempat sampah, almari obat, rak les pasien,
 *   pijakan pasien, nebulizer/box-meja rontgen/papan LCD (disentuh terpisah).
 *
 * Hanya menyentuh baris yang kategorinya berbeda. Idempoten.
 *
 *   npx tsx scripts/fix-kategori.ts            # dry-run
 *   npx tsx scripts/fix-kategori.ts --apply    # tulis ke DB
 */
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
const has = (n: string, kws: string[]) => kws.some((k) => n.includes(k));

// Kata kunci yang memaksa TETAP meubelair (non-listrik / furnitur).
const KEEP = [
  "almari kaca",
  "carier",
  "carrier",
  "coolpack",
  "cool pack",
  "pallet",
  "filling cabinet",
  "filing cabinet",
  "lemari arsip",
  "tempat sampah",
  "bak sampah",
  "tong sampah",
  "almari obat",
  "lemari obat",
  "rak les pasien",
  "pijakan pasien",
];
// Elektronik: kata utuh/spesifik (hindari substring "ac" pada "kaca").
const TO_ELEKTRONIK = [
  "blender",
  "shaker",
  "hygrometer",
  "sealing",
  "pres kertas",
  "amplifier",
  "setrika",
  "refrigerator",
];
const AC_EXACT = ["ac"];
// Alkes.
const TO_ALKES = [
  "corong",
  "gelas pengukur",
  "mortir",
  "stamper",
  "pipet",
  "peipet",
  "urinometer",
  "torniquet",
  "tourniquet",
  "usg",
  "u s g",
  "tht set",
  "snellen",
  "tempat tidur periksa",
  "ranjang periksa",
  "almari instrumen",
  "lemari instrumen",
  "sounde",
  "sonde",
  "kaca mulut",
  "beker",
  "erlemeyer",
  "erlenmeyer",
  "sterilisator",
];

function targetOf(name: string): string | null {
  const n = " " + name.toLowerCase() + " ";
  if (has(n, KEEP)) return null;
  if (AC_EXACT.some((k) => n.split(/[^a-z0-9]+/).includes(k))) return "elektronik";
  if (has(n, TO_ELEKTRONIK)) return "elektronik";
  if (has(n, TO_ALKES)) return "alkes";
  return null;
}

async function main() {
  console.log(APPLY ? "✍️  MODE APPLY" : "🔍 MODE DRY-RUN (tanpa ubah DB)");
  const { data: items } = await sb
    .from("items")
    .select("id,room_id,name,category");
  let changed = 0;
  const samples: string[] = [];
  for (const it of items ?? []) {
    if (it.category !== "meubelair") continue;
    const to = targetOf(it.name);
    if (!to || to === it.category) continue;
    changed++;
    if (samples.length < 40)
      samples.push(`[${it.room_id}] ${it.name} → ${to}`);
    if (APPLY) {
      const { error } = await sb
        .from("items")
        .update({ category: to })
        .eq("id", it.id);
      if (error) console.log(`   ❌ id=${it.id}: ${error.message}`);
    }
  }
  console.log(`\n📊 diubah: ${changed} baris`);
  for (const s of samples) console.log("   " + s);
  console.log(APPLY ? "🎉 Selesai" : "(run --apply untuk menulis)");
}

main().catch((e) => {
  console.error("❌ FATAL:", e.message);
  process.exit(1);
});
