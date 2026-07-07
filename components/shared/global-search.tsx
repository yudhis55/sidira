"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/auth/global-search";

/**
 * Global search palette — opened with Ctrl+K / Cmd+K.
 * Searches rooms, items, and usulan (GAS Ctrl+K scope).
 * Renders nothing until opened; mounts a global keydown listener.
 */
export function GlobalSearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQ("");
      setResults([]);
      setActiveIdx(0);
      // wait a tick for the input to mount
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await globalSearch(q);
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
  }, [q, open]);

  const grouped = useMemo(() => {
    const map = new Map<SearchResult["group"], SearchResult[]>();
    for (const r of results) {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    }
    return Array.from(map.entries());
  }, [results]);

  const flat = useMemo(() => results, [results]);

  const go = useCallback(
    (r: SearchResult) => {
      setOpen(false);
      router.push(r.href);
    },
    [router, setOpen]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[activeIdx]) go(flat[activeIdx]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-none border border-border bg-popover shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Cari ruangan, item, atau usulan…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q ? (
            <button onClick={() => setQ("")} aria-label="Bersihkan">
              <X className="size-4 text-muted-foreground" />
            </button>
          ) : null}
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Mencari…
            </div>
          ) : flat.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {q.trim().length < 2
                ? "Ketik minimal 2 karakter untuk mencari"
                : "Tidak ada hasil ditemukan"}
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group}>
                <div className="bg-muted px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </div>
                {items.map((r) => {
                  const idx = flat.indexOf(r);
                  const on = idx === activeIdx;
                  return (
                    <button
                      key={`${r.group}-${idx}`}
                      onClick={() => go(r)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        on ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <span className="font-medium">{r.label}</span>
                      {r.sub ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {r.sub}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
