import type { PemegangInventaris, AsetPemegang } from "@/types/database";

const pemegangList: PemegangInventaris[] = [
  {
    id: "pemegang-001",
    nama: "dr. Budi Santoso",
    nip: "198703152012011002",
    jabatan: "Dokter Umum",
    status: "PNS",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: "pemegang-002",
    nama: "drg. Citra Dewi",
    nip: "199005202015012003",
    jabatan: "Dokter Gigi",
    status: "PNS",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: "pemegang-003",
    nama: "Apoteker Dina Pratiwi",
    nip: "198808102013012004",
    jabatan: "Apoteker",
    status: "PPPK",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: "pemegang-004",
    nama: "Andi Prasetyo",
    nip: "199206152016011005",
    jabatan: "Analis Kesehatan",
    status: "PNS",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: "pemegang-005",
    nama: "Siti Aminah",
    nip: "199104122014012006",
    jabatan: "Perekam Medis",
    status: "PPPK",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: "pemegang-006",
    nama: "Budi SP",
    nip: "198609202011011008",
    jabatan: "Perawat",
    status: "PNS",
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-01T08:00:00Z",
  },
];

const asetList: AsetPemegang[] = [
  {
    id: 1,
    pemegang_id: "pemegang-001",
    jenis: "kendaraan",
    merk: "Honda Vario 125",
    type: "Motor",
    tahun: "2022",
    nopol: "AE 1234 AB",
    harga: "25.000.000",
    ket: "Dinas kelurahan",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 2,
    pemegang_id: "pemegang-002",
    jenis: "alat",
    merk: "Dental Unit",
    type: "DC-300",
    tahun: "2023",
    harga: "75.000.000",
    ket: "Unit poli gigi",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 3,
    pemegang_id: "pemegang-002",
    jenis: "alat",
    merk: "Scaler Ultrasonik",
    type: "SU-50",
    tahun: "2023",
    harga: "8.500.000",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 4,
    pemegang_id: "pemegang-003",
    jenis: "laptop",
    merk: "Lenovo ThinkPad",
    type: "E14 Gen 4",
    tahun: "2023",
    harga: "12.500.000",
    ket: "Inventaris Farmasi",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 5,
    pemegang_id: "pemegang-004",
    jenis: "alat",
    merk: "Mikroskop Olympus",
    type: "CX23",
    tahun: "2021",
    harga: "45.000.000",
    ket: "Inventaris Lab",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 6,
    pemegang_id: "pemegang-005",
    jenis: "laptop",
    merk: "HP ProBook",
    type: "440 G9",
    tahun: "2022",
    harga: "11.000.000",
    ket: "Inventaris Rekam Medis",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 7,
    pemegang_id: "pemegang-006",
    jenis: "kendaraan",
    merk: "Honda Beat",
    type: "Motor",
    tahun: "2021",
    nopol: "AE 5678 CD",
    harga: "18.000.000",
    ket: "Dinas pustu",
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-01T08:00:00Z",
  },
  {
    id: 8,
    pemegang_id: "pemegang-006",
    jenis: "alat",
    merk: "Coolbox Vaksin",
    type: "CB-20",
    tahun: "2022",
    harga: "3.500.000",
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-01T08:00:00Z",
  },
];

export function getMockPemegang(): PemegangInventaris[] {
  return pemegangList;
}

export function getMockAsetPemegang(): AsetPemegang[] {
  return asetList;
}

export function getMockAsetByPemegang(pemegangId: string): AsetPemegang[] {
  return asetList.filter((a) => a.pemegang_id === pemegangId);
}
