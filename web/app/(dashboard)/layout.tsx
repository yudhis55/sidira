import { AppLayout } from "@/components/gas/app-layout";
import { getUser } from "@/lib/auth/utils";

/**
 * Dashboard layout shell.
 *
 * - Auth gating is delegated to middleware.
 * - Shell: AppLayout (RoomNav full-height kiri + kolom konten berisi
 *   SiteHeader sticky + MainContent).
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
    // Baris flex: sidebar kiri full-height + kolom konten di kanannya.
    <div className="dashboard-shell flex min-h-screen">
      <AppLayout
        profile={
          user
            ? {
                nama: user.nama,
                jabatan: user.jabatan ?? undefined,
                avatar: user.avatar || user.nama.charAt(0).toUpperCase(),
              }
            : null
        }
      >
        {children}
      </AppLayout>
    </div>
  );
}
