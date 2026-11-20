// ══════════════════════════════════════════════════════════════════════
//  Marketplace shared types & display labels
//
//  NOT a "use server" module so server actions and client components can
//  both import types + label maps from here.
//
//  Domain: barang habis pakai (BMHP) — katalog + pengajuan + stok.
//  Jangan tertukar dengan `UsulanItem` (pengadaan aset) atau `Item`
//  (aset inventaris per ruangan).
// ══════════════════════════════════════════════════════════════════════

export type PengajuanStatus =
  | "diajukan"
  | "disetujui"
  | "disetujui_sebagian"
  | "ditolak"
  | "diserahkan"
  | "dibatalkan";

export type MutasiTipe = "saldo_awal" | "masuk" | "keluar" | "koreksi";

// ── Katalog ──────────────────────────────────────────────────────────

export interface KategoriBarang {
  id: number;
  nama: string;
  keterangan?: string | null;
  created_at?: string;
}

export interface Barang {
  id: number;
  kode: string;
  nama: string;
  kategori_id?: number | null;
  satuan: string;
  foto?: string | null;
  deskripsi?: string | null;
  stok: number;
  stok_minimum: number;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
  /** Diisi server action dari tabel kategori_barang (bukan kolom DB). */
  kategori_nama?: string | null;
}

// ── Whitelist pemohon ────────────────────────────────────────────────

export interface WhitelistPemohon {
  id: number;
  nama: string;
  aktif: boolean;
  keterangan?: string | null;
  created_at?: string;
}

// ── Pengajuan ────────────────────────────────────────────────────────

export interface PengajuanItem {
  id: number;
  pengajuan_id: number;
  barang_id?: number | null;
  nama_snapshot: string;
  satuan_snapshot: string;
  jumlah_diminta: number;
  jumlah_disetujui: number;
}

export interface PengajuanHeader {
  id: number;
  nomor: string;
  room_id?: string | null;
  nama_pemohon: string;
  status: PengajuanStatus;
  catatan_pemohon?: string | null;
  catatan_admin?: string | null;
  diajukan_at: string;
  diputuskan_at?: string | null;
  diputuskan_oleh?: string | null;
  diserahkan_at?: string | null;
  diterima_oleh?: string | null;
  created_at?: string;
  /** Diisi server action dari tabel rooms (bukan kolom DB). */
  room_name?: string | null;
  room_icon?: string | null;
  /** Jumlah baris item — diisi server action untuk halaman daftar. */
  item_count?: number;
}

export interface PengajuanDetail extends PengajuanHeader {
  items: PengajuanItem[];
}

export interface MutasiStok {
  id: number;
  barang_id: number;
  tipe: MutasiTipe;
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  referensi_pengajuan_id?: number | null;
  keterangan: string;
  user_id?: string | null;
  created_at: string;
  /** Diisi server action dari tabel barang (bukan kolom DB). */
  barang_nama?: string | null;
  barang_satuan?: string | null;
}

export interface LogStatusPengajuan {
  id: number;
  pengajuan_id: number;
  status_lama?: PengajuanStatus | null;
  status_baru: PengajuanStatus;
  catatan?: string | null;
  user_nama: string;
  created_at: string;
}

/** Hasil `riwayat_pengajuan_publik()` — TANPA identitas pemohon. */
export interface RiwayatPengajuanPublik {
  nomor: string;
  room_name: string | null;
  room_icon: string | null;
  status: PengajuanStatus;
  diajukan_at: string;
  diputuskan_at: string | null;
  diserahkan_at: string | null;
  items: Array<{
    nama: string;
    satuan: string;
    jumlah_diminta: number;
    jumlah_disetujui: number;
  }>;
}

/** Hasil `lacak_pengajuan()` — dipakai pemohon tanpa login. */
export interface LacakPengajuan {
  nomor: string;
  nama_pemohon: string;
  room_id: string | null;
  room_name: string | null;
  room_icon: string | null;
  status: PengajuanStatus;
  catatan_pemohon: string | null;
  catatan_admin: string | null;
  diajukan_at: string;
  diputuskan_at: string | null;
  diserahkan_at: string | null;
  diterima_oleh: string | null;
  items: Array<{
    nama: string;
    satuan: string;
    jumlah_diminta: number;
    jumlah_disetujui: number;
  }>;
}

// ── Keranjang (client-side, localStorage) ────────────────────────────

export interface KeranjangLine {
  barang_id: number;
  nama: string;
  satuan: string;
  jumlah: number;
}

// ══════════════════════════════════════════════════════════════════════
//  Display labels & badge classes
// ══════════════════════════════════════════════════════════════════════

export const PENGAJUAN_STATUS_LABELS: Record<PengajuanStatus, string> = {
  diajukan: "Diajukan",
  disetujui: "Disetujui",
  disetujui_sebagian: "Disetujui Sebagian",
  ditolak: "Ditolak",
  diserahkan: "Diserahkan",
  dibatalkan: "Dibatalkan",
};

/** Kelas badge status — mengikuti token warna aplikasi. */
export const PENGAJUAN_STATUS_BADGE: Record<PengajuanStatus, string> = {
  diajukan: "bg-info-soft text-info",
  disetujui: "bg-primary-soft text-primary",
  disetujui_sebagian: "bg-warning-soft text-warning",
  ditolak: "bg-danger-soft text-danger",
  diserahkan: "bg-teal4 text-teal",
  dibatalkan: "bg-surface-muted text-text-2",
};

/** Status yang masih menunggu keputusan admin. */
export const PENGAJUAN_OPEN_STATUSES: PengajuanStatus[] = ["diajukan"];

/** Status yang sudah final (tidak ada aksi lanjutan). */
export const PENGAJUAN_FINAL_STATUSES: PengajuanStatus[] = [
  "ditolak",
  "diserahkan",
  "dibatalkan",
];

export const MUTASI_TIPE_LABELS: Record<MutasiTipe, string> = {
  saldo_awal: "Saldo Awal",
  masuk: "Masuk",
  keluar: "Keluar",
  koreksi: "Koreksi",
};
