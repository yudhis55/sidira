/**
 * Agregasi baris Laporan Monitoring — port GAS `collectCeklistForMonth()`,
 * `collectInventarisKondisi()`, dan `collectGabungan()` (index.html ~22944).
 *
 * Sumber data adalah hasil server actions `getLaporanPerRoom` (Supabase:
 * tabel `items` + `checklist` per periode). Fungsi di sini murni — tanpa
 * akses mock, localStorage, maupun jaringan — sehingga mudah diuji.
 */
import type { ItemCondition } from "@/types/database";
import type { LaporanRoom } from "@/lib/auth/laporan";

export type LaporanSumber = "gabungan" | "inventaris" | "ceklist" | "manual";

export interface LaporanRow {
  sumber?: "ceklist" | "inventaris";
  sarpras: string;
  ruangan?: string;
  masalah: string;
  penyebab: string;
  tindak: string;
  evaluasi: string;
  ket: string;
  tgl?: string;
  status?: ItemCondition | null;
}

/** Baris kosong untuk padding dokumen agar tabel tetap penuh saat dicetak. */
export function emptyLaporanRow(): LaporanRow {
  return {
    sarpras: "",
    masalah: "",
    penyebab: "",
    tindak: "",
    evaluasi: "",
    ket: "",
    status: null,
  };
}

const KONDISI_LABEL: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada / Tidak Berfungsi",
};

const CEKLIST_KONDISI_LABEL: Record<string, string> = {
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

const KONDISI_MASALAH: Record<string, string> = {
  rr: "Terdapat kerusakan ringan — perlu perhatian",
  rb: "Kerusakan berat — perlu tindakan segera",
  ta: "Barang tidak ada atau tidak dapat dioperasikan",
};

const KONDISI_TINDAK: Record<string, string> = {
  rr: "Mengajukan perbaikan / perawatan berkala",
  rb: "Mengajukan perbaikan mendesak atau penggantian barang",
  ta: "Mengajukan pengadaan / penggantian barang",
};

const KONDISI_EVALUASI: Record<string, string> = {
  rr: "Dalam proses pemantauan dan perbaikan",
  rb: "Menunggu perbaikan atau penggantian",
  ta: "Menunggu pengadaan",
};

function isMasalah(status: string): status is ItemCondition {
  return status === "rr" || status === "rb" || status === "ta";
}

/** GAS `collectCeklistForMonth` — entri ceklist non-"baik" pada bulan terpilih. */
export function collectCeklistForMonth(
  bulanIdx: number,
  tahun: number,
  rooms: LaporanRoom[] = [],
): LaporanRow[] {
  const prefix = `${tahun}-${String(bulanIdx + 1).padStart(2, "0")}-`;
  const results: LaporanRow[] = [];

  for (const room of rooms) {
    for (const item of room.items) {
      for (const entry of item.riwayat_checklist) {
        if (!entry.date_key.startsWith(prefix)) continue;
        const status = entry.condition;
        if (!status || status === "baik") continue;

        const p = entry.payload;
        results.push({
          sumber: "ceklist",
          sarpras: `${item.nama} (${room.room_name})`,
          ruangan: room.room_name,
          masalah:
            (p?.uraian_kerusakan || "").trim() ||
            CEKLIST_KONDISI_LABEL[status] ||
            status,
          penyebab: (p?.jenis_kerusakan || "").trim() || "—",
          tindak:
            (p?.uraian_tindakan || "").trim() ||
            (p?.jenis_tindakan || "").trim() ||
            "—",
          evaluasi:
            status === "rb"
              ? "Menunggu perbaikan lebih lanjut"
              : p?.uraian_tindakan
                ? `Sudah ditindaklanjuti: ${p.uraian_tindakan}`
                : "Sudah ditindaklanjuti",
          ket:
            [
              p?.no_laporan ? `No.${p.no_laporan}` : "",
              (p?.petugas || "").trim(),
            ]
              .filter(Boolean)
              .join(" · ") || "",
          tgl: entry.date_key,
          status: isMasalah(status) ? status : null,
        });
      }
    }
  }

  results.sort((a, b) => (a.tgl || "").localeCompare(b.tgl || ""));
  return results;
}

/** GAS `collectInventarisKondisi` — item dengan kondisi selain "baik". */
export function collectInventarisKondisi(
  rooms: LaporanRoom[] = [],
): LaporanRow[] {
  const results: LaporanRow[] = [];

  for (const room of rooms) {
    for (const item of room.items) {
      const nama = (item.nama || "").trim();
      if (!nama) continue;
      if (!isMasalah(item.kondisi_terbaru)) continue;

      const d = item.detail ?? {};
      const infoExtra = [
        d.bahan ? `Bahan: ${d.bahan}` : "",
        d.merk ? `Merek: ${d.merk}${d.type ? ` / ${d.type}` : ""}` : "",
        d.no_seri || d.kode_barang
          ? `No.Reg: ${d.no_seri || d.kode_barang}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const status = item.kondisi_terbaru;
      results.push({
        sumber: "inventaris",
        sarpras: `${nama} (${room.room_name})`,
        ruangan: room.room_name,
        masalah:
          (d.notes || "").trim() ||
          KONDISI_MASALAH[status] ||
          KONDISI_LABEL[status],
        penyebab: infoExtra || "—",
        tindak: KONDISI_TINDAK[status] || "—",
        evaluasi: KONDISI_EVALUASI[status] || "—",
        ket: KONDISI_LABEL[status] || status,
        tgl: item.tanggal_terbaru || "",
        status,
      });
    }
  }

  return results;
}

/** GAS `collectGabungan` — ceklist dulu, inventaris menyusul tanpa duplikat. */
export function collectGabungan(
  bulanIdx: number,
  tahun: number,
  rooms: LaporanRoom[] = [],
): LaporanRow[] {
  const ceklist = collectCeklistForMonth(bulanIdx, tahun, rooms);
  const inventaris = collectInventarisKondisi(rooms);
  const seen = new Set(ceklist.map((r) => r.sarpras.toLowerCase()));
  return [...ceklist, ...inventaris.filter((r) => !seen.has(r.sarpras.toLowerCase()))];
}
