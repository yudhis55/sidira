import { getMockItems, getMockUsulan } from "@/lib/mock-data";

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
    <div>
      {/* ── Legend Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          padding: "12px 16px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "var(--radius)",
          marginBottom: "20px",
          fontSize: "11.5px",
        }}
      >
        <span style={{ fontWeight: 700, color: "#64748b", marginRight: "4px" }}>
          Keterangan:
        </span>
        {[
          { color: "#0e7c6b", label: "Alat Kesehatan" },
          { color: "#b45309", label: "Meubelair" },
          { color: "#1d4ed8", label: "Elektronik" },
          { color: "#475569", label: "Lainnya" },
        ].map((leg) => (
          <span
            key={leg.label}
            style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8" }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: leg.color,
              }}
            />
            {leg.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 9px",
              borderRadius: "20px",
              fontSize: "10.5px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              background: "#fef3c7",
              color: "#92400e",
            }}
          >
            Wajib
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 9px",
              borderRadius: "20px",
              fontSize: "10.5px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              background: "#dbeafe",
              color: "#1d4ed8",
            }}
          >
            Penting
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 9px",
              borderRadius: "20px",
              fontSize: "10.5px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              background: "#e2e8f0",
              color: "#475569",
            }}
          >
            Pendukung
          </span>
        </span>
      </div>

      {/* ── GStats ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "var(--radius)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
                background: stat.bg,
              }}
            >
              {stat.emoji}
            </div>
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: stat.color,
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "10.5px",
                  color: "#94a3b8",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Page Actions ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <a
          href="/laporan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            borderRadius: "var(--radius)",
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#1e293b",
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
