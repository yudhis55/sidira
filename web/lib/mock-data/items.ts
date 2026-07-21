import type { Item, ItemCategory } from "@/types/database";

const items: Item[] = [
  // ── IGD (5 items) ────────────────────────────────────────────────
  {
    id: 1, room_id: "room-igd", category: "alkes", name: "Bedside Monitor",
    merk: "GE Healthcare", type: "CARESCAPE B650", year: 2021, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "GE-BSM-2021-001", kode_barang: "ALK-001", harga: 85000000,
    spec: "Multi-parameter monitor", prio: "wajib",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 2, room_id: "room-igd", category: "alkes", name: "Stetoskop",
    merk: "Littmann", type: "Classic III", year: 2022, quantity: 3,
    unit: "pcs", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-002", harga: 2500000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 3, room_id: "room-igd", category: "alkes", name: "Nebulizer",
    merk: "Omron", type: "NE-C28", year: 2020, quantity: 2,
    unit: "unit", condition: "rr", index_in_room: 3,
    kode_barang: "ALK-003", harga: 750000,
    notes: "Kompresor agak berisik", prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-02-10T10:00:00Z",
  },
  {
    id: 4, room_id: "room-igd", category: "meubelair", name: "Brankar",
    merk: "Olympic", type: "ST-200", year: 2019, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    bahan: "Stainless Steel", kode_barang: "MEU-001", harga: 4500000, prio: "wajib",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 5, room_id: "room-igd", category: "elektronik", name: "AC Split",
    merk: "Daikin", type: "FTKQ25", year: 2023, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 5,
    kode_barang: "ELK-001", harga: 6500000, prio: "pendukung",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Poli Umum (6 items) ──────────────────────────────────────────
  {
    id: 6, room_id: "room-poli-umum", category: "alkes", name: "Tensimeter",
    merk: "Omron", type: "HEM-7121", year: 2023, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "OMN-TNS-2023-001", kode_barang: "ALK-004", harga: 1200000, prio: "wajib",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 7, room_id: "room-poli-umum", category: "alkes", name: "Termometer Digital",
    merk: "Braun", type: "IRT6520", year: 2022, quantity: 3,
    unit: "pcs", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-005", harga: 850000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 8, room_id: "room-poli-umum", category: "meubelair", name: "Meja Periksa",
    merk: "Olympic", type: "MP-100", year: 2021, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    bahan: "Kayu + Formica", kode_barang: "MEU-002", harga: 2800000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 9, room_id: "room-poli-umum", category: "meubelair", name: "Kursi Dokter",
    merk: "Chitose", type: "Ergo", year: 2021, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 4,
    kode_barang: "MEU-003", harga: 1500000, prio: "pendukung",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 10, room_id: "room-poli-umum", category: "elektronik", name: "Komputer PC",
    merk: "HP", type: "ProDesk 400", year: 2022, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 5,
    kode_barang: "ELK-002", harga: 8500000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 11, room_id: "room-poli-umum", category: "alkes", name: "Timbangan Bayi",
    merk: "Seca", type: "354", year: 2020, quantity: 1,
    unit: "unit", condition: "rr", index_in_room: 6,
    kode_barang: "ALK-006", harga: 3200000,
    notes: "Display kadang blank", prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-03-01T09:00:00Z",
  },

  // ── Poli Gigi (5 items) ──────────────────────────────────────────
  {
    id: 12, room_id: "room-poli-gigi", category: "alkes", name: "Lampu Otoscope",
    merk: "Welch Allyn", type: "MacroView", year: 2021, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 1,
    kode_barang: "ALK-007", harga: 4500000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 13, room_id: "room-poli-gigi", category: "alkes", name: "Needle Destroyer",
    merk: "Surgipharma", type: "ND-200", year: 2019, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-008", harga: 1800000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 14, room_id: "room-poli-gigi", category: "meubelair", name: "Lemari Obat",
    merk: "Olympic", type: "LO-3D", year: 2018, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    bahan: "Kayu", kode_barang: "MEU-004", harga: 3500000, prio: "pendukung",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 15, room_id: "room-poli-gigi", category: "elektronik", name: "Printer",
    merk: "Epson", type: "L3110", year: 2022, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 4,
    kode_barang: "ELK-003", harga: 2800000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 16, room_id: "room-poli-gigi", category: "alkes", name: "Kursi Roda",
    merk: "Sella", type: "Standard", year: 2020, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 5,
    kode_barang: "ALK-009", harga: 1500000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Farmasi (5 items) ────────────────────────────────────────────
  {
    id: 17, room_id: "room-farmasi", category: "meubelair", name: "Rak Besi",
    merk: "Lion", type: "RB-5T", year: 2019, quantity: 4,
    unit: "unit", condition: "baik", index_in_room: 1,
    bahan: "Besi", kode_barang: "MEU-005", harga: 1200000, prio: "pendukung",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 18, room_id: "room-farmasi", category: "elektronik", name: "Kulkas Vaksin",
    merk: "Panasonic", type: "NR-A19", year: 2021, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    no_seri: "PN-KV-2021-001", kode_barang: "ELK-004", harga: 12000000, prio: "wajib",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 19, room_id: "room-farmasi", category: "elektronik", name: "Komputer PC",
    merk: "Dell", type: "OptiPlex 3090", year: 2023, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    kode_barang: "ELK-005", harga: 9000000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 20, room_id: "room-farmasi", category: "meubelair", name: "Meja Tulis",
    merk: "Olympic", type: "MT-120", year: 2020, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    bahan: "Kayu", kode_barang: "MEU-006", harga: 1800000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 21, room_id: "room-farmasi", category: "lainnya", name: "Tempat Sampah Medis",
    merk: "Generic", type: "TS-20L", year: 2022, quantity: 3,
    unit: "pcs", condition: "baik", index_in_room: 5,
    kode_barang: "LAI-001", harga: 150000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Laboratorium (4 items) ───────────────────────────────────────
  {
    id: 22, room_id: "room-lab", category: "alkes", name: "Hematology Analyzer",
    merk: "Sysmex", type: "XP-300", year: 2020, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "SY-HA-2020-001", kode_barang: "ALK-010", harga: 150000000,
    spec: "3-part differential", prio: "wajib",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 23, room_id: "room-lab", category: "alkes", name: "Centrifuge",
    merk: "Hettich", type: "EBA 200", year: 2019, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-011", harga: 25000000, prio: "wajib",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 24, room_id: "room-lab", category: "elektronik", name: "Kulkas Reagen",
    merk: "Sharp", type: "SJ-N166", year: 2021, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    kode_barang: "ELK-006", harga: 4500000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 25, room_id: "room-lab", category: "meubelair", name: "Meja Lab",
    merk: "Custom", type: "ML-180", year: 2018, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    bahan: "Granit + Besi", kode_barang: "MEU-007", harga: 5000000, prio: "pendukung",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Rekam Medis (2 items) ────────────────────────────────────────
  {
    id: 26, room_id: "room-rekam-medis", category: "elektronik", name: "Komputer PC",
    merk: "Lenovo", type: "ThinkCentre M70", year: 2022, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    kode_barang: "ELK-007", harga: 8000000, prio: "penting",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 27, room_id: "room-rekam-medis", category: "elektronik", name: "Printer",
    merk: "Canon", type: "G2010", year: 2021, quantity: 1,
    unit: "unit", condition: "rr", index_in_room: 2,
    kode_barang: "ELK-008", harga: 2500000,
    notes: "Head print sering mampet",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-02-20T11:00:00Z",
  },

  // ── Gudang (3 items) ─────────────────────────────────────────────
  {
    id: 28, room_id: "room-gudang", category: "meubelair", name: "Rak Besi",
    merk: "Lion", type: "RB-Heavy", year: 2017, quantity: 6,
    unit: "unit", condition: "baik", index_in_room: 1,
    bahan: "Besi", kode_barang: "MEU-008", harga: 1500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 29, room_id: "room-gudang", category: "lainnya", name: "Karpet",
    merk: "Generic", type: "KPT-3x4", year: 2020, quantity: 2,
    unit: "lembar", condition: "baik", index_in_room: 2,
    kode_barang: "LAI-002", harga: 350000, prio: "pendukung",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 30, room_id: "room-gudang", category: "lainnya", name: "Galon Air",
    merk: "Aqua", type: "19L", year: 2024, quantity: 10,
    unit: "pcs", condition: "baik", index_in_room: 3,
    kode_barang: "LAI-003", harga: 20000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
];

export function getMockItems(): Item[] {
  return items;
}

export function getMockItemsByRoom(roomId: string): Item[] {
  return items.filter((i) => i.room_id === roomId);
}

export function getMockItemsByCategory(category: ItemCategory): Item[] {
  return items.filter((i) => i.category === category);
}

export function getMockItemById(id: number): Item | undefined {
  return items.find((i) => i.id === id);
}

export function getMockItemCountByRoom(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.room_id] = (counts[item.room_id] || 0) + 1;
  }
  return counts;
}

export function getMockCategoryBreakdown(roomId: string): Record<ItemCategory, number> {
  const breakdown: Record<ItemCategory, number> = {
    alkes: 0,
    meubelair: 0,
    elektronik: 0,
    lainnya: 0,
  };
  for (const item of items) {
    if (item.room_id === roomId) {
      breakdown[item.category]++;
    }
  }
  return breakdown;
}
