# SIDIRA v4 — Sistem Digital Inventaris Ruangan Aset

Aplikasi manajemen inventaris aset untuk Puskesmas Baruharjo, Trenggalek. Dibangun ulang dari Google Apps Script ke stack modern Next.js + Supabase. Seluruh teks UI dalam Bahasa Indonesia.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database & Auth:** Supabase (PostgreSQL + Auth + RLS)
- **UI:** shadcn/ui + Tailwind CSS v4 + Radix
- **Bahasa:** TypeScript (strict)
- **Testing:** Custom runner (`npx tsx __tests__/business-logic.test.ts`)

## Struktur Project

```
sidira/
├── web/                      # Aplikasi Next.js (aktif)
│   ├── app/
│   │   ├── (dashboard)/      # Route group terproteksi (layout + sidebar)
│   │   ├── sbbk/[id]/print   # Route cetak top-level (lepas dari layout dashboard)
│   │   ├── pakta/[id]/print  # Route cetak top-level (lepas dari layout dashboard)
│   │   ├── login/            # Halaman login
│   │   └── api/              # API routes
│   ├── components/           # Komponen fitur (inventaris, sbbk, pakta, ...) + ui/
│   ├── lib/
│   │   ├── auth/             # Server actions per domain ("use server")
│   │   ├── supabase/         # client.ts, server.ts, admin.ts
│   │   ├── business-logic.ts # Pure functions (testable)
│   │   └── types.ts
│   ├── supabase/migrations/  # SQL migrasi timestamped
│   ├── scripts/              # tsx scripts (setup, migrate, monitor)
│   ├── __tests__/            # Unit tests
│   ├── middleware.ts         # Auth guard
│   └── public/               # Aset statis (logo, dll.)
├── gas-legacy/               # Kode lama Google Apps Script (backup, jangan diubah)
├── DESIGN.md                 # Sistem desain "Clinical Ledger" (akromatik)
└── PRODUCT.md                # Konteks produk & pengguna
```

## Fitur (Semua 5 Modul GAS + Tambahan)

1. **Ruangan / Inventaris** — daftar ruangan, detail per-ruangan dengan tabel barang per kategori (alkes, meubelair, elektronik, lainnya), pindah barang antar-ruangan (mencatat riwayat), matriks checklist harian (calendar), dan section Usulan per-ruangan.
2. **Utilitas** — matriks pemeliharaan bulanan (ambulance, genset, IPAL) dengan checklist harian.
3. **Barang Keluar / SBBK** — daftar + filter + rekap + cetak (kop surat + tabel + tanda tangan) + export CSV.
4. **Rekap Pemegang Inventaris** (baru) — rekap pemegang + aset yang dimanfaatkan, pembuatan Pakta Integritas langsung dari pemegang.
5. **Pakta Integritas** — daftar + lampiran daftar aset (kendaraan/laptop/alat) + cetak (2 lembar) + export CSV.

Tambahan: **Riwayat** (perpindahan barang), **Laporan** (laporan harian + export), **Admin Users** (manajemen pengguna).

## Setup

### 1. Environment variables

```bash
cd web
cp .env.local.example .env.local
```

Isi `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Install dependencies

```bash
cd web
npm install
```

### 3. Jalankan migrasi database

Buka Supabase Dashboard → SQL Editor, lalu jalankan file migrasi **berurutan**:

1. `supabase/migrations/20260618000000_initial_schema.sql` — skema inti (users, rooms, items, sbbk, pakta, checklist, dll.)
2. `supabase/migrations/20260618100000_schema_update.sql` — pembaruan skema
3. `supabase/migrations/20260618200000_seed_data.sql` — data awal
4. `supabase/migrations/20260619000001_add_rooms_category.sql` — kolom kategori ruangan
5. `supabase/migrations/20260620000000_seed_rooms_and_items.sql` — seed ruangan & barang
6. `supabase/migrations/20260624000000_fase0_schema_fix.sql` — perbaikan skema Fase 0
7. `supabase/migrations/20260625000000_pemegang_inventaris.sql` — tabel pemegang & aset_pemegang (modul Rekap)
8. `supabase/migrations/20260625000001_seed_utilitas.sql` — seed data utilitas

(File `20240115...` dan `20240120...` opsional; khusus fitur tambahan.)

### 4. Seed default users

```bash
cd web
npx tsx scripts/setup-users.ts
```

### 5. Jalankan dev server

```bash
cd web
npm run dev
```

Buka http://localhost:3000

### Default Login

| Role   | Username  | Password    |
|--------|-----------|-------------|
| Admin  | `sidira`  | `sidira2026`|
| Editor | `pengurus`| `barang2026`|
| Viewer | `kapus`   | `kapus2026` |

## Konvensi Data

- **Kondisi barang (condition):** `baik`, `rr` (rusak ringan), `rb` (rusak berat), `ta` (tidak ada) — mengikuti nilai GAS.
- **Kategori item:** `alkes`, `meubelair`, `elektronik`, `lainnya`.
- **Prioritas:** `wajib`, `penting`, `pendukung`.
- **Roles:** `admin` (akses penuh + manajemen user), `editor` (edit data), `viewer` (read-only).
- Auth login memetakan username ke `{username}@sidira.local`.

## Route Cetak (Print)

Route cetak SBBK & Pakta berada di top-level (`/sbbk/[id]/print`, `/pakta/[id]/print`) sehingga lepas dari layout dashboard dan cocok untuk pencetakan A4. Kedua route memakai kop surat dengan logo `/public/logo-puskesmas.svg` (fallback teks "LOGO" via `onError`).

## Sistem Desain

Mengikuti `DESIGN.md` — estetika "Clinical Ledger": palet akromatik (chroma 0, hanya merah untuk aksi destruktif), sudut persegi (`rounded-none`), tipografi mono untuk heading, tanpa shadow (gunakan ring border). Lihat `DESIGN.md` untuk detail lengkap.

## Scripts

```bash
npm run dev                                          # Dev server
npm run build                                        # Production build
npm run start                                        # Jalankan production server
npm run lint                                         # ESLint
npx tsc --noEmit                                     # Typecheck
npx tsx __tests__/business-logic.test.ts             # Unit tests
npx tsx scripts/setup-users.ts                       # Seed default users
npx tsx scripts/migrate-from-gas.ts                  # Migrasi dari Google Sheets
npx tsx scripts/monitoring.ts                        # Health check
npx tsx scripts/seed-data-from-excel.ts              # Seed dari file Excel
```

## Testing

Tidak ada jest/vitest. Unit test adalah pure-function tests di `__tests__/`, dijalankan dengan runner custom berbasis assert via `npx tsx`. Logika bisnis dijaga di `lib/business-logic.ts` (tanpa dependency DB/network) agar tetap testable.

## Catatan

- Next.js 16 memiliki breaking changes; konsultasikan `web/node_modules/next/dist/docs/` sebelum menulis kode App Router.
- RLS diaktifkan di semua tabel. Jangan ekspos admin client (service role) ke browser.
- File `middleware.ts` melindungi semua route kecuali `/login` dan `/auth`.

## License

Internal use only — Puskesmas Baruharjo, Trenggalek.
