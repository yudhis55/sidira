-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA — Tambah kolom penerima pada tabel SBBK
--  Cara pakai: buka Supabase Dashboard → SQL Editor → tempel seluruh isi
--  file ini → klik Run. Aman dijalankan ulang (IF NOT EXISTS).
--  Kolom bersifat opsional (nullable) agar SBBK lama tetap valid.
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.sbbk ADD COLUMN IF NOT EXISTS penerima_nama TEXT;
ALTER TABLE public.sbbk ADD COLUMN IF NOT EXISTS penerima_nip TEXT;
