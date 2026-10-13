import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Item, ItemCategory, Room } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPublicRoom(id: string): Promise<{ room: Room; items: Item[] } | null> {
  const supabase = await createClient();
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  if (roomError || !room) return null;

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*")
    .eq("room_id", id)
    .order("category")
    .order("name");

  if (itemsError) return { room: room as Room, items: [] };
  return { room: room as Room, items: (items ?? []) as Item[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicRoom(id).catch(() => null);
  if (!result) return { title: "Ruangan tidak ditemukan · SIDIRA" };
  return { title: `${result.room.name} · SIDIRA` };
}

const CATEGORY_ORDER: ItemCategory[] = ["alkes", "meubelair", "elektronik", "lainnya"];

const CATEGORY_STYLE: Record<
  ItemCategory,
  { label: string; icon: string; headerBg: string; headerText: string; chipBg: string; chipText: string }
> = {
  alkes: {
    label: "Alkes",
    icon: "🩺",
    headerBg: "bg-sky-50",
    headerText: "text-sky-800",
    chipBg: "bg-sky-100",
    chipText: "text-sky-800",
  },
  meubelair: {
    label: "Meubelair",
    icon: "🪑",
    headerBg: "bg-amber-50",
    headerText: "text-amber-800",
    chipBg: "bg-amber-100",
    chipText: "text-amber-800",
  },
  elektronik: {
    label: "Elektronik",
    icon: "🔌",
    headerBg: "bg-violet-50",
    headerText: "text-violet-800",
    chipBg: "bg-violet-100",
    chipText: "text-violet-800",
  },
  lainnya: {
    label: "Lainnya",
    icon: "📦",
    headerBg: "bg-teal-50",
    headerText: "text-teal-800",
    chipBg: "bg-teal-100",
    chipText: "text-teal-800",
  },
};

const CONDITION_LABEL: Record<string, string> = {
  baik: "Baik",
  rr: "Rusak ringan",
  rb: "Rusak berat",
  ta: "Tidak aktif",
};

const CONDITION_PILL: Record<string, string> = {
  baik: "bg-emerald-100 text-emerald-800",
  rr: "bg-amber-100 text-amber-800",
  rb: "bg-red-100 text-red-800",
  ta: "bg-neutral-200 text-neutral-600",
};

export default async function PublicRoomPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getPublicRoom(id).catch(() => null);

  if (!result) {
    notFound();
  }

  const { room, items } = result;

  const totalUnit = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const countByCondition: Record<string, number> = {};
  for (const item of items) {
    const key = item.condition ?? "baik";
    countByCondition[key] = (countByCondition[key] ?? 0) + (item.quantity ?? 0);
  }

  const grouped = new Map<ItemCategory, Item[]>();
  for (const item of items) {
    const key = (item.category ?? "lainnya") as ItemCategory;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }
  const orderedGroups = CATEGORY_ORDER.filter((cat) => (grouped.get(cat)?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
        {/* Kop sederhana */}
        <p className="text-center font-mono text-xs uppercase tracking-widest text-neutral-500">
          UPTD Puskesmas Baruharjo · SIDIRA
        </p>

        {/* Identitas ruangan */}
        <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div
            className="px-5 pb-4 pt-5 text-white"
            style={{
              background:
                "linear-gradient(135deg, #062820 0%, #0a3d32 45%, #0e6654 100%)",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-3xl leading-none"
              >
                {room.icon || "🏥"}
              </span>
              <div className="min-w-0">
                <h1 className="font-mono text-xl font-semibold">{room.name}</h1>
                {room.description ? (
                  <p className="mt-1 text-sm text-white/75">{room.description}</p>
                ) : null}
                {room.pj ? (
                  <p className="mt-2 inline-flex flex-wrap items-center gap-1 text-sm">
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-medium">
                      👤 {room.pj}
                    </span>
                    {room.pj_nip ? (
                      <span className="font-mono text-xs text-white/70">
                        {room.pj_nip}
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Ringkasan */}
          <dl className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
            <div className="rounded-md bg-teal-50 px-3 py-2">
              <dt className="text-xs font-medium text-teal-700">Jenis barang</dt>
              <dd className="font-mono text-lg font-semibold text-teal-900">
                {items.length}
              </dd>
            </div>
            <div className="rounded-md bg-sky-50 px-3 py-2">
              <dt className="text-xs font-medium text-sky-700">Total unit</dt>
              <dd className="font-mono text-lg font-semibold text-sky-900">
                {totalUnit}
              </dd>
            </div>
            <div className="rounded-md bg-emerald-50 px-3 py-2">
              <dt className="text-xs font-medium text-emerald-700">Baik</dt>
              <dd className="font-mono text-lg font-semibold text-emerald-900">
                {countByCondition["baik"] ?? 0}
              </dd>
            </div>
            <div className="rounded-md bg-red-50 px-3 py-2">
              <dt className="text-xs font-medium text-red-700">Rusak ringan / berat</dt>
              <dd className="font-mono text-lg font-semibold text-red-900">
                {(countByCondition["rr"] ?? 0) + (countByCondition["rb"] ?? 0)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Daftar inventaris per kategori */}
        {items.length === 0 ? (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6 text-center">
            <p className="text-sm text-neutral-600">
              Belum ada data inventaris untuk ruangan ini.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orderedGroups.map((cat) => {
              const style = CATEGORY_STYLE[cat];
              return (
              <section
                key={cat}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <h2
                  className={`border-b border-neutral-100 px-4 py-2 font-mono text-sm font-semibold ${style.headerBg} ${style.headerText}`}
                >
                  <span aria-hidden className="mr-1.5">{style.icon}</span>
                  {style.label} ({grouped.get(cat)!.length})
                </h2>
                <ul className="divide-y divide-neutral-100">
                  {grouped.get(cat)!.map((item) => {
                    // Kolom merk & type hasil migrasi berisi nilai yang sama
                    // ("MERK / MODEL" diduplikasi ke keduanya): tampilkan satu
                    // baris "Merek / Tipe", kecuali keduanya terisi beda nilai.
                    const meta: { label: string; value: string }[] = [];
                    if (item.merk && item.type && item.merk !== item.type) {
                      meta.push({ label: "Merek", value: item.merk });
                      meta.push({ label: "Tipe", value: item.type });
                    } else if (item.merk || item.type) {
                      meta.push({ label: "Merek / Tipe", value: item.merk ?? item.type ?? "" });
                    }
                    if (item.year) meta.push({ label: "Tahun", value: String(item.year) });
                    // No. Register diisi lewat form SIDIRA ke kolom `noreg`
                    // (fallback ke `kode_barang` warisan migrasi Excel).
                    const noreg = item.noreg || item.kode_barang;
                    if (noreg) meta.push({ label: "No. Register", value: noreg });
                    return (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900">
                            {item.name}
                          </p>
                        </div>
                        <p className="shrink-0 font-mono text-sm font-semibold text-neutral-900">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      {meta.length > 0 ? (
                        <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                          {meta.map((m) => (
                            <div key={m.label} className="flex min-w-0 gap-1 text-xs">
                              <dt className="shrink-0 text-neutral-400">{m.label}:</dt>
                              <dd className="truncate font-medium text-neutral-700">{m.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      <p className="mt-1.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${CONDITION_PILL[item.condition] ?? "bg-neutral-100 text-neutral-600"}`}
                        >
                          {CONDITION_LABEL[item.condition] ?? item.condition}
                        </span>
                      </p>
                    </li>
                    );
                  })}
                </ul>
              </section>
              );
            })}
          </div>
        )}

        {/* Penutup */}
        <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          SIDIRA · UPTD Puskesmas Baruharjo
        </p>
      </div>
    </div>
  );
}
