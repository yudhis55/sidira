-- ══════════════════════════════════════════════════════════════════════
-- Migrasi: MARKETPLACE — Katalog Barang + Pengajuan Barang Habis Pakai
-- ══════════════════════════════════════════════════════════════════════
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → SQL Editor → New Query.
--   2. Salin SELURUH isi file ini, paste, lalu klik Run.
--   3. Verifikasi: SELECT * FROM public.barang; (tabel baru harus ada)
--
-- MODEL AKSES (penting):
--   - Katalog (kategori_barang, barang): SELECT publik (anon) read-only.
--   - Pengajuan dari pemohon: TANPA LOGIN. Tulis hanya lewat fungsi
--     SECURITY DEFINER `submit_pengajuan` yang memvalidasi whitelist nama.
--   - Approve / tolak / serah terima / kelola stok: WAJIB login admin.
--   - Tabel pengajuan TIDAK punya policy INSERT/UPDATE/DELETE sama sekali,
--     sehingga tulis hanya mungkin lewat fungsi SECURITY DEFINER (atau
--     service role). Ini mencegah anon menulis langsung ke tabel.
--   - whitelist_pemohon: TIDAK bisa dibaca anon (data nama pribadi).
--
-- IDEMPOTEN: aman dijalankan ulang (IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
--  1. TABEL
-- ══════════════════════════════════════════════════════════════════════

-- 1.1 Kategori barang (katalog)
CREATE TABLE IF NOT EXISTS public.kategori_barang (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL UNIQUE,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Master barang (katalog yang bisa diminta ruangan)
CREATE TABLE IF NOT EXISTS public.barang (
  id BIGSERIAL PRIMARY KEY,
  kode TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  kategori_id BIGINT REFERENCES public.kategori_barang(id) ON DELETE SET NULL,
  satuan TEXT NOT NULL DEFAULT 'Pcs',
  foto TEXT,
  deskripsi TEXT,
  stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
  stok_minimum INTEGER NOT NULL DEFAULT 0 CHECK (stok_minimum >= 0),
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barang_kategori ON public.barang(kategori_id, aktif);
CREATE INDEX IF NOT EXISTS idx_barang_nama ON public.barang(lower(nama));

-- 1.3 Whitelist nama pemohon
--     Nama dicocokkan case-insensitive oleh submit_pengajuan().
CREATE TABLE IF NOT EXISTS public.whitelist_pemohon (
  id BIGSERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT true,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_whitelist_pemohon_nama
  ON public.whitelist_pemohon(lower(btrim(nama)));

-- 1.4 Pengajuan (header, bernomor)
CREATE TABLE IF NOT EXISTS public.pengajuan (
  id BIGSERIAL PRIMARY KEY,
  nomor TEXT NOT NULL UNIQUE,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
  -- Pemohon tanpa login: identitas dicatat dari nama lengkap + whitelist.
  nama_pemohon TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'diajukan'
    CHECK (status IN ('diajukan','disetujui','disetujui_sebagian','ditolak','diserahkan','dibatalkan')),
  catatan_pemohon TEXT,
  catatan_admin TEXT,
  diajukan_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  diputuskan_at TIMESTAMP WITH TIME ZONE,
  diputuskan_oleh UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  diserahkan_at TIMESTAMP WITH TIME ZONE,
  diterima_oleh TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_status_date ON public.pengajuan(status, diajukan_at DESC);
CREATE INDEX IF NOT EXISTS idx_pengajuan_room ON public.pengajuan(room_id);

-- 1.5 Item pengajuan (snapshot nama & satuan)
CREATE TABLE IF NOT EXISTS public.pengajuan_item (
  id BIGSERIAL PRIMARY KEY,
  pengajuan_id BIGINT NOT NULL REFERENCES public.pengajuan(id) ON DELETE CASCADE,
  barang_id BIGINT REFERENCES public.barang(id) ON DELETE SET NULL,
  nama_snapshot TEXT NOT NULL,
  satuan_snapshot TEXT NOT NULL,
  jumlah_diminta INTEGER NOT NULL CHECK (jumlah_diminta > 0),
  jumlah_disetujui INTEGER NOT NULL DEFAULT 0 CHECK (jumlah_disetujui >= 0)
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_item_header ON public.pengajuan_item(pengajuan_id);

-- 1.6 Mutasi stok (append-only ledger)
CREATE TABLE IF NOT EXISTS public.mutasi_stok (
  id BIGSERIAL PRIMARY KEY,
  barang_id BIGINT NOT NULL REFERENCES public.barang(id) ON DELETE RESTRICT,
  tipe TEXT NOT NULL CHECK (tipe IN ('saldo_awal','masuk','keluar','koreksi')),
  jumlah INTEGER NOT NULL,           -- keluar bernilai negatif
  stok_sebelum INTEGER NOT NULL,
  stok_sesudah INTEGER NOT NULL CHECK (stok_sesudah >= 0),
  referensi_pengajuan_id BIGINT REFERENCES public.pengajuan(id) ON DELETE SET NULL,
  keterangan TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mutasi_barang_date ON public.mutasi_stok(barang_id, created_at DESC);

-- 1.7 Log transisi status pengajuan
CREATE TABLE IF NOT EXISTS public.log_status_pengajuan (
  id BIGSERIAL PRIMARY KEY,
  pengajuan_id BIGINT NOT NULL REFERENCES public.pengajuan(id) ON DELETE CASCADE,
  status_lama TEXT,
  status_baru TEXT NOT NULL,
  catatan TEXT,
  user_nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_status_pengajuan ON public.log_status_pengajuan(pengajuan_id, created_at);

-- 1.8 Trigger updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.barang;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.barang
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ══════════════════════════════════════════════════════════════════════
--  2. FUNGSI BANTU
-- ══════════════════════════════════════════════════════════════════════

-- Nama aktor dari sesi login; 'admin' bila profil tidak ditemukan.
CREATE OR REPLACE FUNCTION public.marketplace_actor()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT coalesce((SELECT nama FROM public.profiles WHERE id = auth.uid()), 'admin');
$$;

-- Nomor pengajuan harian: PGJ-YYYYMMDD-NNN
CREATE OR REPLACE FUNCTION public.next_pengajuan_nomor()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today TEXT := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
  v_seq   INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sidira_pengajuan_nomor'));
  -- Pakai nilai tertinggi yang pernah dipakai hari itu, bukan count(*),
  -- supaya nomor tidak terulang setelah ada baris yang dihapus.
  SELECT coalesce(
           max(nullif(split_part(nomor, '-', 3), '')::INTEGER),
           0
         ) + 1
    INTO v_seq
    FROM public.pengajuan
   WHERE nomor LIKE 'PGJ-' || v_today || '-%';
  RETURN 'PGJ-' || v_today || '-' || lpad(v_seq::text, 3, '0');
END;
$$;

-- ══════════════════════════════════════════════════════════════════════
--  3. FUNGSI PUBLIK (tanpa login)
-- ══════════════════════════════════════════════════════════════════════

-- 3.1 Ajukan permintaan barang.
--     p_items: [{"barang_id": 1, "jumlah": 3}, ...]
CREATE OR REPLACE FUNCTION public.submit_pengajuan(
  p_room_id TEXT,
  p_nama_pemohon TEXT,
  p_catatan TEXT,
  p_items JSONB
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_nama   TEXT := btrim(coalesce(p_nama_pemohon, ''));
  v_barang public.barang%ROWTYPE;
  v_item   JSONB;
  v_jumlah INTEGER;
  v_id     BIGINT;
  v_nomor  TEXT;
BEGIN
  IF v_nama = '' THEN
    RAISE EXCEPTION 'Nama lengkap pemohon wajib diisi' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.whitelist_pemohon w
     WHERE w.aktif AND lower(btrim(w.nama)) = lower(v_nama)
  ) THEN
    RAISE EXCEPTION 'Nama "%" tidak terdaftar dalam whitelist pemohon', v_nama
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.rooms r WHERE r.id = p_room_id) THEN
    RAISE EXCEPTION 'Ruangan tidak ditemukan' USING ERRCODE = '22023';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Minimal satu barang harus diajukan' USING ERRCODE = '22023';
  END IF;

  v_nomor := public.next_pengajuan_nomor();

  INSERT INTO public.pengajuan (nomor, room_id, nama_pemohon, status, catatan_pemohon)
  VALUES (
    v_nomor,
    p_room_id,
    v_nama,
    'diajukan',
    nullif(btrim(coalesce(p_catatan, '')), '')
  )
  RETURNING id INTO v_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_jumlah := coalesce((v_item ->> 'jumlah')::INTEGER, 0);
    IF v_jumlah <= 0 THEN
      RAISE EXCEPTION 'Jumlah barang harus lebih dari 0' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO v_barang
      FROM public.barang
     WHERE id = (v_item ->> 'barang_id')::BIGINT AND aktif;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Barang tidak ditemukan atau tidak aktif' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.pengajuan_item (
      pengajuan_id, barang_id, nama_snapshot, satuan_snapshot,
      jumlah_diminta, jumlah_disetujui
    ) VALUES (
      v_id, v_barang.id, v_barang.nama, v_barang.satuan, v_jumlah, 0
    );
  END LOOP;

  INSERT INTO public.log_status_pengajuan (pengajuan_id, status_lama, status_baru, catatan, user_nama)
  VALUES (v_id, NULL, 'diajukan', 'Pengajuan dibuat', v_nama);

  RETURN jsonb_build_object('id', v_id, 'nomor', v_nomor);
END;
$$;

-- 3.2 Lacak pengajuan dengan nomor + nama pemohon (pengganti login pemohon).
CREATE OR REPLACE FUNCTION public.lacak_pengajuan(p_nomor TEXT, p_nama TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public
AS $$
DECLARE
  v_row  public.pengajuan%ROWTYPE;
  v_room RECORD;
  v_items JSONB;
BEGIN
  SELECT * INTO v_row
    FROM public.pengajuan
   WHERE upper(btrim(nomor)) = upper(btrim(p_nomor))
     AND lower(btrim(nama_pemohon)) = lower(btrim(coalesce(p_nama, '')));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan tidak ditemukan. Periksa nomor dan nama pemohon.'
      USING ERRCODE = '22023';
  END IF;

  SELECT name, icon INTO v_room FROM public.rooms WHERE id = v_row.room_id;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
            'nama', pi.nama_snapshot,
            'satuan', pi.satuan_snapshot,
            'jumlah_diminta', pi.jumlah_diminta,
            'jumlah_disetujui', pi.jumlah_disetujui
          ) ORDER BY pi.id), '[]'::jsonb)
    INTO v_items
    FROM public.pengajuan_item pi
   WHERE pi.pengajuan_id = v_row.id;

  RETURN jsonb_build_object(
    'nomor', v_row.nomor,
    'nama_pemohon', v_row.nama_pemohon,
    'room_id', v_row.room_id,
    'room_name', v_room.name,
    'room_icon', v_room.icon,
    'status', v_row.status,
    'catatan_pemohon', v_row.catatan_pemohon,
    'catatan_admin', v_row.catatan_admin,
    'diajukan_at', v_row.diajukan_at,
    'diputuskan_at', v_row.diputuskan_at,
    'diserahkan_at', v_row.diserahkan_at,
    'diterima_oleh', v_row.diterima_oleh,
    'items', v_items
  );
END;
$$;

-- 3.3 Batalkan pengajuan (pemohon, verifikasi nomor + nama).
CREATE OR REPLACE FUNCTION public.batal_pengajuan(p_nomor TEXT, p_nama TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.pengajuan%ROWTYPE;
BEGIN
  SELECT * INTO v_row
    FROM public.pengajuan
   WHERE upper(btrim(nomor)) = upper(btrim(p_nomor))
     AND lower(btrim(nama_pemohon)) = lower(btrim(coalesce(p_nama, '')))
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan tidak ditemukan' USING ERRCODE = '22023';
  END IF;
  IF v_row.status <> 'diajukan' THEN
    RAISE EXCEPTION 'Hanya pengajuan berstatus "diajukan" yang bisa dibatalkan'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.pengajuan SET status = 'dibatalkan' WHERE id = v_row.id;

  INSERT INTO public.log_status_pengajuan (pengajuan_id, status_lama, status_baru, catatan, user_nama)
  VALUES (v_row.id, v_row.status, 'dibatalkan', 'Dibatalkan oleh pemohon', v_row.nama_pemohon);

  RETURN jsonb_build_object('status', 'dibatalkan');
END;
$$;

-- ══════════════════════════════════════════════════════════════════════
--  4. FUNGSI ADMIN (wajib login, role admin)
-- ══════════════════════════════════════════════════════════════════════

-- 4.1 Putuskan pengajuan: setujui sebagian/seluruh atau tolak.
--     p_items: [{"item_id": 10, "jumlah_disetujui": 2}, ...]
--     Item yang tidak dikirim dianggap disetujui 0.
CREATE OR REPLACE FUNCTION public.approve_pengajuan(
  p_id BIGINT,
  p_items JSONB,
  p_catatan TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_status        TEXT;
  v_item          JSONB;
  v_pi            public.pengajuan_item%ROWTYPE;
  v_approved      INTEGER;
  v_stok          INTEGER;
  v_total_diminta INTEGER;
  v_total_setuju  INTEGER;
  v_new_status    TEXT;
  v_actor         TEXT := public.marketplace_actor();
BEGIN
  IF coalesce(public.user_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Hanya admin yang boleh memutuskan pengajuan' USING ERRCODE = '42501';
  END IF;

  SELECT status INTO v_status FROM public.pengajuan WHERE id = p_id FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan tidak ditemukan' USING ERRCODE = '22023';
  END IF;
  IF v_status <> 'diajukan' THEN
    RAISE EXCEPTION 'Hanya pengajuan berstatus "diajukan" yang bisa diputuskan'
      USING ERRCODE = '22023';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Daftar keputusan item tidak valid' USING ERRCODE = '22023';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_approved := coalesce((v_item ->> 'jumlah_disetujui')::INTEGER, 0);

    SELECT * INTO v_pi
      FROM public.pengajuan_item
     WHERE id = (v_item ->> 'item_id')::BIGINT AND pengajuan_id = p_id
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Item pengajuan tidak ditemukan' USING ERRCODE = '22023';
    END IF;
    IF v_approved < 0 OR v_approved > v_pi.jumlah_diminta THEN
      RAISE EXCEPTION 'Jumlah disetujui tidak valid untuk "%"', v_pi.nama_snapshot
        USING ERRCODE = '22023';
    END IF;

    IF v_approved > 0 THEN
      SELECT stok INTO v_stok FROM public.barang WHERE id = v_pi.barang_id FOR UPDATE;
      IF v_stok IS NULL THEN
        RAISE EXCEPTION 'Barang "%" tidak ditemukan', v_pi.nama_snapshot USING ERRCODE = '22023';
      END IF;
      IF v_stok < v_approved THEN
        RAISE EXCEPTION 'Stok "%" tidak mencukupi (tersedia %, diminta %)',
          v_pi.nama_snapshot, v_stok, v_approved USING ERRCODE = '22023';
      END IF;

      UPDATE public.barang SET stok = stok - v_approved WHERE id = v_pi.barang_id;

      INSERT INTO public.mutasi_stok (
        barang_id, tipe, jumlah, stok_sebelum, stok_sesudah,
        referensi_pengajuan_id, keterangan, user_id
      ) VALUES (
        v_pi.barang_id, 'keluar', -v_approved, v_stok, v_stok - v_approved,
        p_id, 'Persetujuan pengajuan', auth.uid()
      );
    END IF;

    UPDATE public.pengajuan_item SET jumlah_disetujui = v_approved WHERE id = v_pi.id;
  END LOOP;

  SELECT coalesce(sum(jumlah_diminta), 0), coalesce(sum(jumlah_disetujui), 0)
    INTO v_total_diminta, v_total_setuju
    FROM public.pengajuan_item
   WHERE pengajuan_id = p_id;

  v_new_status := CASE
    WHEN v_total_setuju = 0 THEN 'ditolak'
    WHEN v_total_setuju = v_total_diminta THEN 'disetujui'
    ELSE 'disetujui_sebagian'
  END;

  UPDATE public.pengajuan
     SET status = v_new_status,
         catatan_admin = nullif(btrim(coalesce(p_catatan, '')), ''),
         diputuskan_at = NOW(),
         diputuskan_oleh = auth.uid()
   WHERE id = p_id;

  INSERT INTO public.log_status_pengajuan (pengajuan_id, status_lama, status_baru, catatan, user_nama)
  VALUES (p_id, 'diajukan', v_new_status, nullif(btrim(coalesce(p_catatan, '')), ''), v_actor);

  RETURN jsonb_build_object('status', v_new_status);
END;
$$;

-- 4.2 Serah terima barang.
CREATE OR REPLACE FUNCTION public.serahkan_pengajuan(p_id BIGINT, p_diterima_oleh TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_actor  TEXT := public.marketplace_actor();
  v_penerima TEXT := btrim(coalesce(p_diterima_oleh, ''));
BEGIN
  IF coalesce(public.user_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Hanya admin yang boleh menyerahkan barang' USING ERRCODE = '42501';
  END IF;
  IF v_penerima = '' THEN
    RAISE EXCEPTION 'Nama penerima wajib diisi' USING ERRCODE = '22023';
  END IF;

  SELECT status INTO v_status FROM public.pengajuan WHERE id = p_id FOR UPDATE;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Pengajuan tidak ditemukan' USING ERRCODE = '22023';
  END IF;
  IF v_status NOT IN ('disetujui', 'disetujui_sebagian') THEN
    RAISE EXCEPTION 'Pengajuan belum disetujui' USING ERRCODE = '22023';
  END IF;

  UPDATE public.pengajuan
     SET status = 'diserahkan',
         diserahkan_at = NOW(),
         diterima_oleh = v_penerima
   WHERE id = p_id;

  INSERT INTO public.log_status_pengajuan (pengajuan_id, status_lama, status_baru, catatan, user_nama)
  VALUES (p_id, v_status, 'diserahkan', 'Diterima oleh ' || v_penerima, v_actor);

  RETURN jsonb_build_object('status', 'diserahkan');
END;
$$;

-- 4.3 Tambah stok masuk.
CREATE OR REPLACE FUNCTION public.tambah_stok(p_barang_id BIGINT, p_jumlah INTEGER, p_keterangan TEXT)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_stok INTEGER;
BEGIN
  IF coalesce(public.user_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Hanya admin yang boleh mengubah stok' USING ERRCODE = '42501';
  END IF;
  IF coalesce(p_jumlah, 0) <= 0 THEN
    RAISE EXCEPTION 'Jumlah stok masuk harus lebih dari 0' USING ERRCODE = '22023';
  END IF;

  SELECT stok INTO v_stok FROM public.barang WHERE id = p_barang_id FOR UPDATE;
  IF v_stok IS NULL THEN
    RAISE EXCEPTION 'Barang tidak ditemukan' USING ERRCODE = '22023';
  END IF;

  UPDATE public.barang SET stok = stok + p_jumlah WHERE id = p_barang_id;

  INSERT INTO public.mutasi_stok (
    barang_id, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, user_id
  ) VALUES (
    p_barang_id, 'masuk', p_jumlah, v_stok, v_stok + p_jumlah,
    coalesce(nullif(btrim(coalesce(p_keterangan, '')), ''), 'Barang masuk'), auth.uid()
  );

  RETURN v_stok + p_jumlah;
END;
$$;

-- 4.4 Koreksi stok (stock opname).
CREATE OR REPLACE FUNCTION public.koreksi_stok(p_barang_id BIGINT, p_stok_baru INTEGER, p_keterangan TEXT)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_stok   INTEGER;
  v_delta  INTEGER;
BEGIN
  IF coalesce(public.user_role(), '') <> 'admin' THEN
    RAISE EXCEPTION 'Hanya admin yang boleh mengoreksi stok' USING ERRCODE = '42501';
  END IF;
  IF p_stok_baru IS NULL OR p_stok_baru < 0 THEN
    RAISE EXCEPTION 'Stok baru tidak valid' USING ERRCODE = '22023';
  END IF;

  SELECT stok INTO v_stok FROM public.barang WHERE id = p_barang_id FOR UPDATE;
  IF v_stok IS NULL THEN
    RAISE EXCEPTION 'Barang tidak ditemukan' USING ERRCODE = '22023';
  END IF;

  v_delta := p_stok_baru - v_stok;
  IF v_delta = 0 THEN
    RETURN v_stok;
  END IF;

  UPDATE public.barang SET stok = p_stok_baru WHERE id = p_barang_id;

  INSERT INTO public.mutasi_stok (
    barang_id, tipe, jumlah, stok_sebelum, stok_sesudah, keterangan, user_id
  ) VALUES (
    p_barang_id, 'koreksi', v_delta, v_stok, p_stok_baru,
    coalesce(nullif(btrim(coalesce(p_keterangan, '')), ''), 'Koreksi stok'), auth.uid()
  );

  RETURN p_stok_baru;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════
--  5. HAK EKSEKUSI FUNGSI
-- ══════════════════════════════════════════════════════════════════════

-- Publik: ajukan, lacak, batalkan.
REVOKE ALL ON FUNCTION public.submit_pengajuan(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lacak_pengajuan(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.batal_pengajuan(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_pengajuan(TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lacak_pengajuan(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.batal_pengajuan(TEXT, TEXT) TO anon, authenticated;

-- Admin: hanya authenticated (fungsi tetap memeriksa role di dalam).
REVOKE ALL ON FUNCTION public.approve_pengajuan(BIGINT, JSONB, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.serahkan_pengajuan(BIGINT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tambah_stok(BIGINT, INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.koreksi_stok(BIGINT, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_pengajuan(BIGINT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.serahkan_pengajuan(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tambah_stok(BIGINT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.koreksi_stok(BIGINT, INTEGER, TEXT) TO authenticated;

-- ══════════════════════════════════════════════════════════════════════
--  6. RLS
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.kategori_barang      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barang               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist_pemohon    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_item       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutasi_stok          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_status_pengajuan ENABLE ROW LEVEL SECURITY;

-- 6.1 Katalog: publik boleh melihat, admin boleh mengelola.
DROP POLICY IF EXISTS kategori_barang_select_anon ON public.kategori_barang;
CREATE POLICY kategori_barang_select_anon ON public.kategori_barang
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS kategori_barang_select ON public.kategori_barang;
CREATE POLICY kategori_barang_select ON public.kategori_barang
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kategori_barang_write ON public.kategori_barang;
CREATE POLICY kategori_barang_write ON public.kategori_barang
  FOR ALL TO authenticated
  USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

DROP POLICY IF EXISTS barang_select_anon ON public.barang;
CREATE POLICY barang_select_anon ON public.barang
  FOR SELECT TO anon USING (aktif);

DROP POLICY IF EXISTS barang_select ON public.barang;
CREATE POLICY barang_select ON public.barang
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS barang_write ON public.barang;
CREATE POLICY barang_write ON public.barang
  FOR ALL TO authenticated
  USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- 6.2 Whitelist: hanya admin (tidak bisa dibaca anon).
DROP POLICY IF EXISTS whitelist_pemohon_select ON public.whitelist_pemohon;
CREATE POLICY whitelist_pemohon_select ON public.whitelist_pemohon
  FOR SELECT TO authenticated USING (public.user_role() = 'admin');

DROP POLICY IF EXISTS whitelist_pemohon_write ON public.whitelist_pemohon;
CREATE POLICY whitelist_pemohon_write ON public.whitelist_pemohon
  FOR ALL TO authenticated
  USING (public.user_role() = 'admin')
  WITH CHECK (public.user_role() = 'admin');

-- 6.3 Pengajuan: authenticated boleh baca; TIDAK ada policy tulis
--     (tulis hanya lewat fungsi SECURITY DEFINER di atas).
DROP POLICY IF EXISTS pengajuan_select ON public.pengajuan;
CREATE POLICY pengajuan_select ON public.pengajuan
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS pengajuan_item_select ON public.pengajuan_item;
CREATE POLICY pengajuan_item_select ON public.pengajuan_item
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS mutasi_stok_select ON public.mutasi_stok;
CREATE POLICY mutasi_stok_select ON public.mutasi_stok
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS log_status_pengajuan_select ON public.log_status_pengajuan;
CREATE POLICY log_status_pengajuan_select ON public.log_status_pengajuan
  FOR SELECT TO authenticated USING (true);

-- ══════════════════════════════════════════════════════════════════════
--  7. SEED KATEGORI DASAR
-- ══════════════════════════════════════════════════════════════════════
INSERT INTO public.kategori_barang (nama, keterangan) VALUES
  ('Alat Kesehatan', 'Alat kesehatan dan bahan medis'),
  ('Meubelair', 'Perabot dan perlengkapan ruangan'),
  ('Elektronik', 'Perangkat dan aksesoris elektronik'),
  ('Lainnya', 'Kategori lain')
ON CONFLICT (nama) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
--  SELESAI. Langkah verifikasi manual:
--    SELECT count(*) FROM public.kategori_barang;         -- 5
--    SELECT proname FROM pg_proc WHERE proname LIKE '%pengajuan%';
--    SELECT tablename, policyname FROM pg_policies
--     WHERE tablename IN ('barang','pengajuan','whitelist_pemohon');
-- ══════════════════════════════════════════════════════════════════════
