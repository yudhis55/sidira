"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronDown,
  Pin,
  PinOff,
  Menu,
  Plus,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFavorite, removeFavorite, type Favorite } from "@/lib/auth/favorites";
import { toast } from "sonner";
import type { Room } from "@/types/database";
import type { UtilMeta } from "@/lib/auth/utilitas";

// Section keys for collapse state
type SectionKey =
  | "favorites"
  | "ruangan"
  | "utilitas"
  | "barangKeluar"
  | "rekap"
  | "pakta";

interface SmartSidebarProps {
  rooms: Room[];
  favorites: Favorite[];
  utilitas: UtilMeta[];
  user: { nama: string; role: string } | null;
  onLogout: () => void;
}

export function SmartSidebar({ rooms, favorites, utilitas, user, onLogout }: SmartSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  // Lazy init from localStorage to avoid setState-in-effect cascading renders.
  const [collapsedSections, setCollapsedSections] = useState<Set<SectionKey>>(() => {
    if (typeof window === "undefined") return new Set();
    const saved = localStorage.getItem("sidebar-collapsed-sections");
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // Save collapsed state to localStorage
  const toggleSection = useCallback((section: SectionKey) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      localStorage.setItem("sidebar-collapsed-sections", JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Focus trap for mobile drawer
  useEffect(() => {
    if (!isMobileDrawerOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const hamburgerButton = hamburgerButtonRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when drawer opens
    setTimeout(() => {
      firstElement?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab: focus previous element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: focus next element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    drawer.addEventListener("keydown", handleKeyDown);

    // Return focus to hamburger button when drawer closes
    return () => {
      drawer.removeEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        hamburgerButton?.focus();
      }, 100);
    };
  }, [isMobileDrawerOpen]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter rooms by search query (flat list, not grouped — matches GAS)
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const query = searchQuery.toLowerCase();
    return rooms.filter((room) => {
      const roomName = room.name?.toLowerCase() || "";
      return roomName.includes(query);
    });
  }, [rooms, searchQuery]);

  // Get favorite rooms
  const favoriteRooms = useMemo(() => {
    const favoriteRoomIds = new Set(favorites.map((f) => f.room_id));
    return rooms.filter((room) => favoriteRoomIds.has(room.id));
  }, [rooms, favorites]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(
    async (roomId: string, roomName: string, isFavorite: boolean) => {
      try {
        if (isFavorite) {
          await removeFavorite(roomId);
          toast.success(`Ruangan "${roomName}" dihapus dari favorit`);
        } else {
          await addFavorite(roomId);
          toast.success(`Ruangan "${roomName}" ditambahkan ke favorit`);
        }
      } catch {
        toast.error("Gagal menyimpan favorit. Coba lagi.");
      }
    },
    []
  );

  // Check if room is favorite
  const isFavorite = useCallback(
    (roomId: string) => favorites.some((f) => f.room_id === roomId),
    [favorites]
  );

  // Navigate to room
  const navigateToRoom = useCallback(
    (roomId: string) => {
      router.push(`/inventaris/${roomId}`);
      setIsMobileDrawerOpen(false);
    },
    [router]
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        ref={hamburgerButtonRef}
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsMobileDrawerOpen(true)}
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={drawerRef}
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border
          transform transition-transform duration-300 ease-out-quart
          md:relative md:translate-x-0
          ${isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="navigation"
        aria-label="Navigasi utama"
      >
        <div className="flex h-full flex-col">
          {/* User info section */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user?.nama || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.role || "viewer"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onLogout}
                aria-label="Logout"
                className="shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Search box */}
            <div className="sticky top-0 z-10 border-b border-border bg-background p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ruangan..."
                  className="h-8 pl-8 pr-8 text-xs"
                  aria-label="Cari ruangan"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {!searchQuery && (
                  <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Favorites section — useful addition, kept after search */}
            <CollapsibleSection
              title="⭐ FAVORIT"
              isCollapsed={collapsedSections.has("favorites")}
              onToggle={() => toggleSection("favorites")}
              defaultExpanded
            >
              {favoriteRooms.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <Pin className="mx-auto h-6 w-6 text-muted-foreground/30" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Belum ada ruangan favorit. Klik pin icon di samping nama ruangan untuk menambahkan.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {favoriteRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      isActive={pathname === `/inventaris/${room.id}`}
                      isFavorite={true}
                      onNavigate={() => navigateToRoom(room.id)}
                      onFavoriteToggle={() =>
                        handleFavoriteToggle(room.id, room.name || "Ruangan", true)
                      }
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>

            {/* ── Seksi 1: Ruangan ── */}
            <CollapsibleSection
              title="🏥 RUANGAN"
              isCollapsed={collapsedSections.has("ruangan")}
              onToggle={() => toggleSection("ruangan")}
              defaultExpanded
            >
              {searchQuery && filteredRooms.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Tidak ada ruangan yang cocok dengan &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Belum ada ruangan.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredRooms.map((room) => (
                    <RoomItem
                      key={room.id}
                      room={room}
                      isActive={pathname === `/inventaris/${room.id}`}
                      isFavorite={isFavorite(room.id)}
                      onNavigate={() => navigateToRoom(room.id)}
                      onFavoriteToggle={() =>
                        handleFavoriteToggle(
                          room.id,
                          room.name || "Ruangan",
                          isFavorite(room.id)
                        )
                      }
                    />
                  ))}
                </div>
              )}
              <div className="px-1 pt-1">
                <AddItemLink href="/inventaris/new" label="Tambah Ruangan" onClick={() => setIsMobileDrawerOpen(false)} />
              </div>
            </CollapsibleSection>

            {/* ── Seksi 2: Utilitas ── */}
            <CollapsibleSection
              title="⚙️ UTILITAS"
              isCollapsed={collapsedSections.has("utilitas")}
              onToggle={() => toggleSection("utilitas")}
              defaultExpanded
            >
              {utilitas.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Belum ada utilitas.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {utilitas.map((util) => (
                    <EmojiNavItem
                      key={util.util_id}
                      href={`/utilitas/${util.util_id}`}
                      emoji={util.icon}
                      label={util.label}
                      isActive={pathname === `/utilitas/${util.util_id}`}
                      onClick={() => setIsMobileDrawerOpen(false)}
                    />
                  ))}
                </div>
              )}
              <div className="px-1 pt-1">
                <AddItemLink href="/utilitas/new" label="Tambah Utilitas" onClick={() => setIsMobileDrawerOpen(false)} />
              </div>
            </CollapsibleSection>

            {/* ── Seksi 3: Barang Keluar ── */}
            <CollapsibleSection
              title="📋 BARANG KELUAR"
              isCollapsed={collapsedSections.has("barangKeluar")}
              onToggle={() => toggleSection("barangKeluar")}
              defaultExpanded
            >
              <div className="space-y-0.5">
                <EmojiNavItem
                  href="/sbbk"
                  emoji="📋"
                  label="SBBK"
                  isActive={pathname.startsWith("/sbbk")}
                  onClick={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </CollapsibleSection>

            {/* ── Seksi 4: Rekap Inventaris ── */}
            <CollapsibleSection
              title="📊 REKAP INVENTARIS"
              isCollapsed={collapsedSections.has("rekap")}
              onToggle={() => toggleSection("rekap")}
              defaultExpanded
            >
              <div className="space-y-0.5">
                <EmojiNavItem
                  href="/rekap"
                  emoji="📊"
                  label="Pemegang Inventaris"
                  isActive={pathname.startsWith("/rekap")}
                  onClick={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </CollapsibleSection>

            {/* ── Seksi 5: Pakta Integritas ── */}
            <CollapsibleSection
              title="📜 PAKTA INTEGRITAS"
              isCollapsed={collapsedSections.has("pakta")}
              onToggle={() => toggleSection("pakta")}
              defaultExpanded
            >
              <div className="space-y-0.5">
                <EmojiNavItem
                  href="/pakta"
                  emoji="📜"
                  label="Pakta BMD"
                  isActive={pathname.startsWith("/pakta")}
                  onClick={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </aside>
    </>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  defaultExpanded: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  isCollapsed,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-expanded={!isCollapsed}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
            isCollapsed ? "-rotate-90" : "rotate-0"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out-quart ${
          isCollapsed ? "max-h-0" : "max-h-[2000px]"
        }`}
      >
        <div className="pb-2">{children}</div>
      </div>
    </div>
  );
}

// Emoji Navigation Item Component (renders an emoji string as the icon)
interface EmojiNavItemProps {
  href: string;
  emoji: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function EmojiNavItem({ href, emoji, label, isActive, onClick }: EmojiNavItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors duration-150
        ${
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        }
      `}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="flex h-4 w-4 items-center justify-center text-sm leading-none">
        {emoji}
      </span>
      <span className="flex-1">{label}</span>
    </a>
  );
}

// Add Item Link Component (e.g. "＋ Tambah Ruangan")
interface AddItemLinkProps {
  href: string;
  label: string;
  onClick: () => void;
}

function AddItemLink({ href, label, onClick }: AddItemLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
    >
      <Plus className="h-4 w-4" />
      <span className="flex-1">{label}</span>
    </a>
  );
}

// Room Item Component
interface RoomItemProps {
  room: Room;
  isActive: boolean;
  isFavorite: boolean;
  onNavigate: () => void;
  onFavoriteToggle: () => void;
}

function RoomItem({ room, isActive, isFavorite, onNavigate, onFavoriteToggle }: RoomItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={onNavigate}
        className={`
          flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors duration-150 cursor-pointer
          ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-foreground hover:bg-accent hover:text-accent-foreground"
          }
        `}
        role="button"
        aria-current={isActive ? "page" : undefined}
      >
        <span className="flex h-4 w-4 items-center justify-center text-sm leading-none">
          {room.icon || "🏥"}
        </span>
        <span className="flex-1 truncate text-left">{room.name || "Ruangan"}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          className={`
            shrink-0 transition-opacity duration-150
            ${isFavorite || isHovered ? "opacity-100" : "opacity-0"}
          `}
          aria-label={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
        >
          {isFavorite ? (
            <Pin className="h-3.5 w-3.5 text-foreground" fill="currentColor" />
          ) : (
            <PinOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
