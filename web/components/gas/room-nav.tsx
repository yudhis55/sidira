"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AddRoomModal } from "@/components/inventaris/add-room-modal";
import { AddUtilitasModal } from "@/components/utilitas/add-utilitas-modal";
import { useRoomList } from "@/lib/room-store";
import { useUtilitasList } from "@/lib/utilitas-store";
import { useNavUi } from "@/lib/nav-ui-store";
import type { Room, UtilMeta } from "@/types/database";

export interface RoomNavProps {
  /** Daftar ruangan dari Supabase (via AppLayout). */
  rooms?: Room[];
  /** Daftar utilitas dari Supabase (via AppLayout). */
  utilitas?: UtilMeta[];
}

/** Key sessionStorage untuk status collapse seksi sidebar (per sesi). */
const NAV_COLLAPSE_KEY = "sidira:nav-collapsed";

export function RoomNav({ rooms: baseRooms = [], utilitas: baseUtilitas = [] }: RoomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Ruangan/utilitas tambahan serta hasil sunting ikut tercermin di sidebar.
  const rooms = useRoomList(baseRooms);
  const utilitas = useUtilitasList(baseUtilitas);

  // Mode lipat (icon rail) khusus desktop (>=md) — store dibuat agen lain
  // (persist key "sidira:nav-ui", field `collapsed: boolean`).
  // Di mobile (<md) nilai ini diabaikan: drawer selalu 220px penuh karena
  // semua penyesuaian rail memakai varian `md:` (base `w-[220px]` tetap).
  const railCollapsed = useNavUi((s) => s.collapsed);

  // GAS membuka modal langsung dari sidebar (openModal / openUtilModal).
  const [addRoomOpen, setAddRoomOpen] = React.useState(false);
  const [addUtilOpen, setAddUtilOpen] = React.useState(false);

  // Drawer off-canvas di mobile (<md): dibuka via tombol hamburger di
  // SiteHeader lewat custom window event (tanpa prop-drilling — AppLayout
  // adalah server component). Di desktop (>=md) selalu terlihat via CSS.
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("sidira:toggle-nav", onToggle);
    return () => window.removeEventListener("sidira:toggle-nav", onToggle);
  }, []);

  // Drawer ditutup via onClick tiap tab (lihat makeTab), overlay, tombol ✕,
  // dan onCreated modal di bawah — tanpa effect agar lolos react-hooks/set-state-in-effect.

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // ═══ Collapse seksi (ingat per sesi via sessionStorage) ═══
  const [collapsed, setCollapsed] = React.useState<string[]>(() => {
    try {
      const raw = sessionStorage.getItem(NAV_COLLAPSE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      sessionStorage.setItem(NAV_COLLAPSE_KEY, JSON.stringify(collapsed));
    } catch {
      // Abaikan bila storage tidak tersedia.
    }
  }, [collapsed]);

  // Seksi yang memuat path aktif selalu dianggap terbuka (tanpa setState
  // di effect agar lolos react-hooks/set-state-in-effect).
  const sectionOfPath = (p: string): string | null => {
    if (p.startsWith("/inventaris/")) return "ruangan";
    if (p.startsWith("/utilitas/")) return "utilitas";
    if (p.startsWith("/sbbk")) return "sbbk";
    if (p.startsWith("/rekap")) return "rekap";
    if (p.startsWith("/pakta")) return "pakta";
    if (p.startsWith("/admin")) return "admin";
    return null;
  };
  const activeSection = sectionOfPath(pathname);
  const isCollapsed = (key: string) => collapsed.includes(key) && key !== activeSection;
  const toggleSection = (key: string) =>
    setCollapsed((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "10px 12px 4px",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
  };

  const renderSectionHeader = (key: string, label: string) => {
    const shut = isCollapsed(key);
    return (
      <button
        type="button"
        aria-expanded={!shut}
        aria-label={label}
        title={label}
        onClick={() => toggleSection(key)}
        className={railCollapsed ? "justify-between md:justify-center" : "justify-between"}
        style={{
          ...sectionHeaderStyle,
          display: "flex",
          alignItems: "center",
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Label + chevron terlihat di mobile & mode penuh; di mode lipat
            desktop (>=md) disembunyikan dan diganti divider tipis agar
            tinggi ritme seksi tetap terjaga. */}
        <span className={railCollapsed ? "md:hidden" : undefined}>{label}</span>
        <span
          aria-hidden="true"
          className={railCollapsed ? "md:hidden" : undefined}
          style={{ fontSize: 9 }}
        >
          {shut ? "▸" : "▾"}
        </span>
        {railCollapsed && (
          <span
            aria-hidden="true"
            className="hidden md:block"
            style={{ height: 1, width: 24, background: "rgba(255,255,255,0.2)" }}
          />
        )}
      </button>
    );
  };

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
        title={label}
        aria-label={label}
        className={`${act ? "active" : ""}${railCollapsed ? " md:justify-center" : ""}`}
        onMouseEnter={tabHover}
        onMouseLeave={tabLeave}
        onClick={() => setOpen(false)}
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
        {/* Label disembunyikan hanya di desktop (>=md) saat mode lipat;
            di drawer mobile label selalu terlihat. */}
        <span className={railCollapsed ? "md:hidden" : undefined}>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay gelap di mobile — klik menutup drawer. Di bawah drawer
          (z-[55] < z-[60]), di atas topbar sticky (z-50) agar seluruh layar
          termasuk topbar ikut redup dan bisa diklik untuk menutup. */}
      {open && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[55] md:hidden"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "none",
            padding: 0,
            cursor: "default",
          }}
        />
      )}
      <aside
        aria-label="Navigasi utama"
        className={`scroll-hide z-[60] w-[220px] transition-all duration-200 ${
          railCollapsed ? "md:w-16" : "md:w-[220px]"
        } ${
          open ? "visible translate-x-0" : "invisible -translate-x-full md:visible md:translate-x-0"
        } fixed inset-y-0 left-0 md:sticky md:top-0 md:h-[100vh]`}
        style={{
          flexShrink: 0,
          background: "#0a3d32",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          // GAS `.room-nav-outer`: sidebar yang sticky, bukan header.
          // Positioning di mobile (fixed off-canvas) vs desktop (sticky)
          // diatur via className Tailwind di atas; di sini hanya visual.
          // Scroll selalu aktif (juga sentuhan HP — bukan hanya hover mouse):
          // scrollbar disembunyikan visual via .scroll-hide di globals.css.
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
      {/* ═══ Blok logo — slot teratas sidebar ═══
          Tinggi band 60px = minHeight topbar agar garis horizontal topbar
          menyambung mulus ke border bawah blok logo. Di mode lipat desktop
          (>=md) wordmark disembunyikan, ikon 32px dipusatkan di rail 64px.
          Di drawer mobile logo selalu tampil penuh. */}
      <div
        className={railCollapsed ? "md:justify-center md:px-0!" : undefined}
        style={{
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link
          href="/"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-puskesmas.png"
              alt="Puskesmas Baruharjo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "inherit",
              }}
            />
          </span>
          <span
            className={railCollapsed ? "md:hidden" : undefined}
            style={{
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              color: "#fff",
              fontFamily: "Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            SIDIRA
          </span>
        </Link>
        {/* Tombol tutup drawer — hanya di mobile, di ujung kanan band logo */}
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
          className="ml-auto md:hidden"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 14,
            lineHeight: 1,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
      {/* ═══ Menu utama ═══ */}
      <div style={sectionHeaderStyle} className={railCollapsed ? "md:hidden" : undefined}>
        🏠 Utama
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
        {makeTab("/", "🏠", "Dashboard", pathname === "/")}
      </div>

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Ruangan ═══ */}
      {renderSectionHeader("ruangan", "🏥 Ruangan")}

      {!isCollapsed("ruangan") && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
            {rooms.map((room) => makeTab(`/inventaris/${room.id}`, room.icon, room.name))}
          </div>

          <button
            type="button"
            title="Tambah Ruangan"
            aria-label="Tambah Ruangan"
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
            className={railCollapsed ? "md:mx-auto! md:text-center!" : undefined}
          >
            <span className={railCollapsed ? "md:hidden" : undefined}>＋ Tambah Ruangan</span>
            {railCollapsed && (
              <span aria-hidden="true" className="hidden md:inline">
                ＋
              </span>
            )}
          </button>
        </>
      )}

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Utilitas ═══ */}
      {renderSectionHeader("utilitas", "⚙️ Utilitas")}

      {!isCollapsed("utilitas") && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
            {utilitas.map((u) => makeTab(`/utilitas/${u.util_id}`, u.icon, u.label))}
          </div>

          <button
            type="button"
            title="Tambah Utilitas"
            aria-label="Tambah Utilitas"
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
            className={railCollapsed ? "md:mx-auto! md:text-center!" : undefined}
          >
            <span className={railCollapsed ? "md:hidden" : undefined}>＋ Tambah Utilitas</span>
            {railCollapsed && (
              <span aria-hidden="true" className="hidden md:inline">
                ＋
              </span>
            )}
          </button>
        </>
      )}

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Barang Keluar (SBBK) ═══ */}
      {renderSectionHeader("sbbk", "📋 Barang Keluar")}

      {!isCollapsed("sbbk") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
          {makeTab("/sbbk", "📤", "SBBK")}
        </div>
      )}

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Rekap Inventaris ═══ */}
      {renderSectionHeader("rekap", "📊 Rekap Inventaris")}

      {!isCollapsed("rekap") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
          {makeTab("/rekap", "📊", "Pemegang Inventaris")}
        </div>
      )}

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Pakta Integritas ═══ */}
      {renderSectionHeader("pakta", "📝 Pakta Integritas")}

      {!isCollapsed("pakta") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
          {makeTab("/pakta", "📝", "Pakta")}
        </div>
      )}

      {/* ═══ Divider ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 12px" }} />

      {/* ═══ Seksi Admin ═══ */}
      {renderSectionHeader("admin", "🛡️ Admin")}

      {!isCollapsed("admin") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 8px" }}>
          {makeTab("/admin", "👥", "Users")}
        </div>
      )}

      {/* GAS #modalOverlay & #utilModalOverlay — dibuka dari sidebar */}
      <AddRoomModal
        key={addRoomOpen ? "room-open" : "room-closed"}
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        onCreated={(roomId) => {
          setOpen(false);
          router.push(`/inventaris/${roomId}`);
        }}
      />
      <AddUtilitasModal
        key={addUtilOpen ? "util-open" : "util-closed"}
        open={addUtilOpen}
        onClose={() => setAddUtilOpen(false)}
        onCreated={(utilId) => {
          setOpen(false);
          router.push(`/utilitas/${utilId}`);
        }}
      />
      </aside>
    </>
  );
}
