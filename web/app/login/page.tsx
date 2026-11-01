"use client";

import { useActionState, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Eye,
  EyeSlash,
  Lock,
  ShieldCheck,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import "./login.css";

interface LoginState {
  error: string;
}

const initialState: LoginState = { error: "" };

async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await login(formData);
  return { error: result?.error ?? "" };
}

const FEATURES = [
  "Inventaris per ruangan yang rapi dan mudah diaudit",
  "SBBK, pakta integritas, dan rekap dalam satu alur",
  "Akses berbasis peran: admin, editor, viewer",
];

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPw, setShowPw] = useState(false);
  const error = state.error || null;

  return (
    <div className="login-shell grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
      {/* ── Panel brand (desktop) ── */}
      <aside className="login-aside hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-puskesmas.png"
              alt="Logo Puskesmas Baruharjo"
              className="size-full object-contain"
            />
          </span>
          <span className="text-[18px] font-extrabold tracking-tight text-white">
            <span className="text-[#5eead4]">SIDI</span>RA
          </span>
        </div>

        <div className="max-w-[440px]">
          <div className="mb-5 flex size-11 items-center justify-center rounded-md border border-white/15 text-[#5eead4]">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] text-white">
            Sistem Digital Inventaris Ruangan Aset
          </h1>
          <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-white/60">
            Satu tempat untuk mencatat, memverifikasi, dan melaporkan aset
            UPTD Puskesmas Baruharjo.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/70">
                <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-[#5eead4]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-white/35">
          UPTD Puskesmas Baruharjo · Trenggalek
        </p>
      </aside>

      {/* ── Panel form ── */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="login-card rounded-lg border border-border bg-surface p-7 sm:p-9">
            <div className="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-puskesmas.png"
                    alt="Logo Puskesmas Baruharjo"
                    className="size-full object-contain"
                  />
                </span>
                <span className="text-[16px] font-extrabold tracking-tight text-foreground">
                  <span className="text-primary">SIDI</span>RA
                </span>
              </div>
              <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
                Masuk ke dashboard
              </h2>
              <p className="mt-1.5 text-[13px] leading-snug text-text-3">
                Gunakan akun SIDIRA yang diberikan administrator.
              </p>
            </div>

            <form action={formAction}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-[12px] font-semibold text-text-2"
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Masukkan username..."
                    autoComplete="username"
                    required
                    className="h-10 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[12px] font-semibold text-text-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
                  />
                  <input
                    type={showPw ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Masukkan password..."
                    autoComplete="current-password"
                    required
                    className="h-10 w-full rounded-sm border border-border bg-surface pl-9 pr-10 text-[13px] text-foreground outline-none transition-colors placeholder:text-text-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    title={showPw ? "Sembunyikan password" : "Tampilkan password"}
                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-text-3 transition-colors hover:bg-surface-muted hover:text-foreground"
                  >
                    {showPw ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-sm border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] font-medium text-danger"
                >
                  <WarningCircle size={15} className="mt-px shrink-0" />
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="mt-1 w-full"
              >
                {isPending ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke SIDIRA
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 rounded-sm border border-border bg-surface-subtle px-3.5 py-3 text-center">
              <p className="text-[11px] leading-relaxed text-text-3">
                <b className="font-semibold text-text-2">Admin:</b> sidira / sidira2026
                <br />
                <b className="font-semibold text-text-2">Kepala Puskesmas:</b> kapus / kapus2026
                <br />
                <b className="font-semibold text-text-2">Pengurus Barang:</b> pengurus / barang2026
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-text-3">
            SIDIRA v2.0 · Puskesmas Baruharjo · Trenggalek · 2026
          </p>
        </div>
      </main>
    </div>
  );
}
