-- Add category column to rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS category text;

-- Update existing rooms with categories based on spreadsheet data
UPDATE public.rooms SET category = CASE
  -- Pelayanan Medis
  WHEN id IN ('poli-tb', 'imunisasi', 'bp', 'r-gigi', 'r-mtbs', 'r-kb', 'bkia', 'r-poked', 'r-neonatus') THEN 'pelayanan'
  -- Penunjang Medis
  WHEN id IN ('laboratorium', 'r-radiologi', 'r-sterilisasi', 'r-gas-medik') THEN 'penunjang'
  -- Administrasi
  WHEN id IN ('r-loket', 'r-kasir', 'r-kasir-lt2', 'r-rekam-medis-lt2', 'r-tu3', 'r-sip', 'r-administrasi', 'r-akreditasi-1', 'r-pertemuan', 'r-rafliesia') THEN 'administrasi'
  -- Pelayanan Khusus
  WHEN id IN ('r-gizi', 'r-ckg', 'r-promkes', 'r-ukp', 'r-ukm', 'r-ptm', 'r-kesling') THEN 'pelayanan'
  -- Pustu & Ponkesdes
  WHEN id IN ('pustu-kamulan', 'pustu-gador', 'pustu-sumbergayam', 'ponkesdes-karanganom', 'ponkesdes-pakis', 'ponkesdes-sumberejo') THEN 'pustu'
  -- Gudang & Logistik
  WHEN id IN ('gudang-bmhp', 'gudang-obat', 'r-dapur2', 'r-cuci-linen') THEN 'gudang'
  -- Rawat Inap
  WHEN id IN ('r-nakula', 'r-sadewa', 'r-bima', 'r-arjuna', 'r-srikandi', 'r-melati') THEN 'pelayanan'
  -- Gawat Darurat
  WHEN id = 'r-ugd' THEN 'pelayanan'
  -- Default
  ELSE 'lain'
END;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category);

-- Add comment
COMMENT ON COLUMN public.rooms.category IS 'Room category: pelayanan, penunjang, administrasi, gudang, pustu, lain';
