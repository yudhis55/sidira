"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import type {
  PemegangInventaris,
  AsetPemegang,
  AsetPemegangJenis,
} from "@/types/database";

interface RekapTableProps {
  pemegangList: PemegangInventaris[];
  asetList: AsetPemegang[];
  /** Optional map pemegang_id → pakta id (mock). */
  paktaMap?: Record<string, string | null>;
}

const JENIS_META: Record<
  AsetPemegangJenis,
  { icon: string; label: string; bg: string; text: string }
> = {
  laptop: {
    icon: "\uD83D\uDCBB",
    label: "Laptop / PC",
    bg: "#dbeafe",
    text: "#1e40af",
  },
  kendaraan: {
    icon: "\uD83D\uDE97",
    label: "Kendaraan",
    bg: "#fef3c7",
    text: "#92400e",
  },
  alat: {
    icon: "\uD83D\uDD27",
    label: "Alat Lainnya",
    bg: "#dbeafe",
    text: "#1e40af",
  },
  rumah: {
    icon: "\uD83C\uDFE0",
    label: "Rumah Dinas",
    bg: "#ede9fe",
    text: "#6d28d9",
  },
};

const JENIS_ORDER: AsetPemegangJenis[] = [
  "laptop",
  "kendaraan",
  "alat",
  "rumah",
];

function countByJenis(
  asetList: AsetPemegang[],
): Record<AsetPemegangJenis, number> {
  const c: Record<AsetPemegangJenis, number> = {
    kendaraan: 0,
    laptop: 0,
    alat: 0,
    rumah: 0,
  };
  for (const a of asetList) c[a.jenis]++;
  return c;
}

/**
 * Reusable rekap table (GAS .ri-tbl) — mock-only, gas styling, emoji actions.
 * List page inlines a similar table; this component is for reuse / detail embeds.
 */
export function RekapTable({
  pemegangList,
  asetList,
  paktaMap = {},
}: RekapTableProps) {
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const asetGrouped = useMemo(() => {
    const map: Record<string, AsetPemegang[]> = {};
    for (const aset of asetList) {
      if (!map[aset.pemegang_id]) map[aset.pemegang_id] = [];
      map[aset.pemegang_id].push(aset);
    }
    return map;
  }, [asetList]);

  const toggle = (id: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (pemegangList.length === 0) {
    return (
      <div className="text-center py-12 text-ink3 text-[13px]">
        <div className="text-3xl mb-2" aria-hidden>
          {"\uD83D\uDCE6"}
        </div>
        Tidak ada data yang cocok
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {[
              "Nama / NIP",
              "Jabatan",
              "Status",
              "Inventaris Dipegang",
              "Pakta",
              "Aksi",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-[10px] text-[10px] font-bold uppercase tracking-[0.4px] text-left whitespace-nowrap"
                style={{
                  background: "#ecfdf5",
                  color: "#065f46",
                  borderBottom: "2px solid #a7f3d0",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pemegangList.map((p) => {
            const items = asetGrouped[p.id] || [];
            const counts = countByJenis(items);
            const isOpen = openRows.has(p.id);
            const hasPakta = !!paktaMap[p.id];
            const isPppk = p.status.toUpperCase() === "PPPK";

            return (
              <>
                <tr
                  key={p.id}
                  className="cursor-pointer"
                  style={{ borderBottom: "1px solid var(--line)" }}
                  onClick={() => toggle(p.id)}
                >
                  <td className="px-3 py-[10px]">
                    <div className="font-bold text-ink">{p.nama}</div>
                    <div className="text-[10.5px] text-ink3 font-mono mt-px">
                      NIP. {p.nip || "\u2014"}
                    </div>
                  </td>
                  <td className="px-3 py-[10px] text-xs font-semibold text-ink">
                    {p.jabatan || "\u2014"}
                  </td>
                  <td className="px-3 py-[10px]">
                    <span
                      className="inline-block py-0.5 px-2 rounded-lg text-[10.5px] font-bold"
                      style={
                        isPppk
                          ? { background: "#dbeafe", color: "#1e40af" }
                          : { background: "#d1fae5", color: "#065f46" }
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-[10px]">
                    {JENIS_ORDER.filter((j) => counts[j] > 0).map((j) => {
                      const m = JENIS_META[j];
                      return (
                        <span
                          key={j}
                          className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold mr-1"
                          style={{ background: m.bg, color: m.text }}
                        >
                          {m.icon} {counts[j]}
                        </span>
                      );
                    })}
                    {items.length === 0 && (
                      <span className="text-ink3 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-[10px]">
                    {hasPakta ? (
                      <span
                        className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold"
                        style={{ background: "#d1fae5", color: "#065f46" }}
                      >
                        {"\u2705"} Ada
                      </span>
                    ) : (
                      <span
                        className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold"
                        style={{ background: "#fee2e2", color: "#b91c1c" }}
                      >
                        {"\u26a0"} Belum
                      </span>
                    )}
                  </td>
                  <td
                    className="px-3 py-[10px] align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap gap-[3px]">
                      <button
                        type="button"
                        className="py-1 px-2.5 rounded-md border-[1.5px] border-line text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-[#059669] hover:text-[#059669]"
                        onClick={() => toggle(p.id)}
                      >
                        {"\uD83D\uDCCB"} Detail
                      </button>
                      <Link href={`/rekap/${p.id}`}>
                        <button
                          type="button"
                          className="py-1 px-2.5 rounded-md border-[1.5px] border-line text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-[#059669] hover:text-[#059669]"
                        >
                          {"\u270F\uFE0F"} Edit
                        </button>
                      </Link>
                      <Link href="/pakta/new">
                        <button
                          type="button"
                          className="py-1 px-2.5 rounded-md border-[1.5px] border-line text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-[#1e40af] hover:text-[#1e40af]"
                        >
                          {"\uD83D\uDCDC"} Pakta
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr key={`${p.id}-det`}>
                    <td
                      colSpan={6}
                      className="p-0"
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      <div className="p-3" style={{ background: "#f0fdf4" }}>
                        <ExpandGrid items={items} />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ExpandGrid({ items }: { items: AsetPemegang[] }) {
  const grouped = useMemo(() => {
    const map: Partial<Record<AsetPemegangJenis, AsetPemegang[]>> = {};
    for (const j of JENIS_ORDER) {
      const list = items.filter((a) => a.jenis === j);
      if (list.length) map[j] = list;
    }
    return map;
  }, [items]);

  const keys = JENIS_ORDER.filter((j) => grouped[j]);
  if (!keys.length) {
    return (
      <div className="text-center py-3.5 text-ink3 text-[11.5px]">
        Tidak ada inventaris
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-2">
      {keys.map((jenis) => {
        const meta = JENIS_META[jenis];
        const list = grouped[jenis]!;
        return (
          <div
            key={jenis}
            className="bg-white rounded-lg border border-line py-2.5 px-3.5"
          >
            <h4 className="text-[10px] font-extrabold text-ink3 uppercase tracking-[0.4px] mb-1.5">
              {meta.icon} {meta.label} ({list.length})
            </h4>
            {list.map((item) => (
              <div
                key={item.id}
                className="text-[11.5px] text-ink2 py-[3px] border-b border-line last:border-0"
              >
                <b className="font-semibold block">
                  {item.merk || item.ket || "—"}
                </b>
                <small className="text-[10.5px] text-ink3">
                  {[
                    item.type,
                    item.tahun,
                    item.harga ? `Rp ${item.harga}` : "",
                    item.nopol,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
