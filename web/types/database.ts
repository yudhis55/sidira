// Database types akan di-generate dari Supabase
// Untuk sekarang, kita define manual types yang kita butuhkan

export type UserRole = "admin" | "editor" | "viewer";

export interface Profile {
  id: string;
  username: string;
  nama: string;
  jabatan?: string;
  role: UserRole;
  avatar: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type RoomCategory = "pelayanan" | "penunjang" | "administrasi" | "gudang" | "pustu" | "lain";

export interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  description?: string;
  pj?: string;
  pj_nip?: string;
  category?: RoomCategory;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type ItemCategory = "alkes" | "meubelair" | "elektronik" | "lainnya";
export type ItemCondition = "baik" | "rr" | "rb" | "ta";

export interface Item {
  id: number;
  room_id: string;
  category: ItemCategory;
  name: string;
  merk?: string;
  type?: string;
  year?: number;
  quantity: number;
  unit: string;
  condition: ItemCondition;
  notes?: string;
  index_in_room: number;
  bahan?: string;
  no_seri?: string;
  kode_barang?: string;
  harga?: number;
  kategori?: string;
  spec?: string;
  noreg?: string;
  std?: number;
  prio?: "wajib" | "penting" | "pendukung";
  created_at: string;
  updated_at: string;
}

export interface ChecklistPayload {
  status: ItemCondition;
  jenis_kerusakan?: string;
  uraian_kerusakan?: string;
  jenis_tindakan?: string;
  uraian_tindakan?: string;
  petugas?: string;
  no_laporan?: string;
}

export interface Checklist {
  id: number;
  room_id: string;
  item_id: number;
  category: ItemCategory;
  item_index: number;
  date_key: string; // YYYY-MM-DD
  payload: ChecklistPayload;
  updated_at: string;
}

export interface SBBKItem {
  nama: string;
  merk?: string;
  qty: number;
  satuan: string;
  harga: number;
  total: number;
}

export interface SBBK {
  id: string;
  no: string;
  tgl: string; // ISO date
  kepada: string;
  jenis?: string;
  anggaran?: string;
  ket_umum?: string;
  items: SBBKItem[];
  created_at: string;
  updated_at: string;
}

// Catatan: field names mengikuti GAS legacy lampiran aset (source of truth).
// DB kolom aset_kendaraan/aset_laptop/aset_alat adalah JSONB tanpa constraint
// sehingga bentuk objek bebas. Dipakai oleh form entri & dokumen cetak Pakta.
export interface PaktaAsetKendaraan {
  jenis?: string; // motor / mobil
  merk?: string;
  tahun?: string | number;
  nopol?: string; // No. Polisi
  harga?: string; // Harga Perolehan
  ket?: string; // Keterangan
}

export interface PaktaAsetLaptop {
  merk?: string;
  type?: string;
  tahun?: string | number;
  seri?: string; // No. Seri
  harga?: string; // Harga Perolehan
  ket?: string; // Keterangan
}

export interface PaktaAsetAlat {
  merk?: string;
  type?: string;
  tahun?: string | number;
  seri?: string; // No. Seri
  harga?: string; // Harga Perolehan
  ket?: string; // Keterangan
}

export interface Pakta {
  id: string;
  hari?: string;
  tgl?: string;
  nama: string;
  nip?: string;
  jabatan?: string;
  alamat?: string;
  aset_kendaraan: PaktaAsetKendaraan[];
  aset_laptop: PaktaAsetLaptop[];
  aset_alat: PaktaAsetAlat[];
  created_at: string;
  updated_at: string;
}

export interface PenanggungJawab {
  id: number;
  room_id: string;
  nama: string;
  nip?: string;
  jabatan?: string;
  created_at: string;
  updated_at: string;
}

export interface RiwayatPindah {
  id: number;
  ts: string;
  nama: string;
  kat?: ItemCategory;
  dari?: string;
  ke?: string;
  dari_name?: string;
  ke_name?: string;
  user_id?: string;
  created_at: string;
}

export interface UtilItem {
  nama: string;
  ket?: string;
}

export interface UtilItems {
  id: number;
  util_id: string;
  items: UtilItem[];
  created_at: string;
  updated_at: string;
}

export interface UtilMeta {
  util_id: string;
  label: string;
  icon: string;
  warna: string;
  bg: string;
  custom: boolean;
  order_no: number;
  created_at: string;
  updated_at: string;
}

export interface UtilState {
  id: number;
  kind: "check" | "note";
  util_id: string;
  item_index?: string;
  state_key: string;
  value?: string;
  updated_at: string;
  updated_by?: string;
}

export interface UsulanItem {
  nama: string;
  kategori: ItemCategory;
  prioritas: "mendesak" | "penting" | "rencana";
  qty: number;
  satuan: string;
  harga: number;
  total: number;
  status: "diajukan" | "disetujui" | "ditolak";
  keterangan?: string;
}

export interface Usulan {
  id: number;
  room_id: string;
  payload: {
    items: UsulanItem[];
  };
  created_at: string;
  updated_at: string;
}

export interface Log {
  id: number;
  ts: string;
  user_id?: string;
  action: string;
  detail?: string;
  created_at: string;
}

// ══════════════════════════════════════════════════════════════════════
//  Rekap Pemegang Inventaris
// ══════════════════════════════════════════════════════════════════════
export type PemegangStatus = "PNS" | "PPPK";
export type AsetPemegangJenis = "kendaraan" | "laptop" | "alat" | "rumah";

export interface PemegangInventaris {
  id: string;
  nama: string;
  nip?: string;
  jabatan?: string;
  status: PemegangStatus;
  created_at: string;
  updated_at: string;
}

export interface AsetPemegang {
  id: number;
  pemegang_id: string;
  jenis: AsetPemegangJenis;
  merk?: string;
  type?: string;
  tahun?: string;
  nopol?: string;
  harga?: string;
  ket?: string;
  created_at: string;
  updated_at: string;
}
