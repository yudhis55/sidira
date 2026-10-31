-- ============================================================
-- Opsi B: master pegawai + FK dari pemegang_inventaris & pakta.
-- Hubungan antar modul kini berbasis ID (bukan teks nama),
-- sehingga tahan perubahan nama, gelar, atau salah ketik.
--
-- SUDAH DIAPPLY ke project Supabase (jangan dijalankan ulang;
-- file ini arsip). Dijalankan dalam dua tahap karena data lama
-- memiliki 2 nama berbeda dengan NIP yang sama (salah ketik
-- sumber GAS): Dyah Suntari & Arintha Bharata Wijaya.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pegawai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nip text UNIQUE,
  jabatan text,
  status text NOT NULL DEFAULT 'PNS'
    CHECK (status = ANY (ARRAY['PNS'::text, 'PPPK'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;

CREATE POLICY pegawai_select ON public.pegawai
  FOR SELECT TO authenticated USING (true);
CREATE POLICY pegawai_insert ON public.pegawai
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY pegawai_update ON public.pegawai
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY pegawai_delete ON public.pegawai
  FOR DELETE TO authenticated USING (true);

-- FK (nullable: baris lama tanpa link tetap valid)
ALTER TABLE public.pemegang_inventaris
  ADD COLUMN pegawai_id uuid REFERENCES public.pegawai(id) ON DELETE SET NULL;
ALTER TABLE public.pakta
  ADD COLUMN pegawai_id uuid REFERENCES public.pegawai(id) ON DELETE SET NULL;

-- Backfill master pegawai dari pemegang_inventaris (1 baris per nama).
-- ON CONFLICT nip: nama ganda dengan NIP sama diabaikan dulu.
INSERT INTO public.pegawai (nama, nip, jabatan, status)
SELECT DISTINCT ON (LOWER(TRIM(pi.nama)))
       pi.nama, pi.nip, pi.jabatan, pi.status
FROM public.pemegang_inventaris pi
ORDER BY LOWER(TRIM(pi.nama)), pi.created_at
ON CONFLICT (nip) DO NOTHING;

-- Link pemegang & pakta ke master (by nama ternormalisasi)
UPDATE public.pemegang_inventaris pi
SET pegawai_id = g.id
FROM public.pegawai g
WHERE LOWER(TRIM(g.nama)) = LOWER(TRIM(pi.nama))
  AND pi.pegawai_id IS NULL;

UPDATE public.pakta k
SET pegawai_id = g.id
FROM public.pegawai g
WHERE LOWER(TRIM(g.nama)) = LOWER(TRIM(k.nama))
  AND k.pegawai_id IS NULL;

-- Sisa konflik NIP: Dyah Suntari belum punya baris master (NIP-nya
-- bentrok dengan Arintha Bharata Wijaya). Dibuat tanpa NIP agar bisa
-- dikoreksi manual lewat admin.
INSERT INTO public.pegawai (nama, nip, jabatan, status)
SELECT pi.nama, NULL, pi.jabatan, pi.status
FROM public.pemegang_inventaris pi
WHERE LOWER(TRIM(pi.nama)) = 'dyah suntari, amd. keb'
LIMIT 1;

UPDATE public.pemegang_inventaris pi
SET pegawai_id = g.id
FROM public.pegawai g
WHERE LOWER(TRIM(g.nama)) = 'dyah suntari, amd. keb'
  AND LOWER(TRIM(pi.nama)) = 'dyah suntari, amd. keb'
  AND pi.pegawai_id IS NULL;

UPDATE public.pakta k
SET pegawai_id = g.id
FROM public.pegawai g
WHERE LOWER(TRIM(g.nama)) = 'dyah suntari, amd. keb'
  AND LOWER(TRIM(k.nama)) = 'dyah suntari, amd. keb'
  AND k.pegawai_id IS NULL;

CREATE INDEX pemegang_inventaris_pegawai_idx ON public.pemegang_inventaris(pegawai_id);
CREATE INDEX pakta_pegawai_idx ON public.pakta(pegawai_id);
CREATE INDEX pegawai_nama_norm_idx ON public.pegawai (LOWER(TRIM(nama)));
