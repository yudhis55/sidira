# SIDIRA v4 Migration Plan: Google Apps Script → Next.js + Supabase

## Executive Summary

Migrasi aplikasi SIDIRA (Sistem Digital Inventaris Ruangan Aset) dari Google Apps Script monolithic ke modern stack Next.js 14 (App Router) + Supabase. Aplikasi ini digunakan untuk manajemen inventaris aset Puskesmas Baruharjo, Trenggalek.

**Current State:**
- Google Apps Script backend (1,444 lines)
- Monolithic HTML frontend (29,800+ lines)
- Google Sheets sebagai database (13 sheets)
- Offline-first dengan localStorage cache
- Token-based authentication (custom)

**Target State:**
- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Online-only (no offline cache complexity)
- Role-based access control (admin, editor, viewer)
- Deployed di Vercel + Supabase

**Key Decisions:**
- ✅ Full rewrite (semua fitur sekaligus)
- ✅ Keep kode GAS lama (tidak dihapus, di-backup)
- ✅ Fresh start (tidak perlu migrasi data dari Sheets)
- ✅ Online-only (tidak perlu offline sync)
- ✅ Vercel hosting (free tier)
- ✅ Supabase free tier (500MB, 50K monthly active users)

---

## Phase 1: Project Setup & Infrastructure (Week 1)

### 1.1 Initialize Next.js Project
```
sidira/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router pages
│       ├── components/         # React components
│       ├── lib/               # Utilities, helpers
│       ├── types/             # TypeScript types
│       └── public/            # Static assets
├── packages/
│   └── database/              # Supabase schema & migrations
│       ├── supabase/
│       │   └── migrations/    # SQL migration files
│       └── types/             # Generated types
├── gas-legacy/                # Backup kode GAS lama (Code.gs, index.html)
└── docs/                      # Documentation
```

**Tasks:**
- [ ] Create Next.js 14 project with App Router + TypeScript
- [ ] Setup Tailwind CSS + shadcn/ui (modern component library)
- [ ] Configure ESLint + Prettier
- [ ] Setup Turborepo (monorepo structure)
- [ ] Initialize Supabase project
- [ ] Setup environment variables (.env.local)
- [ ] Create gas-legacy/ folder dan backup kode lama
- [ ] Setup Git repository dengan proper .gitignore

**Tech Stack:**
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript 5",
  "styling": "Tailwind CSS 3",
  "ui": "shadcn/ui + Radix UI",
  "state": "Zustand (lightweight)",
  "forms": "React Hook Form + Zod",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "realtime": "Supabase Realtime",
  "deployment": "Vercel"
}
```

### 1.2 Supabase Setup
**Tasks:**
- [ ] Create Supabase project (free tier)
- [ ] Configure project settings (timezone, region)
- [ ] Enable Row Level Security (RLS)
- [ ] Setup Supabase Auth (email/password)
- [ ] Create environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

### 1.3 Database Schema Design

**Tables (13 tables):**

```sql
-- 1. Users (handled by Supabase Auth + custom profile)
-- auth.users (built-in)
-- public.profiles (custom extension)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  jabatan TEXT,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) NOT NULL,
  avatar TEXT DEFAULT '👤',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Rooms (Ruangan)
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏥',
  color TEXT DEFAULT '#0e7c6b',
  bg TEXT DEFAULT '#d4f0eb',
  description TEXT,
  pj TEXT, -- Penanggung jawab (nama)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Items (Inventaris per ruangan)
CREATE TABLE public.items (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('alkes', 'meubelair', 'elektronik', 'lainnya')) NOT NULL,
  name TEXT NOT NULL,
  merk TEXT,
  type TEXT,
  year INTEGER,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'unit',
  condition TEXT CHECK (condition IN ('baik', 'rr', 'rb', 'ta')) DEFAULT 'baik',
  notes TEXT,
  index_in_room INTEGER, -- Urutan dalam ruangan
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Checklist (Ceklist harian kondisi barang)
CREATE TABLE public.checklist (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  item_id BIGINT REFERENCES public.items(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('alkes', 'meubelair', 'elektronik', 'lainnya')) NOT NULL,
  item_index INTEGER NOT NULL, -- Index item dalam category
  date_key TEXT NOT NULL, -- Format: 'YYYY-MM-DD'
  payload JSONB NOT NULL DEFAULT '{}',
  -- payload structure:
  -- {
  --   "status": "baik" | "rr" | "rb" | "ta",
  --   "jenis_kerusakan": "",
  --   "uraian_kerusakan": "",
  --   "jenis_tindakan": "",
  --   "uraian_tindakan": "",
  --   "petugas": "",
  --   "no_laporan": ""
  -- }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, category, item_index, date_key)
);

