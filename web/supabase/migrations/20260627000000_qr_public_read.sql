-- ══════════════════════════════════════════════════════════════════════
-- Migrasi: QR publik read-only (rooms + items untuk ANON)
-- ══════════════════════════════════════════════════════════════════════
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → SQL Editor → New Query.
--   2. Salin SELURUH isi file ini, paste, lalu klik Run.
--   3. Verifikasi: jalankan query SELECT sebagai anon (atau buka halaman
--      publik /r/[id] tanpa login — daftar ruangan & inventaris harus tampil).
--
-- EFEK:
--   - Menambah policy SELECT read-only untuk role `anon` pada tabel
--     public.rooms (rooms_select_anon) dan public.items (items_select_anon).
--   - TIDAK menambah policy INSERT/UPDATE/DELETE untuk anon — tulis tetap
--     butuh login (policy authenticated yang sudah ada tidak diubah).
--   - Diperlukan agar halaman publik GET /r/[id] bisa dibaca tanpa login.
-- ══════════════════════════════════════════════════════════════════════

CREATE POLICY "rooms_select_anon" ON public.rooms
  FOR SELECT TO anon USING (true);

CREATE POLICY "items_select_anon" ON public.items
  FOR SELECT TO anon USING (true);
