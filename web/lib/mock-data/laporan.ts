import type { LaporanSummary, LaporanRoom, LaporanItem } from "./types";

const mockLaporanSummary: LaporanSummary = {
  total_rooms: 8,
  total_items: 30,
  total_baik: 22,
  total_rr: 5,
  total_rb: 2,
  total_ta: 1,
  percentage_baik: 73.3,
  percentage_rr: 16.7,
  percentage_rb: 6.7,
  percentage_ta: 3.3,
};

const mockLaporanRooms: LaporanRoom[] = [
  {
    room_id: "room-igd",
    room_name: "IGD",
    room_icon: "🚑",
    items: [
      {
        item_id: 1,
        nama: "Bedside Monitor",
        kategori: "alkes",
        kondisi_terbaru: "baik",
        tanggal_terbaru: "2025-06-15",
        riwayat_checklist: [
          { date_key: "2025-06-01", condition: "baik" },
          { date_key: "2025-06-15", condition: "baik" },
        ],
      },
      {
        item_id: 2,
        nama: "Stetoskop",
        kategori: "alkes",
        kondisi_terbaru: "rr",
        tanggal_terbaru: "2025-06-15",
        riwayat_checklist: [
          { date_key: "2025-06-01", condition: "baik" },
          { date_key: "2025-06-15", condition: "rr" },
        ],
      },
    ],
    summary: { total: 2, baik: 1, rr: 1, rb: 0, ta: 0 },
  },
  {
    room_id: "room-poli-umum",
    room_name: "Poli Umum",
    room_icon: "🩺",
    items: [
      {
        item_id: 5,
        nama: "Tensimeter",
        kategori: "alkes",
        kondisi_terbaru: "baik",
        tanggal_terbaru: "2025-06-14",
        riwayat_checklist: [
          { date_key: "2025-06-14", condition: "baik" },
        ],
      },
    ],
    summary: { total: 1, baik: 1, rr: 0, rb: 0, ta: 0 },
  },
  {
    room_id: "room-farmasi",
    room_name: "Farmasi",
    room_icon: "💊",
    items: [
      {
        item_id: 15,
        nama: "Kulkas Vaksin",
        kategori: "elektronik",
        kondisi_terbaru: "baik",
        tanggal_terbaru: "2025-06-13",
        riwayat_checklist: [
          { date_key: "2025-06-01", condition: "baik" },
          { date_key: "2025-06-13", condition: "baik" },
        ],
      },
    ],
    summary: { total: 1, baik: 1, rr: 0, rb: 0, ta: 0 },
  },
  {
    room_id: "room-lab",
    room_name: "Laboratorium",
    room_icon: "🔬",
    items: [
      {
        item_id: 20,
        nama: "Mikroskop",
        kategori: "alkes",
        kondisi_terbaru: "rb",
        tanggal_terbaru: "2025-06-12",
        riwayat_checklist: [
          { date_key: "2025-06-01", condition: "rr" },
          { date_key: "2025-06-12", condition: "rb" },
        ],
      },
    ],
    summary: { total: 1, baik: 0, rr: 0, rb: 1, ta: 0 },
  },
  {
    room_id: "room-gudang",
    room_name: "Gudang Umum",
    room_icon: "📦",
    items: [
      {
        item_id: 28,
        nama: "Rak Besi",
        kategori: "meubelair",
        kondisi_terbaru: "ta",
        tanggal_terbaru: "2025-06-10",
        riwayat_checklist: [
          { date_key: "2025-06-10", condition: "ta" },
        ],
      },
    ],
    summary: { total: 1, baik: 0, rr: 0, rb: 0, ta: 1 },
  },
];

export function getMockLaporanSummary(): LaporanSummary {
  return mockLaporanSummary;
}

export function getMockLaporanRooms(): LaporanRoom[] {
  return mockLaporanRooms;
}

export function getMockLaporan(): LaporanRoom[] {
  return mockLaporanRooms;
}
