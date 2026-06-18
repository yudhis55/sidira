"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  ClipboardCheck,
  FileText,
  Truck,
  Lightbulb,
  BarChart3,
  History,
  Users,
  LayoutDashboard,
} from "lucide-react";
import type { Profile } from "@/types/database";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventaris", href: "/inventaris", icon: Package },
  { name: "Checklist", href: "/checklist", icon: ClipboardCheck },
  { name: "SBBK", href: "/sbbk", icon: FileText },
  { name: "Pakta", href: "/pakta", icon: FileText },
  { name: "Utilitas", href: "/utilitas", icon: Truck },
  { name: "Usulan", href: "/usulan", icon: Lightbulb },
  { name: "Laporan", href: "/laporan", icon: BarChart3 },
  { name: "Riwayat", href: "/riwayat", icon: History },
];

const adminNavigation = [{ name: "Kelola User", href: "/admin/users", icon: Users }];

export function Sidebar({ user }: { user: Profile | null }) {
  const pathname = usePathname();

  if (!user) return null;

  const allNavigation = user.role === "admin" ? [...navigation, ...adminNavigation] : navigation;

  return (
    <aside className="w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {allNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold">{user.nama}</p>
            <p className="capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
