import { Suspense } from "react";
import {
  ArmchairIcon,
  ArrowUpRightIcon,
  ClipboardTextIcon,
  FirstAidIcon,
  LaptopIcon,
  PackageIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { getRooms } from "@/lib/auth/rooms";
import { getAllItems } from "@/lib/auth/items";
import { getUsulanList } from "@/lib/auth/usulan";
import { getRiwayatList } from "@/lib/auth/riwayat";
import { getSbbkList } from "@/lib/auth/sbbk";
import { createClient } from "@/lib/supabase/server";
import { getLaporanSummary, getLaporanPerRoom } from "@/lib/auth/laporan";
import type { ItemCategory, RiwayatPindah } from "@/types/database";
import { PageActionsHost } from "@/components/gas/page-actions-host";
import { DonutKondisi } from "@/components/dashboard/donut-kondisi";
import { TopRuangan } from "@/components/dashboard/top-ruangan";
import type { TopRuanganRow } from "@/components/dashboard/top-ruangan";
import { UsulanMenunggu } from "@/components/dashboard/usulan-menunggu";
import type { UsulanMenungguRow } from "@/components/dashboard/usulan-menunggu";
import { CeklistHariIni } from "@/components/dashboard/ceklist-hari-ini";
import { AktivitasTerakhir } from "@/components/dashboard/aktivitas-terakhir";
import type { AktivitasRow } from "@/components/dashboard/aktivitas-terakhir";

type RiwayatRow = Awaited<ReturnType<typeof getRiwayatList>>[number];

function isItemCategory(v: string | undefined): v is ItemCategory {
  return (
    v === "alkes" || v === "meubelair" || v === "elektronik" || v === "lainnya"
  );
}

function toRiwayatPindah(row: RiwayatRow): RiwayatPindah {
  return {
    id: row.id,
    ts: row.ts,
    nama: row.nama,
    kat: isItemCategory(row.kat) ? row.kat : "lainnya",
    dari: row.dari,
    ke: row.ke,
    dari_name: row.dari_name,
    ke_name: row.ke_name,
    user_id: row.user_id,
    created_at: row.created_at,
  };
}

/**
 * Ruangan yang sudah punya ≥1 entri ceklist hari ini (date_key lokal
 * YYYY-MM-DD). Gagal → daftar kosong, widget tetap tampil jujur.
 */
async function getChecklistRoomsToday(today: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("checklist")
      .select("room_id")
      .eq("date_key", today);
    if (error) return [];
    return [...new Set((data ?? []).map((r) => r.room_id as string))];
  } catch {
    return [];
  }
}

/**
 * Dashboard shell — GAS v3 parity:
 * legend-bar + 6 gstats + PageActionsHost (Laporan/Riwayat modals).
 * Density/colors match gas-legacy .legend-bar / .gstats / .page-actions.
 */
