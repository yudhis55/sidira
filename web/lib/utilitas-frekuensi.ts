/**
 * Keterpenuhan ceklist utilitas per frekuensi — pure functions (testable).
 *
 * Frekuensi dibaca dari teks bebas `UtilItem.ket` (GAS FREQ_LIST:
 * Harian/Mingguan/Bulanan/Semester/Tahunan, plus teks lain mis.
 * "Setiap 5000 KM" yang tidak berbasis tanggal).
 */

export type Frekuensi =
  | "harian"
  | "mingguan"
  | "bulanan"
  | "semester"
  | "tahunan"
  | "lainnya";

export type Fulfillment = "mendatang" | "terpenuhi" | "sebagian" | "belum";

/** Normalisasi teks ket → jenis frekuensi (case-insensitive). */
export function parseFrekuensi(ket?: string | null): Frekuensi {
  const k = (ket || "").toLowerCase();
  if (k.includes("harian")) return "harian";
  if (k.includes("mingguan")) return "mingguan";
  if (k.includes("bulanan")) return "bulanan";
  if (k.includes("semester")) return "semester";
  if (k.includes("tahunan") || k.includes("tahun")) return "tahunan";
  return "lainnya";
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function dimOf(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/**
 * Jumlah hari yang sudah lewat di bulan itu (0 bila bulan mendatang).
 * `today` default tanggal hari ini — di-inject agar testable.
 */
export function elapsedDays(
  year: number,
  month0: number,
  today: Date = new Date()
): number {
  const dim = dimOf(year, month0);
  if (year > today.getFullYear()) return 0;
  if (
    year === today.getFullYear() &&
    month0 > today.getMonth()
  )
    return 0;
  if (
    year === today.getFullYear() &&
    month0 === today.getMonth()
  )
    return today.getDate();
  return dim;
}

/** Bulan-bulan yang sudah lewat (0-based) dalam paruh tahun yang sama. */
function elapsedMonthsInHalf(
  year: number,
  month0: number,
  today: Date = new Date()
): number {
  const halfStart = month0 < 6 ? 0 : 6;
  const halfEnd = month0 < 6 ? 5 : 11;
  if (year > today.getFullYear()) return 0;
  const lastElapsed =
    year < today.getFullYear()
      ? halfEnd
      : Math.min(halfEnd, today.getMonth());
  if (lastElapsed < halfStart) return 0;
  return lastElapsed - halfStart + 1;
}

/**
 * Target pengerjaan DALAM bulan itu untuk satu item.
 * -1 = frekuensi tak berbasis tanggal (pakai perilaku lama: ada/tidak).
 */
export function expectedInMonth(
  freq: Frekuensi,
  year: number,
  month0: number,
  today: Date = new Date()
): number {
  const elapsed = elapsedDays(year, month0, today);
  switch (freq) {
    case "harian":
      return elapsed;
    case "mingguan":
      return Math.ceil(elapsed / 7);
    case "bulanan":
      return elapsed > 0 ? 1 : 0;
    case "semester":
      return elapsedMonthsInHalf(year, month0, today) > 0 ? 1 : 0;
    case "tahunan": {
      if (
        year > today.getFullYear() ||
        (year === today.getFullYear() && month0 > today.getMonth())
      )
        return 0;
      return 1;
    }
    case "lainnya":
      return -1;
  }
}

/** Status sel rekap dari aktual vs target. */
export function fulfillmentStatus(
  freq: Frekuensi,
  actual: number,
  expected: number,
  isFuture: boolean
): Fulfillment {
  if (isFuture || expected === 0) return "mendatang";
  if (expected < 0) return actual > 0 ? "terpenuhi" : "belum";
  if (actual >= expected) return "terpenuhi";
  if (actual > 0) return "sebagian";
  return "belum";
}

/** Label ringkas "aktual/target" untuk tooltip. */
export function fulfillmentLabel(
  freq: Frekuensi,
  actual: number,
  expected: number
): string {
  if (expected < 0) return actual > 0 ? "Sudah dikerjakan" : "Belum dikerjakan";
  return `${actual} dari ${expected} target`;
}

/** Tanggal-bulan label konsisten dengan state_key util_state. */
export function monthPrefix(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}`;
}

/** Hitung entri done dalam rentang tanggal (inklusif) untuk satu item. */
export function countDoneInRange(
  doneSet: Set<string>,
  itemIndex: number,
  fromKey: string,
  toKey: string
): number {
  const prefix = `${itemIndex}|`;
  let n = 0;
  for (const key of doneSet) {
    if (!key.startsWith(prefix)) continue;
    const date = key.slice(prefix.length);
    if (date >= fromKey && date <= toKey) n++;
  }
  return n;
}

export interface MonthFulfillment {
  status: Fulfillment;
  actual: number;
  /** -1 = tak berbasis tanggal. */
  expected: number;
}

/**
 * Keterpenuhan satu item dalam satu bulan tampil.
 * Semester/tahunan dihitung KUMULATIF sejak awal paruh/tahun (sekali
 * kerjakan per periode = terpenuhi); harian/mingguan/bulanan per bulan.
 */
export function monthFulfillment(
  freq: Frekuensi,
  doneSet: Set<string>,
  itemIndex: number,
  year: number,
  month0: number,
  isFuture: boolean,
  today: Date = new Date()
): MonthFulfillment {
  if (isFuture) {
    return { status: "mendatang", actual: 0, expected: 0 };
  }
  const dim = dimOf(year, month0);
  const monthStart = `${year}-${pad2(month0 + 1)}-01`;
  const monthEnd = `${year}-${pad2(month0 + 1)}-${pad2(dim)}`;
  if (freq === "semester" || freq === "tahunan") {
    const rangeStart =
      freq === "semester"
        ? `${year}-${pad2(month0 < 6 ? 1 : 7)}-01`
        : `${year}-01-01`;
    const actual = countDoneInRange(
      doneSet,
      itemIndex,
      rangeStart,
      monthEnd
    );
    const started =
      freq === "semester"
        ? elapsedMonthsInHalf(year, month0, today) > 0
        : year < today.getFullYear() ||
          (year === today.getFullYear() && month0 <= today.getMonth());
    if (!started) return { status: "mendatang", actual: 0, expected: 0 };
    return {
      status: actual >= 1 ? "terpenuhi" : "belum",
      actual,
      expected: 1,
    };
  }
  const expected = expectedInMonth(freq, year, month0, today);
  const actual = countDoneInRange(doneSet, itemIndex, monthStart, monthEnd);
  return {
    status: fulfillmentStatus(freq, actual, expected, false),
    actual,
    expected,
  };
}
