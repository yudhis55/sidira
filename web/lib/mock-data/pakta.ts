import type { Pakta } from "@/types/database";

const paktaList: Pakta[] = [
  {
    id: "pakta-001",
    hari: "Senin",
    tgl: "2025-03-10",
    nama: "dr. Budi Santoso",
    nip: "198703152012011002",
    jabatan: "Dokter Umum",
    alamat: "Jl. Merdeka No. 12, Trenggalek",
    aset_kendaraan: [
      {
        jenis: "motor",
        merk: "Honda Vario 125",
        tahun: 2022,
        nopol: "AE 1234 AB",
        harga: "25.000.000",
        ket: "Dinas kelurahan",
      },
    ],
    aset_laptop: [],
    aset_alat: [],
    created_at: "2025-03-10T08:00:00Z",
    updated_at: "2025-03-10T08:00:00Z",
  },
  {
    id: "pakta-002",
    hari: "Rabu",
    tgl: "2025-03-12",
    nama: "Apoteker Dina Pratiwi",
    nip: "198808102013012004",
    jabatan: "Apoteker",
    alamat: "Jl. Pahlawan No. 45, Trenggalek",
    aset_kendaraan: [],
    aset_laptop: [
      {
        merk: "Lenovo ThinkPad",
        type: "E14 Gen 4",
        tahun: 2023,
        seri: "LT-E14-2023-045",
        harga: "12.500.000",
        ket: "Inventaris Farmasi",
      },
    ],
    aset_alat: [
      {
        merk: "Kasir POS",
        type: "Sunmi V2 Pro",
        tahun: 2022,
        seri: "SM-V2P-2022-012",
        harga: "3.500.000",
        ket: "Alat kasir farmasi",
      },
    ],
    created_at: "2025-03-12T08:00:00Z",
    updated_at: "2025-03-12T08:00:00Z",
  },
  {
    id: "pakta-003",
    hari: "Jumat",
    tgl: "2025-04-04",
    nama: "Andi Prasetyo",
    nip: "199206152016011005",
    jabatan: "Analis Kesehatan",
    alamat: "Jl. Sudirman No. 8, Trenggalek",
    aset_kendaraan: [],
    aset_laptop: [],
    aset_alat: [
      {
        merk: "Mindray",
        type: "BC-3600 Hematology Analyzer",
        tahun: 2021,
        seri: "MRD-BC36-2021-078",
        harga: "125.000.000",
        ket: "Peralatan Laboratorium",
      },
      {
        merk: "Hettich",
        type: "EBA 20 Centrifuge",
        tahun: 2020,
        seri: "HTC-EBA20-2020-015",
        harga: "35.000.000",
        ket: "Peralatan Laboratorium",
      },
    ],
    created_at: "2025-04-04T08:00:00Z",
    updated_at: "2025-04-04T08:00:00Z",
  },
];

export function getMockPakta(): Pakta[] {
  return paktaList;
}

export function getMockPaktaById(id: string): Pakta | undefined {
  return paktaList.find((p) => p.id === id);
}
