import { SiteHeader } from "@/components/gas/site-header";
import { AppLayout } from "@/components/gas/app-layout";

/**
 * Dashboard layout shell — GAS v3 mock-mode refactor.
 *
 * - No Supabase / backend calls (mock-only).
 * - Auth gating is delegated to middleware (NEXT_PUBLIC_MOCK_AUTH flag).
 * - Shell: SiteHeader + AppLayout (which composes RoomNav + MainContent).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <AppLayout>{children}</AppLayout>
    </div>
  );
}
