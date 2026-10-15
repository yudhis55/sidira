import { Suspense } from "react";
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

  // GAS gstat icon bg: teal3 / teal3 / amber2 / blue2 / red2 / #f5f3ff
  // GAS value colors: teal / teal / amber / blue / red / #7c3aed
  const pctOf = (v: number) =>
    totalItems > 0 ? Math.round((v / totalItems) * 100) : 0;
  const stats = [
    {
      emoji: "📦",
      value: totalItems,
      label: "Total Item",
      sub: `di ${rooms.length} ruangan`,
      share: 100,
      bg: "var(--teal3)",
      color: "var(--teal)",
    },
    {
      emoji: "🩺",
      value: alkes,
      label: "Alat Kesehatan",
      sub: `${pctOf(alkes)}% dari total`,
      share: pctOf(alkes),
      bg: "var(--teal3)",
      color: "var(--teal)",
    },
    {
      emoji: "🪑",
      value: meubelair,
      label: "Meubelair",
      sub: `${pctOf(meubelair)}% dari total`,
      share: pctOf(meubelair),
      bg: "var(--amber2)",
      color: "var(--amber)",
    },
    {
      emoji: "💻",
      value: elektronik,
      label: "Elektronik",
      sub: `${pctOf(elektronik)}% dari total`,
      share: pctOf(elektronik),
      bg: "var(--blue2)",
      color: "var(--blue)",
    },
    {
      emoji: "⚠️",
      value: perluPerhatian,
      label: "Perlu Perhatian",
      sub: `${pctOf(perluPerhatian)}% perlu tindak lanjut`,
      share: pctOf(perluPerhatian),
      bg: "var(--red2)",
      color: "var(--red)",
      href: "/laporan",
    },
    {
      emoji: "📋",
      value: usulanAktif,
      label: "Usulan Aktif",
      sub: usulanAktif > 0 ? "menunggu diproses" : "antrean kosong 🎉",
      share: usulanAktif > 0 ? 100 : 0,
      bg: "#f5f3ff",
      color: "#7c3aed",
      href: "/usulan",
    },
  ];

  return (
    <div>
      {/* ── Global Stats — 6 kartu pas: 2 kolom HP, 3 tablet, 6 desktop ── */}
      <div
        className="gstats grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        id="gstats"
        style={{
          marginBottom: "20px",
        }}
      >
        {stats.map((s) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div
                  className="gstat-ico"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "21px",
                    flexShrink: 0,
                    background: s.bg,
                    lineHeight: 1,
                  }}
                >
                  {s.emoji}
                </div>
                {"href" in s && s.href && (
                  <span
                    aria-hidden
                    className="text-ink3 transition-transform group-hover:translate-x-0.5"
                    style={{ fontSize: "15px", lineHeight: 1 }}
                  >
                    →
                  </span>
                )}
              </div>
              <div
                className="gstat-v"
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  color: s.color,
                  lineHeight: 1.1,
                  marginTop: "10px",
                }}
              >
                {s.value}
              </div>
              <div
                className="gstat-l"
                style={{
                  fontSize: "11px",
                  color: "var(--ink)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  marginTop: "2px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--ink3)",
                  marginTop: "1px",
                }}
              >
                {s.sub}
              </div>
              <div
                className="gstat-bar"
                style={{
                  height: "5px",
                  borderRadius: "99px",
                  background: "var(--line2)",
                  marginTop: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, Math.max(0, s.share))}%`,
                    borderRadius: "99px",
                    background: s.color,
                  }}
                />
              </div>
            </>
          );
          const cardStyle = {
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            padding: "18px",
            height: "100%",
          } as const;
          return "href" in s && s.href ? (
            <a
              key={s.label}
              href={s.href}
              className="gstat group block transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={cardStyle}
              title={`Buka ${s.label.toLowerCase()}`}
            >
              {body}
            </a>
          ) : (
            <div
              key={s.label}
              className="gstat"
              style={cardStyle}
            >
              {body}
            </div>
          );
        })}
      </div>

      {/* ── Widget overview — 5 kartu di bawah gstats ─────────────── */}
      <div
        className="grid gap-4 md:grid-cols-2"
        style={{ marginBottom: "20px" }}
      >
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
        <p role="alert" className="text-center py-4 text-[12.5px] text-ink3">
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
