import * as React from "react";
import { getSbbkListFull } from "@/lib/auth/sbbk";
import { SbbkOverview } from "@/components/sbbk/sbbk-overview";

export const dynamic = "force-dynamic";

export default async function SbbkPage() {
  // Data live Supabase (overlay localStorage lama ditangani di overview).
  const sbbk = await getSbbkListFull().catch(() => []);
  return (
    <React.Suspense fallback={null}>
      <SbbkOverview sbbk={sbbk} />
    </React.Suspense>
  );
}
