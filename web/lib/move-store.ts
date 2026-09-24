"use client";

/**
 * Pemindahan aset antar ruangan — port GAS `mvConfirm` + `mvLogAdd`
 * (index.html ~28560 & ~28800).
 *
 * GAS memindahkan `<tr>` ke tabel ruangan tujuan lalu memanggil
 * `roomsSaveToStorage()`. Di sini item ditulis ke kunci localStorage ruangan
 * tujuan (`sidira_room_items_<roomId>`) supaya halaman tujuan langsung
 * menampilkannya, dan satu baris riwayat ditambahkan per item.
 */
import { getMockItemsByRoom } from "@/lib/mock-data";
import { MOVE_LOG_KEY, roomItemsStorageKey } from "@/lib/storage-keys";
import { readLocalStorage, writeLocalStorage } from "@/lib/use-local-storage";
import type { Item, ItemCategory, RiwayatPindah, Room } from "@/types/database";

export function readMoveLog(): RiwayatPindah[] {
  return readLocalStorage<RiwayatPindah[]>(MOVE_LOG_KEY, []);
}

export function clearMoveLog(): void {
  writeLocalStorage<RiwayatPindah[]>(MOVE_LOG_KEY, []);
}

/** GAS `mvLogAdd` — entri terbaru selalu di depan, maksimal 200 baris. */
function appendMoveLog(entries: Omit<RiwayatPindah, "id">[]): void {
  const current = readMoveLog();
  const baseId = current.reduce((max, e) => (e.id > max ? e.id : max), 0);
  const added = entries.map((entry, i) => ({ ...entry, id: baseId + i + 1 }));
  writeLocalStorage(MOVE_LOG_KEY, [...added.reverse(), ...current].slice(0, 200));
}

/**
 * Pindahkan sejumlah item ke ruangan tujuan.
 *
 * `destKat` mengikuti GAS: bila filter kategori pada modal masih "Semua",
 * kategori asal item dipertahankan; selain itu semua item masuk ke kategori
 * yang dipilih. Mengembalikan jumlah item yang berhasil dipindah.
 */
export function moveItemsToRoom(
  movedItems: Item[],
  fromRoom: Room,
  destRoom: Room,
  destKat: ItemCategory | null
): number {
  if (movedItems.length === 0) return 0;

  const destKey = roomItemsStorageKey(destRoom.id);
  const existing = readLocalStorage<Item[]>(
    destKey,
    getMockItemsByRoom(destRoom.id)
  );

  let nextId = existing.reduce((max, it) => (it.id > max ? it.id : max), 0);
  const now = new Date().toISOString();

  const appended = movedItems.map((item) => {
    nextId += 1;
    const useKat = destKat ?? item.category;
    return {
      ...item,
      id: nextId,
      room_id: destRoom.id,
      category: useKat,
      index_in_room: existing.filter((it) => it.category === useKat).length,
      updated_at: now,
    } satisfies Item;
  });

  writeLocalStorage(destKey, [...existing, ...appended]);

  appendMoveLog(
    appended.map((item) => ({
      ts: now,
      nama: item.name || "(tanpa nama)",
      kat: item.category,
      dari: fromRoom.id,
      ke: destRoom.id,
      dari_name: fromRoom.name,
      ke_name: destRoom.name,
      created_at: now,
    }))
  );

  return appended.length;
}
