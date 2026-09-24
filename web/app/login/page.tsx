"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/auth/actions";

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
      <style jsx>{`
        .login-shell {
          position: fixed;
          inset: 0;
          display: flex;
          background: linear-gradient(
            150deg,
            #041f18 0%,
            #062820 30%,
            #0a3d32 65%,
            #0c5240 100%
          );
          align-items: center;
          justify-content: center;
          font-family: var(--font-sora), sans-serif;
          overflow: hidden;
        }

        /* Dekoratif bg pattern */
        .login-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        /* Orb dekoratif */
        .login-shell::after {
          content: "";
          position: absolute;
          top: -120px;
          right: -120px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(22, 200, 150, 0.12) 0%,
            transparent 65%
          );
          pointer-events: none;
        }
        .login-orb2 {
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(14, 118, 107, 0.15) 0%,
            transparent 65%
          );
          pointer-events: none;
        }

        /* Card utama */
        .login-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 48px 44px;
          width: 100%;
          max-width: 420px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 32px 80px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Logo + brand */
        .login-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }
        .login-logo-badge {
          width: 80px;
          height: 80px;
          border-radius: 22px;
          background: #0b0d0c;
          border: 2px solid rgba(255, 255, 255, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 12px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          margin-bottom: 16px;
        }
        .login-emblem {
          width: 64px;
          height: 64px;
          display: block;
          object-fit: contain;
        }
        .login-brand-name {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #fff;
          text-align: center;
        }
        .login-brand-name span {
          color: #20e0a0;
        }
        .login-brand-sub {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          margin-top: 6px;
          line-height: 1.5;
          letter-spacing: 0.3px;
        }

        /* Form */
        .login-form-title {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 20px;
          text-align: center;
        }
        .login-field {
          margin-bottom: 16px;
        }
        .login-field label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input-ico {
          position: absolute;
          left: 14px;
          font-size: 15px;
          opacity: 0.5;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 13px 14px 13px 40px;
          background: rgba(255, 255, 255, 0.07);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          color: #fff;
          font-family: var(--font-sora), sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .login-input:focus {
          border-color: #20e0a0;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 3px rgba(32, 224, 160, 0.12);
        }
        .login-input-pw {
          padding-right: 44px;
        }
        .login-pw-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.35);
          padding: 4px;
          transition: color 0.2s;
        }
        .login-pw-toggle:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        /* Error message */
        .login-err {
          display: ${error ? "block" : "none"};
          background: rgba(185, 28, 28, 0.25);
          border: 1px solid rgba(252, 165, 165, 0.3);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: #fca5a5;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        /* Tombol login */
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #14a98f, #0e7c6b);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: var(--font-sora), sans-serif;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 16px rgba(14, 124, 107, 0.4);
          margin-top: 8px;
        }
        .login-btn:hover {
          background: linear-gradient(135deg, #16c891, #14a98f);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(14, 124, 107, 0.5);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Akun info */
        .login-hint {
          margin-top: 20px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          text-align: center;
        }
        .login-hint p {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.35);
          line-height: 1.6;
          margin: 0;
        }
        .login-hint b {
          color: rgba(255, 255, 255, 0.55);
        }

        /* Footer login */
        .login-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

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

            <div className="login-err">
              {error}
            </div>

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