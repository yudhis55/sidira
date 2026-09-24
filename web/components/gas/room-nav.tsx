"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AddRoomModal } from "@/components/inventaris/add-room-modal";
import { AddUtilitasModal } from "@/components/utilitas/add-utilitas-modal";
import { useRoomList } from "@/lib/room-store";
import { useUtilitasList } from "@/lib/utilitas-store";
import type { Room, UtilMeta } from "@/types/database";

export interface RoomNavProps {
  /** Daftar ruangan dari Supabase (via AppLayout). */
  rooms?: Room[];
  /** Daftar utilitas dari Supabase (via AppLayout). */
  utilitas?: UtilMeta[];
}

export function RoomNav({ rooms: baseRooms = [], utilitas: baseUtilitas = [] }: RoomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Ruangan/utilitas tambahan serta hasil sunting ikut tercermin di sidebar.
  const rooms = useRoomList(baseRooms);
  const utilitas = useUtilitasList(baseUtilitas);

  // GAS membuka modal langsung dari sidebar (openModal / openUtilModal).
  const [addRoomOpen, setAddRoomOpen] = React.useState(false);
  const [addUtilOpen, setAddUtilOpen] = React.useState(false);

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
        // GAS `.room-nav-outer`: sidebar yang sticky, bukan header.
        position: "sticky",
        top: 0,
        height: "100vh",
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

      <button
        type="button"
        onClick={() => setAddRoomOpen(true)}
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
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        ＋ Tambah Ruangan
      </button>

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

      <button
        type="button"
        onClick={() => setAddUtilOpen(true)}
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
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        ＋ Tambah Utilitas
      </button>

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
        {makeTab("/rekap", "📊", "Pemegang Inventaris")}
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

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Admin ═══ */}
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
        🛡️ Admin
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {makeTab("/admin", "👥", "Users")}
      </div>

      {/* GAS #modalOverlay & #utilModalOverlay — dibuka dari sidebar */}
      <AddRoomModal
        key={addRoomOpen ? "room-open" : "room-closed"}
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        onCreated={(roomId) => router.push(`/inventaris/${roomId}`)}
      />
      <AddUtilitasModal
        key={addUtilOpen ? "util-open" : "util-closed"}
        open={addUtilOpen}
        onClose={() => setAddUtilOpen(false)}
        onCreated={(utilId) => router.push(`/utilitas/${utilId}`)}
      />
    </aside>
  );
}
