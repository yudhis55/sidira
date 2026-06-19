/**
 * Seed Data Migration Script
 * Dari Spreadsheet Puskesmas Baruharjo ke Supabase
 * ~45 ruangan, ~680 items
 *
 * CARA JALANKAN:
 * 1. Buka Supabase SQL Editor
 * 2. Copy-paste seluruh isi file ini
 * 3. Klik "Run"
 *
 * ATAU dari CLI:
 * npx supabase db execute --file supabase/migrations/20260618200000_seed_data.sql
 */

-- ══════════════════════════════════════════════════════════════════════
--  SEED ROOMS (~45 ruangan)
--  Data dari spreadsheet header: RUANGAN field
-- ══════════════════════════════════════════════════════════════════════

INSERT INTO public.rooms (id, name, icon, color, bg, pj, pj_nip, order_index) VALUES
-- Gudang & Logistik
('gudang-bmhp', 'Gudang BMHP', '📦', '#0e7c6b', '#d4f0eb', 'Vinda Dian Saputra S.Farm', '19850520 200903 1 007', 1),
('gudang-obat', 'Gudang Obat', '💊', '#0e7c6b', '#d4f0eb', 'Destya Wieke E.', '199112292019032001', 2),

-- Pelayanan Medis
('poli-tb', 'Poli TB', '🫁', '#0e7c6b', '#d4f0eb', 'Friza Anindya W. W.', NULL, 10),
('imunisasi', 'R. Vaksin / Imunisasi', '💉', '#0e7c6b', '#d4f0eb', 'Susi Rahayu', '19780115 201001 2 008', 11),
('bp', 'Pelayanan Umum (BP)', '🩺', '#0e7c6b', '#d4f0eb', 'Ns. Indah Purwanti, S.Kep', '19751008 200003 2 005', 12),
('gigi', 'Pelayanan Gigi & Mulut', '🦷', '#0e7c6b', '#d4f0eb', 'drg. Desta Ria Vanika', '19941231 202203 2 006', 13),
('mtbs', 'Pelayanan MTBS', '👶', '#0e7c6b', '#d4f0eb', 'Sri Utari', '19820925 201704 2 004', 14),
('kb', 'Ruang Pelayanan KB', '🤰', '#0e7c6b', '#d4f0eb', 'Wartini, SST', '19710115 199203 2 0001', 15),
('kia', 'Pelayanan KIA', '👶', '#0e7c6b', '#d4f0eb', 'Sribudi Artini, SST', '19720701 199203 2 006', 16),
('poked', 'Ruang PONED', '🚑', '#0e7c6b', '#d4f0eb', 'Wartini, SST', '19710115 199203 2 0001', 17),
('neonatus', 'Ruang Neonatus', '👶', '#0e7c6b', '#d4f0eb', 'Wartini, SST', '19710115 199203 2 0001', 18),

-- Farmasi
('apotik', 'Pelayanan Farmasi', '💊', '#0e7c6b', '#d4f0eb', 'Dina Maretnawati', '19830301 201001 2 024', 20),
('apotik-lt2', 'Apotek Rawat Inap', '💊', '#0e7c6b', '#d4f0eb', 'Destya Wieke E.', '199112292019032001', 21),

-- Penunjang Medis
('laboratorium', 'Laboratorium', '🔬', '#0e7c6b', '#d4f0eb', 'Vinda Dian Saputra', '19850520 200903 1 007', 30),
('radiologi', 'Radiologi', '☢️', '#0e7c6b', '#d4f0eb', 'Vinda Dian Saputra', '19850520 200903 1 007', 31),
('sterilisasi', 'Sterilisasi', '🧪', '#0e7c6b', '#d4f0eb', 'Ns. Indah Purwanti, S.Kep', '19751008 200003 2 005', 32),
('gas-medik', 'Ruang Gas Medik', '⚗️', '#0e7c6b', '#d4f0eb', 'Septian Hadi Santosa', NULL, 33),

-- Gawat Darurat
('ugd', 'Unit Gawat Darurat', '🚑', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 40),

