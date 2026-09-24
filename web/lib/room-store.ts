"use client";

/**
 * Perubahan data ruangan yang belum punya backend — port GAS `roomsSave`
 * (tambah ruangan, edit nama, ganti penanggung jawab, hapus ruangan).
 *
 * Daftar ruangan dasar masih berasal dari mock server-side, jadi yang disimpan
 * hanyalah selisihnya: ruangan tambahan dan patch per ruangan. Pada fase wiring
 * Supabase, cukup ganti pembacanya dengan query tabel `rooms`.
 */
import { useMemo } from "react";
import {
  readLocalStorage,
  useLocalStorageState,
  writeLocalStorage,
} from "@/lib/use-local-storage";
import type { Room } from "@/types/database";

export const ROOM_OVERRIDES_KEY = "sidira_rooms_override";
export const ROOM_ADDED_KEY = "sidira_rooms_added";

export interface RoomOverride {
  name?: string;
  pj?: string;
  /** Ruangan dihapus lewat tombol 🗑 Hapus — disembunyikan dari semua daftar. */
  deleted?: boolean;
}

export type RoomOverrides = Record<string, RoomOverride>;

const EMPTY: RoomOverrides = {};

export function useRoomOverrides() {
  return useLocalStorageState<RoomOverrides>(ROOM_OVERRIDES_KEY, EMPTY);
}

/** Gabungkan satu ruangan dengan perubahannya. */
export function mergeRoom(room: Room, overrides: RoomOverrides): Room {
  const ov = overrides[room.id];
  if (!ov) return room;
  return {
    ...room,
    name: ov.name ?? room.name,
    pj: ov.pj ?? room.pj,
  };
}

export function isRoomDeleted(
  roomId: string,
  overrides: RoomOverrides
): boolean {
  return overrides[roomId]?.deleted === true;
}

/** Daftar ruangan siap tampil: yang dihapus dibuang, sisanya di-patch. */
export function mergeRooms(rooms: Room[], overrides: RoomOverrides): Room[] {
  return rooms
    .filter((r) => !isRoomDeleted(r.id, overrides))
    .map((r) => mergeRoom(r, overrides));
}

/* ── Ruangan tambahan (GAS submitTambahRuangan) ───────────────────────── */

const EMPTY_ROOMS: Room[] = [];

export function useAddedRooms() {
  return useLocalStorageState<Room[]>(ROOM_ADDED_KEY, EMPTY_ROOMS);
}

export interface NewRoomInput {
  name: string;
  icon: string;
  description?: string;
}

/**
 * GAS `submitTambahRuangan` — id `custom_<timestamp>`, warna tetap teal,
 * deskripsi kosong diisi "Ruangan <nama>".
 */
export function addRoom(input: NewRoomInput): Room {
  const now = new Date().toISOString();
  const existing = readLocalStorage<Room[]>(ROOM_ADDED_KEY, EMPTY_ROOMS);
  const room: Room = {
    id: `custom_${Date.now()}`,
    name: input.name,
    icon: input.icon,
    color: "#0e7c6b",
    bg: "#d4f0eb",
    description: input.description?.trim() || `Ruangan ${input.name}`,
    order_index: existing.length,
    created_at: now,
    updated_at: now,
  };
  writeLocalStorage(ROOM_ADDED_KEY, [...existing, room]);
  return room;
}

/**
 * Daftar ruangan final untuk komponen klien: mock + tambahan − yang dihapus,
 * dengan nama/PJ hasil sunting sudah diterapkan.
 */
export function useRoomList(base: Room[]): Room[] {
  const [overrides] = useRoomOverrides();
  const [added] = useAddedRooms();
  return useMemo(
    () => mergeRooms([...base, ...added], overrides),
    [base, added, overrides]
  );
}
