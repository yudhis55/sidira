-- ============================================================
-- Opsi A: ganti seed demo pemegang_inventaris + aset_pemegang
-- dengan data riil yang diturunkan dari tabel `pakta` (32 nama
-- hasil migrasi GAS). Pemegang = satu baris per nama pakta;
-- aset pemegang ditarik dari lampiran JSONB aset_kendaraan /
-- aset_laptop milik pakta.
--
-- SUDAH DIAPPLY ke project Supabase via MCP (tidak perlu
-- dijalankan lagi di SQL Editor — file ini arsip saja).
--
-- Catatan: pencocokan rekap<->pakta masih via nama; pindah ke
-- pegawai_id/FK adalah Opsi B bila diperlukan.
-- ============================================================

-- 1) Bersihkan data demo (6 pemegang fiktif + 8 aset demo)
DELETE FROM aset_pemegang;
DELETE FROM pemegang_inventaris;

-- 2) Pemegang riil: satu baris per nama pakta (id deterministik)
INSERT INTO pemegang_inventaris (id, nama, nip, jabatan, status)
SELECT DISTINCT ON (LOWER(TRIM(p.nama)))
  'pemegang-' || substr(md5(LOWER(TRIM(p.nama))), 1, 8) AS id,
  TRIM(p.nama)                                          AS nama,
  NULLIF(TRIM(p.nip), '')                               AS nip,
  NULLIF(TRIM(p.jabatan), '')                           AS jabatan,
  'PNS'                                                 AS status
FROM pakta p;

-- 3) Aset kendaraan dari lampiran pakta
INSERT INTO aset_pemegang (pemegang_id, jenis, merk, type, tahun, nopol, harga, ket)
SELECT
  'pemegang-' || substr(md5(LOWER(TRIM(p.nama))), 1, 8),
  'kendaraan',
  NULLIF(TRIM(k->>'merk'), ''),
  NULL,
  NULLIF(TRIM(k->>'tahun'), ''),
  NULLIF(TRIM(k->>'nopol'), ''),
  NULLIF(TRIM(k->>'harga'), ''),
  NULLIF(TRIM(k->>'ket'), '')
FROM pakta p,
     jsonb_array_elements(p.aset_kendaraan) AS k
WHERE jsonb_typeof(p.aset_kendaraan) = 'array';

-- 4) Aset laptop dari lampiran pakta
INSERT INTO aset_pemegang (pemegang_id, jenis, merk, type, tahun, nopol, harga, ket)
SELECT
  'pemegang-' || substr(md5(LOWER(TRIM(p.nama))), 1, 8),
  'laptop',
  NULLIF(TRIM(k->>'merk'), ''),
  NULLIF(TRIM(k->>'type'), ''),
  NULLIF(TRIM(k->>'tahun'), ''),
  NULL,
  NULLIF(TRIM(k->>'harga'), ''),
  NULLIF(TRIM(k->>'ket'), '')
FROM pakta p,
     jsonb_array_elements(p.aset_laptop) AS k
WHERE jsonb_typeof(p.aset_laptop) = 'array';
