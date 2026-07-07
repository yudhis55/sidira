import { getPaktaById, deletePakta } from "@/lib/auth/pakta";
import { countAset } from "@/lib/pakta-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deletePakta(id);
  revalidatePath("/pakta");
  redirect("/pakta");
}

export default async function PaktaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pakta = await getPaktaById(id);

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
            <Button variant="outline" size="icon" aria-label="Kembali">
              <ArrowLeft className="h-4 w-4" />
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
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Link href={`/pakta/${pakta.id}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Cetak
            </Button>
          </Link>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={pakta.id} />
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          </form>
        </div>
      </div>

      {/* Info pemegang */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Identitas Pemegang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Tanggal Pakta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
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
          </CardContent>
        </Card>
      </div>

      {/* Lampiran Aset: Kendaraan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">🚗 Kendaraan Dinas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>

      {/* Lampiran Aset: Laptop */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">💻 Laptop / Personal Komputer</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>

      {/* Lampiran Aset: Alat Penunjang */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">
            📱 Alat Penunjang (Tablet, Handphone, Handy Talky, External Hardisk)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>
    </div>
  );
}
