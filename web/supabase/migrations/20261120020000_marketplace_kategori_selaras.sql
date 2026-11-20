-- ══════════════════════════════════════════════════════════════════════
-- Migrasi: Selaraskan kategori katalog marketplace
-- ══════════════════════════════════════════════════════════════════════
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → SQL Editor → New Query.
--   2. Salin SELURUH isi file ini, paste, lalu klik Run.
--
-- EFEK:
--   Kategori katalog diselaraskan dengan kategori inventaris SIDIRA:
--     Alat Kesehatan, Meubelair, Elektronik, Lainnya
--   - 'Rumah Tangga' diganti nama menjadi 'Meubelair' (id tetap).
--   - Barang yang masih berkategori 'BMHP' dipindah ke 'Lainnya'.
--   - 'BMHP' dihapus dari daftar kategori.
--
-- IDEMPOTEN: aman dijalankan berulang.
-- ══════════════════════════════════════════════════════════════════════

-- Pastikan keempat kategori tujuan tersedia.
INSERT INTO public.kategori_barang (nama) VALUES
  ('Alat Kesehatan'),
  ('Meubelair'),
  ('Elektronik'),
  ('Lainnya')
ON CONFLICT (nama) DO NOTHING;

-- Pindahkan barang dari 'BMHP' ke 'Lainnya' sebelum BMHP dihapus.
UPDATE public.barang
   SET kategori_id = (SELECT id FROM public.kategori_barang WHERE nama = 'Lainnya')
 WHERE kategori_id = (SELECT id FROM public.kategori_barang WHERE nama = 'BMHP');

-- Barang tanpa kategori juga diarahkan ke 'Lainnya' agar tidak menggantung.
UPDATE public.barang
   SET kategori_id = (SELECT id FROM public.kategori_barang WHERE nama = 'Lainnya')
 WHERE kategori_id IS NULL;

-- 'Rumah Tangga' → 'Meubelair' (bila masih ada dan Meubelair belum dipakai).
DELETE FROM public.kategori_barang
 WHERE nama = 'Rumah Tangga'
   AND EXISTS (SELECT 1 FROM public.kategori_barang WHERE nama = 'Meubelair');

UPDATE public.kategori_barang SET nama = 'Meubelair' WHERE nama = 'Rumah Tangga';

-- Hapus kategori yang tidak lagi dipakai.
DELETE FROM public.kategori_barang WHERE nama = 'BMHP';

-- Verifikasi:
--   SELECT * FROM public.kategori_barang ORDER BY id;
--   SELECT kode, nama, kategori_id FROM public.barang ORDER BY kode;
