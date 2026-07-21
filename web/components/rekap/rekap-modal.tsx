"use client";

import * as React from "react";
import { Dialog } from "@/components/gas/dialog";
import { getMockRooms } from "@/lib/mock-data/rooms";
import { getMockItems } from "@/lib/mock-data/items";
import type { Item, ItemCategory, ItemCondition, Room } from "@/types/database";
import { cn } from "@/lib/utils";

export interface RekapModalProps {
  open: boolean;
  onClose: () => void;
  /** Active room id for "Ruangan Aktif" scope (room detail page). */
  currentRoomId?: string;
}

type RekapScope = "all" | "current";
type RekapKat = "all" | ItemCategory;
type RekapFilter = "all" | "masalah";

interface RekapRow {
  kat: ItemCategory;
  nama: string;
  spec: string;
  tahun: string;
  merek: string;
  noreg: string;
  sat: string;
  std: string;
  jml: string;
  kondisi: ItemCondition;
  catatan: string;
}

interface RekapRoomGroup {
  id: string;
  name: string;
  icon: string;
  items: RekapRow[];
}

const KAT_LABEL: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

const KONDISI_LABEL: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

const KONDISI_BADGE: Record<ItemCondition, string> = {
  baik: "bg-[#dcfce7] text-[#166534]",
  rr: "bg-[#fef9c3] text-[#854d0e]",
  rb: "bg-[#fee2e2] text-[#b91c1c]",
  ta: "bg-[#f1f5f9] text-[#475569]",
};

const KAT_HEAD: Record<ItemCategory, string> = {
  alkes: "bg-[#d4f0eb] text-[#0e7c6b]",
  meubelair: "bg-[#fef3c7] text-[#92400e]",
  elektronik: "bg-[#dbeafe] text-[#1e40af]",
  lainnya: "bg-[#f1f5f9] text-[#475569]",
};

const KAT_ORDER: ItemCategory[] = [
  "alkes",
  "meubelair",
  "elektronik",
  "lainnya",
];

function itemToRow(item: Item): RekapRow {
  const merekParts = [item.merk, item.type].filter(Boolean);
  return {
    kat: item.category,
    nama: item.name,
    spec: item.spec ?? "",
    tahun: item.year != null ? String(item.year) : "",
    merek: merekParts.join(" / "),
    noreg: item.noreg ?? item.no_seri ?? item.kode_barang ?? "",
    sat: item.unit || "—",
    std: item.std != null ? String(item.std) : "—",
    jml: String(item.quantity ?? 0),
    kondisi: item.condition,
    catatan: item.notes ?? "",
  };
}

function collectRekapData(
  rooms: Room[],
  items: Item[],
  scope: RekapScope,
  kat: RekapKat,
  filter: RekapFilter,
  currentRoomId?: string
): RekapRoomGroup[] {
  const katList: ItemCategory[] =
    kat === "all" ? KAT_ORDER : [kat as ItemCategory];

  const result: RekapRoomGroup[] = [];

  for (const room of rooms) {
    if (scope === "current") {
      if (!currentRoomId || room.id !== currentRoomId) continue;
    }

    const roomItems = items.filter((it) => {
      if (it.room_id !== room.id) return false;
      if (!katList.includes(it.category)) return false;
      if (filter === "masalah" && it.condition === "baik") return false;
      if (!it.name?.trim()) return false;
      return true;
    });

    if (roomItems.length === 0) continue;

    result.push({
      id: room.id,
      name: room.name,
      icon: room.icon,
      items: roomItems.map(itemToRow),
    });
  }

  return result;
}

