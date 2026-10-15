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
  const stats = [
    {
      emoji: "📦",
      value: totalItems,
      label: "Total Item",
      bg: "var(--teal3)",
      color: "var(--teal)",
    },
    {
      emoji: "🩺",
      value: alkes,
      label: "Alat Kesehatan",
      bg: "var(--teal3)",
      color: "var(--teal)",
    },
    {
      emoji: "🪑",
      value: meubelair,
      label: "Meubelair",
      bg: "var(--amber2)",
      color: "var(--amber)",
    },
    {
      emoji: "💻",
      value: elektronik,
      label: "Elektronik",
      bg: "var(--blue2)",
      color: "var(--blue)",
    },
    {
      emoji: "🔴",
      value: perluPerhatian,
      label: "Perlu Perhatian",
      bg: "var(--red2)",
      color: "var(--red)",
    },
    {
      emoji: "📋",
      value: usulanAktif,
      label: "Usulan Aktif",
      bg: "#f5f3ff",
      color: "#7c3aed",
    },
  ];

  const legendItems = [
    { color: "var(--teal)", label: "Alat Kesehatan" },
    { color: "var(--amber)", label: "Meubelair" },
    { color: "var(--blue)", label: "Elektronik" },
    { color: "var(--slate)", label: "Lainnya" },
  ];

  const spillItems = [
    { label: "Wajib", bg: "#fef3c7", color: "#92400e" },
    { label: "Penting", bg: "var(--blue2)", color: "var(--blue)" },
    { label: "Pendukung", bg: "var(--slate2)", color: "var(--slate)" },
  ];

  return (
    <div>
      {/* ── Legend Bar — GAS .legend-bar ───────────────────────────── */}
      <div
        className="legend-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          padding: "12px 16px",
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
          marginBottom: "20px",
          fontSize: "11.5px",
        }}
      >
        <span
          className="legend-title"
          style={{
            fontWeight: 700,
            color: "var(--ink2)",
            marginRight: "4px",
          }}
        >
          Keterangan:
        </span>
        {legendItems.map((leg) => (
          <span
            key={leg.label}
            className="legend-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--ink3)",
            }}
          >
            <span
              className="legend-dot"
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: leg.color,
                flexShrink: 0,
              }}
            />
            {leg.label}
          </span>
        ))}
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {spillItems.map((sp) => (
            <span
              key={sp.label}
              className="spill"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "3px 9px",
                borderRadius: "20px",
                fontSize: "10.5px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                background: sp.bg,
                color: sp.color,
              }}
            >
              {sp.label}
            </span>
          ))}
        </span>
      </div>

      {/* ── Global Stats — GAS .gstats (5 kolom + mobile 2 kolom) ─── */}
      <div
        className="gstats grid grid-cols-2 gap-3 md:grid-cols-5"
        id="gstats"
        style={{
          marginBottom: "20px",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="gstat"
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              className="gstat-ico"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
                background: s.bg,
                lineHeight: 1,
              }}
            >
              {s.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                className="gstat-v"
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  color: s.color,
                  lineHeight: 1.15,
                }}
              >
                {s.value}
              </div>
              <div
                className="gstat-l"
                style={{
                  fontSize: "10.5px",
                  color: "var(--ink3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  marginTop: "2px",
                }}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
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
