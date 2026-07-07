import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlobalSearchDialog } from "@/components/shared/global-search";
import { SiteHeader } from "@/components/gas/site-header";
import { AppLayout } from "@/components/gas/app-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch rooms with category
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <SiteHeader />
      <AppLayout>
        {children}
      </AppLayout>
      <GlobalSearchDialog />
    </div>
  );
}
