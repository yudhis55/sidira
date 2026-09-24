/**
 * Migrasi data operasional GAS → Supabase (one-shot, idempoten, aman di-run ulang).
 *
 * Cakupan (hasil audit GAS read-only 2026-09-21):
 * - pakta (32 dokumen arsip)  → upsert by id
 * - riwayat_pindah (8 baris mvLog) → insert bila belum ada (dedupe ts+nama+dari+ke)
 * - penanggung_jawab (2 nama) + kolom rooms.pj → upsert
 * Dilewati dengan sadar: usulan (1 baris template kosong), checklist (2 records),
 * rooms/items/sbbk (sudah di DB), util (modul masih mock).
 *
 * Mapping ID ruangan GAS → slug DB: "_" jadi "-", lalu collapse dash ganda.
 *   gudang_bhp → gudang-bhp, r__gizi → r-gizi, kasir_lt__2 → kasir-lt-2
 * Ref `custom_*` (ruangan localStorage, tak ada di DB) → null.
 *
 * CARA JALANKAN:
 *   npx tsx scripts/migrate-ops-from-gas.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzn07E55yDbh0jNMiARRIwkUTg78WBQ5RcoSl7XzUL0tINgXtjcc0K5YIjCxnppyCFymg/exec";
// Akun demo (sama seperti scripts/setup-users.ts) — hanya untuk baca loadAll.
const GAS_USER = "sidira";
const GAS_PASS = "sidira2026";

const VALID_KAT = ["alkes", "meubelair", "elektronik", "lainnya"];

/** gudang_bhp → gudang-bhp ; r__gizi → r-gizi */
function gasRoomToSlug(id: string | null | undefined): string | null {
  if (!id || id.startsWith("custom_")) return null;
  return id.replace(/_/g, "-").replace(/-{2,}/g, "-");
}

interface GasResponse {
  ok?: boolean;
  error?: string;
  token?: string;
  user?: { username?: string; role?: string };
  [key: string]: unknown;
}

async function gasCall(body: Record<string, unknown>): Promise<GasResponse> {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as GasResponse;
}

function isEmptyObj(o: unknown): boolean {
  return (
    !!o &&
    typeof o === "object" &&
    Object.values(o as Record<string, unknown>).every((v) => v === "" || v == null)
  );
}

