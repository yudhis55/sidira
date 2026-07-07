-- ══════════════════════════════════════════════════════════════════════
--  SIDIRA — Fase 0: Schema Fix
--  1. Revert items.condition CHECK to GAS 4-value enum ('baik','rr','rb','ta')
--  2. Revert checklist unique constraint to (room_id, category, item_index, date_key)
--     so saveChecklistEntry onConflict works again
--  3. Add missing items columns: spec, noreg, std, prio
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
--  1. ITEMS — Revert condition enum to GAS values
--     Migration 20260618100000 changed this to ('baik','kb','rb') and
--     converted rr->kb, deleted ta. Revert to ('baik','rr','rb','ta').
--     Convert existing 'kb' rows back to 'rr' BEFORE adding the constraint
--     so no rows violate the new CHECK.
-- ══════════════════════════════════════════════════════════════════════

-- Drop the constraint introduced by migration 20260618100000
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_condition_check;

-- Convert data: 'kb' (Kurang Baik) -> 'rr' (Rusak Ringan)
-- Rows that were 'ta' were deleted by the prior migration; we accept that
-- data loss since 'ta' items did not exist in the original GAS data.
UPDATE public.items SET condition = 'rr' WHERE condition = 'kb';

-- Re-add the constraint with the GAS 4-value enum
ALTER TABLE public.items ADD CONSTRAINT items_condition_check
  CHECK (condition IN ('baik', 'rr', 'rb', 'ta'));

-- ══════════════════════════════════════════════════════════════════════
--  2. CHECKLIST — Revert unique constraint
--     Migration 20260618100000 changed this to UNIQUE(item_id, date_key)
--     via constraint checklist_item_date_unique. But saveChecklistEntry
--     (lib/auth/checklist.ts) uses onConflict "room_id,category,item_index,date_key".
--     Restore the composite unique constraint so the upsert works.
-- ══════════════════════════════════════════════════════════════════════

-- Drop ALL existing unique constraints on checklist (whatever they are named)
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

-- Re-add the composite unique constraint matching saveChecklistEntry onConflict
ALTER TABLE public.checklist
  ADD CONSTRAINT checklist_room_cat_idx_date_unique
  UNIQUE(room_id, category, item_index, date_key);

-- Recreate/replace the upsert_checklist function to match the restored constraint
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
  ON CONFLICT (room_id, category, item_index, date_key)
  DO UPDATE SET
    payload = p_payload,
    item_id = p_item_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the composite index (dropped by migration 20260618100000)
CREATE INDEX IF NOT EXISTS idx_checklist_composite
  ON public.checklist(room_id, category, item_index, date_key);

-- ══════════════════════════════════════════════════════════════════════
--  3. ITEMS — Add missing columns to match GAS inventory item structure
-- ══════════════════════════════════════════════════════════════════════

-- spec: spesifikasi (specification text)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS spec TEXT;

-- noreg: nomor register (registration number)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS noreg TEXT;

-- std: standar jumlah (standard quantity), defaults to 0
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS std INTEGER DEFAULT 0;

-- prio: prioritas (priority level: wajib/penting/pendukung)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS prio TEXT
  CHECK (prio IN ('wajib', 'penting', 'pendukung'));
