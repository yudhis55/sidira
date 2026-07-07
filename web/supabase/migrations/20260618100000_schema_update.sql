-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA v4 — Schema Update (Migration #2)
--  Berdasarkan analisis data real spreadsheet Puskesmas Baruharjo
--  ~45 ruangan, ~680 items
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
--  1. ITEMS — Tambah 5 kolom baru
-- ══════════════════════════════════════════════════════════════════════

-- Bahan material (Kayu, Besi, Campuran, Plastik, Logam, Kaca, dll)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS bahan TEXT;

-- Nomor seri pabrik (sebagian besar kosong)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS no_seri TEXT;

-- Kode barang resmi (format: X.X.X.XX.XX.XX.XXX)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS kode_barang TEXT;

-- Harga beli/perolehan per unit (dalam Rupiah, banyak yang kosong)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS harga INTEGER;

-- Kategori sub-section dari spreadsheet (MEDIS, NON MEDIS, SET FARMASI, dll)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS kategori TEXT;

-- Index untuk pencarian
CREATE INDEX IF NOT EXISTS idx_items_kode_barang ON public.items(kode_barang);
CREATE INDEX IF NOT EXISTS idx_items_kategori ON public.items(kategori);

-- ══════════════════════════════════════════════════════════════════════
--  2. ITEMS — Fix condition values
--     Lama: ('baik', 'rr', 'rb', 'ta')
--     Baru: ('baik', 'kb', 'rb')
--     Data real spreadsheet: B=Baik, KB=Kurang Baik, RB=Rusak Berat
-- ══════════════════════════════════════════════════════════════════════

-- Drop constraint lama
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_condition_check;

-- Tambah constraint baru
ALTER TABLE public.items ADD CONSTRAINT items_condition_check
  CHECK (condition IN ('baik', 'kb', 'rb'));

-- Update data existing jika ada
UPDATE public.items SET condition = 'kb' WHERE condition = 'rr';
DELETE FROM public.items WHERE condition = 'ta';

-- ══════════════════════════════════════════════════════════════════════
--  3. ROOMS — Tambah kolom pj_nip
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS pj_nip TEXT;

-- ══════════════════════════════════════════════════════════════════════
--  4. PENANGGUNG JAWAB — Tambah kolom nip dan jabatan
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.penanggung_jawab ADD COLUMN IF NOT EXISTS nip TEXT;
ALTER TABLE public.penanggung_jawab ADD COLUMN IF NOT EXISTS jabatan TEXT;

-- ══════════════════════════════════════════════════════════════════════
--  5. CHECKLIST — Fix unique constraint
--     Lama: UNIQUE(room_id, category, item_index, date_key)
--     Baru: UNIQUE(item_id, date_key) — 1 entry per item per tanggal
-- ══════════════════════════════════════════════════════════════════════

-- Drop constraint lama (name bisa berbeda tergantung PostgreSQL version)
ALTER TABLE public.checklist DROP CONSTRAINT IF EXISTS checklist_room_id_category_item_index_date_key_key;
ALTER TABLE public.checklist DROP CONSTRAINT IF EXISTS checklist_room_id_category_item_i_date_key_key;

-- Coba drop dengan pattern lain
DO $$
DECLARE
  con RECORD;
BEGIN
  FOR con IN
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'checklist'
    AND constraint_type = 'UNIQUE'
  LOOP
    EXECUTE 'ALTER TABLE public.checklist DROP CONSTRAINT IF EXISTS ' || quote_ident(con.constraint_name);
  END LOOP;
END $$;

-- Tambah constraint baru
ALTER TABLE public.checklist ADD CONSTRAINT checklist_item_date_unique
  UNIQUE(item_id, date_key);

-- Update function upsert_checklist agar match constraint baru
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
  ON CONFLICT (item_id, date_key)
  DO UPDATE SET
    payload = p_payload,
    room_id = p_room_id,
    category = p_category,
    item_index = p_item_index,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update index
DROP INDEX IF EXISTS idx_checklist_composite;
CREATE INDEX idx_checklist_item_date ON public.checklist(item_id, date_key);

-- ══════════════════════════════════════════════════════════════════════
--  6. CHECKLIST — Fix category constraint juga
--     Sama seperti items, condition values di spreadsheet beda
-- ══════════════════════════════════════════════════════════════════════

-- Category checklist masih pakai alkes/meubelair/elektronik/lainnya (UI grouping)
-- Ini OK, tidak perlu diubah karena ini untuk grouping di UI

-- ══════════════════════════════════════════════════════════════════════
--  VERIFICATION — Query untuk cek hasil migration
-- ══════════════════════════════════════════════════════════════════════

-- Uncomment untuk verifikasi:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'items' ORDER BY ordinal_position;

-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'rooms' ORDER BY ordinal_position;

-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'penanggung_jawab' ORDER BY ordinal_position;