-- 5. SBBK (Surat Bukti Barang Keluar)
CREATE TABLE public.sbbk (
  id TEXT PRIMARY KEY,
  no TEXT NOT NULL,
  tgl DATE NOT NULL,
  kepada TEXT NOT NULL,
  jenis TEXT,
  anggaran TEXT,
  ket_umum TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  -- items structure:
  -- [
  --   {
  --     "nama": "",
  --     "merk": "",
  --     "qty": 1,
  --     "satuan": "unit",
  --     "harga": 0,
  --     "total": 0
  --   }
  -- ]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Pakta (Pakta Integritas)
CREATE TABLE public.pakta (
  id TEXT PRIMARY KEY,
  hari TEXT,
  tgl DATE,
  nama TEXT NOT NULL,
  nip TEXT,
  jabatan TEXT,
  alamat TEXT,
  aset_kendaraan JSONB DEFAULT '[]',
  -- aset_kendaraan structure:
  -- [{"jenis": "", "merk": "", "tahun": 2020, "no_rangka": "", "no_mesin": "", "no_polisi": "", "kondisi": "baik"}]
  aset_laptop JSONB DEFAULT '[]',
  -- aset_laptop structure:
  -- [{"merk": "", "type": "", "tahun": 2020, "no_seri": "", "kondisi": "baik"}]
  aset_alat JSONB DEFAULT '[]',
  -- aset_alat structure:
  -- [{"nama": "", "merk": "", "type": "", "tahun": 2020, "kondisi": "baik"}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Penanggung Jawab (PJ per ruangan)
CREATE TABLE public.penanggung_jawab (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Riwayat Pindah (Movement log)
CREATE TABLE public.riwayat_pindah (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nama TEXT NOT NULL,
  kat TEXT CHECK (kat IN ('alkes', 'meubelair', 'elektronik', 'lainnya')),
  dari TEXT REFERENCES public.rooms(id),
  ke TEXT REFERENCES public.rooms(id),
  dari_name TEXT,
  ke_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Util Items (Ambulance, Genset, IPAL)
CREATE TABLE public.util_items (
  id BIGSERIAL PRIMARY KEY,
  util_id TEXT NOT NULL, -- 'ambulance', 'genset', 'ipal'
  items JSONB NOT NULL DEFAULT '[]',
  -- items structure:
  -- [{"nama": "", "ket": ""}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Util Meta (Metadata utilitas)
CREATE TABLE public.util_meta (
  util_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '🔧',
  warna TEXT DEFAULT '#0e7c6b',
  bg TEXT DEFAULT '#d4f0eb',
  custom BOOLEAN DEFAULT FALSE,
  order_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Util State (Status ceklist utilitas)
CREATE TABLE public.util_state (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT CHECK (kind IN ('check', 'note')) NOT NULL,
  util_id TEXT NOT NULL,
  item_index TEXT,
  state_key TEXT NOT NULL, -- Date key atau note key
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(util_id, kind, item_index, state_key)
);

-- 12. Usulan (Proposal pengadaan)
CREATE TABLE public.usulan (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  -- payload structure (per room):
  -- {
  --   "items": [
  --     {
  --       "nama": "",
  --       "kategori": "alkes",
  --       "prioritas": "wajib",
  --       "qty": 1,
  --       "satuan": "unit",
  --       "harga": 0,
  --       "total": 0,
  --       "status": "pending",
  --       "keterangan": ""
  --     }
  --   ]
  -- }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Log (Audit trail)
CREATE TABLE public.log (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performance
CREATE INDEX idx_rooms_order ON public.rooms(order_index);
CREATE INDEX idx_items_room ON public.items(room_id);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_checklist_room ON public.checklist(room_id);
CREATE INDEX idx_checklist_date ON public.checklist(date_key);
CREATE INDEX idx_checklist_unique ON public.checklist(room_id, category, item_index, date_key);
CREATE INDEX idx_sbbk_tgl ON public.sbbk(tgl);
CREATE INDEX idx_pakta_tgl ON public.pakta(tgl);
CREATE INDEX idx_riwayat_pindah_ts ON public.riwayat_pindah(ts DESC);
CREATE INDEX idx_util_state_util ON public.util_state(util_id);
CREATE INDEX idx_usulan_room ON public.usulan(room_id);
CREATE INDEX idx_log_ts ON public.log(ts DESC);
CREATE INDEX idx_log_user ON public.log(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sbbk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pakta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penanggung_jawab ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_pindah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.util_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.util_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.util_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usulan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log ENABLE ROW LEVEL SECURITY;
```

**Row Level Security Policies:**

```sql
-- Profiles: Semua authenticated users bisa baca
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: Hanya bisa update profile sendiri
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Rooms: Semua authenticated users bisa baca
CREATE POLICY "Rooms are viewable by authenticated users"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (true);

-- Rooms: Admin & Editor bisa create/update/delete
CREATE POLICY "Admin and Editor can modify rooms"
  ON public.rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Items: Semua authenticated users bisa baca
CREATE POLICY "Items are viewable by authenticated users"
  ON public.items FOR SELECT
  TO authenticated
  USING (true);

-- Items: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify items"
  ON public.items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Checklist: Semua authenticated users bisa baca
CREATE POLICY "Checklist is viewable by authenticated users"
  ON public.checklist FOR SELECT
  TO authenticated
  USING (true);

-- Checklist: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify checklist"
  ON public.checklist FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- SBBK: Semua authenticated users bisa baca
CREATE POLICY "SBBK is viewable by authenticated users"
  ON public.sbbk FOR SELECT
  TO authenticated
  USING (true);

-- SBBK: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify SBBK"
  ON public.sbbk FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Pakta: Semua authenticated users bisa baca
CREATE POLICY "Pakta is viewable by authenticated users"
  ON public.pakta FOR SELECT
  TO authenticated
  USING (true);

-- Pakta: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify Pakta"
  ON public.pakta FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Penanggung Jawab: Semua authenticated users bisa baca
CREATE POLICY "Penanggung Jawab is viewable by authenticated users"
  ON public.penanggung_jawab FOR SELECT
  TO authenticated
  USING (true);

-- Penanggung Jawab: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify Penanggung Jawab"
  ON public.penanggung_jawab FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Riwayat Pindah: Semua authenticated users bisa baca
CREATE POLICY "Riwayat Pindah is viewable by authenticated users"
  ON public.riwayat_pindah FOR SELECT
  TO authenticated
  USING (true);

-- Riwayat Pindah: Admin & Editor bisa create (no update/delete)
CREATE POLICY "Admin and Editor can create Riwayat Pindah"
  ON public.riwayat_pindah FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Util Items: Semua authenticated users bisa baca
CREATE POLICY "Util Items is viewable by authenticated users"
  ON public.util_items FOR SELECT
  TO authenticated
  USING (true);

-- Util Items: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify Util Items"
  ON public.util_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Util Meta: Semua authenticated users bisa baca
CREATE POLICY "Util Meta is viewable by authenticated users"
  ON public.util_meta FOR SELECT
  TO authenticated
  USING (true);

-- Util Meta: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify Util Meta"
  ON public.util_meta FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Util State: Semua authenticated users bisa baca
CREATE POLICY "Util State is viewable by authenticated users"
  ON public.util_state FOR SELECT
  TO authenticated
  USING (true);

-- Util State: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify Util State"
  ON public.util_state FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Usulan: Semua authenticated users bisa baca
CREATE POLICY "Usulan is viewable by authenticated users"
  ON public.usulan FOR SELECT
  TO authenticated
  USING (true);

-- Usulan: Admin & Editor bisa modify
CREATE POLICY "Admin and Editor can modify Usulan"
  ON public.usulan FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Log: Semua authenticated users bisa baca
CREATE POLICY "Log is viewable by authenticated users"
  ON public.log FOR SELECT
  TO authenticated
  USING (true);

-- Log: Hanya bisa insert (no update/delete)
CREATE POLICY "Anyone can insert logs"
  ON public.log FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

**Supabase Auth Configuration:**
```sql
-- Trigger untuk auto-create profile saat user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nama, role, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function untuk update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger ke semua tabel
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.checklist
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sbbk
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pakta
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.penanggung_jawab
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.util_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.util_meta
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.util_state
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.usulan
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**Seed Data:**
```sql
-- Insert default users (untuk testing)
-- Password: sidira2026 (hashed dengan Supabase Auth)
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'sidira@puskesmas.id',
  crypt('sidira2026', gen_salt('bf')),
  '{"nama": "Admin SIDIRA", "role": "admin", "jabatan": "Administrator", "avatar": "👨‍💼"}'
);

-- Password: kapus2026
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'kapus@puskesmas.id',
  crypt('kapus2026', gen_salt('bf')),
  '{"nama": "Kepala Puskesmas", "role": "viewer", "jabatan": "Kepala Puskesmas", "avatar": "👨‍⚕️"}'
);

-- Password: barang2026
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'pengurus@puskesmas.id',
  crypt('barang2026', gen_salt('bf')),
  '{"nama": "Pengurus Barang", "role": "editor", "jabatan": "Pengurus Barang", "avatar": "📦"}'
);
```

**Tasks:**
- [ ] Buat migration file: `20240101000000_initial_schema.sql`
- [ ] Apply migration ke Supabase
- [ ] Generate TypeScript types dengan `supabase gen types`
- [ ] Test RLS policies
- [ ] Seed default users

---

## Phase 2: Authentication & Layout (Week 2)

### 2.1 Supabase Auth Integration
**Files:**
```
apps/web/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client (anon key)
│   │   ├── server.ts          # Server client (service role)
│   │   └── middleware.ts      # Auth middleware
│   └── auth/
│       ├── actions.ts         # Server actions (login, logout)
│       └── utils.ts           # Auth utilities
```

**Tasks:**
- [ ] Create Supabase client utilities
- [ ] Implement login page (`/login`)
- [ ] Implement logout functionality
- [ ] Create auth middleware untuk protect routes
- [ ] Handle session refresh
- [ ] Test authentication flow

### 2.2 Layout & Navigation
**Files:**
```
apps/web/
├── app/
│   ├── layout.tsx             # Root layout
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx       # Login page
│   └── (dashboard)/
│       ├── layout.tsx         # Dashboard layout (with sidebar)
│       ├── page.tsx           # Dashboard home
│       ├── inventaris/
│       │   └── page.tsx       # Room inventory
│       ├── checklist/
│       │   └── page.tsx       # Daily checklist
│       ├── sbbk/
│       │   └── page.tsx       # SBBK documents
│       ├── pakta/
│       │   └── page.tsx       # Pakta documents
│       ├── utilitas/
│       │   └── page.tsx       # Utility maintenance
│       ├── usulan/
│       │   └── page.tsx       # Proposals
│       ├── laporan/
│       │   └── page.tsx       # Reports
│       ├── rekap/
│       │   └── page.tsx       # Inventory recap
│       ├── riwayat/
│       │   └── page.tsx       # Movement history
│       └── admin/
│           └── page.tsx       # User management (admin only)
├── components/
│   ├── layout/
│   │   ├── header.tsx         # Top header with logo & user menu
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   └── breadcrumb.tsx     # Breadcrumb navigation
│   └── ui/                    # shadcn/ui components
```

**Tasks:**
- [ ] Create root layout dengan Tailwind
- [ ] Create login page dengan modern design
- [ ] Create dashboard layout dengan sidebar navigation
- [ ] Implement responsive mobile menu
- [ ] Add breadcrumbs
- [ ] Style header dengan logo & user info

### 2.3 Role-Based Access Control
**Files:**
```
apps/web/
├── lib/
│   └── auth/
│       └── roles.ts           # Role utilities
├── components/
│   └── auth/
│       ├── role-guard.tsx     # Protect routes by role
│       └── permission-check.tsx
```

**Tasks:**
- [ ] Create role utilities (isAdmin, isEditor, isViewer)
- [ ] Create RoleGuard component
- [ ] Protect admin routes (user management)
- [ ] Hide edit/delete buttons for viewers
- [ ] Test role-based access

---

## Phase 3: Core Modules - Rooms & Items (Week 3)

### 3.1 Rooms Management
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── inventaris/
│           ├── page.tsx                    # Rooms list
│           ├── [roomId]/
│           │   └── page.tsx                # Room detail with items
│           └── components/
│               ├── room-card.tsx           # Room card component
│               ├── room-form.tsx           # Add/edit room modal
│               └── room-stats.tsx          # Room statistics
├── lib/
│   └── api/
│       ├── rooms.ts                        # Room API functions
│       └── items.ts                        # Item API functions
```

**Features:**
- [ ] List all rooms dengan grid view
- [ ] Room statistics (total items, condition breakdown)
- [ ] Add new room (modal form)
- [ ] Edit room (name, icon, color, description)
- [ ] Delete room (with confirmation)
- [ ] Reorder rooms (drag & drop)
- [ ] Search & filter rooms
- [ ] Export room data ke CSV

### 3.2 Items Management (per Room)
**Features:**
- [ ] View items grouped by category (alkes, meubelair, elektronik, lainnya)
- [ ] Add new item (inline form)
- [ ] Edit item (inline editing)
- [ ] Delete item (with confirmation)
- [ ] Bulk update kondisi (set all to "baik")
- [ ] Move item ke ruangan lain (dengan riwayat pindah)
- [ ] Filter items by condition
- [ ] Sort items by name/condition/year

### 3.3 Real-time Sync
**Tasks:**
- [ ] Setup Supabase Realtime subscription untuk rooms
- [ ] Setup Supabase Realtime subscription untuk items
- [ ] Handle INSERT, UPDATE, DELETE events
- [ ] Update UI automatically when data changes
- [ ] Show "syncing..." indicator
- [ ] Handle connection errors gracefully

---

## Phase 4: Checklist Harian (Week 4)

### 4.1 Checklist UI
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── checklist/
│           ├── page.tsx                    # Checklist main page
│           └── components/
│               ├── checklist-header.tsx    # Month/year selector
│               ├── checklist-table.tsx     # Main checklist grid
│               ├── checklist-cell.tsx      # Single day cell
│               ├── detail-modal.tsx        # Detail entry modal
│               └── checklist-summary.tsx   # Summary statistics
```

**Features:**
- [ ] Month/year selector dengan tabs
- [ ] Room selector dropdown
- [ ] Checklist grid (items x days)
- [ ] Click cell untuk toggle status (baik → rr → rb → ta → baik)
- [ ] Color-coded cells (green/yellow/red/gray)
- [ ] Batch operations:
  - [ ] Set all to "baik" untuk tanggal tertentu
  - [ ] Set all to "baik" untuk range tanggal
  - [ ] Set all to "baik" untuk seluruh bulan
- [ ] Filter by category (alkes, meubelair, elektronik, lainnya)
- [ ] Search item name
- [ ] Summary statistics (total baik, rr, rb, ta)
- [ ] Export checklist ke CSV

### 4.2 Detail Entry Modal
**Features:**
- [ ] Click cell untuk open detail modal
- [ ] Form fields:
  - [ ] Status (baik/rr/rb/ta)
  - [ ] Jenis kerusakan (dropdown)
  - [ ] Uraian kerusakan (textarea)
  - [ ] Jenis tindakan (dropdown)
  - [ ] Uraian tindakan (textarea)
  - [ ] Petugas (text)
  - [ ] No. laporan (text)
- [ ] Save entry
- [ ] Clear entry
- [ ] View history (log perubahan)

### 4.3 Real-time Checklist Sync
**Tasks:**
- [ ] Setup Supabase Realtime subscription untuk checklist
- [ ] Handle concurrent edits (optimistic updates)
- [ ] Show "last updated by" indicator
- [ ] Handle conflicts gracefully

---

## Phase 5: SBBK & Pakta Documents (Week 5)

### 5.1 SBBK (Surat Bukti Barang Keluar)
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── sbbk/
│           ├── page.tsx                    # SBBK list
│           ├── [sbbkId]/
│           │   └── page.tsx                # SBBK detail/edit
│           └── components/
│               ├── sbbk-table.tsx          # SBBK table
│               ├── sbbk-form.tsx           # SBBK form
│               ├── sbbk-items.tsx          # Items in SBBK
│               └── sbbk-print.tsx          # Print template
```

**Features:**
- [ ] List all SBBK documents
- [ ] Filter by date range, anggaran, jenis
- [ ] Search by no, kepada
- [ ] Add new SBBK
- [ ] Edit SBBK
- [ ] Delete SBBK
- [ ] Add/edit/delete items dalam SBBK
- [ ] Auto-calculate total per item
- [ ] Auto-calculate grand total
- [ ] Format currency (Rp)
- [ ] Print SBBK (PDF template)
- [ ] Export SBBK ke CSV
- [ ] Rekap SBBK per anggaran

### 5.2 Pakta Integritas
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── pakta/
│           ├── page.tsx                    # Pakta list
│           ├── [paktaId]/
│           │   └── page.tsx                # Pakta detail/edit
│           └── components/
│               ├── pakta-table.tsx         # Pakta table
│               ├── pakta-form.tsx          # Pakta form
│               ├── pakta-aset.tsx          # Aset sections (kendaraan, laptop, alat)
│               └── pakta-print.tsx         # Print template
```

**Features:**
- [ ] List all Pakta documents
- [ ] Filter by date range, nama
- [ ] Search by nama, NIP
- [ ] Add new Pakta
- [ ] Edit Pakta
- [ ] Delete Pakta
- [ ] Add/edit/delete aset kendaraan
- [ ] Add/edit/delete aset laptop
- [ ] Add/edit/delete aset alat
- [ ] Count total aset per jenis
- [ ] Print Pakta (PDF template dengan 3 sections)
- [ ] Export Pakta ke CSV

---

## Phase 6: Utilitas (Ambulance, Genset, IPAL) (Week 6)

### 6.1 Utility Management
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── utilitas/
│           ├── page.tsx                    # Utility selector
│           ├── [utilId]/
│           │   └── page.tsx                # Utility checklist
│           └── components/
│               ├── util-card.tsx           # Utility card
│               ├── util-checklist.tsx      # Utility checklist
│               ├── util-jadwal.tsx         # Schedule card
│               └── util-settings.tsx       # Utility settings
```

**Features:**
- [ ] List utilities (Ambulance, Genset, IPAL)
- [ ] Add custom utility (admin only)
- [ ] Edit utility metadata (label, icon, color)
- [ ] Delete utility (admin only)
- [ ] Checklist harian (similar to room checklist)
- [ ] Schedule/jadwal maintenance
- [ ] Notes per tanggal
- [ ] Statistics (days checked, days unchecked)
- [ ] Export utility data ke CSV

### 6.2 Real-time Utility Sync
**Tasks:**
- [ ] Setup Supabase Realtime subscription untuk util_state
- [ ] Handle concurrent checklist updates
- [ ] Optimistic updates untuk better UX

---

## Phase 7: Usulan (Proposals) (Week 7)

### 7.1 Proposal Management
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── usulan/
│           ├── page.tsx                    # Usulan overview
│           ├── [roomId]/
│           │   └── page.tsx                # Usulan per room
│           └── components/
│               ├── usulan-table.tsx        # Usulan table
│               ├── usulan-form.tsx         # Add/edit usulan
│               ├── usulan-stats.tsx        # Statistics
│               └── usulan-export.tsx       # Export functions
```

**Features:**
- [ ] Overview all proposals across rooms
- [ ] View proposals per room
- [ ] Add new proposal item
- [ ] Edit proposal item
- [ ] Delete proposal item
- [ ] Filter by priority (wajib, penting, pendukung)
- [ ] Filter by category
- [ ] Filter by status (pending, approved, rejected)
- [ ] Update status (admin only)
- [ ] Statistics:
  - [ ] Total proposals per room
  - [ ] Total value per room
  - [ ] Global statistics
- [ ] Export proposals ke CSV
- [ ] Print proposals

---

## Phase 8: Laporan & Rekap (Week 8)

### 8.1 Laporan Bulanan (Monthly Reports)
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── laporan/
│           ├── page.tsx                    # Laporan page
│           └── components/
│               ├── laporan-filter.tsx      # Month/year filter
│               ├── laporan-table.tsx       # Laporan table
│               └── laporan-print.tsx       # Print template
```

**Features:**
- [ ] Select month & year
- [ ] Generate laporan dari:
  - [ ] Checklist entries (status rr, rb, ta)
  - [ ] Item kondisi (dari inventaris)
- [ ] Display table:
  - [ ] No.
  - [ ] Sarana & Prasarana
  - [ ] Ruangan
  - [ ] Masalah/Kerusakan
  - [ ] Penyebab
  - [ ] Tindakan
  - [ ] Evaluasi
  - [ ] Keterangan
- [ ] Sort by date
- [ ] Print laporan (PDF)
- [ ] Export laporan ke CSV

### 8.2 Rekap Inventaris (Inventory Recap)
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── rekap/
│           ├── page.tsx                    # Rekap page
│           └── components/
│               ├── rekap-summary.tsx       # Global summary
│               ├── rekap-table.tsx         # Detailed table
│               └── rekap-chart.tsx         # Charts (optional)
```

**Features:**
- [ ] Global statistics:
  - [ ] Total items
  - [ ] Total items per category
  - [ ] Total items per condition
  - [ ] Total rooms
- [ ] Detailed table:
  - [ ] Room name
  - [ ] Total items
  - [ ] Items baik
  - [ ] Items rr
  - [ ] Items rb
  - [ ] Items ta
- [ ] Filter by category
- [ ] Search room
- [ ] Export rekap ke CSV
- [ ] Print rekap

### 8.3 Riwayat Pindah (Movement History)
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── riwayat/
│           ├── page.tsx                    # Movement history
│           └── components/
│               ├── riwayat-table.tsx       # History table
│               └── riwayat-filter.tsx      # Filter options
```

**Features:**
- [ ] List all movement history
- [ ] Filter by date range
- [ ] Filter by room (dari/ke)
- [ ] Filter by category
- [ ] Search by item name
- [ ] Sort by date (newest first)
- [ ] Export history ke CSV
- [ ] Clear history (admin only, with confirmation)

---

## Phase 9: Admin - User Management (Week 9)

### 9.1 User Management
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── admin/
│           ├── page.tsx                    # User list
│           └── components/
│               ├── user-table.tsx          # User table
│               ├── user-form.tsx           # Add/edit user
│               └── user-stats.tsx          # User statistics
```

**Features:**
- [ ] List all users
- [ ] Add new user (admin only)
- [ ] Edit user (nama, jabatan, role, avatar)
- [ ] Reset password (admin only)
- [ ] Delete user (with confirmation, cannot delete self)
- [ ] Filter by role
- [ ] Search by username, nama
- [ ] View user details (last login, etc.)
- [ ] User statistics (total users, users per role)

---

## Phase 10: Additional Features (Week 10)

### 10.1 Global Search
**Files:**
```
apps/web/
├── components/
│   └── search/
│       ├── global-search.tsx               # Search modal
│       └── search-results.tsx              # Results display
```

**Features:**
- [ ] Command palette (Cmd/Ctrl + K)
- [ ] Search across:
  - [ ] Rooms
  - [ ] Items
  - [ ] SBBK documents
  - [ ] Pakta documents
  - [ ] Usulan
- [ ] Display results grouped by type
- [ ] Navigate to result on click
- [ ] Keyboard navigation

### 10.2 Dashboard Overview
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── page.tsx                        # Dashboard home
```

**Features:**
- [ ] Welcome message dengan user info
- [ ] Quick statistics cards:
  - [ ] Total rooms
  - [ ] Total items
  - [ ] Items with issues (rr/rb/ta)
  - [ ] Pending proposals
- [ ] Recent activity (last 10 logs)
- [ ] Quick actions (add room, add SBBK, etc.)
- [ ] Checklist completion chart

### 10.3 Audit Log Viewer
**Files:**
```
apps/web/
├── app/
│   └── (dashboard)/
│       └── logs/
│           ├── page.tsx                    # Log viewer (admin only)
│           └── components/
│               └── log-table.tsx           # Log table
```

**Features:**
- [ ] View all audit logs (admin only)
- [ ] Filter by date range
- [ ] Filter by user
- [ ] Filter by action type
- [ ] Search in details
- [ ] Export logs ke CSV

---

## Phase 11: Testing & Quality Assurance (Week 11)

### 11.1 Unit Tests
**Tasks:**
- [ ] Setup Vitest (test runner)
- [ ] Setup React Testing Library
- [ ] Write tests untuk:
  - [ ] Authentication flows
  - [ ] Form validations
  - [ ] API utilities
  - [ ] Data transformations
  - [ ] Role-based access

### 11.2 Integration Tests
**Tasks:**
- [ ] Test database operations
- [ ] Test RLS policies
- [ ] Test real-time subscriptions
- [ ] Test API endpoints

### 11.3 End-to-End Tests
**Tasks:**
- [ ] Setup Playwright
- [ ] Write E2E tests untuk:
  - [ ] Login/logout
  - [ ] Add room
  - [ ] Add item
  - [ ] Checklist operations
  - [ ] SBBK CRUD
  - [ ] Pakta CRUD
  - [ ] Real-time sync (multi-browser)

### 11.4 Manual Testing
**Tasks:**
- [ ] Test di Chrome, Firefox, Safari, Edge
- [ ] Test di mobile devices
- [ ] Test accessibility (WCAG 2.1 AA)
- [ ] Test performance (Lighthouse score > 90)
- [ ] Test error handling (network errors, validation errors)

---

## Phase 12: Deployment & Launch (Week 12)

### 12.1 Vercel Deployment
**Tasks:**
- [ ] Connect Git repository ke Vercel
- [ ] Configure environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Setup preview deployments (per PR)
- [ ] Deploy to production
- [ ] Configure custom domain (optional)
- [ ] Setup Vercel Analytics (optional)

### 12.2 Supabase Production Setup
**Tasks:**
- [ ] Enable database backups
- [ ] Configure database region
- [ ] Setup Supabase monitoring
- [ ] Configure email templates (auth)
- [ ] Test production environment

### 12.3 Documentation
**Tasks:**
- [ ] Write README.md dengan:
  - [ ] Project overview
  - [ ] Tech stack
  - [ ] Installation guide
  - [ ] Development guide
  - [ ] Deployment guide
- [ ] Write user documentation (Bahasa Indonesia)
- [ ] Write API documentation
- [ ] Create video tutorial (optional)

### 12.4 Data Migration (if needed)
**Tasks:**
- [ ] Create migration script dari Google Sheets (jika perlu)
- [ ] Test migration dengan sample data
- [ ] Run migration di production
- [ ] Verify data integrity

### 12.5 Launch Checklist
- [ ] All features tested & working
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Monitoring setup
- [ ] Backup strategy verified
- [ ] User training completed
- [ ] Support documentation ready

---

## Success Criteria

### Functional Requirements
- [ ] All 13 modules dari GAS version implemented
- [ ] Role-based access control working (admin, editor, viewer)
- [ ] Real-time sync across multiple browsers
- [ ] All CRUD operations working
- [ ] All export/print features working
- [ ] Audit logging working

### Non-Functional Requirements
- [ ] Page load time < 2 seconds
- [ ] Lighthouse score > 90 (performance, accessibility, best practices, SEO)
- [ ] Mobile responsive (works on phones & tablets)
- [ ] WCAG 2.1 AA compliant
- [ ] Secure (RLS policies, no data leaks)
- [ ] Reliable (99.9% uptime)

### Technical Requirements
- [ ] TypeScript strict mode enabled
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code coverage > 80%
- [ ] All tests passing
- [ ] Production-ready deployment

---

## Risk Mitigation

### Technical Risks
1. **Supabase free tier limits (500MB database)**
   - Mitigation: Monitor database size, optimize queries, archive old data
   - Backup plan: Upgrade ke paid tier ($25/month) jika perlu

2. **Real-time sync conflicts**
   - Mitigation: Use optimistic updates, handle conflicts gracefully
   - Backup plan: Fallback to polling jika realtime tidak stabil

3. **Browser compatibility issues**
   - Mitigation: Test di semua major browsers, use polyfills jika perlu
   - Backup plan: Document supported browsers, provide fallback UI

4. **Performance issues dengan large datasets**
   - Mitigation: Implement pagination, virtualization, lazy loading
   - Backup plan: Database indexing, query optimization

### Project Risks
1. **Scope creep**
   - Mitigation: Stick to plan, prioritize features, defer nice-to-haves
   - Backup plan: Phased rollout (MVP first, then add features)

2. **Timeline delays**
   - Mitigation: Weekly progress reviews, adjust scope jika perlu
   - Backup plan: Extend timeline atau reduce features

3. **Learning curve (Next.js, Supabase)**
   - Mitigation: Use documentation, tutorials, community support
   - Backup plan: Hire consultant jika stuck

---

## Conclusion

Plan ini mencakup migrasi lengkap dari Google Apps Script ke Next.js + Supabase dengan semua fitur yang ada. Timeline 12 minggu realistis dengan komitmen 20-30 jam per minggu. Hasil akhir adalah aplikasi modern, scalable, dan maintainable dengan real-time sync yang reliable.

**Next Steps:**
1. Review dan approve plan ini
2. Setup Supabase project
3. Initialize Next.js project
4. Mulai Phase 1 (Project Setup)