async function main() {
  console.log("🔐 Login GAS (read-only)...");
  const login = await gasCall({ action: "login", username: GAS_USER, password: GAS_PASS });
  if (!login.ok || typeof login.token !== "string")
    throw new Error("Login GAS gagal: " + login.error);
  const token = login.token;

  console.log("📥 loadAll...");
  const all = await gasCall({ action: "loadAll", token });
  await gasCall({ action: "logout", token });
  console.log("🔓 Logout GAS OK");

  // Daftar slug ruangan valid di DB (untuk validasi FK)
  const { data: dbRooms } = await supabase.from("rooms").select("id");
  const validSlugs = new Set((dbRooms ?? []).map((r) => r.id as string));
  const mapRoom = (id: string | null | undefined): string | null => {
    const slug = gasRoomToSlug(id);
    return slug && validSlugs.has(slug) ? slug : null;
  };

  interface GasPakta {
    id?: string;
    hari?: string;
    tgl?: string;
    nama?: string;
    nip?: string;
    jabatan?: string;
    alamat?: string;
    asetKendaraan?: Record<string, unknown>[];
    asetLaptop?: Record<string, unknown>[];
    asetAlat?: Record<string, unknown>[];
  }
  interface GasMvLog {
    ts?: string;
    namaItem?: string;
    kat?: string;
    dariRoom?: string;
    keRoom?: string;
    dariName?: string;
    keName?: string;
  }
  const gasPakta = (all.pakta ?? []) as GasPakta[];
  const gasMvLog = (all.mvLog ?? []) as GasMvLog[];
  const gasPj = (all.pj ?? {}) as Record<string, string>;

  // ── 1. PAKTA (upsert by id) ──
  let paktaOk = 0;
  for (const p of gasPakta) {
    if (!p.id || !p.nama) {
      console.log(`   ⚠️  pakta dilewati (id/nama kosong): ${p.id}`);
      continue;
    }
    const row = {
      id: p.id,
      hari: p.hari || null,
      tgl: p.tgl ? String(p.tgl).slice(0, 10) : null,
      nama: p.nama,
      nip: p.nip || null,
      jabatan: p.jabatan || null,
      alamat: p.alamat || null,
      aset_kendaraan: (p.asetKendaraan ?? []).filter((a: unknown) => !isEmptyObj(a)),
      aset_laptop: (p.asetLaptop ?? []).filter((a: unknown) => !isEmptyObj(a)),
      aset_alat: (p.asetAlat ?? []).filter((a: unknown) => !isEmptyObj(a)),
    };
    const { error } = await supabase.from("pakta").upsert(row, { onConflict: "id" });
    if (error) console.log(`   ❌ pakta ${p.id}: ${error.message}`);
    else paktaOk++;
  }
  console.log(`✅ pakta: ${paktaOk}/${gasPakta.length} upsert`);

  // ── 2. RIWAYAT (insert bila belum ada) ──
  // Kunci dinormalisasi via epoch-ms: Postgres mengembalikan timestamptz
  // sebagai "+00:00" sedangkan GAS mengirim "Z" — string mentah tak cocok.
  const keyOf = (ts: string, nama: string, dari: string | null, ke: string | null) =>
    `${new Date(ts).getTime()}|${nama}|${dari}|${ke}`;
  const { data: existing } = await supabase
    .from("riwayat_pindah")
    .select("id, ts, nama, dari, ke")
    .order("id");
  // Self-heal: hapus duplikat eksak (simpan id terkecil per grup)
  const keepByKey = new Map<string, number>();
  const dupeIds: number[] = [];
  for (const r of existing ?? []) {
    const k = keyOf(r.ts, r.nama, r.dari, r.ke);
    if (keepByKey.has(k)) dupeIds.push(r.id);
    else keepByKey.set(k, r.id);
  }
  if (dupeIds.length > 0) {
    await supabase.from("riwayat_pindah").delete().in("id", dupeIds);
    console.log(`   🧹 riwayat duplikat dihapus: ${dupeIds.length}`);
  }
  const seen = new Set(keepByKey.keys());
  let riwayatOk = 0;
  let riwayatSkip = 0;
  for (const m of gasMvLog) {
    if (!m.namaItem) {
      console.log("   ⚠️  mvLog dilewati (nama kosong)");
      continue;
    }
    const row = {
      ts: m.ts || new Date().toISOString(),
      nama: m.namaItem,
      kat: m.kat && VALID_KAT.includes(m.kat) ? m.kat : null,
      dari: mapRoom(m.dariRoom),
      ke: mapRoom(m.keRoom),
      dari_name: m.dariName || null,
      ke_name: m.keName || null,
      user_id: null,
    };
    const key = keyOf(row.ts, row.nama, row.dari, row.ke);
    if (seen.has(key)) {
      riwayatSkip++;
      continue;
    }
    const { error } = await supabase.from("riwayat_pindah").insert(row);
    if (error) console.log(`   ❌ riwayat ${row.nama}: ${error.message}`);
    else {
      seen.add(key);
      riwayatOk++;
    }
  }
  console.log(`✅ riwayat: ${riwayatOk} insert, ${riwayatSkip} sudah ada`);

  // ── 3. PJ (upsert tabel + kolom rooms.pj) ──
  let pjOk = 0;
  for (const [gasId, nama] of Object.entries(gasPj)) {
    const slug = mapRoom(gasId);
    if (!slug || !nama) {
      console.log(`   ⚠️  pj dilewati: ${gasId}`);
      continue;
    }
    const { error: e1 } = await supabase
      .from("penanggung_jawab")
      .upsert({ room_id: slug, nama }, { onConflict: "room_id" });
    const { error: e2 } = await supabase.from("rooms").update({ pj: nama }).eq("id", slug);
    if (e1 || e2) console.log(`   ❌ pj ${slug}: ${e1?.message ?? e2?.message}`);
    else pjOk++;
  }
  console.log(`✅ pj: ${pjOk} ruangan`);

  console.log("\n🎉 Migrasi operasional selesai");
}

main().catch((e) => {
  console.error("❌ FATAL:", e.message);
  process.exit(1);
});