-- Rawat Inap
('nakula', 'Ruang Nakula', '🛏️', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 50),
('sadewa', 'Ruang Sadewa', '🛏️', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 51),
('bima', 'Ruang Bima', '🛏️', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 52),
('arjuna', 'Ruang Arjuna', '🛏️', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 53),
('srikandi', 'Ruang Srikandi', '🛏️', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 54),
('melati', 'Melati', '🌸', '#0e7c6b', '#d4f0eb', 'Adi Mulyono, S.Kep, Ns', '19710506 199102 1 001', 55),

-- Administrasi & Umum
('loket', 'Pendaftaran & Rekam Medis', '📋', '#0e7c6b', '#d4f0eb', 'Muhamad Syarifuddin', '19950504 202012 1 006', 60),
('kasir', 'Kasir', '💰', '#0e7c6b', '#d4f0eb', 'Suseno', '19680410 200701 1 033', 61),
('kasir-lt2', 'Kasir Lantai 2', '💰', '#0e7c6b', '#d4f0eb', 'Karyasri', '19711108 200701 2 008', 62),
('rekam-medis-lt2', 'Rekam Medis Lantai 2', '📁', '#0e7c6b', '#d4f0eb', 'Azizah Putri Andini', '19970321 202203 2 008', 63),
('tu3', 'Tata Usaha 3', '🗂️', '#0e7c6b', '#d4f0eb', 'Muhammad Syaifulloh M.', '19960125 202012 1 004', 64),
('sip', 'SIP', '📊', '#0e7c6b', '#d4f0eb', 'dr. Mufita Sulistyorini', '19780809 201101 2 002', 65),
('administrasi', 'Administrasi', '📋', '#0e7c6b', '#d4f0eb', 'Ns. Yayuk Indah K.', '19780813 200604 2 010', 66),
('akreditasi1', 'Ruang Akreditasi 1', '📝', '#0e7c6b', '#d4f0eb', 'Nurul Alfiah', NULL, 67),
('pertemuan', 'Ruang Pertemuan / Aula', '🗓️', '#0e7c6b', '#d4f0eb', 'Septian Hadi Santosa', NULL, 68),
('rafliesia', 'Raflesia', '🏥', '#0e7c6b', '#d4f0eb', 'Sulistriyani', '19810710 200801 2 019', 69),

-- Pelayanan Khusus
('gizi', 'Pelayanan Gizi & Pojok ASI', '🥗', '#0e7c6b', '#d4f0eb', 'Ahmad Budi', '19741223 200604 1 004', 70),
('ckg', 'Pelayanan CKG', '🦷', '#0e7c6b', '#d4f0eb', 'Sulistriyani, Amd Keb', '19810710 200801 2 019', 71),
('promkes', 'R. Promkes', '📢', '#0e7c6b', '#d4f0eb', 'Rike Dwi Anggraini, S.KM', '19941225 202012 2 007', 72),
('ukp', 'R. UKP', '🩺', '#0e7c6b', '#d4f0eb', 'Ns. Indah Purwanti, S.Kep', '19751008 200003 2 005', 73),
('ukm', 'R. UKM', '📋', '#0e7c6b', '#d4f0eb', 'Ns. Yayuk Indah K., S.Kep', '19780813 200604 2 010', 74),
('ptm', 'R. PTM', '❤️', '#0e7c6b', '#d4f0eb', 'Septian Hadi Santosa', NULL, 75),
('kesling', 'Klinik Sanitasi & Kesling', '🌿', '#0e7c6b', '#d4f0eb', 'Umi Ratnaningsih', '19771110 200903 2 007', 76),

-- Pustu & Ponkesdes
('pustu-kamulan', 'Pustu Kamulan', '🏠', '#0e7c6b', '#d4f0eb', 'Siti Nur Aisiyah', '19830114 201704 2 002', 80),
('pustu-gador', 'Pustu Gador', '🏠', '#0e7c6b', '#d4f0eb', 'Nurlatipah', '19731114 199303 2 002', 81),
('pustu-sumbergayam', 'Pustu Sumbergayam', '🏠', '#0e7c6b', '#d4f0eb', 'Dyah Suntari', '19801011 201905 2 001', 82),
('ponkesdes-karanganom', 'Ponkesdes Karanganom', '🏠', '#0e7c6b', '#d4f0eb', 'Kisma C. Mindanik', '19950313 202203 2 007', 83),
('ponkesdes-pakis', 'Ponkesdes Pakis', '🏠', '#0e7c6b', '#d4f0eb', 'Windarwati', '19720103 199203 2 011', 84),
('ponkesdes-sumberejo', 'Ponkesdes Sumberejo', '🏠', '#0e7c6b', '#d4f0eb', 'Lia Roehanatul M.', '19900401 202203 2 002', 85),

