/**
 * Kunci localStorage bersama — meniru penamaan GAS (`sidira_*`).
 *
 * Dipakai bersama oleh komponen yang menulis data (inventaris, ceklist,
 * usulan) dan modul Laporan yang membacanya kembali untuk agregasi.
 * Saat fase wiring Supabase, cukup ganti pembacanya, bukan kuncinya.
 */
export const roomItemsStorageKey = (roomId: string) =>
  `sidira_room_items_${roomId}`;

export const checklistStorageKey = (roomId: string) =>
  `sidira_checklist_${roomId}`;

export const usulanStorageKey = (roomId: string) => `sidira_usulan_${roomId}`;

/** State laporan: identitas TTD + baris manual per bulan (GAS `sidira_lp_state`). */
export const LAPORAN_STATE_KEY = "sidira_lp_state";

/** Riwayat perpindahan aset yang dicatat sesi ini (GAS `mvLogAdd`). */
export const MOVE_LOG_KEY = "sidira_mv_log";
