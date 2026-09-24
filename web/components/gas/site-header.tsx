"use client";

import * as React from "react";
import Link from "next/link";
import { GlobalSearchBar } from "@/components/gas/global-search-bar";
import { logout } from "@/lib/auth/actions";
import { AVAILABLE_YEARS, useActiveYear } from "@/lib/year-store";

const TAGLINE_WORDS = ["Sistem", "Digital", "Inventaris", "Ruangan"];

export interface SiteHeaderProfile {
  nama: string;
  jabatan?: string;
  avatar: string;
}

export interface SiteHeaderProps {
  /** Jumlah ruangan — GAS `#hs-rooms`. */
  roomCount: number;
  /** Jumlah seluruh item — GAS `#hs-items`. */
  itemCount: number;
  /** Profil pengguna dari Supabase Auth (via getUser di layout server). */
  profile?: SiteHeaderProfile | null;
}

const ACRONYM_LETTERS = [
  { char: "S", accent: true },
  { char: "I", accent: false },
  { char: "D", accent: true },
  { char: "I", accent: false },
  { char: "R", accent: true },
  { char: "A", accent: false },
] as const;

function HeaderStat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? "rgba(32,224,160,0.12)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${
          accent ? "rgba(32,224,160,0.25)" : "rgba(255,255,255,0.14)"
        }`,
        borderRadius: "10px",
        padding: "8px 14px",
        minWidth: "70px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: 800,
          lineHeight: 1,
          color: accent ? "#ffffff" : "#5fffc8",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "9.5px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "rgba(255,255,255,0.5)",
          marginTop: "3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * Chip KIR — di GAS label statis; di v4 menjadi pemilih tahun aktif
 * global (tersimpan lokal). Checklist & laporan menjadikannya tahun awal.
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
  }, [open ]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
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
                background: y === year ? "rgba(32,224,160,0.15)" : "transparent",
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

export function SiteHeader({ roomCount, itemCount, profile }: SiteHeaderProps) {
  const [confirmingLogout, setConfirmingLogout] = React.useState(false);

  // Tanpa profil (belum login / fallback) tampilkan akun default GAS
  // agar tidak ada pergeseran layout.
  const nama = profile?.nama ?? "Administrator SIDIRA";
  const jabatan = profile?.jabatan ?? "Admin Sistem";
  const avatar = profile?.avatar ?? nama.charAt(0).toUpperCase();

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
        // GAS `.site-header`: position relative — ikut scroll hilang.
        // Yang sticky di GAS adalah sidebar, bukan header.
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── 0. Decorative layers — GAS `.site-header::before/::after` ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          zIndex: 0,
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(22, 200, 150, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* ── 1. Accent bar (3px gradient) ── */}
      <div
        style={{
          background:
            "linear-gradient(90deg, #20e0a0, #16c891, #0fa878, #0e6654)",
          height: "3px",
          width: "100%",
        }}
      />

      {/* ── Main content wrap ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "22px 32px 24px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        {/* ── 2. Logo badge ── */}
        <Link
          href="/"
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              overflow: "hidden",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
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
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "1px",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            2026
          </span>
        </Link>

        {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "64px",
              flexShrink: 0,
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent)",
          }}
        />

        {/* ── Branding block ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Brand acronym SIDIRA */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 0,
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {ACRONYM_LETTERS.map((l, i) => (
              <span
                key={i}
                style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  letterSpacing: "-1.5px",
                  fontFamily: "Inter, system-ui, sans-serif",
                  ...(l.accent
                    ? {
                        background:
                          "linear-gradient(135deg, #5fffc8 0%, #20e0a0 50%, #00c980 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(0 2px 8px rgba(32,224,160,0.4))",
                      }
                    : { color: "rgba(255,255,255,0.92)" }),
                }}
              >
                {l.char}
              </span>
            ))}
          </div>

          {/* ── 4. Tagline dua baris: kepanjangan + instansi ── */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.1px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {TAGLINE_WORDS.map((word, i) => (
              <span key={i} style={{ display: "contents" }}>
                <span>{word}</span>
                {i < TAGLINE_WORDS.length - 1 && (
                  <span
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.3)",
                      flexShrink: 0,
                      display: "inline-block",
                      alignSelf: "center",
                    }}
                  />
                )}
              </span>
            ))}
          </div>
          <div
            style={{
              marginTop: "5px",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.2px",
            }}
          >
            UPTD Puskesmas Baruharjo · Trenggalek
          </div>
        </div>

        {/* ── 5. Header stats — GAS `.header-stats` ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <HeaderStat value={String(roomCount)} label="Ruangan" accent />
            <HeaderStat value={String(itemCount)} label="Total Item" />
          </div>
          <YearChip />
        </div>

        {/* ── 6. User bar ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: "auto",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            padding: "8px 14px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #14a98f, #0e7c6b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "14px",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "12px" }}>{nama}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
              {jabatan}
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
              // GAS memakai confirm() bawaan; di sini diganti konfirmasi inline.
              onClick={() => setConfirmingLogout(true)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "6px 14px",
                color: "rgba(255,255,255,0.8)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,80,80,0.2)";
                el.style.borderColor = "rgba(255,80,80,0.4)";
                el.style.color = "#ff6b6b";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,0.1)";
                el.style.borderColor = "rgba(255,255,255,0.2)";
                el.style.color = "rgba(255,255,255,0.8)";
              }}
            >
              ⏻ Keluar
            </button>
          )}
        </div>

        {/* ── 7. Search bar global — GAS `.global-search-bar` ── */}
        <GlobalSearchBar />
      </div>

      {/* ── 8. Wave SVG bottom ── */}
      <svg
        viewBox="0 0 1440 28"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: "block",
          width: "100%",
          height: "28px",
          marginBottom: "-1px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <path
          d="M0,0 C360,28 1080,28 1440,0 L1440,28 L0,28 Z"
          style={{ fill: "var(--background)" }}
        />
      </svg>
    </header>
  );
}
