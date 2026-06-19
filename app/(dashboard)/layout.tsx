import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SmartSidebar } from "@/components/layout/smart-sidebar";
import { getFavorites } from "@/lib/auth/favorites";

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

  // Fetch user favorites
  const favorites = await getFavorites();

  // Handle logout
  async function handleLogout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SmartSidebar
        rooms={rooms || []}
        favorites={favorites}
        user={profile}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={profile} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
