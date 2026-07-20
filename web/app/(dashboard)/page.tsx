import { Suspense } from "react";
import {
  getMockItems,
  getMockUsulan,
  getMockRiwayat,
  getMockLaporanSummary,
  getMockLaporanRooms,
} from "@/lib/mock-data";
import { PageActionsHost } from "@/components/gas/page-actions-host";

/**
 * Dashboard shell — GAS v3 parity:
 * legend-bar + 6 gstats + PageActionsHost (Laporan/Riwayat modals).
 * Density/colors match gas-legacy .legend-bar / .gstats / .page-actions.
 */
export default function DashboardPage() {
  const items = getMockItems();
  const usulan = getMockUsulan();
  const riwayatItems = getMockRiwayat();
  const laporanSummary = getMockLaporanSummary();
  const laporanRooms = getMockLaporanRooms();

  const totalItems = items.length;
  const alkes = items.filter((i) => i.category === "alkes").length;
  const meubelair = items.filter((i) => i.category === "meubelair").length;
  const elektronik = items.filter((i) => i.category === "elektronik").length;
  const perluPerhatian = items.filter((i) =>
    ["rr", "rb", "ta"].includes(i.condition),
  ).length;
  const usulanAktif = usulan.length;

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

      {/* ── Global Stats — GAS .gstats (6 cards) ───────────────────── */}
      <div
        className="gstats"
        id="gstats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
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

      {/* ── Page Actions — Laporan + Riwayat modals (T6 wiring) ────── */}
      <Suspense fallback={null}>
        <PageActionsHost
          riwayatItems={riwayatItems}
          laporanSummary={laporanSummary}
          laporanRooms={laporanRooms}
          withDivider
        />
      </Suspense>
    </div>
  );
}
