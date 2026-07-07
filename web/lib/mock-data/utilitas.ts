import type { UtilMeta, UtilItems, UtilState } from "@/types/database";
import type { UtilSummary } from "./types";

const utilMetaList: UtilMeta[] = [
  {
    util_id: "util-kebersihan",
    label: "Kebersihan Ruangan",
    icon: "\u{1F9F9}",
    warna: "#0e7c6b",
    bg: "#ccfbf1",
    custom: false,
    order_no: 1,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    util_id: "util-sterilisasi",
    label: "Sterilisasi Alat",
    icon: "\u{1F9EA}",
    warna: "#6d28d9",
    bg: "#ede9fe",
    custom: false,
    order_no: 2,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    util_id: "util-ac",
    label: "Perawatan AC",
    icon: "\u{2744}\u{FE0F}",
    warna: "#1d4ed8",
    bg: "#dbeafe",
    custom: true,
    order_no: 3,
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-01T08:00:00Z",
  },
];

const utilItemsList: UtilItems[] = [
  {
    id: 1,
    util_id: "util-kebersihan",
    items: [
      { nama: "Lobby Utama" },
      { nama: "Koridor Lantai 1" },
      { nama: "Toilet Umum" },
      { nama: "Ruang Tunggu" },
      { nama: "Halaman Depan" },
    ],
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 2,
    util_id: "util-sterilisasi",
    items: [
      { nama: "Instrumen Gigi Set A", ket: "Autoclave" },
      { nama: "Instrumen Gigi Set B", ket: "Autoclave" },
      { nama: "Alat Bedah Minor", ket: "Chemical" },
      { nama: "Alat IGD Emergency", ket: "Autoclave" },
    ],
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 3,
    util_id: "util-ac",
    items: [
      { nama: "AC IGD (2 PK)" },
      { nama: "AC Poli Umum (1.5 PK)" },
      { nama: "AC Poli Gigi (1 PK)" },
      { nama: "AC Farmasi (1.5 PK)" },
      { nama: "AC Laboratorium (2 PK)" },
      { nama: "AC Rekam Medis (1 PK)" },
    ],
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-01T08:00:00Z",
  },
];

const utilStateList: UtilState[] = [
  { id: 1, kind: "check", util_id: "util-kebersihan", item_index: "0", state_key: "2025-07-01", value: "done", updated_at: "2025-07-01T07:30:00Z", updated_by: "user-admin" },
  { id: 2, kind: "check", util_id: "util-kebersihan", item_index: "1", state_key: "2025-07-01", value: "done", updated_at: "2025-07-01T07:45:00Z", updated_by: "user-admin" },
  { id: 3, kind: "check", util_id: "util-kebersihan", item_index: "2", state_key: "2025-07-01", value: "done", updated_at: "2025-07-01T08:00:00Z", updated_by: "user-admin" },
  { id: 4, kind: "note", util_id: "util-kebersihan", item_index: "4", state_key: "2025-07-01", value: "Halaman sudah disapu, ada genangan air setelah hujan", updated_at: "2025-07-01T08:15:00Z", updated_by: "user-admin" },
  { id: 5, kind: "check", util_id: "util-sterilisasi", item_index: "0", state_key: "2025-07-02", value: "done", updated_at: "2025-07-02T09:00:00Z", updated_by: "user-editor1" },
  { id: 6, kind: "check", util_id: "util-sterilisasi", item_index: "1", state_key: "2025-07-02", value: "done", updated_at: "2025-07-02T09:15:00Z", updated_by: "user-editor1" },
  { id: 7, kind: "check", util_id: "util-ac", item_index: "0", state_key: "2025-07-05", value: "done", updated_at: "2025-07-05T10:00:00Z", updated_by: "user-admin" },
  { id: 8, kind: "note", util_id: "util-ac", item_index: "0", state_key: "2025-07-05", value: "Filter sudah dibersihkan, freon masih normal", updated_at: "2025-07-05T10:05:00Z", updated_by: "user-admin" },
];

const utilSummaries: UtilSummary[] = [
  { meta: utilMetaList[0], itemCount: 5, doneThisMonth: 3 },
  { meta: utilMetaList[1], itemCount: 4, doneThisMonth: 2 },
  { meta: utilMetaList[2], itemCount: 6, doneThisMonth: 1 },
];

export function getMockUtilitasMeta(): UtilMeta[] {
  return utilMetaList;
}

export function getMockUtilitasItems(): UtilItems[] {
  return utilItemsList;
}

export function getMockUtilitasState(): UtilState[] {
  return utilStateList;
}

export function getMockUtilitasSummary(): UtilSummary[] {
  return utilSummaries;
}
