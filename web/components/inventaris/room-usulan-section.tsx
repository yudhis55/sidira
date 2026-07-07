"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Lightbulb } from "lucide-react";
import type { Usulan, UsulanItem } from "@/lib/usulan-types";
import { USULAN_KATEGORI_LABELS } from "@/lib/usulan-types";
import { PrioritasBadge, StatusBadge } from "@/components/usulan/usulan-badges";
import { UsulanCsvExport } from "@/components/usulan/usulan-csv-export";
import { cn } from "@/lib/utils";

interface RoomUsulanSectionProps {
  roomId: string;
  roomName: string;
  usulanList: Usulan[];
}

const PRIORITAS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "mendesak", label: "⚠ Mendesak" },
  { key: "penting", label: "Penting" },
  { key: "rencana", label: "Rencana" },
];

const STATUS_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "diajukan", label: "Diajukan" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
];

function fmtDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Per-room usulan section rendered inside the inventaris room detail page.
 * Collapsible, with summary stats, filter chips, CSV export, and a table
 * of usulan items. Follows the GAS legacy per-room usulan pattern.
 */
export function RoomUsulanSection({
  roomId,
  roomName,
  usulanList,
}: RoomUsulanSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [prioritasFilter, setPrioritasFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Flatten all items across usulan for this room
  const allItems = useMemo(() => {
    const flat: { item: UsulanItem; usulanId: number; usulanDate: string }[] =
      [];
    for (const u of usulanList) {
      for (const it of u.payload?.items || []) {
        flat.push({ item: it, usulanId: u.id, usulanDate: u.created_at });
      }
    }
    return flat;
  }, [usulanList]);

  const totalItems = allItems.length;
  const totalValue = allItems.reduce(
    (sum, { item }) => sum + (item.total || 0),
    0
  );
  const mendesakCount = allItems.filter(
    ({ item }) => item.prioritas === "mendesak"
  ).length;

  const filteredItems = allItems.filter(({ item }) => {
    if (prioritasFilter !== "all" && item.prioritas !== prioritasFilter)
      return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="ring-1 ring-foreground/10 bg-card">
      {/* Section header (collapsible) */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/40"
      >
        <span className="size-2 bg-foreground" aria-hidden />
        <span className="font-mono text-sm font-semibold">
          💡 Usulan Sarana Prasarana &amp; Alkes
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {totalItems} barang · Rp {totalValue.toLocaleString("id-ID")}
        </span>
        {mendesakCount > 0 && (
          <span className="font-mono text-xs text-muted-foreground">
            · {mendesakCount} mendesak
          </span>
        )}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-muted-foreground transition-transform",
            collapsed && "-rotate-90"
          )}
        />
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="border-t border-border space-y-3 p-3">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Lightbulb
                className="h-8 w-8 text-muted-foreground/50 mb-2"
                aria-hidden
              />
              <p className="font-mono text-xs font-semibold mb-1">
                Belum ada usulan
              </p>
              <p className="text-xs text-muted-foreground text-center mb-3">
                Belum ada usulan pengadaan untuk ruangan {roomName}.
              </p>
              <Link href={`/usulan/new?room=${encodeURIComponent(roomId)}`}>
                <Button size="sm" variant="outline">
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Usulan Baru
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Prioritas:
                    </span>
                    {PRIORITAS_FILTERS.map((chip) => {
                      const active = prioritasFilter === chip.key;
                      return (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={() => setPrioritasFilter(chip.key)}
                          className={cn(
                            "inline-flex h-6 items-center px-2 font-mono text-[10px] ring-1 transition-colors",
                            active
                              ? "bg-primary text-primary-foreground ring-primary"
                              : "bg-background text-foreground ring-border hover:bg-muted"
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Status:
                    </span>
                    {STATUS_FILTERS.map((chip) => {
                      const active = statusFilter === chip.key;
                      return (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={() => setStatusFilter(chip.key)}
                          className={cn(
                            "inline-flex h-6 items-center px-2 font-mono text-[10px] ring-1 transition-colors",
                            active
                              ? "bg-primary text-primary-foreground ring-primary"
                              : "bg-background text-foreground ring-border hover:bg-muted"
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UsulanCsvExport
                    roomId={roomId}
                    size="xs"
                    filename={`Usulan_${roomName.replace(/\s+/g, "_")}`}
                  />
                  <Link href={`/usulan/new?room=${encodeURIComponent(roomId)}`}>
                    <Button size="xs" variant="outline">
                      <Plus className="h-3 w-3" />
                      Tambah
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        No
                      </th>
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        Nama Barang
                      </th>
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        Kategori
                      </th>
                      <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">
                        Jml
                      </th>
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        Satuan
                      </th>
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        Prioritas
                      </th>
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        Status
                      </th>
                      <th className="h-9 px-2 text-right font-mono font-medium whitespace-nowrap">
                        Total
                      </th>
                      <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">
                        Tgl
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(({ item, usulanId, usulanDate }, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-2 py-2 font-mono text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-2 font-medium">
                          <Link
                            href={`/usulan/${usulanId}`}
                            className="hover:underline"
                          >
                            {item.nama}
                          </Link>
                        </td>
                        <td className="px-2 py-2 text-muted-foreground">
                          {USULAN_KATEGORI_LABELS[item.kategori] ||
                            item.kategori}
                        </td>
                        <td className="px-2 py-2 text-right font-mono">
                          {item.qty}
                        </td>
                        <td className="px-2 py-2">{item.satuan}</td>
                        <td className="px-2 py-2">
                          <PrioritasBadge prioritas={item.prioritas} />
                        </td>
                        <td className="px-2 py-2">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-2 py-2 text-right font-mono font-semibold">
                          Rp {item.total.toLocaleString("id-ID")}
                        </td>
                        <td className="px-2 py-2 text-muted-foreground whitespace-nowrap">
                          {fmtDate(usulanDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {filteredItems.length > 0 && (
                    <tfoot className="bg-muted/50">
                      <tr className="border-t-2 border-border">
                        <td
                          colSpan={7}
                          className="px-2 py-2 text-right font-mono font-bold"
                        >
                          Total:
                        </td>
                        <td className="px-2 py-2 text-right font-mono font-bold">
                          Rp{" "}
                          {filteredItems
                            .reduce((s, { item }) => s + (item.total || 0), 0)
                            .toLocaleString("id-ID")}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {filteredItems.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  Tidak ada usulan yang cocok dengan filter.
                </p>
              )}

              {/* Link to full usulan list for this room */}
              <div className="flex justify-end pt-1">
                <Link href="/usulan">
                  <Button size="xs" variant="ghost">
                    Lihat semua usulan →
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
