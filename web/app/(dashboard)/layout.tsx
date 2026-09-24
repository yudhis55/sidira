import { SiteHeader } from "@/components/gas/site-header";
import { AppLayout } from "@/components/gas/app-layout";
import { getUser } from "@/lib/auth/utils";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard layout shell.
 *
 * - Auth gating is delegated to middleware.
 * - Shell: SiteHeader + AppLayout (which composes RoomNav + MainContent).
 *
 * Angka statistik header dihitung di server supaya nilainya sama antara HTML
 * awal dan hasil hidrasi. Count memakai head-count Supabase supaya tidak
 * mengambil seluruh baris hanya untuk angka.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [{ count: roomCount }, { count: itemCount }] = await Promise.all([
    supabase.from("rooms").select("id", { count: "exact", head: true }),
    supabase.from("items").select("id", { count: "exact", head: true }),
  ]);
  const user = await getUser();

  return (
    // GAS: scroll level halaman — header ikut hilang, sidebar yang sticky.
    <div className="dashboard-shell flex min-h-screen flex-col">
      <SiteHeader
        roomCount={roomCount ?? 0}
        itemCount={itemCount ?? 0}
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
