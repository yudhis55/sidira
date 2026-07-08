"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getMockPemegang, getMockAsetPemegang } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import type { AsetPemegang, AsetPemegangJenis, PemegangInventaris } from "@/types/database";

/* ── constants ── */

const FILTER_CHIPS = [
  { key: "all", label: "Semua" },
  { key: "PNS", label: "PNS" },
  { key: "PPPK", label: "PPPK" },
  { key: "sudah", label: "\u2705 Sudah Pakta" },
  { key: "belum", label: "\u26a0 Belum Pakta" },
] as const;

const JENIS_META: Record<
  AsetPemegangJenis,
  { icon: string; label: string; bg: string; text: string }
> = {
  laptop: { icon: "\uD83D\uDCBB", label: "Laptop / PC", bg: "#dbeafe", text: "#1e40af" },
  kendaraan: { icon: "\uD83D\uDE97", label: "Kendaraan", bg: "#fef3c7", text: "#92400e" },
  alat: { icon: "\uD83D\uDD27", label: "Alat", bg: "#dbeafe", text: "#1e40af" },
  rumah: { icon: "\uD83C\uDFE0", label: "Rumah", bg: "#ede9fe", text: "#6d28d9" },
};

const JENIS_ORDER: AsetPemegangJenis[] = ["kendaraan", "laptop", "alat", "rumah"];

/* ── helpers ── */

function countByJenis(asetList: AsetPemegang[]) {
  const c: Record<AsetPemegangJenis, number> = { kendaraan: 0, laptop: 0, alat: 0, rumah: 0 };
  for (const a of asetList) c[a.jenis]++;
  return c;
}

/* ── page ── */

