import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LaporanSummary as LaporanSummaryType } from "@/lib/auth/laporan";

interface LaporanSummaryProps {
  summary: LaporanSummaryType;
}

export function LaporanSummary({ summary }: LaporanSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ruangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_rooms}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_items}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kondisi Baik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {summary.total_baik}
          </div>
          <Progress value={summary.percentage_baik} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {summary.percentage_baik}% dari total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rusak Ringan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {summary.total_rr}
          </div>
          <Progress value={summary.percentage_rr} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {summary.percentage_rr}% dari total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rusak Berat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {summary.total_rb}
          </div>
          <Progress value={summary.percentage_rb} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {summary.percentage_rb}% dari total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tidak Ada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">
            {summary.total_ta}
          </div>
          <Progress value={summary.percentage_ta} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {summary.percentage_ta}% dari total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
