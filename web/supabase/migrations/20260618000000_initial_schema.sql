-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA v4 — Initial Database Schema (FIXED)
--  Puskesmas Baruharjo, Trenggalek
--  Copy-paste seluruh file ini ke Supabase SQL Editor, lalu klik Run
-- ══════════════════════════════════════════════════════════════════════

-- Bersihkan table yang mungkin sudah terbuat dari attempt sebelumnya
DROP TABLE IF EXISTS public.log CASCADE;
DROP TABLE IF EXISTS public.usulan CASCADE;
DROP TABLE IF EXISTS public.util_state CASCADE;
DROP TABLE IF EXISTS public.util_meta CASCADE;
DROP TABLE IF EXISTS public.util_items CASCADE;
DROP TABLE IF EXISTS public.riwayat_pindah CASCADE;
DROP TABLE IF EXISTS public.penanggung_jawab CASCADE;
DROP TABLE IF EXISTS public.pakta CASCADE;
DROP TABLE IF EXISTS public.sbbk CASCADE;
DROP TABLE IF EXISTS public.checklist CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Bersihkan function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.user_role() CASCADE;
DROP FUNCTION IF EXISTS public.write_log() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_checklist() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_util_state() CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════════════════════════════════
--  1. PROFILES (extends Supabase Auth)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  jabatan TEXT,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) NOT NULL DEFAULT 'viewer',
  avatar TEXT DEFAULT '👤',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  2. ROOMS (Ruangan)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏥',
  color TEXT DEFAULT '#0e7c6b',
  bg TEXT DEFAULT '#d4f0eb',
  description TEXT,
  pj TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  3. ITEMS (Inventaris per ruangan)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.items (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('alkes', 'meubelair', 'elektronik', 'lainnya')) NOT NULL,
  name TEXT NOT NULL,
  merk TEXT,
  type TEXT,
  year INTEGER,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'unit',
  condition TEXT CHECK (condition IN ('baik', 'rr', 'rb', 'ta')) DEFAULT 'baik',
  notes TEXT,
  index_in_room INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  4. CHECKLIST (Ceklist harian kondisi barang)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.checklist (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  item_id BIGINT REFERENCES public.items(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('alkes', 'meubelair', 'elektronik', 'lainnya')) NOT NULL,
  item_index INTEGER NOT NULL,
  date_key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, category, item_index, date_key)
);

