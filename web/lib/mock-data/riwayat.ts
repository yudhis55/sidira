import type { RiwayatPindah } from "@/types/database";

function daysAgo(n: number): string {
  const d = new Date("2025-07-07T12:00:00Z");
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const riwayatList: RiwayatPindah[] = [
  {
    id: 1, ts: daysAgo(2), nama: "Stetoskop", kat: "alkes",
    dari: "room-poli-umum", ke: "room-igd",
    dari_name: "Poli Umum", ke_name: "IGD",
    user_id: "user-admin", created_at: daysAgo(2),
  },
  {
    id: 2, ts: daysAgo(5), nama: "Tensimeter Digital", kat: "alkes",
    dari: "room-gudang", ke: "room-poli-umum",
    dari_name: "Gudang Umum", ke_name: "Poli Umum",
    user_id: "user-admin", created_at: daysAgo(5),
  },
  {
    id: 3, ts: daysAgo(7), nama: "Komputer PC", kat: "elektronik",
    dari: "room-rekam-medis", ke: "room-farmasi",
    dari_name: "Rekam Medis", ke_name: "Farmasi",
    user_id: "user-editor1", created_at: daysAgo(7),
  },
  {
    id: 4, ts: daysAgo(9), nama: "Kursi Dokter", kat: "meubelair",
    dari: "room-gudang", ke: "room-poli-gigi",
    dari_name: "Gudang Umum", ke_name: "Poli Gigi",
    user_id: "user-admin", created_at: daysAgo(9),
  },
  {
    id: 5, ts: daysAgo(12), nama: "Printer", kat: "elektronik",
    dari: "room-poli-umum", ke: "room-rekam-medis",
    dari_name: "Poli Umum", ke_name: "Rekam Medis",
    user_id: "user-editor1", created_at: daysAgo(12),
  },
  {
    id: 6, ts: daysAgo(14), nama: "Nebulizer", kat: "alkes",
    dari: "room-igd", ke: "room-poli-umum",
    dari_name: "IGD", ke_name: "Poli Umum",
    user_id: "user-admin", created_at: daysAgo(14),
  },
  {
    id: 7, ts: daysAgo(16), nama: "Rak Besi", kat: "meubelair",
    dari: "room-gudang", ke: "room-farmasi",
    dari_name: "Gudang Umum", ke_name: "Farmasi",
    user_id: "user-admin", created_at: daysAgo(16),
  },
  {
    id: 8, ts: daysAgo(18), nama: "Termometer Digital", kat: "alkes",
    dari: "room-poli-umum", ke: "room-pustu",
    dari_name: "Poli Umum", ke_name: "Pustu Sukorejo",
    user_id: "user-editor2", created_at: daysAgo(18),
  },
  {
    id: 9, ts: daysAgo(20), nama: "AC Split", kat: "elektronik",
    dari: "room-gudang", ke: "room-lab",
    dari_name: "Gudang Umum", ke_name: "Laboratorium",
    user_id: "user-admin", created_at: daysAgo(20),
  },
  {
    id: 10, ts: daysAgo(23), nama: "Brankar", kat: "meubelair",
    dari: "room-poli-umum", ke: "room-igd",
    dari_name: "Poli Umum", ke_name: "IGD",
    user_id: "user-admin", created_at: daysAgo(23),
  },
  {
    id: 11, ts: daysAgo(26), nama: "Kulkas Vaksin", kat: "elektronik",
    dari: "room-gudang", ke: "room-farmasi",
    dari_name: "Gudang Umum", ke_name: "Farmasi",
    user_id: "user-admin", created_at: daysAgo(26),
  },
  {
    id: 12, ts: daysAgo(30), nama: "Meja Periksa", kat: "meubelair",
    dari: "room-gudang", ke: "room-poli-umum",
    dari_name: "Gudang Umum", ke_name: "Poli Umum",
    user_id: "user-editor2", created_at: daysAgo(30),
  },
];

export function getMockRiwayat(): RiwayatPindah[] {
  return riwayatList;
}
