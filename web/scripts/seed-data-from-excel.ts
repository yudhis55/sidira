import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

// Sheet name to room ID mapping
const SHEET_TO_ROOM_MAP: Record<string, string> = {
  "GUDANG BHP": "gudang-bhp",
  "POLI TB": "poli-tb",
  "DAPUR 2": "dapur-2",
  "R. CUCI LINEN": "r-cuci-linen",
  "GUDANG OBAT": "gudang-obat",
  "TATA USAHA 2 ": "tata-usaha-2",
  "RUANG TATA USAHA 1": "ruang-tata-usaha-1",
  "R. KAPUS": "r-kapus",
  "IMMUNISASI ": "immunisasi",
  "TU 3": "tu-3",
  "R. KESLING": "r-kesling",
  "RUANG CKG": "ruang-ckg",
  "R. PROMKES": "r-promkes",
  "R. UKP": "r-ukp",
  "R. UKM": "r-ukm",
  "R.PTM": "r-ptm",
  "R. STERILISASI": "r-sterilisasi",
  "RAFLESIA": "raflesia",
  "LOKET": "loket",
  "KASIR": "kasir",
  "KASIR lt. 2": "kasir-lt-2",
  "R. GIZI": "r-gizi",
  "BP": "bp",
  "R. GIGI": "r-gigi",
  "R. MTBS": "r-mtbs",
  "R. KB": "r-kb",
  "BKIA": "bkia",
  "APOTIK": "apotik",
  "APOTIK LT 2": "apotik-lt-2",
  "RUANG PONED": "ruang-poned",
  "RUANG NEONATUS": "ruang-neonatus",
  "LABORATORIUM": "laboratorium",
  "U  G  D ": "u-g-d",
  "POLINDES KARANGANOM ": "polindes-karanganom",
  "PUSTU KAMULAN": "pustu-kamulan",
  "PUSTU SUMBERGAYAM": "pustu-sumbergayam",
  "POLINDES PAKIS": "polindes-pakis",
  "PUSTU GADOR ": "pustu-gador",
  "SUMBEREJO ": "sumberejo",
  "R. AKREDITASI 1": "r-akreditasi-1",
  "R ALKREDITASI 2": "r-alkreditasi-2",
  "RUANG PERTEMUAN ": "ruang-pertemuan",
  "RUANG NAKULA ": "ruang-nakula",
  "SADEWA ": "sadewa",
  "R. BIMA ": "r-bima",
  "R. ARJUNA": "r-arjuna",
  "R. SRIKANDI ": "r-srikandi",
  "MELATI ": "melati",
  "RUANG GAS 02": "ruang-gas-02",
  "REKAM MEDIS LT 2": "rekam-medis-lt-2",
  "RONTGEN": "rontgen",
};

// Category mapping
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CATEGORY_MAP: Record<string, string> = {
  "ALAT KESEHATAN": "alkes",
  "MEUBELAIR": "meubelair",
  "ELEKTRONIK": "elektronik",
  "LAINNYA": "lainnya",
};

// Condition mapping
const CONDITION_MAP: Record<string, string> = {
  "B": "baik",
  "KB": "rusak_ringan",
  "RB": "rusak_berat",
};

interface RoomData {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  pj: string;
  order_index: number;
}

interface ItemData {
  room_id: string;
  category: string;
  name: string;
  merk: string;
  model: string;
  year: number | null;
  quantity: number;
  unit: string;
  condition: string;
  notes: string;
}

function parseSheetName(sheetName: string): string {
  // Remove trailing spaces
  return sheetName.trim();
}

function parseRoomFromSheet(sheetName: string): RoomData | null {
  const cleanName = parseSheetName(sheetName);
  const roomId = SHEET_TO_ROOM_MAP[sheetName];

  if (!roomId) {
    console.warn(`⚠️  No mapping for sheet: "${sheetName}"`);
    return null;
  }

  // Assign icon based on room name
  let icon = "🏥";
  const nameLower = cleanName.toLowerCase();

  if (nameLower.includes("poli") || nameLower.includes("bp")) icon = "🩺";
  else if (nameLower.includes("lab")) icon = "🔬";
  else if (nameLower.includes("gudang")) icon = "📦";
  else if (nameLower.includes("apotik")) icon = "💊";
  else if (nameLower.includes("kasir")) icon = "💰";
  else if (nameLower.includes("loket")) icon = "🎫";
  else if (nameLower.includes("gizi")) icon = "🍽️";
  else if (nameLower.includes("cuci")) icon = "🧺";
  else if (nameLower.includes("steril")) icon = "✨";
  else if (nameLower.includes("tata usaha") || nameLower.includes("tu ")) icon = "📋";
  else if (nameLower.includes("kapus")) icon = "👨‍⚕️";
  else if (nameLower.includes("imun")) icon = "💉";
  else if (nameLower.includes("poned") || nameLower.includes("ugd")) icon = "🚑";
  else if (nameLower.includes("neonat")) icon = "👶";
  else if (nameLower.includes("kb") || nameLower.includes("bki")) icon = "👩‍⚕️";
  else if (nameLower.includes("mtbs")) icon = "👶";
  else if (nameLower.includes("polindes") || nameLower.includes("pustu")) icon = "🏥";
  else if (nameLower.includes("akreditasi")) icon = "📋";
  else if (nameLower.includes("pertemuan")) icon = "🏛️";
  else if (nameLower.includes("nakula") || nameLower.includes("sadewa") ||
           nameLower.includes("bima") || nameLower.includes("arjuna") ||
           nameLower.includes("srikandi") || nameLower.includes("melati")) icon = "🛏️";
  else if (nameLower.includes("gas")) icon = "⛽";
  else if (nameLower.includes("rekam")) icon = "📁";
  else if (nameLower.includes("rontgen")) icon = "☢️";
  else if (nameLower.includes("rafliesia")) icon = "🌺";
  else if (nameLower.includes("promkes")) icon = "📢";
  else if (nameLower.includes("ukp") || nameLower.includes("ukm")) icon = "📋";
  else if (nameLower.includes("ptm")) icon = "📋";
  else if (nameLower.includes("kesling")) icon = "🌿";
  else if (nameLower.includes("ckg")) icon = "🦷";
  else if (nameLower.includes("sumberejo")) icon = "🏥";

  return {
    id: roomId,
    name: cleanName,
    icon,
    color: "#0e7c6b",
    bg: "#d4f0eb",
    description: "",
    pj: "",
    order_index: 0,
  };
}