-- ══════════════════════════════════════════════════════════════════════
--  5. SBBK (Surat Bukti Barang Keluar)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.sbbk (
  id TEXT PRIMARY KEY,
  no TEXT NOT NULL,
  tgl DATE NOT NULL,
  kepada TEXT NOT NULL,
  jenis TEXT,
  anggaran TEXT,
  ket_umum TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  6. PAKTA (Pakta Integritas)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.pakta (
  id TEXT PRIMARY KEY,
  hari TEXT,
  tgl DATE,
  nama TEXT NOT NULL,
  nip TEXT,
  jabatan TEXT,
  alamat TEXT,
  aset_kendaraan JSONB DEFAULT '[]',
  aset_laptop JSONB DEFAULT '[]',
  aset_alat JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  7. PENANGGUNG JAWAB
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.penanggung_jawab (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  8. RIWAYAT PINDAH (Movement log)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.riwayat_pindah (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nama TEXT NOT NULL,
  kat TEXT CHECK (kat IN ('alkes', 'meubelair', 'elektronik', 'lainnya')),
  dari TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  ke TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  dari_name TEXT,
  ke_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  9. UTIL ITEMS (Ambulance, Genset, IPAL)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.util_items (
  id BIGSERIAL PRIMARY KEY,
  util_id TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  10. UTIL META (Metadata utilitas)
-- ══════════════════════════════════════════════════════════════════════
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

-- ══════════════════════════════════════════════════════════════════════
--  11. UTIL STATE (Status ceklist utilitas)
--  NOTE: Pakai UNIQUE INDEX bukan UNIQUE constraint karena COALESCE
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.util_state (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT CHECK (kind IN ('check', 'note')) NOT NULL,
  util_id TEXT NOT NULL,
  item_index TEXT,
  state_key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_util_state_unique
  ON public.util_state (util_id, kind, COALESCE(item_index, ''), state_key);

-- ══════════════════════════════════════════════════════════════════════
--  12. USULAN (Proposal pengadaan)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.usulan (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  13. LOG (Audit trail)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE public.log (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  INDEXES
-- ══════════════════════════════════════════════════════════════════════
CREATE INDEX idx_rooms_order ON public.rooms(order_index);
CREATE INDEX idx_items_room ON public.items(room_id);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_checklist_room ON public.checklist(room_id);
CREATE INDEX idx_checklist_date ON public.checklist(date_key);
CREATE INDEX idx_checklist_composite ON public.checklist(room_id, category, item_index, date_key);
CREATE INDEX idx_sbbk_tgl ON public.sbbk(tgl);
CREATE INDEX idx_pakta_tgl ON public.pakta(tgl);
CREATE INDEX idx_riwayat_ts ON public.riwayat_pindah(ts DESC);
CREATE INDEX idx_util_state_util ON public.util_state(util_id);
CREATE INDEX idx_usulan_room ON public.usulan(room_id);
CREATE INDEX idx_log_ts ON public.log(ts DESC);
CREATE INDEX idx_log_user ON public.log(user_id);

-- ══════════════════════════════════════════════════════════════════════
--  FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════

-- Helper: cek role user yang sedang login
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile saat user signup via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nama, jabatan, role, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'jabatan', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '👤')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Write audit log
CREATE OR REPLACE FUNCTION public.write_log(
  p_user_id UUID,
  p_action TEXT,
  p_detail TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.log (ts, user_id, action, detail)
  VALUES (NOW(), p_user_id, p_action, p_detail);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upsert checklist entry (incremental)
CREATE OR REPLACE FUNCTION public.upsert_checklist(
  p_room_id TEXT,
  p_item_id BIGINT,
  p_category TEXT,
  p_item_index INTEGER,
  p_date_key TEXT,
  p_payload JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.checklist (room_id, item_id, category, item_index, date_key, payload, updated_at)
  VALUES (p_room_id, p_item_id, p_category, p_item_index, p_date_key, p_payload, NOW())
  ON CONFLICT (room_id, category, item_index, date_key)
  DO UPDATE SET
    payload = p_payload,
    item_id = p_item_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upsert util state (incremental)
CREATE OR REPLACE FUNCTION public.upsert_util_state(
  p_util_id TEXT,
  p_kind TEXT,
  p_item_index TEXT,
  p_state_key TEXT,
  p_value TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.util_state (util_id, kind, item_index, state_key, value, updated_by, updated_at)
  VALUES (p_util_id, p_kind, p_item_index, p_state_key, p_value, p_user_id, NOW())
  ON CONFLICT (util_id, kind, COALESCE(item_index, ''), state_key)
  DO UPDATE SET
    value = p_value,
    updated_by = p_user_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════
--  TRIGGERS
-- ══════════════════════════════════════════════════════════════════════

-- Auto create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamps
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.checklist FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sbbk FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pakta FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.penanggung_jawab FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.util_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.util_meta FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.util_state FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.usulan FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════

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

-- Profiles: semua authenticated bisa baca
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Profiles: bisa update profile sendiri
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Profiles: bisa insert profile sendiri
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Profiles: admin bisa manage semua user
CREATE POLICY "profiles_admin_write" ON public.profiles
  FOR ALL TO authenticated USING (public.user_role() = 'admin');

-- Semua data table: authenticated bisa SELECT
CREATE POLICY "rooms_select" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "items_select" ON public.items FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklist_select" ON public.checklist FOR SELECT TO authenticated USING (true);
CREATE POLICY "sbbk_select" ON public.sbbk FOR SELECT TO authenticated USING (true);
CREATE POLICY "pakta_select" ON public.pakta FOR SELECT TO authenticated USING (true);
CREATE POLICY "pj_select" ON public.penanggung_jawab FOR SELECT TO authenticated USING (true);
CREATE POLICY "riwayat_select" ON public.riwayat_pindah FOR SELECT TO authenticated USING (true);
CREATE POLICY "util_items_select" ON public.util_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "util_meta_select" ON public.util_meta FOR SELECT TO authenticated USING (true);
CREATE POLICY "util_state_select" ON public.util_state FOR SELECT TO authenticated USING (true);
CREATE POLICY "usulan_select" ON public.usulan FOR SELECT TO authenticated USING (true);
CREATE POLICY "log_select" ON public.log FOR SELECT TO authenticated USING (true);

-- Admin & editor bisa INSERT/UPDATE/DELETE
CREATE POLICY "rooms_write" ON public.rooms FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "items_write" ON public.items FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "checklist_write" ON public.checklist FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "sbbk_write" ON public.sbbk FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "pakta_write" ON public.pakta FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "pj_write" ON public.penanggung_jawab FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "util_items_write" ON public.util_items FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "util_meta_write" ON public.util_meta FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "util_state_write" ON public.util_state FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "usulan_write" ON public.usulan FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));

-- Riwayat Pindah: editor+ bisa insert saja
CREATE POLICY "riwayat_insert" ON public.riwayat_pindah
  FOR INSERT TO authenticated WITH CHECK (public.user_role() IN ('admin', 'editor'));

-- Log: semua authenticated bisa insert
CREATE POLICY "log_insert" ON public.log
  FOR INSERT TO authenticated WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════
--  ENABLE REALTIME
-- ══════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'rooms','items','checklist','sbbk','pakta',
      'penanggung_jawab','riwayat_pindah','util_items',
      'util_meta','util_state','usulan','log'
    ])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN
      -- Table sudah ada di publication, skip
      NULL;
    END;
  END LOOP;
END $$;
