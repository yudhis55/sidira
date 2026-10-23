"use client";

import * as React from "react";
import { GlobalSearchBar } from "@/components/gas/global-search-bar";
import { logout } from "@/lib/auth/actions";
import { AVAILABLE_YEARS, useActiveYear } from "@/lib/year-store";
import { useNavUi } from "@/lib/nav-ui-store";

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
    <div ref={wrapRef} className="sh-chip" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Ganti tahun inventaris aktif"
        style={{
          borderRadius: "20px",
          background: "rgba(255,255,255,0.09)",
          border: "1px solid rgba(255,255,255,0.16)",
          padding: "4px 12px",
          fontSize: "10.5px",
          color: "rgba(255,255,255,0.7)",
          fontWeight: 600,
          whiteSpace: "nowrap",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        📅 KIR {year} — Aktif ▾
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Pilih tahun inventaris"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            minWidth: "132px",
            background: "#0a3d32",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "10px",
            padding: "4px",
            zIndex: 200,
            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
          }}
        >
          {AVAILABLE_YEARS.map((y) => (
            <button
              key={y}
              type="button"
              role="option"
              aria-selected={y === year}
              onClick={() => {
                setYear(y);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "7px 10px",
                borderRadius: "7px",
                border: "none",
                background:
                  y === year ? "rgba(32,224,160,0.15)" : "transparent",
                color: y === year ? "#5fffc8" : "rgba(255,255,255,0.75)",
                fontSize: "12px",
                fontWeight: y === year ? 800 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ width: "14px", flexShrink: 0 }}>
                {y === year ? "✓" : ""}
              </span>
              KIR {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Topbar ramping SIDIRA — pengganti hero header.
 * Sticky ~60px di atas kolom konten saja (sidebar kiri full-height terpisah):
 * hamburger, search global, chip tahun, avatar + keluar. Logo "SIDIRA" kini
 * hidup di slot teratas sidebar (lihat RoomNav). Gradien gelap dipertahankan
 * untuk kontinuitas brand.
 */
export function SiteHeader({ profile }: SiteHeaderProps) {
  const toggleCollapsed = useNavUi((s) => s.toggleCollapsed);
  const [confirmingLogout, setConfirmingLogout] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement | null>(null);

  // Tanpa profil (belum login / fallback) tampilkan akun default GAS
  // agar tidak ada pergeseran layout.
  const nama = profile?.nama ?? "Administrator SIDIRA";
  const jabatan = profile?.jabatan ?? "Admin Sistem";
  const avatar = profile?.avatar ?? nama.charAt(0).toUpperCase();

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
    <header
      className="text-white"
      style={{
        background:
          "linear-gradient(150deg, #062820 0%, #0a3d32 35%, #0e6654 75%, #12876e 100%)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        minHeight: "60px",
      }}
    >
      <style>{`
@media (max-width: 767.98px) {
  .sh-usermeta { display: none !important; }
}
`}</style>
      <div
        className="sh-topbar"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "8px 16px",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* ── Hamburger ── */}
        <button
          type="button"
          aria-label="Buka/tutup navigasi"
          onClick={handleHamburger}
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 9,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 17,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ☰
        </button>

        {/* ── Search global — flex-1, baris kedua full-width di mobile ── */}
        <div
          className="sh-search"
          style={{ flex: "1 1 200px", minWidth: 0, maxWidth: "480px" }}
        >
          <GlobalSearchBar />
        </div>

        {/* ── Kanan: chip tahun + user ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginLeft: "auto",
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <YearChip />

          {/* ── Blok akun: klik → popover identitas + keluar ── */}
          <div ref={accountRef} style={{ position: "relative", flexShrink: 0 }}>
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                background: menuOpen
                  ? "rgba(255,255,255,0.14)"
                  : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "10px",
                padding: "4px 10px 4px 4px",
                color: "#fff",
                cursor: "pointer",
                transition: "background 0.15s",
                minHeight: 0,
              }}
            >
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #14a98f, #0e7c6b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "13px",
                  color: "#ffffff",
                  flexShrink: 0,
                }}
                aria-hidden
              >
                {avatar}
              </span>
              <span
                className="sh-usermeta"
                style={{
                  fontWeight: 700,
                  fontSize: "12px",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "140px",
                  display: "block",
                }}
              >
                {nama}
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Menu akun"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "248px",
                  maxWidth: "calc(100vw - 24px)",
                  background: "#fff",
                  border: "1px solid var(--line)",
                  borderRadius: "14px",
                  boxShadow: "0 10px 32px rgba(2, 20, 16, 0.28)",
                  overflow: "hidden",
                  zIndex: 60,
                }}
              >
                {/* Identitas */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px 12px",
                  }}
                >
                  <span
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #14a98f, #0e7c6b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "16px",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    {avatar}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "13px",
                        color: "var(--ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {nama}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--ink3)",
                        marginTop: "2px",
                      }}
                    >
                      {jabatan}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "var(--line)" }} />

                {/* Aksi keluar — konfirmasi dua langkah di dalam popover */}
                {confirmingLogout ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink2)",
                        lineHeight: 1.4,
                      }}
                    >
                      Keluar dari SIDIRA sekarang?
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setConfirmingLogout(false)}
                        style={{
                          flex: 1,
                          background: "var(--line2)",
                          border: "none",
                          borderRadius: "9px",
                          padding: "8px 10px",
                          color: "var(--ink2)",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          flex: 1,
                          background: "var(--red2)",
                          border: "1.5px solid rgba(185, 28, 28, 0.4)",
                          borderRadius: "9px",
                          padding: "8px 10px",
                          color: "var(--red)",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⏻ Ya, keluar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setConfirmingLogout(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      background: "transparent",
                      border: "none",
                      padding: "11px 16px",
                      color: "var(--ink2)",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--red2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span aria-hidden style={{ fontSize: "14px" }}>
                      ⏻
                    </span>
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
