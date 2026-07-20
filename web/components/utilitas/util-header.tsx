"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { renameUtil, type UtilMeta } from "@/lib/auth/utilitas";

interface UtilHeaderProps {
  utilMeta: UtilMeta;
  itemCount: number;
  doneCount: number;
  utilList: UtilMeta[];
}

export function UtilHeader({
  utilMeta,
  itemCount,
  doneCount,
  utilList,
}: UtilHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(utilMeta.label);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    if (!label.trim()) {
      toast.error("Label tidak boleh kosong");
      return;
    }
    startTransition(async () => {
      const res = await renameUtil(utilMeta.util_id, label);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setEditing(false);
        toast.success("Nama utilitas diperbarui");
      }
    });
  };

  const handleCancel = () => {
    setLabel(utilMeta.label);
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center text-3xl leading-none"
          style={{ background: utilMeta.bg }}
        >
          {utilMeta.icon}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-8 max-w-xs font-mono text-base font-bold"
                disabled={pending}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
              <Button
                type="button"
                size="icon"
                className="h-8 w-8"
                onClick={handleSave}
                disabled={pending}
                aria-label="Simpan"
              >
                ✓
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={handleCancel}
                disabled={pending}
                aria-label="Batal"
              >
                ✕
              </Button>
            </div>
          ) : (
            <h1 className="flex items-center gap-2 font-mono text-2xl font-bold tracking-tight">
              Pemeliharaan {utilMeta.label}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 font-mono text-xs"
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Nama
              </Button>
            </h1>
          )}
          <p className="text-xs text-muted-foreground">
            Puskesmas Baruharjo · {itemCount} item pemeliharaan
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="font-mono text-2xl font-bold tabular-nums">
              {itemCount}
            </div>
            <div className="font-mono text-xs text-muted-foreground">Item</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold tabular-nums">
              {doneCount}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Sudah Dikerjakan Bulan Ini
            </div>
          </div>
        </div>
      </div>

      {/* Unit bar — switch between utilitas */}
      {utilList.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {utilList.map((u) => {
            const active = u.util_id === utilMeta.util_id;
            return (
              <a
                key={u.util_id}
                href={`/utilitas/${encodeURIComponent(u.util_id)}`}
                className={
                  "inline-flex h-8 items-center gap-1.5 rounded-none border px-2.5 font-mono text-xs transition-colors " +
                  (active
                    ? "border-transparent font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
                }
                style={
                  active
                    ? { background: u.bg, borderColor: "transparent" }
                    : undefined
                }
              >
                <span className="leading-none">{u.icon}</span>
                {u.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
