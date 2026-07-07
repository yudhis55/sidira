import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, TriangleAlert, CircleX, Minus } from "lucide-react";
import type { LaporanSummary as LaporanSummaryType } from "@/lib/auth/laporan";

interface LaporanSummaryProps {
  summary: LaporanSummaryType;
}

type KondisiKey = "baik" | "rr" | "rb" | "ta";

interface KondisiMeta {
  label: string;
  Icon: typeof Check;
}

const KONDISI_META: Record<KondisiKey, KondisiMeta> = {
  baik: { label: "Baik", Icon: Check },
  rr: { label: "Rusak Ringan", Icon: TriangleAlert },
  rb: { label: "Rusak Berat", Icon: CircleX },
  ta: { label: "Tidak Ada", Icon: Minus },
};

function KondisiCard({
  kondisi,
  count,
  percentage,
}: {
  kondisi: KondisiKey;
  count: number;
  percentage: number;
}) {
  const { label, Icon } = KONDISI_META[kondisi];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-bold tabular-nums">{count}</div>
        <Progress value={percentage} className="mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {percentage}% dari total
        </p>
      </CardContent>
    </Card>
  );
}

export function LaporanSummary({ summary }: LaporanSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ruangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-2xl font-bold tabular-nums">
            {summary.total_rooms}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-2xl font-bold tabular-nums">
            {summary.total_items}
          </div>
        </CardContent>
      </Card>

      <KondisiCard
        kondisi="baik"
        count={summary.total_baik}
        percentage={summary.percentage_baik}
      />
      <KondisiCard
        kondisi="rr"
        count={summary.total_rr}
        percentage={summary.percentage_rr}
      />
      <KondisiCard
        kondisi="rb"
        count={summary.total_rb}
        percentage={summary.percentage_rb}
      />
      <KondisiCard
        kondisi="ta"
        count={summary.total_ta}
        percentage={summary.percentage_ta}
      />
    </div>
  );
}
