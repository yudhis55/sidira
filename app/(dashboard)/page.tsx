import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ClipboardCheck, AlertTriangle, Lightbulb } from "lucide-react";

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
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Barang",
      value: itemsCount || 0,
      icon: ClipboardCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Barang Bermasalah",
      value: issuesCount || 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Usulan Pending",
      value: usulanCount || 0,
      icon: Lightbulb,
      color: "text-purple-600",
      bg: "bg-purple-50",
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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bg} rounded-lg p-2`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang</CardTitle>
          <CardDescription>
            Aplikasi SIDIRA v4.0 — Sistem Digital Inventaris Ruangan untuk Puskesmas Baruharjo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✅ Terintegrasi dengan Supabase (PostgreSQL + Real-time Sync)</p>
            <p>✅ Cross-browser synchronization otomatis</p>
            <p>✅ Role-based access control (Admin, Editor, Viewer)</p>
            <p>✅ Modern UI dengan shadcn/ui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
