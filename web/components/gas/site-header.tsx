"use client";

import { useRouter } from "next/navigation";

export function SiteHeader() {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-[100] h-14 px-5 flex items-center justify-between text-white"
      style={{ background: "linear-gradient(135deg, #062820 0%, #12876e 100%)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center">
          <span className="font-bold text-sm">S</span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-base tracking-wider leading-tight">SIDIRA</span>
          <span className="text-[11px] text-white/70 hidden sm:inline leading-tight">
            Sistem Digital Inventaris Ruangan
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">sidira</span>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded">admin</span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-white/80 hover:text-white px-2 py-1 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
