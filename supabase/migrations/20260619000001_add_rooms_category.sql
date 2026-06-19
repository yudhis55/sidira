-- Add category column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'lain';

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category);

-- Add comment
COMMENT ON COLUMN rooms.category IS 'Room category: pelayanan, penunjang, administrasi, gudang, pustu, lain';
