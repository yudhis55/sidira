-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA — Rekap Pemegang Inventaris module
--  Tables: pemegang_inventaris (holder) + aset_pemegang (assets held)
--  Follows the patterns from migration 20260618000000_initial_schema.sql:
--    - handle_updated_at() trigger for auto-updating updated_at
--    - RLS enabled, SELECT for authenticated, write for admin+editor
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
--  1. PEMEGANG_INVENTARIS (holder / person responsible for assets)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.pemegang_inventaris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nip TEXT,
  jabatan TEXT,
  status TEXT CHECK (status IN ('PNS','PPPK')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════
--  2. ASET_PEMEGANG (assets held by a pemegang)
-- ══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.aset_pemegang (
  id BIGSERIAL PRIMARY KEY,
  pemegang_id UUID NOT NULL REFERENCES public.pemegang_inventaris(id) ON DELETE CASCADE,
  jenis TEXT CHECK (jenis IN ('kendaraan','laptop','alat','rumah')) NOT NULL,
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

-- ══════════════════════════════════════════════════════════════════════
--  3. TRIGGERS — auto update updated_at (handle_updated_at() exists
--     from migration 20260618000000_initial_schema.sql)
-- ══════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS set_updated_at ON public.pemegang_inventaris;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pemegang_inventaris
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.aset_pemegang;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.aset_pemegang
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════════════
--  4. ROW LEVEL SECURITY
--     Same pattern as other tables: authenticated can SELECT,
--     admin+editor can INSERT/UPDATE/DELETE (FOR ALL).
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.pemegang_inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aset_pemegang ENABLE ROW LEVEL SECURITY;

-- SELECT: semua authenticated bisa baca
CREATE POLICY "pemegang_inventaris_select" ON public.pemegang_inventaris
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "aset_pemegang_select" ON public.aset_pemegang
  FOR SELECT TO authenticated USING (true);

-- INSERT/UPDATE/DELETE: admin & editor
CREATE POLICY "pemegang_inventaris_write" ON public.pemegang_inventaris
  FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));
CREATE POLICY "aset_pemegang_write" ON public.aset_pemegang
  FOR ALL TO authenticated USING (public.user_role() IN ('admin', 'editor'));

-- ══════════════════════════════════════════════════════════════════════
--  5. REALTIME
-- ══════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.pemegang_inventaris';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.aset_pemegang';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
