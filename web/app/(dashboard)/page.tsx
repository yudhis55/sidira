import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/gas/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: roomsCount } = await supabase
    .from("rooms")
    .select("*", { count: "exact", head: true });

  const { count: itemsCount } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true });

  const { count: issuesCount } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .in("condition", ["rr", "rb", "ta"]);

  const { count: usulanCount } = await supabase
    .from("usulan")
    .select("*", { count: "exact", head: true });

  const stats = [
    {
      title: "Total Ruangan",
      value: roomsCount || 0,
      icon: "📦",
      description: "Ruangan terdaftar",
    },
    {
      title: "Total Barang",
      value: itemsCount || 0,
      icon: "📋",
      description: "Barang inventaris",
    },
    {
      title: "Barang Bermasalah",
      value: issuesCount || 0,
      icon: "⚠️",
      description: "Perlu perhatian",
    },
    {
      title: "Usulan Pending",
      value: usulanCount || 0,
      icon: "💡",
      description: "Menunggu approval",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan inventaris Puskesmas Baruharjo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} aria-label={`${stat.title}: ${stat.value} ${stat.description}`}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">
                {stat.title}
              </h3>
              <div className="rounded-none bg-muted p-2">
                <span className="text-lg" aria-hidden="true">{stat.icon}</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold" aria-label={`${stat.value} ${stat.description}`}>
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="pb-3">
          <h3 className="font-mono text-sm font-semibold">Selamat Datang</h3>
          <p className="text-xs text-muted-foreground">
            Aplikasi SIDIRA v4.0 — Sistem Digital Inventaris Ruangan untuk Puskesmas Baruharjo
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Terintegrasi dengan Supabase (PostgreSQL + Real-time Sync)</p>
          <p>• Cross-browser synchronization otomatis</p>
          <p>• Role-based access control (Admin, Editor, Viewer)</p>
          <p>• Modern UI dengan GAS Design System</p>
        </div>
      </Card>
    </div>
  );
}
