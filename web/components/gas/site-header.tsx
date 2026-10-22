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

  // Tanpa profil (belum login / fallback) tampilkan akun default GAS
  // agar tidak ada pergeseran layout.
  const nama = profile?.nama ?? "Administrator SIDIRA";
  const jabatan = profile?.jabatan ?? "Admin Sistem";
  const avatar = profile?.avatar ?? nama.charAt(0).toUpperCase();

  const handleHamburger = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      toggleCollapsed();
    } else {
      window.dispatchEvent(new CustomEvent("sidira:toggle-nav"));
    }
  };

  const handleLogout = () => {
    setConfirmingLogout(false);
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
  .sh-logout-label { display: none !important; }
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
          <div
            style={{
              width: "30px",
              height: "30px",
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
            title={`${nama}${jabatan ? ` — ${jabatan}` : ""}`}
          >
            {avatar}
          </div>
          <div className="sh-usermeta" style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "140px",
              }}
            >
              {nama}
            </div>
          </div>
          {confirmingLogout ? (
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setConfirmingLogout(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
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
                  background: "rgba(255,80,80,0.25)",
                  border: "1px solid rgba(255,80,80,0.45)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  color: "#ff8f8f",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Ya, keluar
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Keluar"
              title="Keluar"
              onClick={() => setConfirmingLogout(true)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "rgba(255,255,255,0.8)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ⏻ <span className="sh-logout-label">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
