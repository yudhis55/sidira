"use client";

/**
 * Search bar global di header — port GAS `.global-search-bar` / `#gsDropdown`
 * (index.html ~6955 & ~8070).
 *
 * Beda dengan versi palette sebelumnya: kolom pencarian selalu terlihat di
 * header (lengkap dengan badge Ctrl+K dan tombol bersihkan), sedangkan hasil
 * tampil sebagai dropdown putih di bawahnya. Dropdown dirender lewat portal
 * (posisi fixed mengikuti kolom pencarian) agar tidak terpotong.
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/lib/auth/global-search";
import { mockGlobalSearch } from "@/lib/mock-data/global-search";
import { useIsClient } from "@/lib/use-is-client";

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

const GROUP_ICON: Record<SearchResult["group"], string> = {
  Ruangan: "🏥",
  Item: "📦",
  Usulan: "📝",
};

interface Anchor {
  left: number;
  top: number;
  width: number;
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);
  const mounted = useIsClient();

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // GAS: Ctrl+K memfokuskan kolom pencarian, Esc menutup hasil.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Posisi dropdown mengikuti kolom pencarian (header sticky + bisa di-scroll).
  const measure = React.useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({ left: r.left, top: r.bottom + 6, width: r.width });
  }, []);

  React.useEffect(() => {
    if (!focused) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [focused, measure]);

  // Pencarian ter-debounce 250ms, minimal 2 karakter (sama dengan GAS gsSearch).
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      debounceRef.current = setTimeout(() => {
        setResults([]);
        setLoading(false);
        setActiveIdx(0);
      }, 0);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = IS_MOCK ? mockGlobalSearch(q) : await globalSearch(q);
        setResults(r);
        setActiveIdx(0);
      } catch (err) {
        console.error("global search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const grouped = React.useMemo(() => {
    const map = new Map<SearchResult["group"], SearchResult[]>();
    for (const r of results) {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    }
    return Array.from(map.entries());
  }, [results]);

  const go = (r: SearchResult) => {
    setQ("");
    setResults([]);
    setFocused(false);
    router.push(r.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) go(results[activeIdx]);
    }
  };

  const showDropdown = focused && q.trim().length > 0;

  return (
    <div className="w-full min-w-0 basis-full px-1 pb-1">
      {/* GAS .gsb-wrap */}
      <div
        ref={wrapRef}
        onClick={() => inputRef.current?.focus()}
        className="flex w-full max-w-[480px] cursor-text items-center gap-2 rounded-xl border-[1.5px] border-white/20 bg-white/[0.14] px-3.5 py-2 transition-all focus-within:border-white/50 focus-within:bg-white/20 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.1)]"
      >
        <span className="shrink-0 text-[15px] opacity-70" aria-hidden>
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          // Blur ditunda supaya klik pada hasil sempat terproses.
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Cari barang, alat, sarana... (Ctrl+K)"
          autoComplete="off"
          aria-label="Pencarian global"
          className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-white outline-none placeholder:text-[12.5px] placeholder:text-white/55"
        />
        {q ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            aria-label="Bersihkan pencarian"
            className="flex size-5 shrink-0 items-center justify-center rounded-full border-none bg-white/15 p-0 text-[11px] text-white/70 transition-colors hover:bg-white/30 hover:text-white"
          >
            ✕
          </button>
        ) : (
          <kbd className="shrink-0 rounded-[5px] border-[1.5px] border-white/30 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.3px] text-white/60">
            Ctrl+K
          </kbd>
        )}
      </div>

      {/* GAS #gsDropdown — di-portal agar tidak terpotong header */}
      {mounted && showDropdown && anchor
        ? createPortal(
            <div
              className="fixed z-[900] max-h-[520px] overflow-y-auto rounded-[14px] border-[1.5px] border-line bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
              style={{
                left: anchor.left,
                top: anchor.top,
                width: Math.max(anchor.width, 480),
              }}
            >
              {/* GAS .gs-drop-head */}
              <div className="sticky top-0 z-[1] flex items-center gap-2.5 border-b border-line bg-bg px-4 py-2.5">
                <span className="text-[11px] font-bold text-ink3">
                  {loading ? (
                    "Mencari…"
                  ) : (
                    <>
                      <b className="font-mono text-teal">{results.length}</b>{" "}
                      hasil untuk “{q.trim()}”
                    </>
                  )}
                </span>
                <span className="ml-auto text-[10px] text-ink3">
                  ↑↓ pilih · Enter buka · Esc tutup
                </span>
              </div>

              {!loading && results.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12.5px] text-ink3">
                  {q.trim().length < 2
                    ? "Ketik minimal 2 karakter untuk mencari"
                    : "Tidak ada hasil ditemukan"}
                </div>
              ) : (
                grouped.map(([group, list]) => (
                  <div key={group} className="border-b border-line last:border-b-0">
                    <div className="sticky top-[41px] flex items-center gap-2 bg-bg px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.4px] text-ink2">
                      <span aria-hidden>{GROUP_ICON[group]}</span>
                      {group}
                      <span className="ml-auto rounded-[10px] bg-line2 px-[7px] py-px text-[10px] font-bold text-ink3">
                        {list.length}
                      </span>
                    </div>
                    {list.map((r) => {
                      const idx = results.indexOf(r);
                      const on = idx === activeIdx;
                      return (
                        <button
                          key={`${r.group}-${idx}`}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => go(r)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`flex w-full items-center gap-2.5 border-b border-line px-4 py-[9px] pl-8 text-left last:border-b-0 transition-colors ${
                            on ? "bg-teal4" : "hover:bg-teal4"
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-ink">
                            {r.label}
                          </span>
                          {r.sub ? (
                            <span className="shrink-0 truncate text-[11px] text-ink3">
                              {r.sub}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
