"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/utilitas", label: "Utilitas" },
  { href: "/sbbk", label: "SBBK" },
  { href: "/pakta", label: "Pakta" },
  { href: "/rekap", label: "Rekap" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/laporan", label: "Laporan" },
  { href: "/admin/users", label: "Users" },
] as const;

const ACRONYM_CHIPS = [
  { letter: "S", word: "Sistem" },
  { letter: "I", word: "Inventaris" },
  { letter: "D", word: "Digital" },
  { letter: "I", word: "" },
  { letter: "R", word: "" },
  { letter: "A", word: "" },
] as const;

const TAGLINE_WORDS = ["Sistem", "Digital", "Inventaris", "Ruangan", "Aset"];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-[100] text-white"
      style={{
        background:
          "linear-gradient(150deg, #062820 0%, #0a3d32 35%, #0e6654 75%, #12876e 100%)",
        position: "sticky",
        overflow: "hidden",
      }}
    >
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
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "20px 36px 16px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
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
              width: "72px",
              height: "72px",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
            }}
          >
            🏥
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
            height: "70px",
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
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #5fffc8 0%, #20e0a0 50%, #00c980 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-2px",
                filter: "drop-shadow(0 2px 8px rgba(32,224,160,0.4))",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              S
            </span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-2px",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              I
            </span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #5fffc8 0%, #20e0a0 50%, #00c980 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-2px",
                filter: "drop-shadow(0 2px 8px rgba(32,224,160,0.4))",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              D
            </span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-2px",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              I
            </span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #5fffc8 0%, #20e0a0 50%, #00c980 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-2px",
                filter: "drop-shadow(0 2px 8px rgba(32,224,160,0.4))",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              R
            </span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-2px",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              A
            </span>
          </div>

          {/* ── 4. Brand fullname / tagline ── */}
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "0.1px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "18px",
                height: "18px",
                borderRadius: "5px",
                background: "rgba(32,224,160,0.2)",
                border: "1px solid rgba(32,224,160,0.35)",
                fontSize: "10px",
                color: "#20e0a0",
                flexShrink: 0,
              }}
            >
              ✦
            </span>
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

          {/* ── 3. Acronym breakdown chips ── */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {ACRONYM_CHIPS.map((chip, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: "12px",
                    color: "#20e0a0",
                    marginRight: "2px",
                  }}
                >
                  {chip.letter}
                </span>
                {chip.word}
              </span>
            ))}
          </div>
        </div>

        {/* ── 6. User bar ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              color: "#5fffc8",
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "13px" }}>sidira</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              admin
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
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
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(255,80,80,0.2)";
              (e.target as HTMLButtonElement).style.borderColor =
                "rgba(255,80,80,0.4)";
              (e.target as HTMLButtonElement).style.color = "#ff6b6b";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.1)";
              (e.target as HTMLButtonElement).style.borderColor =
                "rgba(255,255,255,0.2)";
              (e.target as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.8)";
            }}
          >
            ⏻ Keluar
          </button>
        </div>
      </div>

      {/* ── Nav row ── */}
      <div
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "0 36px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
          aria-label="Navigasi utama"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/admin/users"
                ? pathname.startsWith("/admin/users")
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "13px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  color: isActive
                    ? "white"
                    : "rgba(255,255,255,0.8)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── 5. Wave SVG bottom ── */}
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
          fill="var(--background)"
        />
      </svg>
    </header>
  );
}
