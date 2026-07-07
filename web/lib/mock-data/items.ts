import type { Item, ItemCategory } from "@/types/database";

const items: Item[] = [
  // ── IGD (5 items) ────────────────────────────────────────────────
  {
    id: 1, room_id: "room-igd", category: "alkes", name: "Bedside Monitor",
    merk: "GE Healthcare", type: "CARESCAPE B650", year: 2021, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "GE-BSM-2021-001", kode_barang: "ALK-001", harga: 85000000,
    spec: "Multi-parameter monitor",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 2, room_id: "room-igd", category: "alkes", name: "Stetoskop",
    merk: "Littmann", type: "Classic III", year: 2022, quantity: 3,
    unit: "pcs", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-002", harga: 2500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 3, room_id: "room-igd", category: "alkes", name: "Nebulizer",
    merk: "Omron", type: "NE-C28", year: 2020, quantity: 2,
    unit: "unit", condition: "rr", index_in_room: 3,
    kode_barang: "ALK-003", harga: 750000,
    notes: "Kompresor agak berisik",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-02-10T10:00:00Z",
  },
  {
    id: 4, room_id: "room-igd", category: "meubelair", name: "Brankar",
    merk: "Olympic", type: "ST-200", year: 2019, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    bahan: "Stainless Steel", kode_barang: "MEU-001", harga: 4500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 5, room_id: "room-igd", category: "elektronik", name: "AC Split",
    merk: "Daikin", type: "FTKQ25", year: 2023, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 5,
    kode_barang: "ELK-001", harga: 6500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Poli Umum (6 items) ──────────────────────────────────────────
  {
    id: 6, room_id: "room-poli-umum", category: "alkes", name: "Tensimeter",
    merk: "Omron", type: "HEM-7121", year: 2023, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "OMN-TNS-2023-001", kode_barang: "ALK-004", harga: 1200000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 7, room_id: "room-poli-umum", category: "alkes", name: "Termometer Digital",
    merk: "Braun", type: "IRT6520", year: 2022, quantity: 3,
    unit: "pcs", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-005", harga: 850000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 8, room_id: "room-poli-umum", category: "meubelair", name: "Meja Periksa",
    merk: "Olympic", type: "EX-100", year: 2020, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 3,
    bahan: "Stainless + Leather", kode_barang: "MEU-002", harga: 3500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 9, room_id: "room-poli-umum", category: "meubelair", name: "Kursi Dokter",
    merk: "Chairman", type: "V-888", year: 2021, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    kode_barang: "MEU-003", harga: 1800000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 10, room_id: "room-poli-umum", category: "elektronik", name: "Komputer PC",
    merk: "Lenovo", type: "ThinkCentre M720", year: 2022, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 5,
    spec: "i5 Gen 8, 8GB RAM, 256GB SSD", kode_barang: "ELK-002", harga: 9500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 11, room_id: "room-poli-umum", category: "alkes", name: "Timbangan Bayi",
    merk: "Camry", type: "RT-100", year: 2019, quantity: 1,
    unit: "unit", condition: "rr", index_in_room: 6,
    kode_barang: "ALK-006", harga: 1500000,
    notes: "Kalibrasi perlu dicek",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-03-01T08:00:00Z",
  },

  // ── Poli Gigi (5 items) ──────────────────────────────────────────
  {
    id: 12, room_id: "room-poli-gigi", category: "alkes", name: "Lampu Otoscope",
    merk: "Welch Allyn", type: "PanOptic", year: 2021, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "WA-OPT-2021-012", kode_barang: "ALK-007", harga: 4200000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 13, room_id: "room-poli-gigi", category: "alkes", name: "Needle Destroyer",
    merk: "Medco", type: "ND-100", year: 2022, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-008", harga: 650000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 14, room_id: "room-poli-gigi", category: "meubelair", name: "Lemari Obat",
    merk: "Olympic", type: "LB-300", year: 2020, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    bahan: "Besi", kode_barang: "MEU-004", harga: 2800000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 15, room_id: "room-poli-gigi", category: "elektronik", name: "Printer",
    merk: "HP", type: "LaserJet Pro M404", year: 2023, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 4,
    kode_barang: "ELK-003", harga: 4500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 16, room_id: "room-poli-gigi", category: "alkes", name: "Kursi Roda",
    merk: "Alkes", type: "FS918", year: 2018, quantity: 1,
    unit: "unit", condition: "rb", index_in_room: 5,
    kode_barang: "ALK-009", harga: 2200000,
    notes: "Ban belakang aus, perlu penggantian",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-04-01T08:00:00Z",
  },

  // ── Farmasi (5 items) ────────────────────────────────────────────
  {
    id: 17, room_id: "room-farmasi", category: "meubelair", name: "Rak Besi",
    merk: "Lion Star", type: "RB-5", year: 2020, quantity: 4,
    unit: "unit", condition: "baik", index_in_room: 1,
    bahan: "Besi", kode_barang: "MEU-005", harga: 1200000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 18, room_id: "room-farmasi", category: "elektronik", name: "Kulkas Vaksin",
    merk: "Haier", type: "HYC-98", year: 2022, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    spec: "Medical Grade 2-8\u00B0C", no_seri: "HR-KV-2022-005",
    kode_barang: "ELK-004", harga: 12000000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 19, room_id: "room-farmasi", category: "elektronik", name: "Komputer PC",
    merk: "Dell", type: "OptiPlex 3000", year: 2023, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    spec: "i3 Gen 10, 8GB RAM, 256GB SSD", kode_barang: "ELK-005", harga: 8000000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 20, room_id: "room-farmasi", category: "meubelair", name: "Meja Tulis",
    merk: "Olympic", type: "MT-120", year: 2019, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    bahan: "Kayu Lapis", kode_barang: "MEU-006", harga: 1500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 21, room_id: "room-farmasi", category: "lainnya", name: "Tempat Sampah Medis",
    merk: "Biosharp", type: "BS-30", year: 2023, quantity: 5,
    unit: "pcs", condition: "baik", index_in_room: 5,
    kode_barang: "LNY-001", harga: 350000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Laboratorium (4 items) ───────────────────────────────────────
  {
    id: 22, room_id: "room-lab", category: "alkes", name: "Hematology Analyzer",
    merk: "Mindray", type: "BC-3600", year: 2021, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 1,
    no_seri: "MRD-BC36-2021-078", kode_barang: "ALK-010", harga: 125000000,
    spec: "3-part diff, 60 samples/hour",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 23, room_id: "room-lab", category: "alkes", name: "Centrifuge",
    merk: "Hettich", type: "EBA 20", year: 2020, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    kode_barang: "ALK-011", harga: 35000000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 24, room_id: "room-lab", category: "elektronik", name: "Kulkas Reagen",
    merk: "Panasonic", type: "NR-AQ17", year: 2022, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 3,
    kode_barang: "ELK-006", harga: 5500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 25, room_id: "room-lab", category: "meubelair", name: "Meja Lab",
    merk: "Custom", type: "Lab-Top", year: 2019, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 4,
    bahan: "Phenolic Resin", kode_barang: "MEU-007", harga: 5000000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Rekam Medis (2 items) ────────────────────────────────────────
  {
    id: 26, room_id: "room-rekam-medis", category: "elektronik", name: "Komputer PC",
    merk: "HP", type: "ProDesk 400 G6", year: 2021, quantity: 2,
    unit: "unit", condition: "baik", index_in_room: 1,
    spec: "i5 Gen 10, 8GB, 512GB SSD", kode_barang: "ELK-007", harga: 9000000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 27, room_id: "room-rekam-medis", category: "elektronik", name: "Printer",
    merk: "Epson", type: "L3250", year: 2023, quantity: 1,
    unit: "unit", condition: "baik", index_in_room: 2,
    kode_barang: "ELK-008", harga: 3500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },

  // ── Gudang Umum (3 items) ────────────────────────────────────────
  {
    id: 28, room_id: "room-gudang", category: "meubelair", name: "Rak Besi",
    merk: "Lion Star", type: "RB-6", year: 2018, quantity: 6,
    unit: "unit", condition: "rr", index_in_room: 1,
    bahan: "Besi", kode_barang: "MEU-008", harga: 1200000,
    notes: "Beberapa unit berkarat",
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-02-15T08:00:00Z",
  },
  {
    id: 29, room_id: "room-gudang", category: "lainnya", name: "Karpet",
    merk: "Local", type: "Roll-5mm", year: 2020, quantity: 3,
    unit: "pcs", condition: "baik", index_in_room: 2,
    kode_barang: "LNY-002", harga: 500000,
    created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 30, room_id: "room-gudang", category: "lainnya", name: "Galon Air",
    merk: "Aqua", type: "19L", year: 2024, quantity: 10,
    unit: "pcs", condition: "ta", index_in_room: 3,
    kode_barang: "LNY-003",
    notes: "Tidak termasuk inventaris tetap",
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
