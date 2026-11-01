"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  CaretDown,
  ChartBar,
  FileText,
  GearSix,
  Plus,
  SquaresFour,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { AddRoomModal } from "@/components/inventaris/add-room-modal";
import { AddUtilitasModal } from "@/components/utilitas/add-utilitas-modal";
import { useRoomList } from "@/lib/room-store";
import { useUtilitasList } from "@/lib/utilitas-store";
import { useNavUi } from "@/lib/nav-ui-store";
import { cn } from "@/lib/utils";
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

  // Mode lipat (icon rail) khusus desktop (>=md) — store persist "sidira:nav-ui".
  // Di mobile (<md) nilai ini diabaikan: drawer selalu 220px penuh karena
  // semua penyesuaian rail memakai varian `md:` (base `w-[220px]` tetap).
  const railCollapsed = useNavUi((s) => s.collapsed);

  // Modal tambah ruangan/utilitas dibuka langsung dari sidebar.
  const [addRoomOpen, setAddRoomOpen] = React.useState(false);
  const [addUtilOpen, setAddUtilOpen] = React.useState(false);

  // Drawer off-canvas di mobile (<md): dibuka via hamburger di SiteHeader
  // lewat custom window event (tanpa prop-drilling — AppLayout server comp).
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("sidira:toggle-nav", onToggle);
    return () => window.removeEventListener("sidira:toggle-nav", onToggle);
  }, []);

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

  // Seksi yang memuat path aktif selalu dianggap terbuka.
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

  const renderSectionHeader = (key: string, label: string) => {
    const shut = isCollapsed(key);
    return (
      <button
        type="button"
        aria-expanded={!shut}
        aria-label={label}
        title={label}
        onClick={() => toggleSection(key)}
        className={cn(
          "mt-2 flex w-full items-center justify-between gap-2 px-2 pb-1 pt-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-text-3",
          railCollapsed && "md:justify-center md:px-0"
        )}
      >
        <span className={railCollapsed ? "md:hidden" : undefined}>{label}</span>
        <CaretDown
          size={12}
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-transform duration-150",
            shut && "-rotate-90",
            railCollapsed && "md:hidden"
          )}
        />
        {railCollapsed && (
          <span aria-hidden="true" className="hidden h-px w-6 bg-border md:block" />
        )}
      </button>
    );
  };

  const makeTab = (href: string, icon: React.ReactNode, label: string, active?: boolean) => {
    const act = active ?? isActive(href);
    return (
      <Link
        key={href}
        href={href}
        title={label}
        aria-label={label}
        aria-current={act ? "page" : undefined}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-[13px] font-medium no-underline transition-colors duration-150",
          act
            ? "bg-primary-soft text-primary"
            : "text-text-2 hover:bg-surface-muted hover:text-foreground",
          railCollapsed && "md:justify-center md:gap-0 md:px-0"
        )}
        onClick={() => setOpen(false)}
      >
        <span className="flex size-[18px] shrink-0 items-center justify-center">{icon}</span>
        <span className={cn("truncate", railCollapsed && "md:hidden")}>{label}</span>
      </Link>
    );
  };

  const roomIcon = (icon: string) => (
    <span className="flex size-7 items-center justify-center rounded-sm bg-surface-muted text-[16px] leading-none">
      {icon}
    </span>
  );

  const navIcon = (node: React.ReactNode) => (
    <span className="text-[18px] leading-none">{node}</span>
  );

  const addButton = (
    kind: "Ruangan" | "Utilitas",
    onClick: () => void
  ) => (
    <button
      type="button"
      title={`Tambah ${kind}`}
      aria-label={`Tambah ${kind}`}
      onClick={onClick}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-[13px] font-medium text-text-3 transition-colors duration-150 hover:bg-surface-muted hover:text-foreground",
        railCollapsed && "md:justify-center md:gap-0 md:px-0"
      )}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center">
        <Plus size={16} />
      </span>
      <span className={cn("truncate", railCollapsed && "md:hidden")}>Tambah {kind}</span>
    </button>
  );

  return (
    <>
      {/* Overlay di mobile — klik menutup drawer. Di bawah drawer (z-[55] < z-[60]),
          di atas topbar sticky (z-50) agar seluruh layar ikut redup. */}
      {open && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[55] bg-foreground/40 md:hidden"
        />
      )}
      <aside
        aria-label="Navigasi utama"
        className={cn(
          "scroll-hide fixed inset-y-0 left-0 z-[60] flex w-[220px] flex-col overflow-y-auto overflow-x-hidden border-r border-border bg-surface transition-[width,transform] duration-200",
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          railCollapsed ? "md:w-16" : "md:w-[220px]",
          open ? "visible translate-x-0" : "invisible -translate-x-full md:visible"
        )}
      >
        {/* ═══ Blok logo — 60px, menyambung border topbar ═══ */}
        <div
          className={cn(
            "flex h-[60px] shrink-0 items-center gap-2 border-b border-border px-3.5",
            railCollapsed && "md:justify-center md:px-0"
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 no-underline"
            aria-label="SIDIRA — Dashboard"
          >
            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-puskesmas.png"
                alt="Puskesmas Baruharjo"
                className="size-full object-contain"
              />
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-[16px] font-extrabold tracking-tight text-foreground",
                railCollapsed && "md:hidden"
              )}
            >
              <span className="text-primary">SIDI</span>RA
            </span>
          </Link>
          {/* Tombol tutup drawer — hanya di mobile */}
          <button
            type="button"
            aria-label="Tutup navigasi"
            onClick={() => setOpen(false)}
            className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-text-2 transition-colors hover:bg-surface-muted hover:text-foreground md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* ═══ Menu utama ═══ */}
        <div className="flex flex-1 flex-col px-2 pb-4">
          {renderSectionHeader("utama", "Utama")}
          <div className="flex flex-col gap-0.5">
            {makeTab("/", navIcon(<SquaresFour size={18} />), "Dashboard", pathname === "/")}
          </div>

          <div className="my-2 h-px bg-border" />

          {/* ═══ Ruangan ═══ */}
          {renderSectionHeader("ruangan", "Ruangan")}
          {!isCollapsed("ruangan") && (
            <div className="flex flex-col gap-0.5">
              {rooms.map((room) => makeTab(`/inventaris/${room.id}`, roomIcon(room.icon), room.name))}
              {addButton("Ruangan", () => setAddRoomOpen(true))}
            </div>
          )}

          <div className="my-2 h-px bg-border" />

          {/* ═══ Utilitas ═══ */}
          {renderSectionHeader("utilitas", "Utilitas")}
          {!isCollapsed("utilitas") && (
            <div className="flex flex-col gap-0.5">
              {makeTab("/utilitas", navIcon(<GearSix size={18} />), "Semua Utilitas")}
              {utilitas.map((u) => makeTab(`/utilitas/${u.util_id}`, roomIcon(u.icon), u.label))}
              {addButton("Utilitas", () => setAddUtilOpen(true))}
            </div>
          )}

          <div className="my-2 h-px bg-border" />

          {/* ═══ Barang Keluar (SBBK) ═══ */}
          {renderSectionHeader("sbbk", "Barang Keluar")}
          {!isCollapsed("sbbk") && (
            <div className="flex flex-col gap-0.5">
              {makeTab("/sbbk", navIcon(<ArrowSquareOut size={18} />), "SBBK")}
            </div>
          )}

          <div className="my-2 h-px bg-border" />

          {/* ═══ Rekap Inventaris ═══ */}
          {renderSectionHeader("rekap", "Rekap Inventaris")}
          {!isCollapsed("rekap") && (
            <div className="flex flex-col gap-0.5">
              {makeTab("/rekap", navIcon(<ChartBar size={18} />), "Pemegang Inventaris")}
            </div>
          )}

          <div className="my-2 h-px bg-border" />

          {/* ═══ Pakta Integritas ═══ */}
          {renderSectionHeader("pakta", "Pakta Integritas")}
          {!isCollapsed("pakta") && (
            <div className="flex flex-col gap-0.5">
              {makeTab("/pakta", navIcon(<FileText size={18} />), "Pakta")}
            </div>
          )}

          <div className="my-2 h-px bg-border" />

          {/* ═══ Admin ═══ */}
          {renderSectionHeader("admin", "Admin")}
          {!isCollapsed("admin") && (
            <div className="flex flex-col gap-0.5">
              {makeTab("/admin", navIcon(<UsersThree size={18} />), "Users")}
            </div>
          )}

        </div>

        {/* Modals dibuka dari sidebar */}
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
