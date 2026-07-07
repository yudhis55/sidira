import type { Profile } from "@/types/database";

const mockUsers: Profile[] = [
  {
    id: "user-001",
    username: "admin",
    nama: "Dr. Hendra Wijaya",
    jabatan: "Kepala Puskesmas",
    role: "admin",
    avatar: "HW",
    last_login: "2025-06-20T08:30:00Z",
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2025-06-20T08:30:00Z",
  },
  {
    id: "user-002",
    username: "editor1",
    nama: "drg. Ani Sulistyawati",
    jabatan: "Dokter Gigi",
    role: "editor",
    avatar: "AS",
    last_login: "2025-06-19T10:15:00Z",
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2025-06-19T10:15:00Z",
  },
  {
    id: "user-003",
    username: "editor2",
    nama: "Apoteker Dina Pratiwi",
    jabatan: "Apoteker",
    role: "editor",
    avatar: "DP",
    last_login: "2025-06-18T14:20:00Z",
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-06-18T14:20:00Z",
  },
  {
    id: "user-004",
    username: "viewer",
    nama: "Siti Aminah",
    jabatan: "Perekam Medis",
    role: "viewer",
    avatar: "SA",
    last_login: "2025-06-17T09:00:00Z",
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-06-17T09:00:00Z",
  },
];

export function getMockUsers(): Profile[] {
  return mockUsers;
}
