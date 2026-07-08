import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/gas/badge";
import { getMockRooms } from "@/lib/mock-data/rooms";
import { getMockItemsByRoom } from "@/lib/mock-data/items";
import { getMockUsulan } from "@/lib/mock-data/usulan";
import { RoomUsulanSection } from "@/components/inventaris/room-usulan-section";
import type { ItemCategory, ItemCondition } from "@/types/database";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_CONFIG: {
  value: ItemCategory;
  label: string;
  headerBg: string;
  dotColor: string;
  labelColor: string;
  countBg: string;
}[] = [
  {
    value: "alkes",
    label: "Alat Kesehatan",
    headerBg: "bg-teal3",
    dotColor: "bg-teal",
    labelColor: "text-teal",
    countBg: "bg-teal",
  },
  {
    value: "meubelair",
    label: "Meubelair",
    headerBg: "bg-amber2",
    dotColor: "bg-amber",
    labelColor: "text-amber",
    countBg: "bg-amber",
  },
  {
    value: "elektronik",
    label: "Elektronik",
    headerBg: "bg-blue2",
    dotColor: "bg-blue",
    labelColor: "text-blue",
    countBg: "bg-blue",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    headerBg: "bg-slate2",
    dotColor: "bg-slate",
    labelColor: "text-slate",
    countBg: "bg-slate",
  },
];

const CONDITION_LABELS: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

