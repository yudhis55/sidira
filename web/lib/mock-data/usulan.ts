import type { Usulan } from "@/lib/usulan-types";

const usulanList: Usulan[] = [
  {
    id: 1,
    room_id: "room-igd",
    payload: {
      items: [
        { nama: "Defibrilator", kategori: "alkes", prioritas: "mendesak", qty: 1, satuan: "unit", harga: 45000000, total: 45000000, status: "disetujui" },
        { nama: "Pulse Oximeter", kategori: "alkes", prioritas: "penting", qty: 2, satuan: "unit", harga: 3500000, total: 7000000, status: "diajukan" },
      ],
    },
    rooms: { name: "IGD", icon: "\u{1F691}" },
    created_at: "2025-05-01T08:00:00Z",
    updated_at: "2025-05-01T08:00:00Z",
  },
  {
    id: 2,
    room_id: "room-igd",
    payload: {
      items: [
        { nama: "Infant Warmer", kategori: "alkes", prioritas: "penting", qty: 1, satuan: "unit", harga: 18000000, total: 18000000, status: "diajukan", keterangan: "Untuk penanganan neonatus darurat" },
      ],
    },
    rooms: { name: "IGD", icon: "\u{1F691}" },
    created_at: "2025-05-15T08:00:00Z",
    updated_at: "2025-05-15T08:00:00Z",
  },
  {
    id: 3,
    room_id: "room-poli-umum",
    payload: {
      items: [
        { nama: "Spirometer", kategori: "alkes", prioritas: "penting", qty: 1, satuan: "unit", harga: 5500000, total: 5500000, status: "disetujui" },
        { nama: "EKG Machine", kategori: "alkes", prioritas: "rencana", qty: 1, satuan: "unit", harga: 25000000, total: 25000000, status: "ditolak", keterangan: "Anggaran belum tersedia" },
      ],
    },
    rooms: { name: "Poli Umum", icon: "\u{1FA7A}" },
    created_at: "2025-04-20T08:00:00Z",
    updated_at: "2025-05-10T08:00:00Z",
  },
  {
    id: 4,
    room_id: "room-poli-umum",
    payload: {
      items: [
        { nama: "Meja Periksa Anak", kategori: "meubelair", prioritas: "rencana", qty: 1, satuan: "unit", harga: 4000000, total: 4000000, status: "diajukan" },
      ],
    },
    rooms: { name: "Poli Umum", icon: "\u{1FA7A}" },
    created_at: "2025-06-01T08:00:00Z",
    updated_at: "2025-06-01T08:00:00Z",
  },
  {
    id: 5,
    room_id: "room-poli-gigi",
    payload: {
      items: [
        { nama: "Dental Unit", kategori: "alkes", prioritas: "mendesak", qty: 1, satuan: "set", harga: 75000000, total: 75000000, status: "disetujui", keterangan: "Unit lama sudah rusak berat" },
        { nama: "Scaler Ultrasonik", kategori: "alkes", prioritas: "penting", qty: 1, satuan: "unit", harga: 8500000, total: 8500000, status: "disetujui" },
      ],
    },
    rooms: { name: "Poli Gigi", icon: "\u{1F9B7}" },
    created_at: "2025-03-15T08:00:00Z",
    updated_at: "2025-04-01T08:00:00Z",
  },
  {
    id: 6,
    room_id: "room-farmasi",
    payload: {
      items: [
        { nama: "Lemari Pendingin Obat", kategori: "elektronik", prioritas: "penting", qty: 1, satuan: "unit", harga: 15000000, total: 15000000, status: "diajukan", keterangan: "Kapasitas kulkas sekarang tidak mencukupi" },
      ],
    },
    rooms: { name: "Farmasi", icon: "\u{1F48A}" },
    created_at: "2025-06-10T08:00:00Z",
    updated_at: "2025-06-10T08:00:00Z",
  },
  {
    id: 7,
    room_id: "room-lab",
    payload: {
      items: [
        { nama: "Chemistry Analyzer", kategori: "alkes", prioritas: "mendesak", qty: 1, satuan: "unit", harga: 250000000, total: 250000000, status: "diajukan", keterangan: "Untuk pemeriksaan kimia darah lengkap" },
        { nama: "Mikroskop Binokuler", kategori: "alkes", prioritas: "penting", qty: 1, satuan: "unit", harga: 12000000, total: 12000000, status: "disetujui" },
      ],
    },
    rooms: { name: "Laboratorium", icon: "\u{1F52C}" },
    created_at: "2025-05-25T08:00:00Z",
    updated_at: "2025-06-05T08:00:00Z",
  },
  {
    id: 8,
    room_id: "room-pustu",
    payload: {
      items: [
        { nama: "Stetoskop", kategori: "alkes", prioritas: "penting", qty: 1, satuan: "pcs", harga: 2500000, total: 2500000, status: "diajukan" },
        { nama: "Tensimeter Digital", kategori: "alkes", prioritas: "penting", qty: 1, satuan: "unit", harga: 1200000, total: 1200000, status: "diajukan" },
        { nama: "Kursi Tunggu", kategori: "meubelair", prioritas: "rencana", qty: 4, satuan: "unit", harga: 800000, total: 3200000, status: "ditolak", keterangan: "Tunda sampai semester 2" },
      ],
    },
    rooms: { name: "Pustu Sukorejo", icon: "\u{1F3E5}" },
    created_at: "2025-06-20T08:00:00Z",
    updated_at: "2025-06-25T08:00:00Z",
  },
];

export function getMockUsulan(roomId?: string): Usulan[] {
  if (roomId) {
    return usulanList.filter((u) => u.room_id === roomId);
  }
  return usulanList;
}
