-- ══════════════════════════════════════════════════════════════════════
-- Migrasi: Riwayat pengajuan publik (tanpa identitas pemohon)
-- ══════════════════════════════════════════════════════════════════════
-- CARA PAKAI: Supabase Dashboard → SQL Editor → tempel → Run.
--
-- EFEK:
--   - Fungsi `riwayat_pengajuan_publik(limit)` mengembalikan daftar
--     pengajuan untuk halaman publik /riwayat-pengajuan.
--   - Kolom yang dikembalikan SENGAJA dibatasi: nomor, ruangan, status,
--     waktu, dan rincian barang. `nama_pemohon`, `catatan_pemohon`, dan
--     `catatan_admin` TIDAK pernah keluar dari fungsi ini.
--   - Tabel `pengajuan` tetap tidak bisa dibaca anon (RLS tidak diubah);
--     anon hanya mendapat EXECUTE untuk fungsi ini.
--
-- IDEMPOTEN: safe dijalankan berulang.
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.riwayat_pengajuan_publik(p_limit INTEGER DEFAULT 100)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
           jsonb_agg(t.row_data ORDER BY t.diajukan_at DESC),
           '[]'::jsonb
         )
    FROM (
      SELECT
        jsonb_build_object(
          'nomor', p.nomor,
          'room_name', r.name,
          'room_icon', r.icon,
          'status', p.status,
          'diajukan_at', p.diajukan_at,
          'diputuskan_at', p.diputuskan_at,
          'diserahkan_at', p.diserahkan_at,
          'items', coalesce(
            (
              SELECT jsonb_agg(
                       jsonb_build_object(
                         'nama', pi.nama_snapshot,
                         'satuan', pi.satuan_snapshot,
                         'jumlah_diminta', pi.jumlah_diminta,
                         'jumlah_disetujui', pi.jumlah_disetujui
                       )
                       ORDER BY pi.id
                     )
                FROM public.pengajuan_item pi
               WHERE pi.pengajuan_id = p.id
            ),
            '[]'::jsonb
          )
        ) AS row_data,
        p.diajukan_at
      FROM public.pengajuan p
      LEFT JOIN public.rooms r ON r.id = p.room_id
     ORDER BY p.diajukan_at DESC
     LIMIT greatest(1, least(coalesce(p_limit, 100), 300))
    ) t;
$$;

REVOKE ALL ON FUNCTION public.riwayat_pengajuan_publik(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.riwayat_pengajuan_publik(INTEGER) TO anon, authenticated;

-- Verifikasi:
--   SELECT public.riwayat_pengajuan_publik(5);
