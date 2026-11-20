import Image from "next/image";
import Link from "next/link";
import { ClockCounterClockwise, SignIn, SquaresFour, Storefront } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { getUser } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "katalog", label: "Katalog" },
  { href: "/riwayat-pengajuan", key: "riwayat", label: "Riwayat" },
] as const;

export type PublicNavKey = (typeof NAV)[number]["key"];

interface PublicShellProps {
  active: PublicNavKey;
  children: ReactNode;
}

/**
 * Shell untuk halaman publik (tanpa sidebar dashboard).
 *
 * Dipakai landing page `/` dan `/lacak`. Header ringkas di semua ukuran,
 * ditambah bottom navigation di layar kecil (pola marketplace) supaya
 * katalog, pelacakan, dan pintu masuk dashboard selalu terjangkau ibu jari.
 */
export async function PublicShell({ active, children }: PublicShellProps) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <span className="flex size-8 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface">
              <Image
                src="/logo-puskesmas.png"
                alt="Logo UPTD Puskesmas Baruharjo"
                width={32}
                height={32}
                preload
                className="size-full object-contain"
              />
            </span>
            <span className="text-[15px] font-extrabold tracking-tight text-foreground">
              <span className="text-primary">SIDI</span>RA
            </span>
          </Link>

          <nav aria-label="Navigasi publik" className="flex items-center gap-1">
            {NAV.map((item) => {
              const on = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "hidden rounded-sm px-3 py-1.5 text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/35 sm:inline-flex",
                    on
                      ? "bg-primary-soft text-primary"
                      : "text-text-2 hover:bg-surface-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <Link
                href="/dashboard"
                className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                <SquaresFour size={15} weight="bold" aria-hidden />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="ml-1 inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
              >
                <SignIn size={15} aria-hidden />
                Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-5 sm:px-6 sm:pt-6 md:pb-16">
        {children}
      </main>

      <footer className="border-t border-border bg-surface pb-20 md:pb-0">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-5 text-[11px] text-text-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>UPTD Puskesmas Baruharjo · Trenggalek</p>
        </div>
      </footer>

      {/* Bottom navigation — pola marketplace, hanya di layar kecil. */}
      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
      >
        <div className="grid h-16 grid-cols-3 pb-[env(safe-area-inset-bottom)]">
          <Link
            href="/"
            aria-current={active === "katalog" ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
              active === "katalog"
                ? "text-primary"
                : "text-text-3 hover:text-foreground"
            )}
          >
            <Storefront size={20} weight={active === "katalog" ? "fill" : "regular"} />
            Katalog
          </Link>
          <Link
            href="/riwayat-pengajuan"
            aria-current={active === "riwayat" ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
              active === "riwayat"
                ? "text-primary"
                : "text-text-3 hover:text-foreground"
            )}
          >
            <ClockCounterClockwise
              size={20}
              weight={active === "riwayat" ? "bold" : "regular"}
            />
            Riwayat
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <SquaresFour size={20} weight="bold" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-semibold text-text-3 transition-colors hover:text-foreground"
            >
              <SignIn size={20} />
              Masuk
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
