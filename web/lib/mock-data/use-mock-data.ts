"use client";

import { getMockRooms } from "./rooms";
import { getMockItems, getMockItemsByRoom } from "./items";
import { getMockSbbk } from "./sbbk";
import { getMockPakta } from "./pakta";
import { getMockUtilitasMeta, getMockUtilitasItems, getMockUtilitasSummary } from "./utilitas";
import { getMockUsulan } from "./usulan";
import { getMockRiwayat } from "./riwayat";
import { getMockPemegang, getMockAsetPemegang } from "./rekap";
import { getMockLaporanSummary, getMockLaporanRooms } from "./laporan";
import { getMockUsers } from "./users";

interface MockResult<T> {
  data: T;
  isLoading: false;
  error: null;
}

export function useMockRooms(): MockResult<ReturnType<typeof getMockRooms>> {
  return { data: getMockRooms(), isLoading: false, error: null };
}

export function useMockItems(roomId?: string): MockResult<ReturnType<typeof getMockItems>> {
  const data = roomId ? getMockItemsByRoom(roomId) : getMockItems();
  return { data, isLoading: false, error: null };
}

export function useMockSbbk(): MockResult<ReturnType<typeof getMockSbbk>> {
  return { data: getMockSbbk(), isLoading: false, error: null };
}

export function useMockPakta(): MockResult<ReturnType<typeof getMockPakta>> {
  return { data: getMockPakta(), isLoading: false, error: null };
}

export function useMockUtilitas(): MockResult<{
  meta: ReturnType<typeof getMockUtilitasMeta>;
  items: ReturnType<typeof getMockUtilitasItems>;
  summary: ReturnType<typeof getMockUtilitasSummary>;
}> {
  return {
    data: {
      meta: getMockUtilitasMeta(),
      items: getMockUtilitasItems(),
      summary: getMockUtilitasSummary(),
    },
    isLoading: false,
    error: null,
  };
}

export function useMockUsulan(roomId?: string): MockResult<ReturnType<typeof getMockUsulan>> {
  return { data: getMockUsulan(roomId), isLoading: false, error: null };
}

export function useMockRiwayat(): MockResult<ReturnType<typeof getMockRiwayat>> {
  return { data: getMockRiwayat(), isLoading: false, error: null };
}

export function useMockRekap(): MockResult<{
  pemegang: ReturnType<typeof getMockPemegang>;
  aset: ReturnType<typeof getMockAsetPemegang>;
}> {
  return {
    data: {
      pemegang: getMockPemegang(),
      aset: getMockAsetPemegang(),
    },
    isLoading: false,
    error: null,
  };
}

export function useMockLaporan(): MockResult<{
  summary: ReturnType<typeof getMockLaporanSummary>;
  rooms: ReturnType<typeof getMockLaporanRooms>;
}> {
  return {
    data: {
      summary: getMockLaporanSummary(),
      rooms: getMockLaporanRooms(),
    },
    isLoading: false,
    error: null,
  };
}

export function useMockUsers(): MockResult<ReturnType<typeof getMockUsers>> {
  return { data: getMockUsers(), isLoading: false, error: null };
}