export default function RekapPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const pemegangList = useMemo(() => getMockPemegang(), []);
  const allAset = useMemo(() => getMockAsetPemegang(), []);

  // Group aset by pemegang_id
  const asetGrouped = useMemo(() => {
    const map: Record<string, AsetPemegang[]> = {};
    for (const aset of allAset) {
      if (!map[aset.pemegang_id]) map[aset.pemegang_id] = [];
      map[aset.pemegang_id].push(aset);
    }
    return map;
  }, [allAset]);

  // Stats
  const totalPemegang = pemegangList.length;
  const totalAset = allAset.length;

  // Filter rows
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pemegangList.filter((p) => {
      const okQ = !q || p.nama.toLowerCase().includes(q) || (p.jabatan || "").toLowerCase().includes(q);
      const okF =
        filter === "all" ? true :
        filter === "PNS" ? p.status === "PNS" :
        filter === "PPPK" ? p.status === "PPPK" :
        filter === "belum" ? true : // mock: all belum
        true;
      return okQ && okF;
    });
  }, [pemegangList, search, filter]);

  const toggleRow = (id: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* ── Header card (ri-hdr) ── */}
      <div
        className="flex items-center gap-3.5 rounded-lg border border-line bg-white p-5 mb-5"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        {/* Icon */}
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
        >
          📊
        </div>

        {/* Title + sub */}
        <div className="flex flex-col">
          <div className="text-lg font-extrabold text-ink">
            Rekap Pemegang Inventaris {new Date().getFullYear()}
          </div>
          <div className="text-xs text-ink3 mt-0.5">
            Puskesmas Baruharjo · Peralatan Mesin & Rumah Dinas
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2.5 ml-auto">
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-extrabold font-mono text-teal">{totalPemegang}</div>
            <div className="text-[10px] text-ink3 font-semibold">Pemegang</div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-extrabold font-mono text-teal">{totalAset}</div>
            <div className="text-[10px] text-ink3 font-semibold">Aset</div>
          </div>
        </div>
      </div>

      {/* ── Toolbar (ri-toolbar) ── */}
      <div className="flex gap-2.5 items-center flex-wrap mb-3.5">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Cari nama / jabatan..."
          className="flex-1 min-w-[200px] max-w-[300px] py-2 px-3.5 rounded-[10px] border border-line bg-white text-[13px] outline-none transition-colors focus:border-teal"
        />

        {/* Filter chips */}
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className="py-1.5 px-3.5 rounded-[20px] border text-[11px] font-bold transition-colors"
            style={
              filter === chip.key
                ? { background: "#059669", color: "#fff", borderColor: "#059669" }
                : { background: "var(--white)", color: "var(--ink3)", borderColor: "var(--line)" }
            }
          >
            {chip.label}
          </button>
        ))}

        {/* Buat Pakta button → navigates to /pakta/new */}
        <Link href="/pakta/new">
          <Button
            type="button"
            style={{
              background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
              color: "#fff",
              border: "none",
              boxShadow: "0 3px 10px rgba(37,99,235,0.25)",
              fontSize: "12px",
              fontWeight: 700,
              padding: "9px 18px",
              borderRadius: "10px",
            }}
          >
            📜 Buat Pakta
          </Button>
        </Link>
      </div>

      {/* ── Table (ri-wrap + ri-tbl) ── */}
      <div
        className="rounded-lg border border-line bg-white overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-ink3">
            Tidak ada data yang cocok
          </div>
        ) : (
          <table className="w-full border-collapse text-[12.5px]">
            {/* Header */}
            <thead>
              <tr>
                {["Nama / NIP", "Jabatan", "Status", "Inventaris Dipegang", "Pakta", "Aksi"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-left whitespace-nowrap"
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

            {/* Body */}
            <tbody>
              {filtered.map((pemegang) => {
                const asetList = asetGrouped[pemegang.id] || [];
                const counts = countByJenis(asetList);
                const isOpen = openRows.has(pemegang.id);

                return (
                  <RekapRow
                    key={pemegang.id}
                    pemegang={pemegang}
                    asetList={asetList}
                    counts={counts}
                    isOpen={isOpen}
                    onToggle={() => toggleRow(pemegang.id)}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Row component ── */

function RekapRow({
  pemegang,
  asetList,
  counts,
  isOpen,
  onToggle,
}: {
  pemegang: PemegangInventaris;
  asetList: AsetPemegang[];
  counts: Record<AsetPemegangJenis, number>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  // Status badge
  const isPppk = pemegang.status.toUpperCase() === "PPPK";
  const statusBadgeStyle = isPppk
    ? { background: "#dbeafe", color: "#1e40af" }
    : { background: "#d1fae5", color: "#065f46" };

  // Inventaris badges
  const badges = JENIS_ORDER.filter((j) => counts[j] > 0).map((j) => {
    const meta = JENIS_META[j];
    return (
      <span
        key={j}
        className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold mr-1"
        style={{ background: meta.bg, color: meta.text }}
      >
        {meta.icon} {counts[j]}
      </span>
    );
  });

  // Pakta badge (mock: all belum)
  const paktaBadge = (
    <span
      className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold"
      style={{ background: "#fee2e2", color: "#b91c1c" }}
    >
      ⚠ Belum
    </span>
  );

  return (
    <>
      {/* Main row */}
      <tr
        onClick={onToggle}
        className="cursor-pointer"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <td className="px-3 py-2.5">
          <div className="font-bold text-ink">{pemegang.nama}</div>
          <div className="text-[10.5px] text-ink3 font-mono mt-px">
            NIP. {pemegang.nip || "\u2014"}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className="text-xs font-semibold text-ink">{pemegang.jabatan || "\u2014"}</div>
        </td>
        <td className="px-3 py-2.5">
          <span
            className="inline-block py-0.5 px-2 rounded-lg text-[10.5px] font-bold"
            style={statusBadgeStyle}
          >
            {pemegang.status}
          </span>
        </td>
        <td className="px-3 py-2.5">
          {badges.length > 0 ? badges : <span className="text-ink3 text-[11px]">—</span>}
        </td>
        <td className="px-3 py-2.5">{paktaBadge}</td>
        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggle}
            className="py-1 px-2.5 rounded-md border text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-teal hover:text-teal mr-1"
          >
            📋 Detail
          </button>
          <Link href="/pakta/new">
            <button className="py-1 px-2.5 rounded-md border text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-blue hover:text-blue">
              📜 Pakta
            </button>
          </Link>
        </td>
      </tr>

      {/* Detail row */}
      {isOpen && (
        <tr>
          <td colSpan={6} className="p-0" style={{ borderBottom: "1px solid var(--line)" }}>
            <div className="p-3" style={{ background: "#f0fdf4" }}>
              <DetailGrid asetList={asetList} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Detail expand (ri-detail-inner + ri-detail-grid) ── */

function DetailGrid({ asetList }: { asetList: AsetPemegang[] }) {
  const grouped = useMemo(() => {
    const map: Partial<Record<AsetPemegangJenis, AsetPemegang[]>> = {};
    for (const j of JENIS_ORDER) {
      const items = asetList.filter((a) => a.jenis === j);
      if (items.length > 0) map[j] = items;
    }
    return map;
  }, [asetList]);

  const keys = JENIS_ORDER.filter((j) => grouped[j]);

  if (keys.length === 0) {
    return (
      <div className="text-center py-3.5 text-ink3 text-[11.5px]">
        Tidak ada inventaris
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      {keys.map((jenis) => {
        const meta = JENIS_META[jenis];
        const items = grouped[jenis]!;
        return (
          <div
            key={jenis}
            className="bg-white rounded-lg border border-line p-2.5 px-3.5"
          >
            <h4 className="text-[10px] font-extrabold text-ink3 uppercase tracking-wide mb-1.5">
              {meta.icon} {meta.label} ({items.length})
            </h4>
            {items.map((item) => (
              <div
                key={item.id}
                className="text-[11.5px] text-ink2 py-0.5 border-b border-line last:border-0"
              >
                <b className="font-semibold block">
                  {item.merk || item.ket || "—"}
                </b>
                <small className="text-[10.5px] text-ink3">
                  {item.type ? `${item.type}` : ""}
                  {item.tahun ? ` · ${item.tahun}` : ""}
                  {item.harga ? ` · Rp ${item.harga}` : ""}
                  {item.nopol ? ` · ${item.nopol}` : ""}
                </small>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
