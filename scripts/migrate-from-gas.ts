/**
 * Migration Script: Google Sheets → Supabase PostgreSQL
 *
 * Script ini membaca data dari Google Sheets (via URL export CSV)
 * dan mengimportnya ke Supabase PostgreSQL.
 *
 * PRASYARAT:
 * 1. Buka Google Sheets SIDIRA lama
 * 2. Export setiap sheet ke CSV (File → Download → CSV)
 * 3. Simpan file CSV di folder `migration-data/` dengan nama sesuai sheet:
 *    - rooms.csv (dari sheet "InventarisRuangan")
 *    - sbbk.csv (dari sheet "SBBK")
 *    - pakta.csv (dari sheet "Pakta")
 *    - dll
 *
 * ATAU gunakan Google Sheets URL export:
 *    https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={GID}
 *
 * CARA JALANKAN:
 *   npx tsx scripts/migrate-from-gas.ts
 *
 * KONFIGURASI:
 *   Set SPREADSHEET_ID di .env.local atau ganti manual di bawah
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

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

const MIGRATION_DIR = path.join(process.cwd(), "migration-data");

// ═══════════════════════════════════════════════════════
//  CSV Parser (simple, handles quoted fields)
// ═══════════════════════════════════════════════════════

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() || "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ═══════════════════════════════════════════════════════
//  Migration Functions
// ═══════════════════════════════════════════════════════

async function migrateRooms() {
  console.log("\n📦 Migrating Rooms...");

  const csvPath = path.join(MIGRATION_DIR, "rooms.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   ⚠️  File rooms.csv tidak ditemukan, skip...");
    return 0;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  // Group by roomId (karena di GAS, satu room bisa punya multiple rows)
  const roomsMap = new Map<string, any>();

  for (const row of rows) {
    const roomId = row.roomId;
    if (!roomId) continue;

    if (!roomsMap.has(roomId)) {
      roomsMap.set(roomId, {
        id: roomId,
        name: row.roomName || roomId,
        icon: row.roomIcon || "🏥",
        color: row.roomColor || "#0e7c6b",
        bg: row.roomBg || "#d4f0eb",
        description: row.roomDesc || "",
        pj: row.roomPj || "",
        order_index: parseInt(row.roomOrder) || 0,
      });
    }
  }

  const rooms = Array.from(roomsMap.values());
  let count = 0;

  for (const room of rooms) {
    const { error } = await supabase.from("rooms").upsert(room);
    if (error) {
      console.log(`   ❌ Error importing room ${room.name}: ${error.message}`);
    } else {
      count++;
    }
  }

  console.log(`   ✅ Imported ${count} rooms`);
  return count;
}

async function migrateItems() {
  console.log("\n📦 Migrating Items...");

  const csvPath = path.join(MIGRATION_DIR, "items.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   ⚠️  File items.csv tidak ditemukan, skip...");
    return 0;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  let count = 0;

  for (const row of rows) {
    if (!row.roomId || !row.itemJson) continue;

    try {
      const item = JSON.parse(row.itemJson);
      const { error } = await supabase.from("items").insert({
        room_id: row.roomId,
        category: item.kat || "lainnya",
        name: item.nama || "Unknown",
        merk: item.merk || null,
        type: item.type || null,
        year: item.tahun ? parseInt(item.tahun) : null,
        quantity: parseInt(item.qty) || 1,
        unit: item.satuan || "unit",
        condition: item.kondisi || "baik",
        notes: item.ket || null,
        index_in_room: parseInt(row.itemIndex) || 0,
      });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        count++;
      }
    } catch (e) {
      console.log(`   ❌ Parse error: ${e}`);
    }
  }

  console.log(`   ✅ Imported ${count} items`);
  return count;
}

async function migrateSbbk() {
  console.log("\n📦 Migrating SBBK...");

  const csvPath = path.join(MIGRATION_DIR, "sbbk.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   ⚠️  File sbbk.csv tidak ditemukan, skip...");
    return 0;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  let count = 0;

  for (const row of rows) {
    if (!row.id) continue;

    try {
      const items = row.items_json ? JSON.parse(row.items_json) : [];
      const { error } = await supabase.from("sbbk").insert({
        id: row.id,
        no: row.no || "",
        tgl: row.tgl || new Date().toISOString().split("T")[0],
        kepada: row.kepada || "",
        jenis: row.jenis || null,
        anggaran: row.anggaran || null,
        ket_umum: row.ketUmum || null,
        items_json: JSON.stringify(items),
      });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        count++;
      }
    } catch (e) {
      console.log(`   ❌ Parse error: ${e}`);
    }
  }

  console.log(`   ✅ Imported ${count} SBBK records`);
  return count;
}

async function migratePakta() {
  console.log("\n📦 Migrating Pakta...");

  const csvPath = path.join(MIGRATION_DIR, "pakta.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   ⚠️  File pakta.csv tidak ditemukan, skip...");
    return 0;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  let count = 0;

  for (const row of rows) {
    if (!row.id) continue;

    try {
      const kendaraan = row.asetKendaraan_json ? JSON.parse(row.asetKendaraan_json) : [];
      const laptop = row.asetLaptop_json ? JSON.parse(row.asetLaptop_json) : [];
      const alat = row.asetAlat_json ? JSON.parse(row.asetAlat_json) : [];

      const { error } = await supabase.from("pakta").insert({
        id: row.id,
        hari: row.hari || null,
        tgl: row.tgl || null,
        nama: row.nama || "",
        nip: row.nip || null,
        jabatan: row.jabatan || null,
        alamat: row.alamat || null,
        aset_kendaraan: JSON.stringify(kendaraan),
        aset_laptop: JSON.stringify(laptop),
        aset_alat: JSON.stringify(alat),
      });

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        count++;
      }
    } catch (e) {
      console.log(`   ❌ Parse error: ${e}`);
    }
  }

  console.log(`   ✅ Imported ${count} Pakta records`);
  return count;
}

async function migratePenanggungJawab() {
  console.log("\n📦 Migrating Penanggung Jawab...");

  const csvPath = path.join(MIGRATION_DIR, "pj.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   ⚠️  File pj.csv tidak ditemukan, skip...");
    return 0;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  let count = 0;

  for (const row of rows) {
    if (!row.roomId || !row.nama) continue;

    const { error } = await supabase.from("penanggung_jawab").upsert({
      room_id: row.roomId,
      nama: row.nama,
    });

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      count++;
    }
  }

  console.log(`   ✅ Imported ${count} PJ records`);
  return count;
}

async function migrateUsulan() {
  console.log("\n📦 Migrating Usulan...");

  const csvPath = path.join(MIGRATION_DIR, "usulan.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("   ⚠️  File usulan.csv tidak ditemukan, skip...");
    return 0;
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  let count = 0;

  for (const row of rows) {
    if (!row.payload_json) continue;

    try {
      const payload = JSON.parse(row.payload_json);

      // Usulan di GAS disimpan sebagai satu JSON besar
      // Di schema baru, kita simpan per room
      if (typeof payload === "object") {
        for (const roomId in payload) {
          const { error } = await supabase.from("usulan").insert({
            room_id: roomId,
            payload: JSON.stringify(payload[roomId]),
          });

          if (error) {
            console.log(`   ❌ Error for room ${roomId}: ${error.message}`);
          } else {
            count++;
          }
        }
      }
    } catch (e) {
      console.log(`   ❌ Parse error: ${e}`);
    }
  }

  console.log(`   ✅ Imported ${count} Usulan records`);
  return count;
}

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log("🚀 SIDIRA Data Migration: Google Sheets → Supabase\n");

  // Check migration data directory
  if (!fs.existsSync(MIGRATION_DIR)) {
    console.log("📁 Folder migration-data/ tidak ditemukan.");
    console.log("\n📋 Cara menggunakan:");
    console.log("   1. Buat folder: mkdir migration-data");
    console.log("   2. Export Google Sheets ke CSV:");
    console.log("      - InventarisRuangan → migration-data/rooms.csv");
    console.log("      - InventarisRuangan (items only) → migration-data/items.csv");
    console.log("      - SBBK → migration-data/sbbk.csv");
    console.log("      - Pakta → migration-data/pakta.csv");
    console.log("      - PenanggungJawab → migration-data/pj.csv");
    console.log("      - Usulan → migration-data/usulan.csv");
    console.log("   3. Jalankan lagi: npx tsx scripts/migrate-from-gas.ts");
    console.log("\n💡 Atau export semua sheet sekaligus dari Google Sheets:");
    console.log("   File → Download → Comma Separated Values (.csv)");

    fs.mkdirSync(MIGRATION_DIR, { recursive: true });
    console.log(`\n✅ Folder migration-data/ sudah dibuat. Silakan taruh file CSV di sana.`);
    return;
  }

  console.log(`📁 Found migration data in: ${MIGRATION_DIR}\n`);

  // Run migrations in order
  const results = {
    rooms: await migrateRooms(),
    items: await migrateItems(),
    sbbk: await migrateSbbk(),
    pakta: await migratePakta(),
    pj: await migratePenanggungJawab(),
    usulan: await migrateUsulan(),
  };

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("\n📊 Migration Summary:\n");
  console.table(results);

  const total = Object.values(results).reduce((a, b) => a + b, 0);
  console.log(`\n✨ Total: ${total} records migrated\n`);

  // Verification
  console.log("🔍 Verifying data in Supabase...\n");

  const { count: roomCount } = await supabase.from("rooms").select("*", { count: "exact", head: true });
  const { count: itemCount } = await supabase.from("items").select("*", { count: "exact", head: true });
  const { count: sbbkCount } = await supabase.from("sbbk").select("*", { count: "exact", head: true });

  console.log(`   Rooms: ${roomCount || 0}`);
  console.log(`   Items: ${itemCount || 0}`);
  console.log(`   SBBK:  ${sbbkCount || 0}`);
  console.log("\n✅ Migration complete!\n");
}

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