function formatTglCetak(d: Date): string {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OptBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl border-[1.5px] px-3 py-[5px] text-[11.5px] font-semibold transition-[background,color,border-color] duration-150",
        active
          ? "border-[#0e7c6b] bg-[#0e7c6b] text-white"
          : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#0e7c6b] hover:bg-[#0e7c6b] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

/**
 * GAS `#rekapModalBg` / `openRekapModal` parity — rekap kondisi sarana & alkes
 * from mock rooms/items. Filters: scope / kategori / bermasalah + print.
 */
export function RekapModal({
  open,
  onClose,
  currentRoomId,
}: RekapModalProps) {
  const [scope, setScope] = React.useState<RekapScope>("all");
  const [kat, setKat] = React.useState<RekapKat>("all");
  const [filter, setFilter] = React.useState<RekapFilter>("all");
  const [kapus, setKapus] = React.useState("");
  const [nipKapus, setNipKapus] = React.useState("");
  const [pengurus, setPengurus] = React.useState("");
  const [nipPengurus, setNipPengurus] = React.useState("");
  const [kota, setKota] = React.useState("Trenggalek");

  // Filter defaults reset via parent remount key={open ? "rekap-open" : "rekap-closed"}

  const rooms = React.useMemo(() => getMockRooms(), []);
  const items = React.useMemo(() => getMockItems(), []);

  const data = React.useMemo(
    () =>
      collectRekapData(rooms, items, scope, kat, filter, currentRoomId),
    [rooms, items, scope, kat, filter, currentRoomId]
  );

  const allItems = React.useMemo(
    () => data.flatMap((r) => r.items),
    [data]
  );

  const stats = React.useMemo(() => {
    const baik = allItems.filter((i) => i.kondisi === "baik").length;
    const rr = allItems.filter((i) => i.kondisi === "rr").length;
    const rb = allItems.filter((i) => i.kondisi === "rb").length;
    const ta = allItems.filter((i) => i.kondisi === "ta").length;
    const total = allItems.length;
    const pctBaik = total ? Math.round((baik / total) * 100) : 0;
    return { baik, rr, rb, ta, total, pctBaik };
  }, [allItems]);

  const now = React.useMemo(() => new Date(), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const tglCetak = formatTglCetak(now);
  const year = now.getFullYear();

  const scopeLabel = scope === "all" ? "Semua Ruangan" : "Ruangan Aktif";
  const katFilterLabel =
    kat === "all" ? "Semua Kategori" : KAT_LABEL[kat as ItemCategory] || kat;
  const filterLabel =
    filter === "masalah" ? "Bermasalah Saja" : "Semua Kondisi";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} size="xl" zIndex={3000}>
      {/* Head — GAS .rekap-modal-head teal; print CTA uses .btn-rekap blue */}
      <div
        className="flex shrink-0 items-center gap-3.5 px-6 py-[18px]"
        style={{
          background: "linear-gradient(135deg, #0a3d32, #0e7c6b)",
        }}
      >
        <div className="text-[28px] leading-none" aria-hidden>
          📊
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[17px] font-extrabold leading-tight text-white">
            Rekap Kondisi Sarana Prasarana & Alkes
          </h2>
          <p className="mt-0.5 mb-0 text-xs text-white/65">
            Puskesmas Baruharjo — Trenggalek · SIDIRA {year}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 cursor-pointer rounded-lg border border-white/20 bg-white/12 px-[13px] py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/22"
        >
          ✕ Tutup
        </button>
      </div>

      {/* Options — GAS .rekap-options */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#e2e8ef] bg-[#f8fafc] px-6 py-[18px]">
        <div className="flex flex-wrap items-center gap-2">
          <label className="whitespace-nowrap text-xs font-bold text-[#374151]">
            Ruangan:
          </label>
          <OptBtn active={scope === "all"} onClick={() => setScope("all")}>
            Semua Ruangan
          </OptBtn>
          <OptBtn
            active={scope === "current"}
            onClick={() => setScope("current")}
          >
            Ruangan Aktif
          </OptBtn>
        </div>

        <div className="ml-2.5 flex flex-wrap items-center gap-2">
          <label className="whitespace-nowrap text-xs font-bold text-[#374151]">
            Kategori:
          </label>
          <OptBtn active={kat === "all"} onClick={() => setKat("all")}>
            Semua
          </OptBtn>
          <OptBtn active={kat === "alkes"} onClick={() => setKat("alkes")}>
            🩺 Alkes
          </OptBtn>
          <OptBtn
            active={kat === "meubelair"}
            onClick={() => setKat("meubelair")}
          >
            🪑 Meubelair
          </OptBtn>
          <OptBtn
            active={kat === "elektronik"}
            onClick={() => setKat("elektronik")}
          >
            💻 Elektronik
          </OptBtn>
        </div>

        <div className="ml-2.5 flex flex-wrap items-center gap-2">
          <label className="whitespace-nowrap text-xs font-bold text-[#374151]">
            Filter kondisi:
          </label>
          <OptBtn active={filter === "all"} onClick={() => setFilter("all")}>
            Semua
          </OptBtn>
          <OptBtn
            active={filter === "masalah"}
            onClick={() => setFilter("masalah")}
          >
            ⚠ Bermasalah
          </OptBtn>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto flex cursor-pointer items-center gap-[7px] rounded-lg border-0 bg-[#1d4ed8] px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#1e40af]"
        >
          🖨️ Cetak / PDF
        </button>
      </div>

      {/* Preview / printable doc */}
      <div
        id="rekap-print-area"
        className="overflow-y-auto px-6 py-6"
        style={{ maxHeight: "min(70vh, calc(100vh - 220px))" }}
      >
        {/* Kop */}
        <div className="mb-3.5 flex items-center gap-4 border-b-[3px] border-[#0e7c6b] pb-2.5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent p-0.5"
            style={{
              background: "linear-gradient(145deg, #0a3d32, #14a98f)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-puskesmas.png"
              alt="Logo Puskesmas"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 mb-0.5 text-[15px] font-black tracking-tight text-[#0a3d32]">
              PUSKESMAS BARUHARJO
            </h1>
            <p className="m-0 text-[10px] text-[#374151]">
              Jl. Raya Baruharjo, Kecamatan Durenan, Kabupaten Trenggalek —
              Jawa Timur
            </p>
            <p className="mt-0.5 mb-0 text-[9.5px] text-[#6b7280]">
              Telp. (0355) · Email: puskesmas.baruharjo@trenggalekkab.go.id
            </p>
          </div>
        </div>

        {/* Title box */}
        <div className="my-3 rounded-lg bg-[#0e7c6b] px-2.5 py-2.5 text-center">
          <h2 className="m-0 mb-0.5 text-[13px] font-black uppercase tracking-wide text-white">
            Rekap Kondisi Sarana Prasarana & Alat Kesehatan
          </h2>
          <p className="m-0 text-[10px] text-white/80">
            {scopeLabel} · {katFilterLabel} · {filterLabel}
          </p>
        </div>

        {/* Meta */}
        <div className="mb-3.5 flex overflow-hidden rounded-md border border-[#d1d5db]">
          {[
            { dt: "Tanggal Cetak", dd: tglCetak },
            { dt: "Total Ruangan", dd: `${data.length} ruangan` },
            { dt: "Total Item", dd: `${stats.total} item` },
            { dt: "Periode", dd: `Tahun ${year}` },
            { dt: "Dokumen", dd: "SIDIRA — Puskesmas Baruharjo" },
          ].map((m, i, arr) => (
            <div
              key={m.dt}
              className={cn(
                "flex-1 px-3 py-[7px]",
                i < arr.length - 1 && "border-r border-[#d1d5db]"
              )}
            >
              <div className="text-[8.5px] font-bold uppercase tracking-wide text-[#6b7280]">
                {m.dt}
              </div>
              <div className="mt-0.5 text-[11px] font-bold text-[#0a3d32]">
                {m.dd}
              </div>
            </div>
          ))}
        </div>

        {/* Summary cards */}
        <div className="mb-3.5 flex flex-wrap gap-2">
          <SummaryCard
            ico="📦"
            val={stats.total}
            lbl="Total Item"
            valColor="#1d4ed8"
            className="border-[#93c5fd] bg-[#f0f9ff]"
          />
          <SummaryCard
            ico="✅"
            val={stats.baik}
            lbl={`Kondisi Baik (${stats.pctBaik}%)`}
            valColor="#166534"
            className="border-[#86efac] bg-[#f0fdf4]"
          />
          <SummaryCard
            ico="⚠️"
            val={stats.rr}
            lbl="Rusak Ringan"
            valColor="#92400e"
            className="border-[#fcd34d] bg-[#fffbeb]"
          />
          <SummaryCard
            ico="🔴"
            val={stats.rb}
            lbl="Rusak Berat"
            valColor="#b91c1c"
            className="border-[#fca5a5] bg-[#fef2f2]"
          />
          <SummaryCard
            ico="—"
            val={stats.ta}
            lbl="Tidak Ada"
            valColor="#475569"
            className="border-[#cbd5e1] bg-[#f8fafc]"
          />
        </div>

        {/* Per-room tables */}
        {data.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-[#9ca3af]">
            Tidak ada data untuk ditampilkan.
          </div>
        ) : (
          data.map((room) => {
            const rBaik = room.items.filter((i) => i.kondisi === "baik").length;
            const rMasalah = room.items.length - rBaik;
            const katGroups = KAT_ORDER.reduce(
              (acc, k) => {
                const list = room.items.filter((it) => it.kat === k);
                if (list.length) acc[k] = list;
                return acc;
              },
              {} as Partial<Record<ItemCategory, RekapRow[]>>
            );

            return (
              <div key={room.id} className="mt-4">
                <div
                  className="flex items-center gap-2.5 rounded-t-md px-3 py-[7px] text-white"
                  style={{
                    background: "linear-gradient(135deg, #0a3d32, #0e7c6b)",
                  }}
                >
                  <span className="text-base" aria-hidden>
                    {room.icon}
                  </span>
                  <span className="text-xs font-extrabold">{room.name}</span>
                  <span className="ml-auto text-[10px] text-white/75">
                    {room.items.length} item · {rBaik} baik
                    {rMasalah > 0 && (
                      <>
                        {" · "}
                        <span className="font-bold text-[#fcd34d]">
                          {rMasalah} masalah
                        </span>
                      </>
                    )}
                  </span>
                </div>

                {KAT_ORDER.map((k) => {
                  const list = katGroups[k];
                  if (!list?.length) return null;
                  return (
                    <div key={k}>
                      <div
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                          KAT_HEAD[k]
                        )}
                      >
                        {KAT_LABEL[k]} ({list.length} item)
                      </div>
                      <table className="mb-0 w-full border-collapse text-[10px]">
                        <thead>
                          <tr>
                            {[
                              ["28px", "No"],
                              [undefined, "Nama Barang & Spesifikasi"],
                              ["44px", "Tahun"],
                              ["90px", "Merek/Tipe"],
                              ["80px", "No. Register"],
                              ["40px", "Sat"],
                              ["38px", "Std"],
                              ["38px", "Ada"],
                              ["80px", "Kondisi"],
                              [undefined, "Keterangan"],
                            ].map(([w, label], hi) => (
                              <th
                                key={hi}
                                style={w ? { width: w } : undefined}
                                className="whitespace-nowrap border border-[#e2e8ef] bg-[#f8fafc] px-[7px] py-[5px] text-left text-[9px] font-bold uppercase tracking-wide text-[#374151]"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((it, idx) => (
                            <tr
                              key={`${room.id}-${k}-${idx}`}
                              className="even:bg-[#fafafa]"
                            >
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] text-center align-middle text-[#6b7280]">
                                {idx + 1}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] align-middle font-semibold">
                                {it.nama}
                                {it.spec ? (
                                  <div className="text-[8.5px] font-normal text-[#6b7280]">
                                    {it.spec}
                                  </div>
                                ) : null}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] align-middle">
                                {it.tahun || "—"}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] align-middle">
                                {it.merek || "—"}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] align-middle">
                                {it.noreg || "—"}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] text-center align-middle">
                                {it.sat || "—"}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] text-center align-middle">
                                {it.std || "—"}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] text-center align-middle font-bold">
                                {it.jml || "0"}
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] align-middle">
                                <span
                                  className={cn(
                                    "inline-block whitespace-nowrap rounded-[9px] px-[7px] py-px text-[9px] font-bold",
                                    KONDISI_BADGE[it.kondisi]
                                  )}
                                >
                                  {KONDISI_LABEL[it.kondisi]}
                                </span>
                              </td>
                              <td className="border border-[#e2e8ef] px-[7px] py-[5px] align-middle">
                                {it.catatan || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}

        {/* Tanda tangan */}
        <div className="mt-8 flex overflow-hidden rounded-lg border border-[#d1d5db]">
          <div className="flex-1 border-r border-[#d1d5db] px-5 py-4 text-center">
            <div className="mb-1 text-[10px] font-bold text-[#374151]">
              Mengetahui,
            </div>
            <div className="mb-16 text-[9px] text-[#6b7280]">
              Kepala Puskesmas Baruharjo
            </div>
            <div className="mx-auto mb-1 w-3/4 border-t-[1.5px] border-[#374151]" />
            <div className="text-[10.5px] font-bold text-[#0a3d32]">
              {kapus || (
                <span className="italic text-[#9ca3af]">Nama Kepala</span>
              )}
            </div>
            <div className="mt-0.5 text-[9px] text-[#6b7280]">
              NIP. {nipKapus || "—"}
            </div>
          </div>
          <div className="flex-1 px-5 py-4 text-center">
            <div className="mb-1 text-[10px] font-bold text-[#374151]">
              {kota}, {now.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="mb-16 text-[9px] text-[#6b7280]">
              Pengurus Barang Pembantu
            </div>
            <div className="mx-auto mb-1 w-3/4 border-t-[1.5px] border-[#374151]" />
            <div className="text-[10.5px] font-bold text-[#0a3d32]">
              {pengurus || (
                <span className="italic text-[#9ca3af]">Nama Pengurus</span>
              )}
            </div>
            <div className="mt-0.5 text-[9px] text-[#6b7280]">
              NIP. {nipPengurus || "—"}
            </div>
          </div>
        </div>

        {/* Signature inputs (screen only — not critical for print) */}
        <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-dashed border-[#e5e7eb] bg-[#f8fafc] p-3 print:hidden">
          <SigField
            label="Nama Kepala Puskesmas"
            value={kapus}
            onChange={setKapus}
            placeholder="Nama Kepala, M.Kes"
          />
          <SigField
            label="NIP Kepala"
            value={nipKapus}
            onChange={setNipKapus}
            placeholder="19XXXXXX XXXXXX X XXX"
          />
          <SigField
            label="Nama Pengurus Barang Pembantu"
            value={pengurus}
            onChange={setPengurus}
            placeholder="Nama Pengurus, S.Kep"
          />
          <SigField
            label="NIP Pengurus Barang"
            value={nipPengurus}
            onChange={setNipPengurus}
            placeholder="19XXXXXX XXXXXX X XXX"
          />
          <SigField
            label="Kota Penandatanganan"
            value={kota}
            onChange={setKota}
            placeholder="Trenggalek"
            narrow
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e2e8ef] pt-2 text-[9px] text-[#9ca3af]">
          <span>
            SIDIRA — Sistem Digital Inventaris Ruangan Aset · Puskesmas
            Baruharjo, Trenggalek
          </span>
          <span>Dicetak: {tglCetak}</span>
        </div>
      </div>
    </Dialog>
  );
}

function SummaryCard({
  ico,
  val,
  lbl,
  valColor,
  className,
}: {
  ico: string;
  val: number;
  lbl: string;
  valColor: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-[100px] flex-1 items-center gap-2 rounded-lg border-[1.5px] px-3 py-2",
        className
      )}
    >
      <div className="text-lg" aria-hidden>
        {ico}
      </div>
      <div>
        <div
          className="text-xl font-black leading-none"
          style={{ color: valColor }}
        >
          {val}
        </div>
        <div className="mt-px text-[8.5px] font-semibold text-[#6b7280]">
          {lbl}
        </div>
      </div>
    </div>
  );
}

function SigField({
  label,
  value,
  onChange,
  placeholder,
  narrow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  narrow?: boolean;
}) {
  return (
    <div className={cn("min-w-[200px] flex-1", narrow && "min-w-[140px] flex-none basis-[180px]")}>
      <div className="mb-1 text-[10px] font-bold text-[#374151]">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="box-border w-full rounded-md border-[1.5px] border-[#e5e7eb] px-2.5 py-1.5 text-xs font-[inherit]"
      />
    </div>
  );
}
