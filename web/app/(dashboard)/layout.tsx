import { SiteHeader } from "@/components/gas/site-header";
import { AppLayout } from "@/components/gas/app-layout";
import { getUser } from "@/lib/auth/utils";

/**
 * Dashboard layout shell.
 *
 * - Auth gating is delegated to middleware.
 * - Shell: SiteHeader (topbar ramping) + AppLayout (RoomNav + MainContent).
 *
 * Hitungan ruangan/item tidak lagi ditampilkan di header — angka statistik
 * dihitung langsung di halaman dashboard dari Supabase.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    // Topbar sticky di atas, konten + sidebar di bawahnya.
    <div className="dashboard-shell flex min-h-screen flex-col">
      <SiteHeader
        profile={
          user
            ? {
                nama: user.nama,
                jabatan: user.jabatan ?? undefined,
                avatar: user.avatar || user.nama.charAt(0).toUpperCase(),
              }
            : null
        }
      />
      <AppLayout>{children}</AppLayout>
    </div>
  );
}
