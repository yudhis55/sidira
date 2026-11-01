"use client";

import * as React from "react";
import {
  CalendarBlank,
  CaretDown,
  Check,
  List,
  SignOut,
} from "@phosphor-icons/react";
import { GlobalSearchBar } from "@/components/gas/global-search-bar";
import { logout } from "@/lib/auth/actions";
import { AVAILABLE_YEARS, useActiveYear } from "@/lib/year-store";
import { useNavUi } from "@/lib/nav-ui-store";
import { cn } from "@/lib/utils";

export interface SiteHeaderProfile {
  nama: string;
  jabatan?: string;
  avatar: string;
}

export interface SiteHeaderProps {
  /** Profil pengguna dari Supabase Auth (via getUser di layout server). */
  profile?: SiteHeaderProfile | null;
}

/**
 * Chip KIR — pemilih tahun aktif global (tersimpan lokal).
 * Checklist & laporan menjadikannya tahun awal.
 */
function YearChip() {
  const [year, setYear] = useActiveYear();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Ganti tahun inventaris aktif"
        className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 text-[12px] font-medium text-text-2 transition-colors duration-150 outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/35"
      >
        <CalendarBlank size={15} aria-hidden="true" />
        <span>
          <span className="hidden sm:inline">KIR </span>
          <span className="font-mono text-[12px] font-semibold text-foreground">{year}</span>
        </span>
        <CaretDown size={11} aria-hidden="true" className="text-text-3" />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Pilih tahun inventaris"
          className="absolute right-0 top-[calc(100%+6px)] z-[60] min-w-[148px] rounded-lg border border-border bg-surface p-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
        >
          {AVAILABLE_YEARS.map((y) => {
            const active = y === year;
            return (
              <button
                key={y}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setYear(y);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-[12px] transition-colors",
                  active
                    ? "bg-primary-soft font-semibold text-primary"
                    : "font-medium text-text-2 hover:bg-surface-muted hover:text-foreground"
                )}
              >
                <span className="flex w-3.5 shrink-0 justify-center">
                  {active ? <Check size={12} weight="bold" aria-hidden="true" /> : null}
                </span>
                KIR {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Topbar ramping SIDIRA — 60px, sticky di atas kolom konten saja.
 * Hamburger, search global, chip tahun, avatar + popover keluar.
 */
export function SiteHeader({ profile }: SiteHeaderProps) {
  const toggleCollapsed = useNavUi((s) => s.toggleCollapsed);
  const [confirmingLogout, setConfirmingLogout] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement | null>(null);

  // Tanpa profil (belum login / fallback) tampilkan akun default.
  const nama = profile?.nama ?? "Administrator SIDIRA";
  const jabatan = profile?.jabatan ?? "Admin Sistem";
  // Inisial dari nama — emoji avatar (data lama) tidak dipakai sebagai ikon UI.
  const avatar = nama.trim().charAt(0).toUpperCase();

  // Popover akun: tutup saat klik di luar atau tekan Escape.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmingLogout(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setConfirmingLogout(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleHamburger = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      toggleCollapsed();
    } else {
      window.dispatchEvent(new CustomEvent("sidira:toggle-nav"));
    }
  };

  const handleLogout = () => {
    setConfirmingLogout(false);
    setMenuOpen(false);
    void logout();
  };

  return (
    <header className="sticky top-0 z-50 h-[60px] border-b border-border bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center gap-2 px-3 sm:px-4 md:gap-3">
        {/* ── Hamburger ── */}
        <button
          type="button"
          aria-label="Buka/tutup navigasi"
          onClick={handleHamburger}
          className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-text-2 transition-colors duration-150 outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/35"
        >
          <List size={18} />
        </button>

        {/* ── Search global ── */}
        <div className="min-w-0 max-w-[460px] flex-1">
          <GlobalSearchBar />
        </div>

        {/* ── Kanan: chip tahun + akun ── */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <YearChip />

          <div ref={accountRef} className="relative shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Akun: ${nama}`}
              title={`${nama}${jabatan ? ` — ${jabatan}` : ""}`}
              onClick={() => {
                setMenuOpen((v) => !v);
                setConfirmingLogout(false);
              }}
              className={cn(
                "flex h-9 items-center gap-2 rounded-sm border border-border px-1.5 pr-2 text-foreground transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                menuOpen ? "bg-surface-muted" : "bg-surface hover:bg-surface-muted"
              )}
            >
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-semibold text-primary"
              >
                {avatar}
              </span>
              <span className="hidden max-w-[140px] truncate text-[12px] font-semibold md:block">
                {nama}
              </span>
              <CaretDown size={11} aria-hidden="true" className="text-text-3" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Menu akun"
                className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[260px] max-w-[calc(100vw-24px)] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
              >
                {/* Identitas */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[15px] font-semibold text-primary"
                  >
                    {avatar}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {nama}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-text-3">{jabatan}</div>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {confirmingLogout ? (
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <div className="text-[12px] leading-snug text-text-2">
                      Keluar dari SIDIRA sekarang?
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingLogout(false)}
                        className="h-8 flex-1 rounded-sm border border-border bg-surface text-[12px] font-semibold text-text-2 transition-colors hover:bg-surface-muted"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-sm border border-danger/50 bg-surface text-[12px] font-semibold text-danger transition-colors hover:bg-danger-soft"
                      >
                        <SignOut size={13} aria-hidden="true" />
                        Ya, keluar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setConfirmingLogout(true)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12.5px] font-semibold text-text-2 transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <SignOut size={16} aria-hidden="true" />
                    Keluar dari akun
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
