import type { Profile } from "@/types/database";
import type { UserProfile } from "@/lib/auth/admin";

/**
 * Petakan UserProfile (gabungan Auth + profiles) ke bentuk Profile
 * yang dipakai komponen admin.
 *
 * Ditaruh di sini (bukan lib/auth/admin.ts) karena modul "use server"
 * hanya boleh mengekspor fungsi async.
 */
export function toProfile(u: UserProfile): Profile {
  return {
    id: u.id,
    username: u.username,
    nama: u.nama,
    jabatan: u.jabatan,
    role: u.role,
    avatar: u.avatar,
    last_login: u.last_login ?? undefined,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}
