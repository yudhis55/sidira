import type { UtilMeta, UtilItems, UtilState, UtilItem } from "@/types/database";
import type { UtilSummary } from "./types";

// Data utilitas disamakan dengan GAS legacy (UTILITAS_DATA di index.html)
// dan seed Supabase 20260625000001_seed_utilitas.sql: amb_apv, amb_kijang, genset, ipal.
const utilMetaList: UtilMeta[] = [
  {
    util_id: "amb_apv",
    label: "Ambulance APV",
    icon: "\u{1F691}",
    warna: "#b91c1c",
    bg: "linear-gradient(135deg,#7f1d1d,#b91c1c)",
    custom: false,
    order_no: 1,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    util_id: "amb_kijang",
    label: "Ambulance Kijang",
    icon: "\u{1F691}",
    warna: "#c2410c",
    bg: "linear-gradient(135deg,#7c2d12,#c2410c)",
    custom: false,
    order_no: 2,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    util_id: "genset",
    label: "Genset",
    icon: "⚡",
    warna: "#b45309",
    bg: "linear-gradient(135deg,#78350f,#b45309)",
    custom: false,
    order_no: 3,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    util_id: "ipal",
    label: "IPAL",
    icon: "\u{1F4A7}",
    warna: "#1d4ed8",
    bg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
    custom: false,
    order_no: 4,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
];

const utilItemsList: UtilItems[] = [
  {
    id: 1,
    util_id: "amb_apv",
    items: [
      { nama: "Pemanasan mesin", ket: "Harian" },
      { nama: "Cek Accu", ket: "Bulanan" },
      { nama: "Cek Oli", ket: "Bulanan" },
      { nama: "Ganti Oli", ket: "Setiap 5000 KM" },
      { nama: "Cek Sirine", ket: "Bulanan" },
      { nama: "Cek Air Radiator", ket: "Bulanan" },
      { nama: "Cek Minyak Rem", ket: "Bulanan" },
      { nama: "Cek Lampu", ket: "Bulanan" },
      { nama: "Cek AC", ket: "Bulanan" },
      { nama: "Cek Wiper Kaca", ket: "Bulanan" },
      { nama: "Cek Oksigen", ket: "Harian" },
      { nama: "Cek Dragbar", ket: "Mingguan" },
      { nama: "Cek Kondisi dan Angin Ban", ket: "Mingguan" },
      { nama: "Servis Kendaraan", ket: "Min. 1 Tahun 1x" },
      { nama: "Mencuci Kendaraan", ket: "Mingguan" },
    ],
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 2,
    util_id: "amb_kijang",
    items: [
      { nama: "Pemanasan mesin", ket: "Harian" },
      { nama: "Cek Accu", ket: "Bulanan" },
      { nama: "Cek Oli", ket: "Bulanan" },
      { nama: "Ganti Oli", ket: "Setiap 5000 KM" },
      { nama: "Cek Sirine", ket: "Bulanan" },
      { nama: "Cek Air Radiator", ket: "Bulanan" },
      { nama: "Cek Minyak Rem", ket: "Bulanan" },
      { nama: "Cek Lampu", ket: "Bulanan" },
      { nama: "Cek Wiper Kaca", ket: "Bulanan" },
      { nama: "Cek Oksigen", ket: "Harian" },
      { nama: "Cek Dragbar", ket: "Mingguan" },
      { nama: "Cek Kondisi dan Angin Ban", ket: "Mingguan" },
      { nama: "Servis Kendaraan", ket: "Min. 1 Tahun 1x" },
      { nama: "Mencuci Kendaraan", ket: "Mingguan" },
    ],
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 3,
    util_id: "genset",
    items: [
      { nama: "Pemanasan mesin Genset", ket: "Harian" },
      { nama: "Cek BBM / Solar", ket: "Harian" },
      { nama: "Cek Accu", ket: "Bulanan" },
      { nama: "Cek Oli", ket: "Bulanan" },
      { nama: "Ganti Oli", ket: "Min. 1 Tahun" },
      { nama: "Ganti Filter", ket: "Min. 1 Tahun" },
      { nama: "Cek Air Radiator", ket: "Bulanan" },
      { nama: "Cek Instalasi", ket: "Bulanan" },
      { nama: "Cek Bok Panel", ket: "Bulanan" },
      { nama: "Membersihkan Genset", ket: "Mingguan" },
    ],
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
  {
    id: 4,
    util_id: "ipal",
    items: [
      { nama: "Cek Bok Panel", ket: "Mingguan" },
      { nama: "Cek Instalasi Listrik", ket: "Mingguan" },
      { nama: "Cek Pompa Air Inlet", ket: "Bulanan" },
      { nama: "Cek Pompa Air Sirkulasi", ket: "Bulanan" },
      { nama: "Cek Pompa Air Transfer", ket: "Bulanan" },
      { nama: "Cek Pompa Air Filter", ket: "Bulanan" },
      { nama: "Cek Instalasi Pipa Air Limbah", ket: "Bulanan" },
      { nama: "Cek Tabung Reaktor", ket: "Bulanan" },
      { nama: "Cek Lampu Catalist Destructor", ket: "Bulanan" },
      { nama: "Cek Tabung Filter", ket: "Bulanan" },
    ],
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
  },
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Sample state dibangkitkan deterministik relatif terhadap tanggal hari ini,
// supaya matriks bulan berjalan & jadwal tahunan tidak kosong kapan pun dilihat.
function buildSampleState(): UtilState[] {
  const rows: UtilState[] = [];
  let id = 1;
  const now = new Date();
  const year = now.getFullYear();
  const curMonth0 = now.getMonth();
  const todayDate = now.getDate();

  for (const util of utilItemsList) {
    const itemCount = util.items.length;

    // Bulan-bulan sebelumnya tahun ini: beberapa item selesai (untuk matriks tahunan).
    for (let m0 = 0; m0 < curMonth0; m0++) {
      for (let idx = 0; idx < itemCount; idx++) {
        // Pola deterministik: sebagian besar item punya minimal satu hari selesai.
        if ((idx + m0) % 4 === 3) continue;
        const day = ((idx * 3 + m0 * 5) % 26) + 1;
        rows.push({
          id: id++,
          kind: "check",
          util_id: util.util_id,
          item_index: String(idx),
          state_key: `${year}-${pad2(m0 + 1)}-${pad2(day)}`,
          value: "1",
          updated_at: `${year}-${pad2(m0 + 1)}-${pad2(day)}T08:00:00Z`,
          updated_by: "user-admin",
        });
      }
    }

    // Bulan berjalan: item harian/mingguan tercentang di beberapa hari terakhir.
    for (let idx = 0; idx < itemCount; idx++) {
      for (let back = 1; back <= 6; back++) {
        const day = todayDate - back;
        if (day < 1) break;
        if ((idx + day) % 3 !== 0) continue;
        rows.push({
          id: id++,
          kind: "check",
          util_id: util.util_id,
          item_index: String(idx),
          state_key: `${year}-${pad2(curMonth0 + 1)}-${pad2(day)}`,
          value: "1",
          updated_at: `${year}-${pad2(curMonth0 + 1)}-${pad2(day)}T08:00:00Z`,
          updated_by: "user-admin",
        });
      }
    }

    // Catatan bulanan (per YYYY-MM, meniru key uid_tahun_bulan di GAS).
    rows.push({
      id: id++,
      kind: "note",
      util_id: util.util_id,
      state_key: `${year}-${pad2(curMonth0 + 1)}`,
      value: "Pemeliharaan rutin berjalan normal.",
      updated_at: now.toISOString(),
      updated_by: "user-admin",
    });
  }

  return rows;
}

const utilStateList: UtilState[] = buildSampleState();

export function getMockUtilitasMeta(): UtilMeta[] {
  return utilMetaList;
}

export function getMockUtilitasItems(): UtilItems[] {
  return utilItemsList;
}

export function getMockUtilitasState(): UtilState[] {
  return utilStateList;
}

export function getMockUtilitasSummary(): UtilSummary[] {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  return utilMetaList.map((meta) => {
    const itemCount =
      utilItemsList.find((r) => r.util_id === meta.util_id)?.items.length ?? 0;
    const doneThisMonth = utilStateList.filter(
      (s) =>
        s.util_id === meta.util_id &&
        s.kind === "check" &&
        s.state_key.startsWith(prefix)
    ).length;
    return { meta, itemCount, doneThisMonth };
  });
}

export function getMockUtilMetaById(utilId: string): UtilMeta | null {
  return utilMetaList.find((m) => m.util_id === utilId) ?? null;
}

export function getMockUtilItemsById(utilId: string): UtilItem[] {
  const row = utilItemsList.find((r) => r.util_id === utilId);
  return row?.items ?? [];
}

/** month0 is 0-based (0 = January). Filters state_key prefix YYYY-MM. */
export function getMockUtilStateForMonth(
  utilId: string,
  year: number,
  month0: number
): { checks: UtilState[]; note: string } {
  const mm = String(month0 + 1).padStart(2, "0");
  const prefix = `${year}-${mm}`;
  const monthRows = getMockUtilitasState().filter(
    (s) => s.util_id === utilId && s.state_key.startsWith(prefix)
  );
  const checks = monthRows.filter((s) => s.kind === "check");
  const noteRow = monthRows.find((s) => s.kind === "note");
  return { checks, note: noteRow?.value ?? "" };
}

/**
 * Seluruh state (semua bulan) untuk satu utilitas — dipakai matriks ceklist
 * lintas-bulan dan kartu Jadwal Pemeliharaan Tahunan.
 */
export function getMockUtilStateForUtil(utilId: string): {
  checks: UtilState[];
  notesByMonth: Record<string, string>;
} {
  const rows = getMockUtilitasState().filter((s) => s.util_id === utilId);
  const checks = rows.filter((s) => s.kind === "check");
  const notesByMonth: Record<string, string> = {};
  for (const r of rows) {
    if (r.kind !== "note") continue;
    notesByMonth[r.state_key.slice(0, 7)] = r.value ?? "";
  }
  return { checks, notesByMonth };
}