export default async function DashboardPage() {
  // Nilai awal untuk modal laporan (diambil ulang live saat dibuka).
  // Gagal → fallback dihitung dari rooms/items asli di bawah.
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const laporanFilter = { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
  // Hitungan ASLI Supabase — gagal → daftar kosong, dashboard tetap tampil.
  // Paralel: 2 query inventaris + usulan + riwayat + 2 laporan + sbbk + ceklist hari ini.
  const [rooms, items, usulan, riwayatRes, laporanSummary, laporanRooms, sbbkList, checklistRoomsToday] =
    await Promise.all([
      getRooms().catch(
        () => [] as Awaited<ReturnType<typeof getRooms>>
      ),
      getAllItems().catch(
        () => [] as Awaited<ReturnType<typeof getAllItems>>
      ),
      getUsulanList().catch(
        () => [] as Awaited<ReturnType<typeof getUsulanList>>
      ),
      getRiwayatList().then(
        (v): { items: RiwayatPindah[]; error: false } => ({
          items: v.map(toRiwayatPindah),
          error: false,
        }),
        (): { items: RiwayatPindah[]; error: true } => ({
          items: [],
          error: true,
        })
      ),
      getLaporanSummary(laporanFilter).catch(() => ({
        total_rooms: 0,
        total_items: 0,
        total_baik: 0,
        total_rr: 0,
        total_rb: 0,
        total_ta: 0,
        percentage_baik: 0,
        percentage_rr: 0,
        percentage_rb: 0,
        percentage_ta: 0,
      })),
      getLaporanPerRoom(laporanFilter).catch(() => []),
      getSbbkList().catch(
        () => [] as Awaited<ReturnType<typeof getSbbkList>>
      ),
      getChecklistRoomsToday(todayKey).catch(() => [] as string[]),
    ]);
  const riwayatItems = riwayatRes.items;
  const riwayatError = riwayatRes.error;

  // Bila ringkasan laporan gagal dimuat, jangan tampilkan nol palsu di modal:
  // pakai hitungan asli rooms/items sebagai nilai awal.
  const summary =
    laporanSummary.total_rooms === 0 &&
    laporanSummary.total_items === 0 &&
    (rooms.length > 0 || items.length > 0)
      ? {
          ...laporanSummary,
          total_rooms: rooms.length,
          total_items: items.length,
        }
      : laporanSummary;

  const totalItems = items.length;
  const alkes = items.filter((i) => i.category === "alkes").length;
  const meubelair = items.filter((i) => i.category === "meubelair").length;
  const elektronik = items.filter((i) => i.category === "elektronik").length;
  const perluPerhatian = items.filter((i) =>
    ["rr", "rb", "ta"].includes(i.condition),
  ).length;
  const usulanAktif = usulan.length;

  // ── Widget overview (data asli, dihitung di server) ────────────────
  const roomNameById = new Map(rooms.map((r) => [r.id, r.name]));

  // (1) Donat kondisi dari items.
  const donutCounts = {
    baik: items.filter((i) => i.condition === "baik").length,
    rr: items.filter((i) => i.condition === "rr").length,
    rb: items.filter((i) => i.condition === "rb").length,
    ta: items.filter((i) => i.condition === "ta").length,
  };

  // (2) Top-5 ruangan: % (rr+rb+ta)/total tertinggi, hanya yang punya item.
  const topRuanganRows: TopRuanganRow[] = rooms
    .map((room) => {
      const roomItems = items.filter((i) => i.room_id === room.id);
      const perhatian = roomItems.filter((i) =>
        ["rr", "rb", "ta"].includes(i.condition)
      ).length;
      return {
        roomId: room.id,
        roomName: room.name,
        roomIcon: room.icon,
        total: roomItems.length,
        perhatian,
        pct:
          roomItems.length === 0
            ? 0
            : Math.round((perhatian / roomItems.length) * 100),
      };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.pct - a.pct || b.perhatian - a.perhatian)
    .slice(0, 5);

  // (3) Usulan menunggu = item usulan berstatus "diajukan".
  const usulanMenungguAll: UsulanMenungguRow[] = usulan.flatMap((u) =>
    (u.payload?.items ?? [])
      .filter((it) => it.status === "diajukan")
      .map((it) => ({
        usulanId: u.id,
        roomName: u.rooms?.name ?? roomNameById.get(u.room_id) ?? "—",
        nama: it.nama,
        prioritas: it.prioritas,
        qty: it.qty,
        satuan: it.satuan,
      }))
  );
  const usulanMenungguRows = usulanMenungguAll.slice(0, 5);

  // (4) Ceklist hari ini: ruangan ber-item yang sudah ada entri hari ini.
  const roomsWithItems = new Set(items.map((i) => i.room_id));
  const ceklistChecked = checklistRoomsToday.filter((id) =>
    roomsWithItems.has(id)
  ).length;
  const todayLabel = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // (5) Aktivitas: 7 riwayat pindah + 3 SBBK terbaru, urut waktu menurun.
  const aktivitasRows: AktivitasRow[] = [
    ...riwayatItems.slice(0, 7).map((r) => ({
      key: `riwayat-${r.id}`,
      kind: "pindah" as const,
      text: `${r.nama} dipindah ${r.dari_name ?? r.dari ?? "—"} → ${r.ke_name ?? r.ke ?? "—"}`,
      ts: r.ts,
    })),
    ...sbbkList.slice(0, 3).map((s) => ({
      key: `sbbk-${s.id}`,
      kind: "sbbk" as const,
      text: `SBBK ${s.no} diterbitkan ke ${s.kepada}`,
      ts: s.tgl,
    })),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 7);

  const pctOf = (v: number) =>
    totalItems > 0 ? Math.round((v / totalItems) * 100) : 0;

  type StatTone = "neutral" | "danger" | "info";
  const stats: Array<{
    icon: typeof PackageIcon;
    value: number;
    label: string;
    sub: string;
    share: number;
    tone: StatTone;
    href?: string;
  }> = [
    {
      icon: PackageIcon,
      value: totalItems,
      label: "Total Item",
      sub: `di ${rooms.length} ruangan`,
      share: 100,
      tone: "neutral",
    },
    {
      icon: FirstAidIcon,
      value: alkes,
      label: "Alat Kesehatan",
      sub: `${pctOf(alkes)}% dari total`,
      share: pctOf(alkes),
      tone: "neutral",
    },
    {
      icon: ArmchairIcon,
      value: meubelair,
      label: "Meubelair",
      sub: `${pctOf(meubelair)}% dari total`,
      share: pctOf(meubelair),
      tone: "neutral",
    },
    {
      icon: LaptopIcon,
      value: elektronik,
      label: "Elektronik",
      sub: `${pctOf(elektronik)}% dari total`,
      share: pctOf(elektronik),
      tone: "neutral",
    },
    {
      icon: WarningIcon,
      value: perluPerhatian,
      label: "Perlu Perhatian",
      sub: `${pctOf(perluPerhatian)}% perlu tindak lanjut`,
      share: pctOf(perluPerhatian),
      tone: "danger",
      href: "/laporan",
    },
    {
      icon: ClipboardTextIcon,
      value: usulanAktif,
      label: "Usulan Aktif",
      sub: usulanAktif > 0 ? "menunggu diproses" : "antrean kosong",
      share: usulanAktif > 0 ? 100 : 0,
      tone: "info",
      href: "/usulan",
    },
  ];

  return (
    <div>
      {/* ── Judul halaman — sans (Jakarta) seperti PageHeader modul lain.
          Mono hanya untuk angka, bukan judul. ── */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          Ringkasan aset Puskesmas Baruharjo · {todayLabel}
        </p>
      </div>

      {/* ── Global Stats — 6 kartu pas: 2 kolom HP, 3 tablet, 6 desktop ── */}
      <div
        className="gstats mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        id="gstats"
      >
        {stats.map((s) => {
          const Icon = s.icon;
          const alert = s.tone === "danger" && s.value > 0;
          const iconClass =
            s.tone === "danger"
              ? alert
                ? "bg-danger-soft text-danger"
                : "bg-surface-muted text-text-3"
              : s.tone === "info"
                ? "bg-info-soft text-info"
                : "bg-primary-soft text-primary";
          const barClass =
            s.tone === "danger"
              ? "bg-danger"
              : s.tone === "info"
                ? "bg-info"
                : "bg-primary";
          const cardClass = cn(
            "group flex h-full flex-col rounded-md border border-border bg-surface p-4 transition-colors",
            s.href && "hover:border-border-strong"
          );
          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-md",
                    iconClass
                  )}
                >
                  <Icon size={20} weight="bold" aria-hidden="true" />
                </span>
                {s.href && (
                  <ArrowUpRightIcon
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="text-text-3 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                )}
              </div>
              <div
                className={cn(
                  "mt-2.5 font-mono text-[30px] font-bold leading-none tabular-nums",
                  alert ? "text-danger" : "text-foreground"
                )}
              >
                {s.value}
              </div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-3">
                {s.label}
              </div>
              <div className="mt-0.5 text-[12px] text-text-2">{s.sub}</div>
              <div className="mt-auto pt-2.5">
                <div className="h-1 overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className={cn("h-full rounded-full", barClass)}
                    style={{
                      width: `${Math.min(100, Math.max(0, s.share))}%`,
                    }}
                  />
                </div>
              </div>
            </>
          );
          return s.href ? (
            <a
              key={s.label}
              href={s.href}
              className={cardClass}
              title={`Buka ${s.label.toLowerCase()}`}
            >
              {body}
            </a>
          ) : (
            <div key={s.label} className={cardClass}>
              {body}
            </div>
          );
        })}
      </div>

      {/* ── Widget overview — 5 kartu di bawah gstats ─────────────── */}
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <DonutKondisi counts={donutCounts} />
        <TopRuangan rows={topRuanganRows} />
        <UsulanMenunggu
          rows={usulanMenungguRows}
          hasMore={usulanMenungguAll.length > usulanMenungguRows.length}
        />
        <CeklistHariIni
          checked={ceklistChecked}
          total={roomsWithItems.size}
          todayLabel={todayLabel}
        />
        <div className="md:col-span-2">
          <AktivitasTerakhir rows={aktivitasRows} />
        </div>
      </div>

      {/* ── Page Actions — Laporan + Riwayat modals (T6 wiring) ────── */}
      {riwayatError && (
        <p role="alert" className="text-center py-4 text-[12.5px] text-text-3">
          Gagal memuat riwayat perpindahan. Silakan muat ulang halaman.
        </p>
      )}
      <Suspense fallback={null}>
        <PageActionsHost
          riwayatItems={riwayatItems}
          laporanSummary={summary}
          laporanRooms={laporanRooms}
          withDivider
        />
      </Suspense>
    </div>
  );
}
