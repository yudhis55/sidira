import { getMockPaktaById } from "@/lib/mock-data";
import { countAset } from "@/lib/pakta-utils";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import type {
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";

export const dynamic = "force-dynamic";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function fmtDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaktaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pakta = getMockPaktaById(id);

  if (!pakta) {
    notFound();
  }

  const asetCount = countAset(pakta);
  const kendaraan = (pakta.aset_kendaraan || []) as PaktaAsetKendaraan[];
  const laptop = (pakta.aset_laptop || []) as PaktaAsetLaptop[];
  const alat = (pakta.aset_alat || []) as PaktaAsetAlat[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pakta">
            <Button variant="ghost" className="h-9 w-9 p-0" aria-label="Kembali">
              ⬅️
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">{pakta.nama}</h1>
            <p className="text-xs text-muted-foreground">
              Pakta Integritas BMD · {asetCount} aset
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/pakta/${pakta.id}/edit`}>
            <Button variant="ghost" className="text-xs px-3 py-1.5">
              ✏️ Edit
            </Button>
          </Link>
          <Link href={`/pakta/${pakta.id}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="text-xs px-3 py-1.5">
              🖨️ Cetak
            </Button>
          </Link>
        </div>
      </div>

      {/* Info pemegang */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="pb-3">
            <p className="font-mono text-sm font-bold">Identitas Pemegang</p>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Nama</p>
              <p className="font-mono font-semibold">{pakta.nama || "-"}</p>
            </div>
            {pakta.nip && (
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">NIP</p>
                <p>{pakta.nip}</p>
              </div>
            )}
            {pakta.jabatan && (
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Jabatan</p>
                <p>{pakta.jabatan}</p>
              </div>
            )}
            {pakta.alamat && (
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Alamat</p>
                <p className="text-muted-foreground">{pakta.alamat}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="pb-3">
            <p className="font-mono text-sm font-bold">Tanggal Pakta</p>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Hari</p>
              <p>{pakta.hari || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Tanggal</p>
              <p>{fmtDate(pakta.tgl)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Total Aset</p>
              <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] font-semibold ring-1 ring-border">
                {asetCount} aset
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Lampiran Aset: Kendaraan */}
      <Card>
        <div className="pb-3">
          <p className="font-mono text-sm font-bold">🚗 Kendaraan Dinas</p>
        </div>
        <div className="p-0">
          {kendaraan.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Tidak ada data aset kendaraan
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium w-10">No</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Jenis</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Tahun</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">No. Polisi</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Harga Perolehan</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {kendaraan.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-2 py-2 font-mono">{i + 1}</td>
                      <td className="px-2 py-2">{r.jenis || "-"}</td>
                      <td className="px-2 py-2 font-medium">{r.merk || "-"}</td>
                      <td className="px-2 py-2">{r.tahun?.toString() || "-"}</td>
                      <td className="px-2 py-2">{r.nopol || "-"}</td>
                      <td className="px-2 py-2">{r.harga || "-"}</td>
                      <td className="px-2 py-2 text-muted-foreground">{r.ket || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Lampiran Aset: Laptop */}
      <Card>
        <div className="pb-3">
          <p className="font-mono text-sm font-bold">💻 Laptop / Personal Komputer</p>
        </div>
        <div className="p-0">
          {laptop.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Tidak ada data aset laptop/PC
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium w-10">No</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Type</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Tahun</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">No. Seri</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Harga Perolehan</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {laptop.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-2 py-2 font-mono">{i + 1}</td>
                      <td className="px-2 py-2 font-medium">{r.merk || "-"}</td>
                      <td className="px-2 py-2">{r.type || "-"}</td>
                      <td className="px-2 py-2">{r.tahun?.toString() || "-"}</td>
                      <td className="px-2 py-2">{r.seri || "-"}</td>
                      <td className="px-2 py-2">{r.harga || "-"}</td>
                      <td className="px-2 py-2 text-muted-foreground">{r.ket || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Lampiran Aset: Alat Penunjang */}
      <Card>
        <div className="pb-3">
          <p className="font-mono text-sm font-bold">
            📱 Alat Penunjang (Tablet, Handphone, Handy Talky, External Hardisk)
          </p>
        </div>
        <div className="p-0">
          {alat.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Tidak ada data aset alat penunjang
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium w-10">No</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Type</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Tahun</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">No. Seri</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Harga Perolehan</th>
                    <th className="h-9 px-2 text-left font-mono font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {alat.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-2 py-2 font-mono">{i + 1}</td>
                      <td className="px-2 py-2 font-medium">{r.merk || "-"}</td>
                      <td className="px-2 py-2">{r.type || "-"}</td>
                      <td className="px-2 py-2">{r.tahun?.toString() || "-"}</td>
                      <td className="px-2 py-2">{r.seri || "-"}</td>
                      <td className="px-2 py-2">{r.harga || "-"}</td>
                      <td className="px-2 py-2 text-muted-foreground">{r.ket || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
