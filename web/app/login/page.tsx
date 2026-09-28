"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/auth/actions";
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

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPw, setShowPw] = useState(false);
  const error = state.error || null;

  return (
    <>

      <div className="login-shell">
        <div className="login-orb2"></div>
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-badge" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="login-emblem"
                src="/logo-puskesmas.png"
                alt="Logo Puskesmas Baruharjo"
                width={64}
                height={64}
              />
            </div>
            <div className="login-brand-name">
              <span>SIDI</span>RA
            </div>
            <div className="login-brand-sub">
              Sistem Digital Inventaris Ruangan Aset<br />
              UPTD Puskesmas Baruharjo · Trenggalek
            </div>
          </div>

          <form action={formAction}>
            <div className="login-form-title">MASUK KE DASHBOARD</div>

            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-ico">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="login-input"
                  placeholder="Masukkan username..."
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-ico">🔒</span>
                <input
                  type={showPw ? "text" : "password"}
                  id="password"
                  name="password"
                  className="login-input login-input-pw"
                  placeholder="Masukkan password..."
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  title={showPw ? "Sembunyikan password" : "Tampilkan password"}
                  aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error ? <div className="login-err">{error}</div> : null}

            <button type="submit" className="login-btn" disabled={isPending}>
              {isPending ? (
                "Memproses..."
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M6.5 2.5h-4v11h4v-1.6H4.2V4.1h2.3V2.5z"
                      fill="#f5a623"
                    />
                    <path
                      d="M6.2 8h6.6M10.9 5.4L13.5 8l-2.6 2.6"
                      stroke="#f5a623"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Masuk ke SIDIRA
                </>
              )}
            </button>
          </form>

          <div className="login-hint">
            <p>
              <b>Admin:</b> sidira / sidira2026<br />
              <b>Kepala Puskesmas:</b> kapus / kapus2026<br />
              <b>Pengurus Barang:</b> pengurus / barang2026
            </p>
          </div>

          <div className="login-footer">
            SIDIRA v2.0 · Puskesmas Baruharjo · Trenggalek · 2026
          </div>
        </div>
      </div>
    </>
  );
}