function parseItemFromRow(row: unknown[], rowIndex: number): ItemData | null {
  // Skip header rows (first ~15 rows typically)
  if (rowIndex < 15) return null;

  // Skip empty rows
  if (!row || row.length === 0) return null;

  // Extract data from row (based on Excel structure)
  const _no = row[0];
  const nama = row[1];
  const merk = row[2] || "";
  const model = row[3] || "";
  const _bahan = row[4] || "";
  const tahun = row[5] ? parseInt(row[5] as string) : null;
  const _kode = row[6] || "";
  const jumlah = parseInt(row[7] as string) || 1;
  const _harga = parseFloat(row[8] as string) || 0;
  const _kondisi_b = row[9];
  const kondisi_kb = row[10];
  const kondisi_rb = row[11];
  const notes = row[12] || "";

  // Skip if no nama or nama is not a string
  if (!nama || typeof nama !== "string" || nama.trim() === "") return null;

  // Determine condition
  let condition = "baik";
  if (kondisi_kb === "✓" || kondisi_kb === "KB") {
    condition = "rusak_ringan";
  } else if (kondisi_rb === "✓" || kondisi_rb === "RB") {
    condition = "rusak_berat";
  }

  // Determine category (simplified for now - would need more logic)
  const category = "lainnya"; // Would need category mapping logic

  return {
    room_id: "", // Will be set later
    category,
    name: nama.trim(),
    merk: typeof merk === "string" ? merk.trim() : "",
    model: typeof model === "string" ? model.trim() : "",
    year: tahun,
    quantity: jumlah,
    unit: "unit",
    condition,
    notes: typeof notes === "string" ? notes.trim() : "",
  };
}

async function main() {
  console.log("=== SIDIRA Excel Seeder ===\n");

  const excelPath = path.join(__dirname, "..", "..", "KARTU INVENTARIS RUANGAN 2026.xlsx");

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel file not found: ${excelPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading Excel file: ${excelPath}\n`);

  const workbook = XLSX.readFile(excelPath);
  const sheetNames = workbook.SheetNames;

  console.log(`📊 Found ${sheetNames.length} sheets\n`);

  const rooms: RoomData[] = [];
  const items: ItemData[] = [];

  let roomOrderIndex = 0;

  for (const sheetName of sheetNames) {
    const room = parseRoomFromSheet(sheetName);

    if (!room) {
      console.log(`⏭️  Skipping sheet: ${sheetName}`);
      continue;
    }

    room.order_index = roomOrderIndex++;
    rooms.push(room);

    console.log(`\n📋 Processing sheet: ${sheetName} → ${room.id}`);

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    let itemCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as unknown[];
      const item = parseItemFromRow(row, i);

      if (item) {
        item.room_id = room.id;
        items.push(item);
        itemCount++;
      }
    }

    console.log(`   ✓ Added ${itemCount} items`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Rooms: ${rooms.length}`);
  console.log(`   Items: ${items.length}`);

  // Generate SQL
  const sqlStatements: string[] = [];

  // Rooms INSERT
  sqlStatements.push("-- Rooms INSERT statements");
  for (const room of rooms) {
    const sql = `INSERT INTO rooms (id, name, icon, color, bg, description, pj, order_index, updated_at) VALUES ('${room.id}', '${room.name.replace(/'/g, "''")}', '${room.icon}', '${room.color}', '${room.bg}', '${room.description.replace(/'/g, "''")}', '${room.pj.replace(/'/g, "''")}', ${room.order_index}, NOW()) ON CONFLICT (id) DO NOTHING;`;
    sqlStatements.push(sql);
  }

  // Items INSERT
  sqlStatements.push("\n-- Items INSERT statements");
  for (const item of items) {
    const sql = `INSERT INTO items (room_id, category, name, merk, model, year, quantity, unit, condition, notes, updated_at) VALUES ('${item.room_id}', '${item.category}', '${item.name.replace(/'/g, "''")}', '${item.merk.replace(/'/g, "''")}', '${item.model.replace(/'/g, "''")}', ${item.year || "NULL"}, ${item.quantity}, '${item.unit}', '${item.condition}', '${item.notes.replace(/'/g, "''")}', NOW());`;
    sqlStatements.push(sql);
  }

  // Write SQL to file
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "20260620000000_seed_rooms_and_items.sql");
  fs.writeFileSync(sqlPath, sqlStatements.join("\n"), "utf-8");

  console.log(`\n✅ SQL file generated: ${sqlPath}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review the generated SQL file`);
  console.log(`   2. Run: npx supabase db reset`);
  console.log(`   3. Run: npx supabase db push`);
}

main().catch(console.error);
