import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/gas/button";
import { Card } from "@/components/gas/card";
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
}[] = [
  { value: "alkes", label: "Alat Kesehatan", headerBg: "bg-teal3", dotColor: "bg-teal" },
  { value: "meubelair", label: "Meubelair", headerBg: "bg-amber2", dotColor: "bg-amber" },
  { value: "elektronik", label: "Elektronik", headerBg: "bg-blue2", dotColor: "bg-blue" },
  { value: "lainnya", label: "Lainnya", headerBg: "bg-slate2", dotColor: "bg-slate" },
];

const CONDITION_LABELS: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;

  const rooms = getMockRooms();
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    notFound();
  }

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

  const itemCount = items.length;
  const totalUnits = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <Link href="/inventaris">
          <Button variant="ghost" className="h-9 w-9 p-0">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            {room.icon} {room.name}
          </h1>
          <p className="text-sm text-ink3">
            {itemCount} item · {totalUnits} unit
          </p>
        </div>
      </div>

      {/* Room info card */}
      <Card>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink3">Penanggung Jawab:</span>{" "}
            <span className="font-semibold">{room.pj}</span>
          </div>
          <div>
            <span className="text-ink3">NIP:</span>{" "}
            <span className="font-mono text-xs">{room.pj_nip}</span>
          </div>
          {room.description && (
            <div className="col-span-2">
              <span className="text-ink3">Deskripsi:</span> {room.description}
            </div>
          )}
        </div>
      </Card>

      {/* 4 category sections with colored collapsible headers */}
      <div className="space-y-3">
        {CATEGORY_CONFIG.map((cat) => {
          const catItems = grouped[cat.value];
          return (
            <details key={cat.value} open className={`cat-section`}>
              {/* Collapsible header: dot + label + count badge */}
              <summary
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md cursor-pointer select-none list-none ${cat.headerBg}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.dotColor}`} />
                <span className={`text-xs font-bold uppercase tracking-wide ${cat.dotColor.replace("bg-", "text-")}`}>
                  {cat.label}
                </span>
                <span className={`ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white ${cat.dotColor}`}>
                  {catItems.length} item
                </span>
              </summary>

              {/* Table body */}
              <div className="mt-px">
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-center w-10">
                          No
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-left">
                          Nama
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-left">
                          Spec
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-left">
                          Satuan
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-center">
                          Jml
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-center">
                          Std
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-center">
                          Status
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-center">
                          Kondisi
                        </th>
                        <th className="border-b border-line px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-ink3 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-ink3 text-sm">
                            Tidak ada data
                          </td>
                        </tr>
                      ) : (
                        catItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-line2/50">
                            <td className="border-b border-line2 px-3 py-2 text-sm text-center text-ink font-mono">
                              {idx + 1}
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-sm text-ink font-semibold">
                              {item.name}
                              {item.merk && (
                                <div className="text-ink3 font-normal text-xs">{item.merk} {item.type}</div>
                              )}
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-sm text-ink2">
                              {item.spec || "—"}
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-sm text-ink2">
                              {item.unit || "—"}
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-sm text-ink font-bold text-center font-mono">
                              {item.quantity}
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-sm text-ink2 text-center">
                              0
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-center">
                              {/* Priority placeholder */}
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-center">
                              <Badge variant={item.condition as ItemCondition}>
                                {CONDITION_LABELS[item.condition] || item.condition}
                              </Badge>
                            </td>
                            <td className="border-b border-line2 px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  className="text-sm hover:opacity-70"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="text-sm hover:opacity-70"
                                  title="Pindah"
                                >
                                  📦
                                </button>
                                <button
                                  className="text-sm hover:opacity-70"
                                  title="Checklist"
                                >
                                  ✅
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
