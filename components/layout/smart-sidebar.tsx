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
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  ScrollText,
  Wrench,
  Lightbulb,
  BarChart3,
  History,
  Ambulance,
  Zap,
  Droplets,
  LogOut,
  Building2,
  Stethoscope,
  Microscope,
  Pill,
  Home,
  BedDouble,
  Activity,
  Hospital,
  Store,
  School,
  Warehouse,
  Factory,
  Building,
  Sofa,
  Armchair,
  Briefcase,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFavorite, removeFavorite, type Favorite } from "@/lib/auth/favorites";
import { toast } from "sonner";
import type { Room } from "@/types/database";

// Section keys for collapse state
type SectionKey = "favorites" | "menu" | "rooms" | "utilitas";

// Room categories for grouping
const ROOM_CATEGORIES = {
  pelayanan: "Pelayanan",
  penunjang: "Penunjang",
  administrasi: "Administrasi",
  gudang: "Gudang & Logistik",
  pustu: "Pustu & Ponkesdes",
  lain: "Lainnya",
} as const;

type RoomCategory = keyof typeof ROOM_CATEGORIES;

interface SmartSidebarProps {
  rooms: Room[];
  favorites: Favorite[];
  user: { nama: string; role: string } | null;
  onLogout: () => void;
}

export function SmartSidebar({ rooms, favorites, user, onLogout }: SmartSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Set<SectionKey>>(new Set());
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed-sections");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCollapsedSections(new Set(parsed));
      } catch {}
    }
  }, []);

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
        hamburgerButtonRef.current?.focus();
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

  // Filter rooms by search query
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const query = searchQuery.toLowerCase();
    return rooms.filter((room) => {
      const roomName = room.name?.toLowerCase() || "";
      const categoryName = ROOM_CATEGORIES[room.category as RoomCategory]?.toLowerCase() || "";
      return roomName.includes(query) || categoryName.includes(query);
    });
  }, [rooms, searchQuery]);

  // Group rooms by category
  const groupedRooms = useMemo(() => {
    const groups: Record<RoomCategory, Room[]> = {
      pelayanan: [],
      penunjang: [],
      administrasi: [],
      gudang: [],
      pustu: [],
      lain: [],
    };

    filteredRooms.forEach((room) => {
      const category = (room.category as RoomCategory) || "lain";
      if (groups[category]) {
        groups[category].push(room);
      } else {
        groups.lain.push(room);
      }
    });

    return groups;
  }, [filteredRooms]);

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
      } catch (error) {
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

  // Main navigation items
  const mainNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/checklist", label: "Checklist", icon: ClipboardCheck },
    { href: "/sbbk", label: "SBBK", icon: FileText },
    { href: "/pakta", label: "Pakta", icon: ScrollText },
    { href: "/utilitas", label: "Utilitas", icon: Wrench },
    { href: "/usulan", label: "Usulan", icon: Lightbulb },
    { href: "/laporan", label: "Laporan", icon: BarChart3 },
    { href: "/riwayat", label: "Riwayat", icon: History },
  ];

  // Tambah menu admin jika user adalah admin
  if (user?.role === "admin") {
    mainNavItems.push({ href: "/admin/users", label: "Kelola User", icon: Users });
  }

  // Utilitas items
  const utilitasItems = [
    { id: "ambulance", label: "Ambulance", icon: Ambulance },
    { id: "genset", label: "Genset", icon: Zap },
    { id: "ipal", label: "IPAL", icon: Droplets },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
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

            {/* Favorites section */}
            <CollapsibleSection
              title="FAVORIT"
              sectionKey="favorites"
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

            {/* Main navigation */}
            <CollapsibleSection
              title="MENU UTAMA"
              sectionKey="menu"
              isCollapsed={collapsedSections.has("menu")}
              onToggle={() => toggleSection("menu")}
              defaultExpanded
            >
              <div className="space-y-0.5">
                {mainNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                  />
                ))}
              </div>
            </CollapsibleSection>

            {/* Rooms section */}
            <CollapsibleSection
              title="RUANGAN"
              sectionKey="rooms"
              isCollapsed={collapsedSections.has("rooms")}
              onToggle={() => toggleSection("rooms")}
              defaultExpanded
            >
              {searchQuery && filteredRooms.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Tidak ada ruangan yang cocok dengan "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(groupedRooms).map(([category, categoryRooms]) => {
                    if (categoryRooms.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className="px-3 py-1.5">
                          <p className="text-xs font-medium text-muted-foreground">
                            {ROOM_CATEGORIES[category as RoomCategory]}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          {categoryRooms.map((room) => (
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
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>

            {/* Utilitas section */}
            <CollapsibleSection
              title="UTILITAS"
              sectionKey="utilitas"
              isCollapsed={collapsedSections.has("utilitas")}
              onToggle={() => toggleSection("utilitas")}
              defaultExpanded={false}
            >
              <div className="space-y-0.5">
                {utilitasItems.map((item) => (
                  <NavItem
                    key={item.id}
                    href={`/utilitas/${item.id}`}
                    label={item.label}
                    icon={item.icon}
                    isActive={pathname === `/utilitas/${item.id}`}
                    onClick={() => setIsMobileDrawerOpen(false)}
                  />
                ))}
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
  sectionKey: SectionKey;
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
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-expanded={!isCollapsed}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
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

// Navigation Item Component
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
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
      <Icon className="h-4 w-4" />
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

// Map icon IDs to Lucide icons
const ROOM_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  hospital: Hospital,
  home: Home,
  building2: Building2,
  store: Store,
  school: School,
  warehouse: Warehouse,
  factory: Factory,
  office: Building,
  sofa: Sofa,
  armchair: Armchair,
  briefcase: Briefcase,
  package: Package,
};

function RoomItem({ room, isActive, isFavorite, onNavigate, onFavoriteToggle }: RoomItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = ROOM_ICON_MAP[room.icon || "hospital"] || Hospital;

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
        <IconComponent className="h-4 w-4" />
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
