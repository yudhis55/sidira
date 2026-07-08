"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMockRooms, getMockUtilitasMeta } from "@/lib/mock-data";

export function RoomNav() {
  const pathname = usePathname();
  const rooms = getMockRooms();
  const utilitas = getMockUtilitasMeta();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const tabStyle = (active: boolean) => ({
    color: active ? "#4eebd0" : "rgba(255,255,255,0.55)",
    borderLeft: active ? "3px solid #4eebd0" : "3px solid transparent",
    background: active ? "rgba(78,235,208,0.1)" : "transparent",
  });

  const iconStyle = (active: boolean) => ({
    width: 20,
    height: 20,
    borderRadius: 5,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    flexShrink: 0,
    background: active ? "rgba(78,235,208,0.18)" : "rgba(255,255,255,0.1)",
  });

  const tabHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    if (!el.classList.contains("active")) {
      el.style.color = "rgba(255,255,255,0.9)";
      el.style.background = "rgba(255,255,255,0.07)";
    }
  };

  const tabLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    if (!el.classList.contains("active")) {
      el.style.color = "rgba(255,255,255,0.55)";
      el.style.background = "transparent";
    }
  };

  const makeTab = (href: string, icon: string, label: string, active?: boolean) => {
    const act = active ?? isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={act ? "active" : ""}
        onMouseEnter={tabHover}
        onMouseLeave={tabLeave}
        style={{
          ...tabStyle(act),
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          fontSize: "11.5px",
          fontWeight: 600,
          borderRadius: 7,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          textAlign: "left",
          textDecoration: "none",
          width: "100%",
        }}
      >
        <span style={iconStyle(act)}>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "#0a3d32",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.overflowY = "auto"; }}
      onMouseLeave={(e) => { e.currentTarget.style.overflowY = "hidden"; }}
    >
      {/* ═══ Seksi Ruangan ═══ */}
      <div
        style={{
          padding: "10px 12px 4px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}
      >
        🏥 Ruangan
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {rooms.map((room) => makeTab(`/inventaris/${room.id}`, room.icon, room.name))}
      </div>

      <Link
        href="/admin/ruangan"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.9)";
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.35)";
          e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "block",
          padding: "8px 10px",
          margin: "0 8px",
          fontSize: "11.5px",
          fontWeight: 600,
          borderRadius: 7,
          color: "rgba(255,255,255,0.35)",
          textDecoration: "none",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          borderLeft: "3px solid transparent",
        }}
      >
        ＋ Tambah Ruangan
      </Link>

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Utilitas ═══ */}
      <div
        style={{
          padding: "10px 12px 4px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}
      >
        ⚙️ Utilitas
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {utilitas.map((u) => makeTab(`/utilitas/${u.util_id}`, u.icon, u.label))}
      </div>

      <Link
        href="/admin/utilitas"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.9)";
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.35)";
          e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "block",
          padding: "8px 10px",
          margin: "0 8px",
          fontSize: "11.5px",
          fontWeight: 600,
          borderRadius: 7,
          color: "rgba(255,255,255,0.35)",
          textDecoration: "none",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          borderLeft: "3px solid transparent",
        }}
      >
        ＋ Tambah Utilitas
      </Link>

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Barang Keluar (SBBK) ═══ */}
      <div
        style={{
          padding: "10px 12px 4px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}
      >
        📋 Barang Keluar
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {makeTab("/sbbk", "📤", "SBBK")}
      </div>

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Rekap Inventaris ═══ */}
      <div
        style={{
          padding: "10px 12px 4px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}
      >
        📊 Rekap Inventaris
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {makeTab("/rekap", "📊", "Rekap")}
      </div>

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Pakta Integritas ═══ */}
      <div
        style={{
          padding: "10px 12px 4px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
        }}
      >
        📝 Pakta Integritas
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {makeTab("/pakta", "📝", "Pakta")}
      </div>
    </aside>
  );
}
