"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { updateItemStatus } from "@/lib/auth/usulan";

interface ItemStatusActionsProps {
  usulanId: number;
  itemIndex: number;
  currentStatus: "pending" | "approved" | "rejected";
}

export function ItemStatusActions({
  usulanId,
  itemIndex,
  currentStatus,
}: ItemStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    setLoading(true);

    const result = await updateItemStatus(usulanId, itemIndex, status);

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  if (currentStatus !== "pending") {
    return (
      <div className="text-sm text-muted-foreground">
        Status: <span className="font-medium">{currentStatus === "approved" ? "Disetujui" : "Ditolak"}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 pt-2 border-t">
      <Button
        size="sm"
        variant="default"
        onClick={() => handleStatusChange("approved")}
        disabled={loading}
      >
        <Check className="mr-2 h-4 w-4" />
        {loading ? "Memproses..." : "Setujui"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleStatusChange("rejected")}
        disabled={loading}
      >
        <X className="mr-2 h-4 w-4" />
        {loading ? "Memproses..." : "Tolak"}
      </Button>
    </div>
  );
}
