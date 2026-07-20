import type { SBBK } from "@/types/database";

const sbbkList: SBBK[] = [
  {
    id: "sbbk-001",
    no: "001/SBBK/PKB/2025",
    tgl: "2025-02-10",
    kepada: "IGD",
    jenis: "BAST",
    anggaran: "APBD 2025",
    ket_umum: "Pengadaan alat IGD semester 1",
    items: [
      { nama: "Bedside Monitor", merk: "GE Healthcare", qty: 2, satuan: "unit", harga: 85000000, total: 170000000 },
      { nama: "Stetoskop", merk: "Littmann", qty: 3, satuan: "pcs", harga: 2500000, total: 7500000 },
      { nama: "Nebulizer", merk: "Omron", qty: 2, satuan: "unit", harga: 750000, total: 1500000 },
    ],
    created_at: "2025-02-10T08:00:00Z",
    updated_at: "2025-02-10T08:00:00Z",
  },
  {
    id: "sbbk-002",
    no: "002/SBBK/PKB/2025",
    tgl: "2025-03-05",
    kepada: "Poli Umum",
    jenis: "Serah Terima",
    anggaran: "DAK",
    ket_umum: "Distribusi alat Poli Umum",
    items: [
      { nama: "Tensimeter Digital", merk: "Omron", qty: 2, satuan: "unit", harga: 1200000, total: 2400000 },
      { nama: "Timbangan Bayi", merk: "Camry", qty: 1, satuan: "unit", harga: 1500000, total: 1500000 },
    ],
    created_at: "2025-03-05T08:00:00Z",
    updated_at: "2025-03-05T08:00:00Z",
  },
  {
    id: "sbbk-003",
    no: "003/SBBK/PKB/2025",
    tgl: "2025-04-12",
    kepada: "Farmasi",
    jenis: "BAST",
    anggaran: "APBD 2025",
    items: [
      { nama: "Kulkas Vaksin", merk: "Haier", qty: 1, satuan: "unit", harga: 12000000, total: 12000000 },
      { nama: "Komputer PC", merk: "Dell", qty: 1, satuan: "unit", harga: 8000000, total: 8000000 },
      { nama: "Rak Besi", merk: "Lion Star", qty: 4, satuan: "unit", harga: 1200000, total: 4800000 },
      { nama: "Meja Tulis", merk: "Olympic", qty: 2, satuan: "unit", harga: 1500000, total: 3000000 },
    ],
    created_at: "2025-04-12T08:00:00Z",
    updated_at: "2025-04-12T08:00:00Z",
  },
  {
    id: "sbbk-004",
    no: "004/SBBK/PKB/2025",
    tgl: "2025-05-20",
    kepada: "Laboratorium",
    jenis: "BAST",
    anggaran: "DAK",
    ket_umum: "Peralatan laboratorium DAK 2025",
    items: [
      { nama: "Hematology Analyzer", merk: "Mindray", qty: 1, satuan: "unit", harga: 125000000, total: 125000000 },
      { nama: "Centrifuge", merk: "Hettich", qty: 1, satuan: "unit", harga: 35000000, total: 35000000 },
    ],
    created_at: "2025-05-20T08:00:00Z",
    updated_at: "2025-05-20T08:00:00Z",
  },
];

export function getMockSbbk(): SBBK[] {
  return sbbkList;
}

export function getMockSbbkById(id: string): SBBK | null {
  return sbbkList.find((s) => s.id === id) ?? null;
}
