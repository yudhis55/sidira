"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  getMockPemegang,
  getMockAsetPemegang,
  getMockAsetByPemegang,
} from "@/lib/mock-data";
import { getPaktaList } from "@/lib/auth/pakta";
import type { Pakta } from "@/types/database";
import {
  addPaktaRecords,
  buildPaktaFromPemegang,
  findPaktaForPemegang,
  useAddedPakta,
  useHiddenPaktaIds,
} from "@/lib/pakta-store";
import {
  addPemegang,
  getMergedPemegang,
  savePemegangIdentity,
  useAddedPemegang,
  usePemegangOverrides,
  type PemegangIdentity,
} from "@/lib/pemegang-store";
import { Button } from "@/components/gas/button";
import { PemegangFormDialog } from "@/components/rekap/pemegang-form-dialog";
import { RekapPaktaButton } from "@/components/rekap/pakta-button";
import type {
  AsetPemegang,
  AsetPemegangJenis,
  PemegangInventaris,
} from "@/types/database";

/* ── constants (GAS .ri-*) ── */

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

/** Status pakta per pemegang — GAS `riHasPakta(nama)`: cocok via nama. */
function usePaktaLookup() {
  const [addedPakta] = useAddedPakta();
  const [hiddenIds] = useHiddenPaktaIds();
  // Daftar arsip live Supabase (pengganti mock) untuk status + cegah ganda.
  const [staticPakta, setStaticPakta] = useState<Pakta[]>([]);
  useEffect(() => {
    let cancelled = false;
    getPaktaList()
      .then((list) => {
        if (!cancelled) setStaticPakta(list);
      })
      .catch(() => {
        if (!cancelled) setStaticPakta([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const hasPakta = (p: PemegangInventaris) =>
    !!findPaktaForPemegang(p.nama, staticPakta, addedPakta, hiddenIds);
  return { hasPakta };
}

function countByJenis(asetList: AsetPemegang[]) {
  const c: Record<AsetPemegangJenis, number> = {
    kendaraan: 0,
    laptop: 0,
    alat: 0,
    rumah: 0,
  };
  for (const a of asetList) c[a.jenis]++;
  return c;
}

export default function RekapPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const [addedPemegang] = useAddedPemegang();
  const [pemegangOverrides] = usePemegangOverrides();
  const pemegangList = useMemo(
    () => getMergedPemegang(getMockPemegang(), addedPemegang, pemegangOverrides),
    [addedPemegang, pemegangOverrides]
  );
  const allAset = useMemo(() => getMockAsetPemegang(), []);
  const { hasPakta } = usePaktaLookup();

  const asetGrouped = useMemo(() => {
    const map: Record<string, AsetPemegang[]> = {};
    for (const aset of allAset) {
      if (!map[aset.pemegang_id]) map[aset.pemegang_id] = [];
      map[aset.pemegang_id].push(aset);
    }
    return map;
  }, [allAset]);

  const totalPemegang = pemegangList.length;
  const totalAset = allAset.length;
  const sudahPakta = pemegangList.filter((p) => hasPakta(p)).length;
  const belumPakta = totalPemegang - sudahPakta;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pemegangList.filter((p) => {
      const okQ =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        (p.jabatan || "").toLowerCase().includes(q) ||
        (p.nip || "").toLowerCase().includes(q);
      if (!okQ) return false;
      if (filter === "all") return true;
      if (filter === "PNS") return p.status === "PNS";
      if (filter === "PPPK") return p.status === "PPPK";
      if (filter === "sudah") return hasPakta(p);
      if (filter === "belum") return !hasPakta(p);
      return true;
    });
  }, [pemegangList, search, filter, hasPakta]);

  const toggleRow = (id: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** GAS `riBuatSemuaPakta` — buat pre-filled untuk semua yg belum (yg terfilter). */
  const handleBuatSemuaPakta = () => {
    const belum = filtered.filter((p) => !hasPakta(p));
    if (belum.length === 0) {
      toast.info("Semua pemegang sudah memiliki Pakta");
      return;
    }
    if (
      !confirm(
        `Buat Pakta Integritas untuk ${belum.length} pemegang yang belum?\nData lampiran diisi otomatis.`
      )
    )
      return;
    const recs = belum.map((p, i) =>
      buildPaktaFromPemegang(
        p,
        asetGrouped[p.id] || getMockAsetByPemegang(p.id),
        `pakta-${Date.now()}-${i}`
      )
    );
    addPaktaRecords(recs);
    toast.success(
      `${recs.length} pakta + lampiran dibuat otomatis dari rekap (mode demo)`
    );
  };

  return (
    <div>
      {/* ── Header (GAS .ri-hdr) ── */}
      <div
        className="flex items-center gap-3.5 rounded-lg border border-line bg-white p-5 mb-5"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
          style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          aria-hidden
        >
          {"\uD83D\uDCCA"}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="text-lg font-extrabold text-ink">
            Rekap Pemegang Inventaris 2025
          </div>
          <div className="text-xs text-ink3 mt-0.5">
            Puskesmas Baruharjo · Peralatan Mesin & Rumah Dinas
          </div>
        </div>

        {/* Summary chips — GAS .ri-stat: Pemegang / Item / Pakta Ada / Belum */}
        <div className="flex gap-2.5 ml-auto flex-wrap justify-end">
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-black font-mono text-teal leading-none">
              {totalPemegang}
            </div>
            <div className="text-[10px] text-ink3 font-semibold mt-0.5">
              Pemegang
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-black font-mono text-teal leading-none">
              {totalAset}
            </div>
            <div className="text-[10px] text-ink3 font-semibold mt-0.5">
              Item
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div
              className="text-xl font-black font-mono leading-none"
              style={{ color: "#1d4ed8" }}
            >
              {sudahPakta}
            </div>
            <div className="text-[10px] text-ink3 font-semibold mt-0.5">
              Pakta Ada
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div
              className="text-xl font-black font-mono leading-none"
              style={{ color: "#b91c1c" }}
            >
              {belumPakta}
            </div>
            <div className="text-[10px] text-ink3 font-semibold mt-0.5">
              Belum
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar (GAS .ri-toolbar) ── */}
      <div className="flex gap-2.5 items-center flex-wrap mb-3.5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={"\uD83D\uDD0D Cari nama / jabatan..."}
          className="flex-1 min-w-[200px] max-w-[300px] py-[9px] px-3.5 rounded-[10px] border-[1.5px] border-line bg-white text-[13px] outline-none transition-colors focus:border-[#059669]"
          aria-label="Cari pemegang"
        />

        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setFilter(chip.key)}
            className="py-1.5 px-3.5 rounded-[20px] border-[1.5px] text-[11px] font-bold transition-colors"
            style={
              filter === chip.key
                ? {
                    background: "#059669",
                    color: "#fff",
                    borderColor: "#059669",
                  }
                : {
                    background: "var(--white, #fff)",
                    color: "var(--ink3)",
                    borderColor: "var(--line)",
                  }
            }
          >
            {chip.label}
          </button>
        ))}

        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ marginLeft: "auto" }}
        >
          <Button
            type="button"
            onClick={handleBuatSemuaPakta}
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
            {"\uD83D\uDCDC"} Buat Pakta Semua
          </Button>

          <PemegangFormDialog
            key="pemegang-new"
            trigger={
              <Button
                type="button"
                className="text-[12px]"
                style={{
                  background: "linear-gradient(135deg, #059669, #047857)",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 3px 10px rgba(5,150,105,0.25)",
                }}
              >
                <span className="mr-1" aria-hidden>
                  {"\u2795"}
                </span>
                Tambah Pemegang
              </Button>
            }
            onSaved={(values: PemegangIdentity) => {
              const rec = addPemegang(values);
              toast.success(
                `Pemegang "${rec.nama}" ditambahkan (mode demo — tersimpan lokal)`
              );
            }}
          />
        </div>
      </div>

      {/* ── Table (GAS .ri-wrap + .ri-tbl) ── */}
      <div
        className="rounded-lg border border-line bg-white overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {filtered.length === 0 ? (
          <div
            className="text-center text-ink3 text-[13px]"
            style={{ padding: "48px" }}
          >
            Tidak ada data yang cocok
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr>
                  {(
                    [
                      { label: "Nama / NIP" },
                      { label: "Jabatan" },
                      { label: "Status" },
                      { label: "Inventaris Dipegang" },
                      { label: "Pakta" },
                      { label: "Aksi", minWidth: "140px" },
                    ] as { label: string; minWidth?: string }[]
                  ).map((h) => (
                    <th
                      key={h.label}
                      className="px-3 py-[10px] text-[10px] font-bold uppercase tracking-[0.4px] text-left whitespace-nowrap"
                      style={{
                        background: "#ecfdf5",
                        color: "#065f46",
                        borderBottom: "2px solid #a7f3d0",
                        ...(h.minWidth ? { minWidth: h.minWidth } : null),
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
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
                      hasPakta={hasPakta(pemegang)}
                      onToggle={() => toggleRow(pemegang.id)}
                      onEdit={(values: PemegangIdentity) => {
                        savePemegangIdentity(pemegang.id, values);
                        toast.success(
                          `Identitas "${values.nama.trim()}" disimpan (mode demo — tersimpan lokal). Selebihnya edit di menu Pakta.`
                        );
                      }}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Row (GAS .ri-tbl tbody) ── */

function RekapRow({
  pemegang,
  asetList,
  counts,
  isOpen,
  hasPakta,
  onToggle,
  onEdit,
}: {
  pemegang: PemegangInventaris;
  asetList: AsetPemegang[];
  counts: Record<AsetPemegangJenis, number>;
  isOpen: boolean;
  hasPakta: boolean;
  onToggle: () => void;
  onEdit: (values: PemegangIdentity) => void;
}) {
  const isPppk = pemegang.status.toUpperCase() === "PPPK";
  const statusBadgeStyle = isPppk
    ? { background: "#dbeafe", color: "#1e40af" }
    : { background: "#d1fae5", color: "#065f46" };

  const badges = JENIS_ORDER.filter((j) => counts[j] > 0).map((j) => {
    const meta = JENIS_META[j];
    return (
      <span
        key={j}
        className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold mr-[3px] mb-0.5"
        style={{ background: meta.bg, color: meta.text }}
      >
        {meta.icon} {counts[j]}
      </span>
    );
  });

const paktaBadge = hasPakta ? (
    <span
      className="inline-block py-0.5 px-[9px] rounded-[10px] text-[10.5px] font-bold"
      style={{ background: "#d1fae5", color: "#065f46" }}
    >
      {"\u2705"} Ada
    </span>
  ) : (
    <span
      className="inline-block py-0.5 px-[9px] rounded-[10px] text-[10.5px] font-bold"
      style={{ background: "#fee2e2", color: "#b91c1c" }}
    >
      {"\u26a0"} Belum
    </span>
  );

  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer transition-colors"
        style={{ borderBottom: "1px solid var(--line)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f0fdf4";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "";
        }}
      >
        <td className="px-3 py-[10px] align-middle">
          <div className="font-bold text-ink">{pemegang.nama}</div>
          <div className="text-[10.5px] text-ink3 font-mono mt-px">
            NIP. {pemegang.nip || "\u2014"}
          </div>
        </td>
        <td className="px-3 py-[10px] align-middle">
          <div className="text-xs font-semibold text-ink">
            {pemegang.jabatan || "\u2014"}
          </div>
        </td>
        <td className="px-3 py-[10px] align-middle">
          <span
            className="inline-block py-0.5 px-2 rounded-[8px] text-[10.5px] font-bold"
            style={statusBadgeStyle}
          >
            {pemegang.status}
          </span>
        </td>
        <td className="px-3 py-[10px] align-middle">
          {badges.length > 0 ? (
            badges
          ) : (
            <span className="text-ink3 text-[11px]">—</span>
          )}
        </td>
        <td className="px-3 py-[10px] align-middle">{paktaBadge}</td>
        <td
          className="px-3 py-[10px] align-middle"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-[3px]">
            <button
              type="button"
              onClick={onToggle}
              className="py-1 px-2.5 rounded-md border-[1.5px] border-line text-[11px] font-semibold text-ink2 bg-white transition-colors hover:border-[#059669] hover:text-[#059669]"
            >
              {"\uD83D\uDCCB"} Detail
            </button>
            <PemegangFormDialog
              key={`pemegang-edit-${pemegang.id}`}
              pemegang={pemegang}
              trigger={
                <button
                  type="button"
                  className="py-1 px-2.5 rounded-md border-[1.5px] border-[#059669] text-[11px] font-semibold text-[#059669] bg-[#ecfdf5] transition-colors hover:bg-[#059669] hover:text-white"
                >
                  {"\u270F\uFE0F"} Edit
                </button>
              }
              onSaved={onEdit}
            />
            <RekapPaktaButton pemegang={pemegang} asetList={asetList} />
          </div>
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td
            colSpan={6}
            className="p-0"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <div className="px-2 py-3" style={{ background: "#f0fdf4" }}>
              <DetailGrid asetList={asetList} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Expand (GAS .ri-detail-grid) ── */

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-2">
      {keys.map((jenis) => {
        const meta = JENIS_META[jenis];
        const items = grouped[jenis]!;
        return (
          <div
            key={jenis}
            className="bg-white rounded-lg border border-line py-2.5 px-3.5"
          >
            <h4 className="text-[10px] font-extrabold text-ink3 uppercase tracking-[0.4px] mb-1.5">
              {meta.icon} {meta.label} ({items.length})
            </h4>
            {items.map((item) => (
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
