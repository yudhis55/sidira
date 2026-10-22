import { RoomNav } from "./room-nav";
import { SiteHeader } from "./site-header";
import { MainContent } from "./main-content";
import { getRooms } from "@/lib/auth/rooms";
import { getUtilMetaList } from "@/lib/auth/utilitas";
import type { SiteHeaderProfile } from "./site-header";

/**
 * Shell dashboard pola SaaS umum:
 *
 *   ┌──────────┬──────────────────────────┐
 *   │ logo     │ topbar (sticky)          │
 *   │──────────│──────────────────────────│
 *   │ RoomNav  │ MainContent              │
 *   │ (sticky) │                          │
 *   └──────────┴──────────────────────────┘
 *
 * - Sidebar kiri full-height (sticky, dari tepi atas viewport) memuat blok
 *   logo di slot teratas — lihat RoomNav.
 * - Topbar sticky hanya di atas kolom konten; karena lebar sidebar
 *   dianimasikan lewat `transition-all` pada aside, topbar ikut bergeser
 *   sinkron saat collapse (220px ↔ 64px) tanpa margin-left manual.
 * - Di mobile (<md) sidebar jadi drawer off-canvas (fixed) sehingga keluar
 *   dari flex flow — kolom konten memenuhi layar penuh.
 */
export async function AppLayout({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile?: SiteHeaderProfile | null;
}) {
  const [rooms, utilitas] = await Promise.all([getRooms(), getUtilMetaList()]);

  return (
    <div className="flex w-full flex-1 items-start">
      <RoomNav rooms={rooms} utilitas={utilitas} />
      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader profile={profile} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
