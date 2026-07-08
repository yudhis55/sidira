import { getMockItems, getMockUsulan } from "@/lib/mock-data";
import { Card } from "@/components/gas/card";

export default function DashboardPage() {
  const items = getMockItems();
  const usulan = getMockUsulan();

  const totalItems = items.length;
  const alkes = items.filter((i) => i.category === "alkes").length;
  const meubelair = items.filter((i) => i.category === "meubelair").length;
  const elektronik = items.filter((i) => i.category === "elektronik").length;
  const perluPerhatian = items.filter((i) =>
    ["rr", "rb", "ta"].includes(i.condition),
  ).length;
  const usulanAktif = usulan.length;

  const stats = [
    { emoji: "📦", value: totalItems, label: "Total Item", bg: "#ccfbf1", color: "#0e7c6b" },
    { emoji: "🩺", value: alkes, label: "Alat Kesehatan", bg: "#ccfbf1", color: "#0e7c6b" },
    { emoji: "🪑", value: meubelair, label: "Meubelair", bg: "#fef3c7", color: "#b45309" },
    { emoji: "💻", value: elektronik, label: "Elektronik", bg: "#dbeafe", color: "#1d4ed8" },
    { emoji: "🔴", value: perluPerhatian, label: "Perlu Perhatian", bg: "#fee2e2", color: "#b91c1c" },
    { emoji: "📋", value: usulanAktif, label: "Usulan Aktif", bg: "#f5f3ff", color: "#7c3aed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan inventaris Puskesmas Baruharjo
        </p>
      </div>

      {/* ── Legend Bar ─────────────────────────────────────────────── */}
      <div
        className="legend-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          padding: "12px 16px",
          background: "var(--card)",
          borderRadius: "var(--radius)",
          border: "1px solid hsl(var(--border))",
          fontSize: "0.875rem",
        }}
      >
        <span style={{ fontWeight: 600 }}>Keterangan:</span>
        {[
          { color: "#0e7c6b", label: "Alat Kesehatan" },
          { color: "#b45309", label: "Meubelair" },
          { color: "#1d4ed8", label: "Elektronik" },
          { color: "#475569", label: "Lainnya" },
        ].map((leg) => (
          <span key={leg.label} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: leg.color,
                display: "inline-block",
              }}
            />
            {leg.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              background: "#dcfce7",
              color: "#166534",
            }}
          >
            Wajib
          </span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              background: "#fef3c7",
              color: "#92400e",
            }}
          >
            Penting
          </span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              background: "#f1f5f9",
              color: "#475569",
            }}
          >
            Pendukung
          </span>
        </span>
      </div>

      {/* ── GStats ────────────────────────────────────────────────── */}
      <div
        className="gstats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {stat.emoji}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: stat.color,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* ── Page Actions ──────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <a
          href="/laporan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "var(--radius)",
            border: "1px solid hsl(var(--border))",
            background: "var(--card)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "hsl(var(--foreground))",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          📄 Laporan Monitoring
        </a>
      </div>
    </div>
  );
}