-- Lainnya
('dapur2', 'Dapur 2', '🍽️', '#0e7c6b', '#d4f0eb', 'Ahmad Budi', '19741223 200604 1 004', 90),
('cuci-linen', 'R. Cuci Linen', '🧺', '#0e7c6b', '#d4f0eb', NULL, NULL, 91)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  pj = EXCLUDED.pj,
  pj_nip = EXCLUDED.pj_nip,
  order_index = EXCLUDED.order_index;

-- ══════════════════════════════════════════════════════════════════════
--  SEED ITEMS (Sample dari beberapa ruangan)
--  Format: room_id, category, name, merk, type, year, quantity, unit, condition,
--          bahan, no_seri, kode_barang, harga, kategori, index_in_room
--
--  NOTE: Ini hanya SAMPLE ~100 items dari total ~680 items
--  Untuk complete seed, perlu parse CSV dari spreadsheet
-- ══════════════════════════════════════════════════════════════════════

-- GUDANG BMHP (7 items)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('gudang-bmhp', 'meubelair', 'Rak Kayu', NULL, NULL, 2017, 1, 'unit', 'baik', 'Kayu', '1.3.2.05.01.04.004', 2583000, NULL, 1),
('gudang-bmhp', 'meubelair', 'Rak Kayu', NULL, NULL, 2019, 5, 'unit', 'baik', 'Kayu', '1.3.2.05.01.04.004', 2095000, NULL, 2),
('gudang-bmhp', 'meubelair', 'Trolley Barang', NULL, NULL, 2019, 1, 'unit', 'baik', 'Besi', '1.3.2.05.02.06.079', 990000, NULL, 3),
('gudang-bmhp', 'meubelair', 'Meja Tulis', NULL, NULL, NULL, 1, 'unit', 'baik', 'Kayu', '1.3.2.05.02.01.002', NULL, NULL, 4),
('gudang-bmhp', 'meubelair', 'Kursi', NULL, NULL, NULL, 1, 'unit', 'baik', 'Campuran', '1.3.2.05.02.01.003', NULL, NULL, 5),
('gudang-bmhp', 'meubelair', 'Almari', NULL, NULL, NULL, 1, 'unit', 'baik', 'Kayu', '1.3.2.04.01.04.005', NULL, NULL, 6),
('gudang-bmhp', 'meubelair', 'Kursi Tunggu', NULL, NULL, NULL, 1, 'unit', 'baik', 'Kayu', '1.3.2.05.02.01.003', NULL, NULL, 7);

