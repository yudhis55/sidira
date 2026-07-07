"use client";

import { logout } from "@/lib/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Search } from "lucide-react";
import type { Profile } from "@/types/database";

export function Header({ user }: { user: Profile | null }) {
  if (!user) return null;

  function openSearch() {
    // Dispatch a synthetic Ctrl+K so the GlobalSearchDialog listener catches it.
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true })
    );
  }

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-mono text-2xl font-bold text-[var(--teal)]">SIDIRA</h1>
          <p className="text-sm text-muted-foreground">
            Sistem Digital Inventaris Ruangan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={openSearch}
            className="hidden gap-2 sm:inline-flex"
            title="Cari (Ctrl+K)"
          >
            <Search className="size-4" />
            <span className="text-muted-foreground">Cari…</span>
            <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Ctrl K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            className="sm:hidden"
            title="Cari (Ctrl+K)"
          >
            <Search className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-10 rounded-full">
                <Avatar className="size-10">
                  <AvatarFallback className="text-lg">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.nama}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.jabatan} • {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 size-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