/** Priority spill badge matching GAS sp-wajib / sp-penting / sp-pendukung */
function PriorityPill({ prio }: { prio?: string }) {
  if (!prio) return null;
  if (prio === "wajib")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-amber2 text-amber">
        ⭐ Wajib
      </span>
    );
  if (prio === "penting")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-blue2 text-blue">
        🔹 Penting
      </span>
    );
  if (prio === "pendukung")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap bg-slate2 text-slate">
        · Pendukung
      </span>
    );
  return null;
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { id } = await params;

  const rooms = getMockRooms();
  const room = rooms.find((r) => r.id === id);
  if (!room) return notFound();

  const items = getMockItemsByRoom(id);
  const usulanList = getMockUsulan(id);

  // Group items by category
  const grouped: Record<ItemCategory, typeof items> = {
    alkes: [],
    meubelair: [],
    elektronik: [],
    lainnya: [],
  };
  for (const item of items) {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  }

  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const baikCount = items.filter((i) => i.condition === "baik").length;
  const rrCount = items.filter((i) => i.condition === "rr").length;
  const rbCount = items.filter((i) => i.condition === "rb").length;
  const taCount = items.filter((i) => i.condition === "ta").length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ── Room Header (matches GAS .room-header) ── */}
      <div className="flex items-center gap-4 mb-5 p-5 bg-white rounded-lg border border-line">
        {/* Back link */}
        <Link
          href="/inventaris"
          className="text-ink3 hover:text-ink text-sm shrink-0"
        >
          ← Kembali
        </Link>

        {/* Room icon (GAS .room-icon-big) */}
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[26px] shrink-0"
          style={{ background: room.bg }}
        >
          {room.icon}
        </div>

        {/* Title + description */}
        <div>
          <div className="text-lg font-extrabold text-ink">{room.name}</div>
          {room.description && (
            <div className="text-xs text-ink3 mt-0.5">{room.description}</div>
          )}
        </div>

        {/* Stats (GAS .room-stats .rstat) */}
        <div className="ml-auto flex gap-3">
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-extrabold text-teal font-mono">
              {totalItems}
            </div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
              Jenis Item
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-extrabold text-teal font-mono">
              {totalUnits}
            </div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
              Total Unit
            </div>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-line2">
            <div className="text-xl font-extrabold text-teal font-mono">
              {baikCount}
            </div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
              Baik
            </div>
          </div>
          {rrCount > 0 && (
            <div className="text-center px-4 py-2 rounded-lg bg-line2">
              <div className="text-xl font-extrabold text-amber font-mono">
                {rrCount}
              </div>
              <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
                Rusak Ringan
              </div>
            </div>
          )}
          {rbCount > 0 && (
            <div className="text-center px-4 py-2 rounded-lg bg-line2">
              <div className="text-xl font-extrabold text-red font-mono">
                {rbCount}
              </div>
              <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
                Rusak Berat
              </div>
            </div>
          )}
          {taCount > 0 && (
            <div className="text-center px-4 py-2 rounded-lg bg-line2">
              <div className="text-xl font-extrabold text-slate font-mono">
                {taCount}
              </div>
              <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
                Tidak Ada
              </div>
            </div>
          )}
        </div>

        {/* PJ Block (GAS .pj-block) */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-line2 cursor-pointer shrink-0">
          <span className="text-base">👤</span>
          <div>
            <div className="text-[10px] text-ink3 font-semibold uppercase tracking-wide">
              Penanggung Jawab
            </div>
            <div
              className={`text-sm font-semibold ${room.pj ? "text-ink" : "text-ink3 italic"}`}
            >
              {room.pj || "Belum diisi"}
            </div>
          </div>
          <span className="text-xs text-ink3">✏️</span>
        </div>

        {/* Action buttons (GAS room-header-actions) */}
        <div className="flex gap-2 shrink-0">
          <button className="text-xs px-3 py-1.5 rounded-md bg-teal text-white font-semibold hover:opacity-90">
            ✅ Semua Baik
          </button>
          <button className="text-xs px-3 py-1.5 rounded-md bg-line2 text-ink2 font-semibold hover:bg-line">
            ✏️ Edit
          </button>
          <button className="text-xs px-3 py-1.5 rounded-md bg-line2 text-ink2 font-semibold hover:bg-line">
            ↗ Pindah
          </button>
          <button className="text-xs px-3 py-1.5 rounded-md bg-red2 text-red font-semibold hover:opacity-90">
            🗑 Hapus
          </button>
        </div>
      </div>

      {/* ── 4 Category Sections ── */}
      <div className="space-y-5">
        {CATEGORY_CONFIG.map((cat) => {
          const catItems = grouped[cat.value];
          return (
            <details
              key={cat.value}
              open
              className={`cat-section`}
            >
              {/* Category header (GAS .cat-header) */}
              <summary
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md cursor-pointer select-none list-none ${cat.headerBg}`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.dotColor}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-[0.8px] ${cat.labelColor}`}
                >
                  {cat.label}
                </span>
                <span
                  className={`ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white ${cat.countBg}`}
                >
                  {catItems.length} item
                </span>
                <span className="text-[11px] ml-1.5">▼</span>
              </summary>

              {/* Table body (GAS .cat-body .tbl-wrap) */}
              <div className="mt-px">
                <div className="overflow-x-auto rounded-b-lg">
                  <table className="w-full border-collapse text-[13px] bg-white border border-line border-t-0">
                    <thead>
                      <tr>
                        <th className="w-9 text-center px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap">
                          No
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left">
                          Nama Barang
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[72px]">
                          Spesifikasi
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[110px]">
                          Merek / Tipe
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[100px]">
                          No. Register
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left">
                          Satuan
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center">
                          Std
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center">
                          Jml
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center">
                          Prioritas
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center min-w-[120px]">
                          Kondisi
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-left min-w-[130px]">
                          Keterangan
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap text-center min-w-[80px]">
                          Ceklist
                        </th>
                        <th className="px-3.5 py-2.5 bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-wide text-ink3 border-b border-line whitespace-nowrap"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={13}
                            className="py-6 text-center text-ink3 text-sm"
                          >
                            Tidak ada data
                          </td>
                        </tr>
                      ) : (
                        catItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="border-b border-line last:border-b-0 hover:bg-[#fafcff]"
                          >
                            {/* No */}
                            <td className="w-9 text-center px-3.5 py-2.5 font-mono text-[11px] text-ink3">
                              {idx + 1}
                            </td>
                            {/* Nama Barang */}
                            <td className="px-3.5 py-2.5 font-semibold text-ink">
                              {item.name}
                            </td>
                            {/* Spesifikasi */}
                            <td className="px-3.5 py-2.5 text-[11.5px] text-ink3 font-normal">
                              {item.spec || "—"}
                            </td>
                            {/* Merek / Tipe */}
                            <td className="px-3.5 py-2.5 text-xs text-ink2">
                              {item.merk
                                ? `${item.merk}${item.type ? ` / ${item.type}` : ""}`
                                : "—"}
                            </td>
                            {/* No. Register */}
                            <td className="px-3.5 py-2.5 text-xs text-ink2 font-mono">
                              {item.noreg || item.kode_barang || "—"}
                            </td>
                            {/* Satuan */}
                            <td className="px-3.5 py-2.5 text-xs text-ink3">
                              {item.unit || "—"}
                            </td>
                            {/* Std */}
                            <td className="px-3.5 py-2.5 text-center font-mono text-xs text-ink3">
                              {item.std && item.std > 0 ? item.std : "—"}
                            </td>
                            {/* Jml */}
                            <td className="px-3.5 py-2.5 text-center font-mono text-[13px] font-bold text-ink2">
                              {item.quantity}
                            </td>
                            {/* Prioritas (spill badge) */}
                            <td className="px-3.5 py-2.5 text-center">
                              <PriorityPill prio={item.prio} />
                            </td>
                            {/* Kondisi (badge) */}
                            <td className="px-3.5 py-2.5 text-center">
                              <Badge variant={item.condition}>
                                {CONDITION_LABELS[item.condition] ||
                                  item.condition}
                              </Badge>
                            </td>
                            {/* Keterangan */}
                            <td className="px-3.5 py-2.5 text-xs text-ink3">
                              {item.notes || ""}
                            </td>
                            {/* Ceklist */}
                            <td className="px-3.5 py-2.5 text-center">
                              <button className="text-xs px-2 py-1 rounded bg-line2 text-ink2 hover:bg-line font-semibold">
                                📅 Ceklist
                              </button>
                            </td>
                            {/* Actions: Pindah + Hapus */}
                            <td className="px-3.5 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  className="w-6 h-6 flex items-center justify-center rounded bg-line2 text-ink2 hover:bg-line text-xs"
                                  title="Pindah ke ruangan lain"
                                >
                                  ↗
                                </button>
                                <button
                                  className="w-6 h-6 flex items-center justify-center rounded bg-red2 text-red hover:opacity-90 text-xs"
                                  title="Hapus"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* Usulan section (per-room, collapsible) */}
      <RoomUsulanSection
        roomId={id}
        roomName={room.name}
        usulanList={usulanList}
      />
    </div>
  );
}
