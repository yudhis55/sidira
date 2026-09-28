-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA — Rekap Pemegang Inventaris (backend yang selama ini hilang)
--  Tabel `pemegang_inventaris` + `aset_pemegang` yang dirujuk
--  web/lib/auth/rekap.ts namun belum pernah dibuat.
--
--  Cara pakai: paste seluruh file ke Supabase Dashboard → SQL Editor → Run.
-- ══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.pemegang_inventaris (
  id TEXT PRIMARY KEY DEFAULT ('pemegang-' || substr(gen_random_uuid()::text, 1, 8)),
  nama TEXT NOT NULL,
  nip TEXT,
  jabatan TEXT,
  status TEXT CHECK (status IN ('PNS', 'PPPK')) NOT NULL DEFAULT 'PNS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aset_pemegang (
  id BIGSERIAL PRIMARY KEY,
  pemegang_id TEXT NOT NULL REFERENCES public.pemegang_inventaris(id) ON DELETE CASCADE,
  jenis TEXT CHECK (jenis IN ('kendaraan', 'laptop', 'alat', 'rumah')) NOT NULL,
  merk TEXT,
  type TEXT,
  tahun TEXT,
  nopol TEXT,
  harga TEXT,
  ket TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aset_pemegang_pemegang ON public.aset_pemegang(pemegang_id);
CREATE INDEX IF NOT EXISTS idx_aset_pemegang_jenis ON public.aset_pemegang(jenis);

DROP TRIGGER IF EXISTS set_updated_at ON public.pemegang_inventaris;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pemegang_inventaris FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.aset_pemegang;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.aset_pemegang FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.pemegang_inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aset_pemegang ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pemegang_select" ON public.pemegang_inventaris;
CREATE POLICY "pemegang_select" ON public.pemegang_inventaris
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pemegang_write" ON public.pemegang_inventaris;
CREATE POLICY "pemegang_write" ON public.pemegang_inventaris
  FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));

DROP POLICY IF EXISTS "aset_select" ON public.aset_pemegang;
CREATE POLICY "aset_select" ON public.aset_pemegang
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "aset_write" ON public.aset_pemegang;
CREATE POLICY "aset_write" ON public.aset_pemegang
  FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
