-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA — Seed default utilitas (4 utilities from GAS legacy app)
--  Source: gas-legacy/index.html lines 18851-18940 (UTILITAS_DATA)
--  Tables: util_meta (util_id, label, icon, warna, bg, custom, order_no)
--          util_items (util_id, items JSONB array of {nama,ket})
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
--  1. UTIL_META — 4 default utilities
-- ══════════════════════════════════════════════════════════════════════
INSERT INTO public.util_meta (util_id, label, icon, warna, bg, custom, order_no) VALUES
  ('amb_apv',    'Ambulance APV',   '🚑', '#b91c1c', 'linear-gradient(135deg,#7f1d1d,#b91c1c)', false, 1),
  ('amb_kijang', 'Ambulance Kijang','🚑', '#c2410c', 'linear-gradient(135deg,#7c2d12,#c2410c)', false, 2),
  ('genset',     'Genset',          '⚡', '#b45309', 'linear-gradient(135deg,#78350f,#b45309)', false, 3),
  ('ipal',       'IPAL',            '💧', '#1d4ed8', 'linear-gradient(135deg,#1e3a8a,#1d4ed8)', false, 4)
ON CONFLICT (util_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
--  2. UTIL_ITEMS — checklist items per utility (transcribed exactly from GAS)
-- ══════════════════════════════════════════════════════════════════════

-- Ambulance APV
INSERT INTO public.util_items (util_id, items) VALUES
  ('amb_apv', '[
    {"nama":"Pemanasan mesin","ket":"Harian"},
    {"nama":"Cek Accu","ket":"Bulanan"},
    {"nama":"Cek Oli","ket":"Bulanan"},
    {"nama":"Ganti Oli","ket":"Setiap 5000 KM"},
    {"nama":"Cek Sirine","ket":"Bulanan"},
    {"nama":"Cek Air Radiator","ket":"Bulanan"},
    {"nama":"Cek Minyak Rem","ket":"Bulanan"},
    {"nama":"Cek Lampu","ket":"Bulanan"},
    {"nama":"Cek AC","ket":"Bulanan"},
    {"nama":"Cek Wiper Kaca","ket":"Bulanan"},
    {"nama":"Cek Oksigen","ket":"Harian"},
    {"nama":"Cek Dragbar","ket":"Mingguan"},
    {"nama":"Cek Kondisi dan Angin Ban","ket":"Mingguan"},
    {"nama":"Servis Kendaraan","ket":"Min. 1 Tahun 1x"},
    {"nama":"Mencuci Kendaraan","ket":"Mingguan"}
  ]'::jsonb)
ON CONFLICT (util_id) DO NOTHING;

-- Ambulance Kijang
INSERT INTO public.util_items (util_id, items) VALUES
  ('amb_kijang', '[
    {"nama":"Pemanasan mesin","ket":"Harian"},
    {"nama":"Cek Accu","ket":"Bulanan"},
    {"nama":"Cek Oli","ket":"Bulanan"},
    {"nama":"Ganti Oli","ket":"Setiap 5000 KM"},
    {"nama":"Cek Sirine","ket":"Bulanan"},
    {"nama":"Cek Air Radiator","ket":"Bulanan"},
    {"nama":"Cek Minyak Rem","ket":"Bulanan"},
    {"nama":"Cek Lampu","ket":"Bulanan"},
    {"nama":"Cek Wiper Kaca","ket":"Bulanan"},
    {"nama":"Cek Oksigen","ket":"Harian"},
    {"nama":"Cek Dragbar","ket":"Mingguan"},
    {"nama":"Cek Kondisi dan Angin Ban","ket":"Mingguan"},
    {"nama":"Servis Kendaraan","ket":"Min. 1 Tahun 1x"},
    {"nama":"Mencuci Kendaraan","ket":"Mingguan"}
  ]'::jsonb)
ON CONFLICT (util_id) DO NOTHING;

-- Genset
INSERT INTO public.util_items (util_id, items) VALUES
  ('genset', '[
    {"nama":"Pemanasan mesin Genset","ket":"Harian"},
    {"nama":"Cek BBM / Solar","ket":"Harian"},
    {"nama":"Cek Accu","ket":"Bulanan"},
    {"nama":"Cek Oli","ket":"Bulanan"},
    {"nama":"Ganti Oli","ket":"Min. 1 Tahun"},
    {"nama":"Ganti Filter","ket":"Min. 1 Tahun"},
    {"nama":"Cek Air Radiator","ket":"Bulanan"},
    {"nama":"Cek Instalasi","ket":"Bulanan"},
    {"nama":"Cek Bok Panel","ket":"Bulanan"},
    {"nama":"Membersihkan Genset","ket":"Mingguan"}
  ]'::jsonb)
ON CONFLICT (util_id) DO NOTHING;

-- IPAL
INSERT INTO public.util_items (util_id, items) VALUES
  ('ipal', '[
    {"nama":"Cek Bok Panel","ket":"Mingguan"},
    {"nama":"Cek Instalasi Listrik","ket":"Mingguan"},
    {"nama":"Cek Pompa Air Inlet","ket":"Bulanan"},
    {"nama":"Cek Pompa Air Sirkulasi","ket":"Bulanan"},
    {"nama":"Cek Pompa Air Transfer","ket":"Bulanan"},
    {"nama":"Cek Pompa Air Filter","ket":"Bulanan"},
    {"nama":"Cek Instalasi Pipa Air Limbah","ket":"Bulanan"},
    {"nama":"Cek Tabung Reaktor","ket":"Bulanan"},
    {"nama":"Cek Lampu Catalist Destructor","ket":"Bulanan"},
    {"nama":"Cek Tabung Filter","ket":"Bulanan"}
  ]'::jsonb)
ON CONFLICT (util_id) DO NOTHING;