-- LABORATORIUM (sample 10 items dari 36)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('laboratorium', 'alkes', 'Kamar Hitung', NULL, NULL, 1993, 1, 'unit', 'kb', 'Kaca', '1.3.2.07.01.01.214', NULL, 'MEDIS', 1),
('laboratorium', 'alkes', 'Mikroskop Binokulker', 'C E', NULL, 1999, 1, 'unit', 'kb', 'Campuran', '1.3.2.08.01.16.006', NULL, 'MEDIS', 2),
('laboratorium', 'alkes', 'Mikroskop Binokuler', 'Yasumi', NULL, 2000, 1, 'unit', 'baik', 'Campuran', '1.3.2.08.01.16.006', NULL, 'MEDIS', 3),
('laboratorium', 'alkes', 'Stirilisator', 'Elitek', NULL, 2012, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.001', NULL, 'MEDIS', 4),
('laboratorium', 'alkes', 'Kamar Hitung', 'Marienfeid', NULL, 2013, 1, 'unit', 'kb', 'Kaca', '1.3.2.07.01.01.214', NULL, 'MEDIS', 5),
('laboratorium', 'alkes', 'Pipet Thoma Eritrosit', 'Assistant', NULL, 2013, 8, 'unit', 'kb', 'Kaca', '1.3.2.07.01.01.214', NULL, 'MEDIS', 6),
('laboratorium', 'alkes', 'Pipet Thoma Leokosit', 'Assistant', NULL, 2013, 8, 'unit', 'kb', 'Kaca', '1.3.2.07.01.01.214', NULL, 'MEDIS', 7),
('laboratorium', 'alkes', 'Mikroskop Binokuler', 'Olympus', NULL, 2013, 1, 'unit', 'kb', 'Campuran', '1.3.2.08.01.16.006', NULL, 'MEDIS', 8),
('laboratorium', 'alkes', 'Autoklik', 'C E', NULL, 2014, 2, 'unit', 'kb', 'Plastik', '1.3.2.07.01.01.214', NULL, 'MEDIS', 9),
('laboratorium', 'alkes', 'Rak LED', 'Westegreen', NULL, 2014, 2, 'unit', 'kb', 'Kaca', '1.3.2.07.01.01.214', NULL, 'MEDIS', 10);

-- UGD (sample 10 items dari 63)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('ugd', 'alkes', 'Bed Periksa', 'Paramond', NULL, 2013, 1, 'unit', 'baik', 'Besi', '1.3.2.07.01.11.003', NULL, 'MEDIS', 1),
('ugd', 'alkes', 'Kursi Roda', 'MAX', NULL, 2013, 3, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.126', NULL, 'MEDIS', 2),
('ugd', 'alkes', 'Trolly', NULL, NULL, 2016, 1, 'unit', 'baik', 'Besi', '1.3.2.07.01.01.153', NULL, 'MEDIS', 3),
('ugd', 'alkes', 'EKG', 'Trismed', NULL, 2018, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.14.001', 54510100, 'MEDIS', 4),
('ugd', 'alkes', 'Stetoskop Anak', NULL, NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.004', 430669, 'MEDIS', 5),
('ugd', 'alkes', 'Stretcher / Brankar', 'MAK', NULL, 2019, 1, 'unit', 'baik', 'Besi', '1.3.2.07.01.01.188', 17021550, 'MEDIS', 6),
('ugd', 'alkes', 'Suction Pump', 'Boscarol Medical Unit', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.21.055', 21110487, 'MEDIS', 7),
('ugd', 'alkes', 'Tensi Meter Digital', 'Omron HBP-1100', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.005', 1533000, 'MEDIS', 8),
('ugd', 'alkes', 'Tensi Meter Jarum', 'Onemed', NULL, 2024, 1, 'unit', 'baik', 'Campuran', NULL, NULL, 'MEDIS', 9),
('ugd', 'meubelair', 'Almari Loker', NULL, NULL, 2010, 1, 'unit', 'baik', 'Kayu', '1.3.2.04.01.04.005', NULL, 'NON MEDIS', 10);

-- PELAYANAN GIGI & MULUT (sample 10 items dari 51)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('gigi', 'alkes', 'Dental Unit', 'Genatus', NULL, 2002, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.02.002', 45000000, 'MEDIS', 1),
('gigi', 'alkes', 'Tang Cabut Dewasa RB Premolar', NULL, NULL, 2006, 3, 'unit', 'baik', 'Logam', '1.3.2.07.01.01.214', NULL, 'MEDIS', 2),
('gigi', 'alkes', 'Dental Unit Set', 'Fortuna', NULL, 2017, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.02.002', 130992500, 'MEDIS', 3),
('gigi', 'alkes', 'Skeler Ultrasonik', 'Sonic Piezo', NULL, 2023, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.02.154', 3292500, 'MEDIS', 4),
('gigi', 'alkes', 'Skeler (Highspeed)', 'Coxo', NULL, 2024, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.02.154', 2048000, 'MEDIS', 5),
('gigi', 'meubelair', 'Meja Tulis', NULL, NULL, 1994, 1, 'unit', 'baik', 'Kayu', '1.3.2.05.02.01.002', NULL, 'NON MEDIS', 6),
('gigi', 'meubelair', 'Kursi Besi', NULL, NULL, 2016, 2, 'unit', 'baik', 'Campuran', '1.3.2.05.02.01.003', NULL, 'NON MEDIS', 7),
('gigi', 'elektronik', 'AC', 'Samsung', NULL, 2018, 1, 'unit', 'baik', 'Campuran', '1.3.2.05.02.04.004', 4272000, 'NON MEDIS', 8),
('gigi', 'elektronik', 'Printer', 'Epson L121', NULL, 2022, 1, 'unit', 'baik', 'Campuran', '1.3.2.10.02.03.003', 2465499, 'NON MEDIS', 9),
('gigi', 'elektronik', 'Komputer PC', 'Axioo', NULL, 2023, 1, 'unit', 'baik', 'Campuran', '1.3.2.10.01.02.009', 13150000, 'NON MEDIS', 10);

-- PELAYANAN KIA (sample 10 items dari 24)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('kia', 'alkes', 'Timbangan Badan', 'OneMed', NULL, 2017, 1, 'unit', 'baik', 'Besi', '1.3.2.05.02.06.025', 370000, 'MEDIS', 1),
('kia', 'alkes', 'Fetal Doppler', 'Jumper JPD-100B+', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.05.081', NULL, 'MEDIS', 2),
('kia', 'alkes', 'Thermometer Infrared', 'YUWELL - YT - 1', NULL, 2020, 1, 'unit', 'baik', 'Campuran', '1.3.2.03.03.08.012', 1540000, 'MEDIS', 3),
('kia', 'alkes', 'U S G SET', 'SM TULIP', NULL, 2022, 1, 'unit', 'kb', 'Campuran', '1.3.2.07.01.04.202', 128125000, 'MEDIS', 4),
('kia', 'meubelair', 'Meja tulis', NULL, NULL, 2010, 1, 'unit', 'baik', 'Kayu', '1.3.2.05.02.01.002', NULL, 'NON MEDIS', 5),
('kia', 'meubelair', 'Tempat Tidur Pasien', NULL, NULL, 2010, 1, 'unit', 'baik', 'Campuran', '1.3.2.05.02.01.019', 5565740, 'NON MEDIS', 6),
('kia', 'elektronik', 'AC', 'Polytron', NULL, 2017, 1, 'unit', 'baik', 'Campuran', '1.3.2.05.02.04.004', 4237500, 'NON MEDIS', 7),
('kia', 'elektronik', 'Printer', 'Epson L120', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.10.02.03.003', 1935000, 'NON MEDIS', 8),
('kia', 'meubelair', 'Kursi Besi', NULL, NULL, 2016, 4, 'unit', 'baik', 'Campuran', '1.3.2.05.02.01.003', NULL, 'NON MEDIS', 9),
('kia', 'meubelair', 'Almari Arsip', NULL, NULL, 2011, 2, 'unit', 'baik', 'Aluminium', '1.3.2.04.01.04.005', NULL, 'NON MEDIS', 10);

-- PELAYANAN UMUM / BP (sample 10 items dari 30)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('bp', 'alkes', 'THT Set', NULL, NULL, 2009, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.06.138', NULL, 'MEDIS', 1),
('bp', 'alkes', 'Tansi Meter Digital', 'OMRON HBP-1100', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.005', 1533000, 'MEDIS', 2),
('bp', 'alkes', 'Stetoskop', NULL, NULL, 2022, 2, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.004', NULL, 'MEDIS', 3),
('bp', 'elektronik', 'AC', 'Samsung', NULL, 2018, 1, 'unit', 'baik', 'Campuran', '1.3.2.05.02.04.004', 4272000, 'NON MEDIS', 4),
('bp', 'elektronik', 'Komputer PC', 'HP 22-c0028d AIO', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.10.01.02.001', 8387500, 'NON MEDIS', 5),
('bp', 'elektronik', 'Printer', 'Epson L120', NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.10.02.03.003', 1935000, 'NON MEDIS', 6),
('bp', 'elektronik', 'Komputer PC', 'Acer AIO Aspire', NULL, 2024, 1, 'unit', 'baik', 'Campuran', '1.3.2.10.01.02.001', 8800000, 'NON MEDIS', 7),
('bp', 'meubelair', 'Meja Tulis', NULL, NULL, 2013, 4, 'unit', 'baik', 'Kayu', '1.3.2.05.02.01.002', NULL, 'NON MEDIS', 8),
('bp', 'meubelair', 'Kursi Besi', NULL, NULL, 2016, 7, 'unit', 'baik', 'Campuran', '1.3.2.05.02.01.003', NULL, 'NON MEDIS', 9),
('bp', 'meubelair', 'Tempat tidur Periksa', NULL, NULL, 2016, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.214', NULL, 'NON MEDIS', 10);

-- RAWAT INAP (sample items)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('sadewa', 'meubelair', 'Bed Pasien Lengkap', 'Innovated Bed', NULL, 2021, 3, 'unit', 'baik', 'Besi', NULL, NULL, NULL, 1),
('sadewa', 'meubelair', 'Bedside Cabinet', NULL, NULL, 2015, 3, 'unit', 'baik', 'Besi', NULL, NULL, NULL, 2),
('sadewa', 'elektronik', 'Kipas Angin Dinding', 'Maspion', NULL, 2016, 2, 'unit', 'baik', 'Campuran', NULL, NULL, NULL, 3),
('bima', 'meubelair', 'Bed Pasien Lengkap', 'Paramount', NULL, 2014, 1, 'unit', 'baik', 'Besi', NULL, NULL, NULL, 1),
('bima', 'meubelair', 'Bed Pasien Lengkap', 'Unnovated Bed', NULL, 2021, 2, 'unit', 'baik', 'Besi', NULL, NULL, NULL, 2),
('arjuna', 'meubelair', 'Bed Pasien Lengkap', 'Supramak', NULL, 2015, 2, 'unit', 'kb', 'Besi', NULL, NULL, NULL, 1),
('srikandi', 'meubelair', 'Bed Pasien Lengkap', 'Supramak Bed', NULL, 2018, 1, 'unit', 'kb', 'Besi', NULL, NULL, NULL, 1),
('melati', 'meubelair', 'Bed Pasien Lengkap', 'Supramak', NULL, 2018, 5, 'unit', 'baik', 'Besi', NULL, NULL, NULL, 1);

-- PUSTU & PONKESDES (sample items)
INSERT INTO public.items (room_id, category, name, merk, type, year, quantity, unit, condition, bahan, kode_barang, harga, kategori, index_in_room) VALUES
('pustu-kamulan', 'meubelair', 'Almari Arsip', NULL, NULL, 1994, 1, 'unit', 'rb', 'Kayu', '1.3.2.04.01.04.005', NULL, NULL, 1),
('pustu-kamulan', 'alkes', 'Stetoskop', NULL, NULL, 2000, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.004', NULL, NULL, 2),
('pustu-gador', 'meubelair', 'Meja tulis', NULL, NULL, 1995, 1, 'unit', 'kb', 'Kayu', '1.3.2.05.02.01.002', NULL, NULL, 1),
('pustu-gador', 'alkes', 'Stetoskop', NULL, NULL, 2019, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.004', 514780, NULL, 2),
('ponkesdes-karanganom', 'meubelair', 'Meja Tulis', NULL, NULL, 1998, 1, 'unit', 'kb', 'Kayu', '1.3.2.05.02.01.002', NULL, NULL, 1),
('ponkesdes-karanganom', 'alkes', 'Stetoskop', NULL, NULL, 2011, 1, 'unit', 'baik', 'Campuran', '1.3.2.07.01.01.004', NULL, NULL, 2);

-- ══════════════════════════════════════════════════════════════════════
--  VERIFICATION QUERIES
-- ══════════════════════════════════════════════════════════════════════

-- Uncomment untuk verifikasi:
-- SELECT COUNT(*) as total_rooms FROM public.rooms;
-- SELECT COUNT(*) as total_items FROM public.items;
-- SELECT room_id, COUNT(*) as item_count FROM public.items GROUP BY room_id ORDER BY item_count DESC;
-- SELECT condition, COUNT(*) as count FROM public.items GROUP BY condition;
-- SELECT kategori, COUNT(*) as count FROM public.items WHERE kategori IS NOT NULL GROUP BY kategori;
