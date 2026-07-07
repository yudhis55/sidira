"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock mode: redirect immediately
    router.push("/");
  }

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
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.15),
            rgba(255, 255, 255, 0.05)
          );
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          box-shadow:
            0 12px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          margin-bottom: 16px;
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
        .login-divider {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #20e0a0, #0e7c6b);
          border-radius: 2px;
          margin: 14px auto 0;
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
      `}</style>

      <div className="login-shell">
        <div className="login-orb2"></div>
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-badge" style={{ background: "transparent", overflow: "hidden" }}>
              <Image 
                src="/logo-puskesmas.svg" 
                alt="Logo Puskesmas" 
                width={80} 
                height={80} 
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }} 
              />
            </div>
            <div className="login-brand-name">
              SIDIR<span>A</span>
            </div>
            <div className="login-brand-sub">
              Sistem Digital Inventaris Ruangan<br />
              Puskesmas Baruharjo
            </div>
            <div className="login-divider"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-form-title">Akses Panel Admin</div>

            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-ico">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="login-input"
                  placeholder="Masukkan username"
                  defaultValue="sidira"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-ico">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="login-input"
                  placeholder="Masukkan password"
                  defaultValue="sidira2026"
                  required
                />
              </div>
            </div>

            <div className="login-err">
              {error}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>

          <div className="login-hint">
            <p>Untuk mencoba, gunakan username <b>sidira</b> dan password <b>sidira2026</b></p>
          </div>
        </div>
      </div>
    </>
  );
}