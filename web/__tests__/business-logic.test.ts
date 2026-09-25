/**
 * Unit Tests untuk Business Logic SIDIRA
 *
 * Jalankan: npx tsx __tests__/business-logic.test.ts
 *
 * Test ini tidak membutuhkan database atau koneksi internet.
 * Hanya menguji fungsi-fungsi murni (pure functions).
 */

import {
  generateSbbkNumber,
  isValidSbbkNumber,
  calculateTotalValue,
  getConditionCategory,
  calculateConditionPercentage,
  isValidEmail,
  generateRoomId,
  hasPermission,
  formatRupiah,
  calculateItemAge,
  calculateSbbkTotalItems,
  validateRoom,
  validateItem,
  todayString,
  daysInMonth,
} from "../lib/business-logic";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${message}`);
  }
}

function assertEqual(actual: unknown, expected: unknown, message: string) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  if (isEqual) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${message}`);
    console.log(`     Expected: ${JSON.stringify(expected)}`);
    console.log(`     Actual:   ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn: () => void, message: string) {
  try {
    fn();
    failed++;
    console.log(`  ❌ FAIL: ${message} (seharusnya throw error)`);
  } catch {
    passed++;
    console.log(`  ✅ ${message}`);
  }
}

// ═══════════════════════════════════════════════════════
//  TEST SUITE
// ═══════════════════════════════════════════════════════

console.log("\n🧪 SIDIRA Business Logic Unit Tests\n");

// ── 1. SBBK Number ──
console.log("── SBBK Number ──");

assertEqual(
  generateSbbkNumber(new Date(2026, 5, 18), 1),
  "SBBK/2026/06/0001",
  "Generate SBBK number #1"
);

assertEqual(
  generateSbbkNumber(new Date(2026, 0, 1), 42),
  "SBBK/2026/01/0042",
  "Generate SBBK number #42 dengan bulan Januari"
);

assertEqual(
  generateSbbkNumber(new Date(2026, 11, 31), 999),
  "SBBK/2026/12/0999",
  "Generate SBBK number #999 bulan Desember"
);

assert(isValidSbbkNumber("SBBK/2026/06/0001"), "Valid SBBK number accepted");
assert(!isValidSbbkNumber("SBBK/2026/6/0001"), "Invalid month format rejected");
assert(!isValidSbbkNumber("SBBK/2026/06/1"), "Invalid sequence format rejected");
assert(!isValidSbbkNumber("sbbk/2026/06/0001"), "Lowercase prefix rejected");
assert(!isValidSbbkNumber(""), "Empty string rejected");

// ── 2. Total Value ──
console.log("\n── Calculate Total Value ──");

assertEqual(calculateTotalValue(10, 50000), 500000, "10 x 50,000 = 500,000");
assertEqual(calculateTotalValue(1, 0), 0, "1 x 0 = 0");
assertEqual(calculateTotalValue(0, 100000), 0, "0 x 100,000 = 0");

assertThrows(
  () => calculateTotalValue(-1, 50000),
  "Negative quantity throws error"
);

assertThrows(
  () => calculateTotalValue(5, -1000),
  "Negative unit price throws error"
);

// ── 3. Condition Category ──
console.log("\n── Condition Category ──");

assertEqual(getConditionCategory("baik"), "good", "baik -> good");
assertEqual(getConditionCategory("rr"), "damaged", "rr -> damaged");
assertEqual(getConditionCategory("rb"), "damaged", "rb -> damaged");
assertEqual(getConditionCategory("ta"), "missing", "ta -> missing");
assertEqual(getConditionCategory("unknown"), "missing", "unknown -> missing");

// ── 4. Condition Percentage ──
console.log("\n── Condition Percentage ──");

assertEqual(
  calculateConditionPercentage(0, { baik: 0, rr: 0, rb: 0, ta: 0 }),
  { baik: 0, rr: 0, rb: 0, ta: 0 },
  "Zero total items returns all zeros"
);

assertEqual(
  calculateConditionPercentage(100, { baik: 80, rr: 10, rb: 5, ta: 5 }),
  { baik: 80, rr: 10, rb: 5, ta: 5 },
  "100 items with correct percentages"
);

assertEqual(
  calculateConditionPercentage(10, { baik: 7, rr: 2, rb: 1, ta: 0 }),
  { baik: 70, rr: 20, rb: 10, ta: 0 },
  "10 items with rounding"
);

assertEqual(
  calculateConditionPercentage(3, { baik: 1, rr: 1, rb: 1, ta: 0 }),
  { baik: 33, rr: 33, rb: 33, ta: 0 },
  "3 items with rounding (33% each)"
);

// ── 5. Email Validation ──
console.log("\n── Email Validation ──");

assert(isValidEmail("user@example.com"), "Valid email accepted");
assert(isValidEmail("sidira@sidira.local"), "Local domain email accepted");
assert(!isValidEmail(""), "Empty string rejected");
assert(!isValidEmail("notanemail"), "No @ symbol rejected");
assert(!isValidEmail("@nodomain.com"), "Missing username rejected");
assert(!isValidEmail("user@.com"), "Missing domain rejected");

// ── 6. Room ID Generation ──
console.log("\n── Room ID Generation ──");

assertEqual(generateRoomId("Ruang Periksa 1"), "ruang-periksa-1", "Spaces converted to dashes");
assertEqual(generateRoomId("Lab. Kimia"), "lab-kimia", "Dot converted to dash");
assertEqual(generateRoomId("ICU"), "icu", "Uppercase converted to lowercase");
assertEqual(generateRoomId("  Ruang VIP  "), "ruang-vip", "Leading/trailing spaces trimmed");
assertEqual(generateRoomId("Poli Gigi & Mulut"), "poli-gigi-mulut", "Special characters removed");

// ── 7. Permission Check ──
console.log("\n── Permission Check ──");

assert(hasPermission("admin", ["admin", "editor"]), "Admin has admin+editor permission");
assert(hasPermission("editor", ["admin", "editor"]), "Editor has admin+editor permission");
assert(!hasPermission("viewer", ["admin", "editor"]), "Viewer does NOT have admin+editor permission");
assert(hasPermission("viewer", ["admin", "editor", "viewer"]), "Viewer has all-role permission");
assert(hasPermission("admin", ["admin"]), "Admin has admin-only permission");

// ── 8. Format Rupiah ──
console.log("\n── Format Rupiah ──");

assertEqual(formatRupiah(0), "Rp 0", "0 rupiah");
assertEqual(formatRupiah(1000), "Rp 1.000", "1,000 rupiah");
assertEqual(formatRupiah(1500000), "Rp 1.500.000", "1.5 million rupiah");
assertEqual(formatRupiah(50000), "Rp 50.000", "50,000 rupiah");

// ── 9. Item Age ──
console.log("\n── Item Age Calculation ──");

const testDate = new Date(2026, 5, 18); // 18 June 2026

assertEqual(
  calculateItemAge("2020-06-18", testDate),
  6,
  "Item from exactly 6 years ago"
);

assertEqual(
  calculateItemAge("2025-01-01", testDate),
  1,
  "Item from ~1.5 years ago = 1 year"
);

assertEqual(
  calculateItemAge("2026-06-18", testDate),
  0,
  "Item from today = 0 years"
);

// ── 10. SBBK Total Items ──
console.log("\n── SBBK Total Items ──");

assertEqual(
  calculateSbbkTotalItems([
    { quantity: 5 },
    { quantity: 3 },
    { quantity: 2 },
  ]),
  10,
  "Sum of 5 + 3 + 2 = 10"
);

assertEqual(calculateSbbkTotalItems([]), 0, "Empty items = 0");
assertEqual(
  calculateSbbkTotalItems([{ quantity: 1 }]),
  1,
  "Single item = 1"
);

// ── 11. Room Validation ──
console.log("\n── Room Validation ──");

const validRoom = validateRoom({ name: "Ruang Periksa", icon: "🏥" });
assert(validRoom.valid, "Valid room passes validation");
assertEqual(validRoom.errors.length, 0, "Valid room has no errors");

const emptyName = validateRoom({ name: "", icon: "🏥" });
assert(!emptyName.valid, "Empty name fails validation");

const longName = validateRoom({ name: "A".repeat(101), icon: "🏥" });
assert(!longName.valid, "Name > 100 chars fails validation");

// ── 12. Item Validation ──
console.log("\n── Item Validation ──");

const validItem = validateItem({
  name: "Stetoskop",
  category: "alkes",
  quantity: 1,
  unit: "unit",
  condition: "baik",
});
assert(validItem.valid, "Valid item passes validation");

const invalidCategory = validateItem({
  name: "Test",
  category: "invalid",
  quantity: 1,
  unit: "unit",
  condition: "baik",
});
assert(!invalidCategory.valid, "Invalid category fails validation");

const zeroQty = validateItem({
  name: "Test",
  category: "alkes",
  quantity: 0,
  unit: "unit",
  condition: "baik",
});
assert(!zeroQty.valid, "Zero quantity fails validation");

const noUnit = validateItem({
  name: "Test",
  category: "alkes",
  quantity: 1,
  unit: "",
  condition: "baik",
});
assert(!noUnit.valid, "Empty unit fails validation");

// ── 13. Date Utilities ──
console.log("\n── Date Utilities ──");

const today = todayString();
assert(/^\d{4}-\d{2}-\d{2}$/.test(today), "todayString returns YYYY-MM-DD format");

assertEqual(daysInMonth(2026, 1), 28, "February 2026 has 28 days");
assertEqual(daysInMonth(2024, 1), 29, "February 2024 (leap) has 29 days");
assertEqual(daysInMonth(2026, 0), 31, "January has 31 days");
assertEqual(daysInMonth(2026, 3), 30, "April has 30 days");

// ── 14. Frekuensi Utilitas ──
console.log("\n── Frekuensi Utilitas ──");

import {
  parseFrekuensi,
  expectedInMonth,
  fulfillmentStatus,
  monthFulfillment,
  countDoneInRange,
} from "../lib/utilitas-frekuensi";

assertEqual(parseFrekuensi("Harian"), "harian", "parse Harian");
assertEqual(parseFrekuensi("Mingguan"), "mingguan", "parse Mingguan");
assertEqual(parseFrekuensi("Bulanan"), "bulanan", "parse Bulanan");
assertEqual(parseFrekuensi("Semester"), "semester", "parse Semester");
assertEqual(parseFrekuensi("Tahunan"), "tahunan", "parse Tahunan");
assertEqual(parseFrekuensi("Min. 1 Tahun 1x"), "tahunan", "parse Min. 1 Tahun 1x");
assertEqual(parseFrekuensi("Setiap 5000 KM"), "lainnya", "parse non-tanggal");
assertEqual(parseFrekuensi(""), "lainnya", "parse kosong");
assertEqual(parseFrekuensi(undefined), "lainnya", "parse undefined");

const fakeToday = new Date(2026, 8, 22); // 22 Sep 2026
assertEqual(expectedInMonth("harian", 2026, 8, fakeToday), 22, "harian Sep: 22 hari");
assertEqual(expectedInMonth("harian", 2026, 7, fakeToday), 31, "harian Agu: 31 hari");
assertEqual(expectedInMonth("harian", 2026, 9, fakeToday), 0, "harian Okt: mendatang");
assertEqual(expectedInMonth("mingguan", 2026, 8, fakeToday), 4, "mingguan Sep: ceil(22/7)");
assertEqual(expectedInMonth("bulanan", 2026, 8, fakeToday), 1, "bulanan Sep: 1");
assertEqual(expectedInMonth("bulanan", 2026, 9, fakeToday), 0, "bulanan Okt: 0");
assertEqual(expectedInMonth("semester", 2026, 8, fakeToday), 1, "semester H2: 1");
assertEqual(expectedInMonth("tahunan", 2026, 8, fakeToday), 1, "tahunan: 1");
assertEqual(expectedInMonth("lainnya", 2026, 8, fakeToday), -1, "lainnya: -1");

assertEqual(fulfillmentStatus("harian", 22, 22, false), "terpenuhi", "22/22 terpenuhi");
assertEqual(fulfillmentStatus("harian", 3, 22, false), "sebagian", "3/22 sebagian");
assertEqual(fulfillmentStatus("harian", 0, 22, false), "belum", "0/22 belum");
assertEqual(fulfillmentStatus("harian", 0, 0, true), "mendatang", "future mendatang");
assertEqual(fulfillmentStatus("lainnya", 1, -1, false), "terpenuhi", "lainnya ada");
assertEqual(fulfillmentStatus("lainnya", 0, -1, false), "belum", "lainnya kosong");

const doneSep = new Set(["0|2026-09-01", "0|2026-09-05", "1|2026-09-01"]);
assertEqual(countDoneInRange(doneSep, 0, "2026-09-01", "2026-09-30"), 2, "count range item 0");
assertEqual(countDoneInRange(doneSep, 1, "2026-09-01", "2026-09-30"), 1, "count range item 1");
const fHarian = monthFulfillment("harian", doneSep, 0, 2026, 8, false, fakeToday);
assertEqual(fHarian.status, "sebagian", "harian 2/22 sebagian");
assertEqual(fHarian.actual, 2, "harian aktual 2");
const fTahunan = monthFulfillment("tahunan", doneSep, 0, 2026, 8, false, fakeToday);
assertEqual(fTahunan.status, "terpenuhi", "tahunan kumulatif terpenuhi");
assertEqual(monthFulfillment("bulanan", doneSep, 0, 2026, 9, true, fakeToday).status, "mendatang", "bulan depan mendatang");

// ═══════════════════════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════════════════════

console.log("\n" + "═".repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

if (failed === 0) {
  console.log("🎉 All tests passed!\n");
  process.exit(0);
} else {
  console.log("❌ Some tests failed!\n");
  process.exit(1);
}
