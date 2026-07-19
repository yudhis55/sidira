"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import type { UsulanStatus } from "@/lib/usulan-types";
import { USULAN_STATUS_LABELS } from "@/lib/usulan-types";

interface ItemStatusActionsProps {
  usulanId: number;
  itemIndex: number;
  currentStatus: UsulanStatus;
}

export function ItemStatusActions({
  currentStatus,
}: ItemStatusActionsProps) {
  const [pending, startTransition] = useTransition();

  const handleStatusChange = (_status: UsulanStatus) => {
    startTransition(() => {
      toast.success("Mode demo — status tidak disimpan ke server");
    });
  };

  // Already decided — show status + allow reset
  if (currentStatus !== "diajukan") {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {USULAN_STATUS_LABELS[currentStatus]}
        </span>
        <Button
          size="xs"
          variant="outline"
          onClick={() => handleStatusChange("diajukan")}
          disabled={pending}
          title="Set ulang ke Diajukan"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Reset"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="xs"
        variant="default"
        onClick={() => handleStatusChange("disetujui")}
        disabled={pending}
        title="Setujui barang ini"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        Setujui
      </Button>
      <Button
        size="xs"
        variant="destructive"
        onClick={() => handleStatusChange("ditolak")}
        disabled={pending}
        title="Tolak barang ini"
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="h-3 w-3" />
        )}
        Tolak
      </Button>
    </div>
  );
}
