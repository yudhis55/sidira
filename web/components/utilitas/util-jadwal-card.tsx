"use client";

import type { UtilItem } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  fulfillmentLabel,
  monthFulfillment,
  parseFrekuensi,
} from "@/lib/utilitas-frekuensi";

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// Warna badge frekuensi — GAS .freq-badge.{Harian|Mingguan|Bulanan|Semester|Tahunan}
const FREQ_BADGE_STYLE: Record<string, { background: string; color: string }> = {
  Harian: { background: "#d4f0eb", color: "#065f46" },
  Mingguan: { background: "#ede9fe", color: "#5b21b6" },
  Bulanan: { background: "#dbeafe", color: "#1e40af" },
  Semester: { background: "#fef3c7", color: "#92400e" },
  Tahunan: { background: "#fce7f3", color: "#9d174d" },
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export interface UtilJadwalCardProps {
  icon: string;
  year: number;
  items: UtilItem[];
  /** Set berisi key `${itemIndex}|YYYY-MM-DD` untuk sel yang sudah dikerjakan. */
  doneSet: Set<string>;
  onEdit: () => void;
}

/**
 * Kartu "Jadwal Pemeliharaan Tahunan" — porting GAS utilBuildJadwalCard:
 * matriks item × 12 bulan (✔ ada yang dikerjakan / · belum / — bulan mendatang)
 * dengan badge frekuensi per item.
 */
export function UtilJadwalCard({
  icon,
  year,
  items,
  doneSet,
  onEdit,
}: UtilJadwalCardProps) {
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;


  return (
    <div className="mb-5 overflow-hidden rounded-[10px] border border-line bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {/* Head — GAS .util-jadwal-head */}
      <div
        className="flex items-center gap-2.5 px-5 py-3 text-white"
        style={{ background: "linear-gradient(135deg,#0a3d32,#0e7c6b)" }}
      >
        <span className="text-lg leading-none" aria-hidden>
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="m-0 text-sm font-extrabold leading-tight">
            Jadwal Pemeliharaan Tahunan {year}
          </h3>
          <div className="mt-px text-[10px] opacity-70">
            {items.length} item pemeliharaan
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto flex items-center gap-1.5 rounded-[20px] border-[1.5px] border-white/35 bg-white/[0.12] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:border-white/60 hover:bg-white/[0.22]"
        >
          ✏️ Edit Jadwal
        </button>
      </div>

      {/* Table — GAS .util-jadwal-tbl */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="min-w-[200px] border border-line bg-[#f8fafc] px-2 py-1.5 text-left text-[10px] font-bold text-ink3">
                Kegiatan Pemeliharaan
              </th>
              {MONTH_NAMES_SHORT.map((b) => (
                <th
                  key={b}
                  className="border border-line bg-[#f8fafc] px-2 py-1.5 text-center text-[10px] font-bold text-ink3"
                >
                  {b}
                </th>
              ))}
              <th className="min-w-[110px] border border-line bg-[#f8fafc] px-2 py-1.5 text-center text-[10px] font-bold text-ink3">
                Frekuensi
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  className="border border-line px-2 py-6 text-center text-xs text-ink3"
                >
                  Belum ada item. Klik ✏️ Edit Jadwal untuk menambahkan.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={`${it.nama}-${idx}`} className="even:[&>td]:bg-[#fafafa]">
                  <td className="border border-line py-1.5 pl-3 pr-2 text-left font-semibold text-ink">
                    {it.nama}
                  </td>
                  {MONTH_NAMES_SHORT.map((b, mi) => {
                    const ym = `${year}-${pad2(mi + 1)}`;
                    const isFuture = ym > currentYm;
                    // Target vs realisasi sesuai frekuensi item (ket).
                    const freq = parseFrekuensi(it.ket);
                    const f = monthFulfillment(
                      freq,
                      doneSet,
                      idx,
                      year,
                      mi,
                      isFuture
                    );
                    const tip = `${it.nama} · ${ym}: ${fulfillmentLabel(
                      freq,
                      f.actual,
                      f.expected
                    )}`;
                    return (
                      <td
                        key={b}
                        title={tip}
                        className={cn(
                          "border border-line px-2 py-1.5 text-center",
                          isFuture && "text-[#e5e7eb]",
                          f.status === "terpenuhi" &&
                            "text-sm font-extrabold text-[#16a34a]",
                          f.status === "sebagian" &&
                            "text-[10px] font-extrabold text-[#d97706]"
                        )}
                        style={
                          !isFuture && f.status === "belum"
                            ? { color: "#fbbf24" }
                            : undefined
                        }
                      >
                        {f.status === "mendatang"
                          ? "—"
                          : f.status === "terpenuhi"
                            ? "✔"
                            : f.status === "sebagian"
                              ? `${f.actual}/${f.expected}`
                              : "·"}
                      </td>
                    );
                  })}
                  <td className="border border-line px-2 py-1.5 text-center text-[10px] text-ink3">
                    <span
                      className="inline-block rounded-[10px] px-2 py-0.5 text-[10px] font-bold"
                      style={
                        FREQ_BADGE_STYLE[it.ket ?? ""] ?? {
                          background: "var(--line2)",
                          color: "var(--ink3)",
                        }
                      }
                    >
                      {it.ket || "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
