# SIDIRA v4 - Sistem Digital Inventaris Ruangan Aset

Aplikasi manajemen inventaris aset untuk Puskesmas Baruharjo, Trenggalek.

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Supabase Auth
- **Language**: TypeScript

## 📁 Struktur Project

```
sidira/
├── web/                    # Next.js application
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities dan server actions
│   ├── supabase/         # Database migrations
│   ├── scripts/          # Setup dan monitoring scripts
│   ├── __tests__/        # Unit tests
│   └── docs/             # Documentation
└── gas-legacy/           # Kode lama Google Apps Script (backup)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn
- Supabase project (sudah dibuat dan dikonfigurasi)

### Installation

1. Clone repository:
```bash
git clone https://github.com/yudhis55/sidira.git
cd sidira
```

2. Install dependencies:
```bash
cd web
npm install
```

3. Setup environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan isi dengan credentials Supabase Anda:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Setup database:
   - Buka Supabase Dashboard → SQL Editor
   - Jalankan file migrasi di `web/supabase/migrations/` **berurutan** (lihat `web/README.md` untuk daftar lengkap dan urutan). Mulai dari `20260618000000_initial_schema.sql`.

5. Seed default users:
```bash
npx tsx scripts/setup-users.ts
```

6. Run development server:
```bash
npm run dev
```

7. Buka http://localhost:3000

### Default Login Credentials

- **Admin**: username `sidira`, password `sidira2026`
- **Editor**: username `pengurus`, password `barang2026`
- **Viewer**: username `kapus`, password `kapus2026`

## 📚 Dokumentasi

- [User Guide](web/docs/USER_GUIDE.md) - Panduan penggunaan aplikasi
- [Migration Guide](web/scripts/migrate-from-gas.ts) - Migrasi dari Google Sheets
- [Monitoring](web/scripts/monitoring.ts) - Health check dan monitoring

## ✅ Features

Semua 5 modul GAS telah diimplementasikan:

- ✅ Authentication & Authorization (3 roles: admin, editor, viewer)
- ✅ Dashboard dengan statistics
- ✅ **Ruangan / Inventaris** — detail per-ruangan, tabel per kategori, pindah barang (dengan riwayat), matriks checklist harian, section Usulan per-ruangan
- ✅ **Utilitas** — matriks pemeliharaan bulanan (ambulance, genset, IPAL)
- ✅ **Barang Keluar / SBBK** — daftar, filter, rekap, cetak (kop surat), export CSV
- ✅ **Rekap Pemegang Inventaris** (baru) — rekap pemegang + aset, buat Pakta langsung
- ✅ **Pakta Integritas** — daftar, lampiran aset, cetak (2 lembar), export CSV
- ✅ Riwayat (perpindahan barang), Laporan (export), Admin User Management

Lihat `web/README.md` untuk detail setup, migrasi, dan konvensi data.

## 🧪 Testing

Run unit tests:
```bash
cd web
npx tsx __tests__/business-logic.test.ts
```

Run monitoring script:
```bash
npx tsx scripts/monitoring.ts
```

## 📦 Scripts

```bash
npm run dev                                  # Start development server
npm run build                                # Build for production
npm run start                                # Start production server
npm run lint                                 # ESLint
npx tsc --noEmit                             # Typecheck
npx tsx scripts/setup-users.ts               # Seed default users
npx tsx scripts/monitoring.ts                # Health check
npx tsx scripts/migrate-from-gas.ts          # Migrasi dari Google Sheets
```

## 🔄 Migration dari Google Apps Script

Jika Anda memiliki data di Google Sheets lama, gunakan migration script:

```bash
cd web
npx tsx scripts/migrate-from-gas.ts
```

Lihat detail di [migration script](web/scripts/migrate-from-gas.ts).

## 📝 License

Internal use only - Puskesmas Baruharjo, Trenggalek

## 👥 Team

- Developer: AI Assistant
- Client: Puskesmas Baruharjo
