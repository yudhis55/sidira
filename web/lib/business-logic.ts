/**
 * Business logic utilities untuk SIDIRA
 * Fungsi-fungsi murni yang bisa di-test tanpa dependency ke database
 */

/**
 * Generate nomor SBBK otomatis berdasarkan tanggal
 * Format: SBBK/YYYY/MM/NNNN
 */
export function generateSbbkNumber(date: Date, sequenceNumber: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const sequence = String(sequenceNumber).padStart(4, "0");
  return `SBBK/${year}/${month}/${sequence}`;
}

/**
 * Validasi format nomor SBBK
 */
export function isValidSbbkNumber(sbbkNumber: string): boolean {
  const pattern = /^SBBK\/\d{4}\/\d{2}\/\d{4}$/;
  return pattern.test(sbbkNumber);
}

/**
 * Hitung total nilai barang berdasarkan jumlah dan harga
 */
export function calculateTotalValue(quantity: number, unitPrice: number): number {
  if (quantity < 0 || unitPrice < 0) {
    throw new Error("Quantity dan unit price harus positif");
  }
  return quantity * unitPrice;
}

/**
 * Kategorisasi kondisi barang berdasarkan status
 * baik -> good, rr/rb -> damaged, ta -> missing
 */
export function getConditionCategory(condition: string): "good" | "damaged" | "missing" {
  switch (condition) {
    case "baik":
      return "good";
    case "rr":
    case "rb":
      return "damaged";
    case "ta":
      return "missing";
    default:
      return "missing";
  }
}

/**
 * Format tanggal ke format Indonesia
 */
export function formatDateIndonesian(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Hitung persentase kondisi barang
 */
export function calculateConditionPercentage(
  totalItems: number,
  conditionCounts: { baik: number; rr: number; rb: number; ta: number }
): { baik: number; rr: number; rb: number; ta: number } {
  if (totalItems === 0) {
    return { baik: 0, rr: 0, rb: 0, ta: 0 };
  }

  return {
    baik: Math.round((conditionCounts.baik / totalItems) * 100),
    rr: Math.round((conditionCounts.rr / totalItems) * 100),
    rb: Math.round((conditionCounts.rb / totalItems) * 100),
    ta: Math.round((conditionCounts.ta / totalItems) * 100),
  };
}

/**
 * Validasi email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Generate slug dari nama ruangan untuk ID
 */
export function generateRoomId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Cek apakah user memiliki role yang cukup
 */
export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Format harga ke format Rupiah
 */
export function formatRupiah(amount: number): string {
  // Gunakan narrow no-break space untuk konsistensi
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
  // Normalize unicode spaces
  return formatted.replace(/ /g, " ");
}

/**
 * Hitung umur barang dalam tahun
 */
export function calculateItemAge(purchaseDate: Date | string, currentDate?: Date): number {
  const purchase = typeof purchaseDate === "string" ? new Date(purchaseDate) : purchaseDate;
  const current = currentDate || new Date();

  // Gunakan perhitungan berdasarkan tahun untuk akurasi
  let age = current.getFullYear() - purchase.getFullYear();

  // Adjust jika belum anniversary
  const monthDiff = current.getMonth() - purchase.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && current.getDate() < purchase.getDate())) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Hitung total items dari SBBK items array
 */
export function calculateSbbkTotalItems(
  items: Array<{ quantity: number }>
): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Validasi data room sebelum save
 */
export function validateRoom(data: {
  name?: string;
  icon?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Nama ruangan harus diisi");
  }
  if (data.name && data.name.length > 100) {
    errors.push("Nama ruangan maksimal 100 karakter");
  }
  if (data.icon && data.icon.length > 5) {
    errors.push("Icon tidak valid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validasi data item sebelum save
 */
export function validateItem(data: {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  condition?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validCategories = ["alkes", "meubelair", "elektronik", "lainnya"];
  const validConditions = ["baik", "rr", "rb", "ta"];

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Nama barang harus diisi");
  }
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push("Kategori harus dipilih");
  }
  if (!data.quantity || data.quantity < 1) {
    errors.push("Jumlah minimal 1");
  }
  if (!data.unit || data.unit.trim().length === 0) {
    errors.push("Satuan harus diisi");
  }
  if (!data.condition || !validConditions.includes(data.condition)) {
    errors.push("Kondisi harus dipilih");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate tanggal hari ini dalam format YYYY-MM-DD
 */
export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Hitung jumlah hari dalam bulan tertentu
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
