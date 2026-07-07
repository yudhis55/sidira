import { getPaktaList, deletePakta } from "@/lib/auth/pakta";
import { countAset } from "@/lib/pakta-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaktaCsvExport } from "@/components/pakta/pakta-csv-export";
import { Plus, Pencil, Printer, Trash2, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-elements";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deletePakta(id);
  revalidatePath("/pakta");
  redirect("/pakta");
}

export default async function PaktaPage() {
  const paktaList = await getPaktaList();
  const total = paktaList.length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon="📜"
        title="Pakta Integritas Pemanfaatan BMD"
        subtitle="Puskesmas Baruharjo · Barang Milik Daerah"
        stats={[{ value: total, label: "Total Pakta", tone: "teal" }]}
        actions={
          <Link href="/pakta/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Entri Pakta Baru
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <PaktaCsvExport />
      </div>

      {/* List */}
      {paktaList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 text-3xl" aria-hidden>📜</div>
            <p className="mb-1 font-mono text-sm font-semibold">Belum ada data Pakta Integritas</p>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Klik &quot;Entri Pakta Integritas Baru&quot; untuk menambahkan
            </p>
            <Link href="/pakta/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Entri Pakta Integritas Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap w-16">No.</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Nama / NIP</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Jabatan</th>
                    <th className="h-9 px-2 text-left font-mono font-medium whitespace-nowrap">Tanggal</th>
                    <th className="h-9 px-2 text-center font-mono font-medium whitespace-nowrap w-20">Aset</th>
                    <th className="h-9 px-2 text-center font-mono font-medium whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paktaList.map((pakta, i) => {
                    const asetCount = countAset(pakta);
                    return (
                      <tr key={pakta.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="px-2 py-2 align-top">
                          <span className="inline-flex h-5 items-center px-1.5 font-mono text-[10px] ring-1 ring-border">
                            {String(i + 1).padStart(3, "0")}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <Link
                            href={`/pakta/${pakta.id}`}
                            className="font-medium hover:underline"
                          >
                            {pakta.nama || "-"}
                          </Link>
                          <div className="text-[10px] text-muted-foreground">
                            {pakta.nip ? `NIP. ${pakta.nip}` : "NIP. —"}
                          </div>
                        </td>
                        <td className="px-2 py-2 align-top font-medium">
                          {pakta.jabatan || "-"}
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="text-muted-foreground">{fmtDate(pakta.tgl)}</div>
                          <div className="text-[10px] text-muted-foreground">{pakta.hari || "-"}</div>
                        </td>
                        <td className="px-2 py-2 text-center align-top">
                          <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] font-semibold ring-1 ring-border">
                            {asetCount} aset
                          </span>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`/pakta/${pakta.id}/edit`}
                              className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3" aria-hidden />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <Link
                              href={`/pakta/${pakta.id}/print?lampiran=1`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-[var(--blue)]/30 text-[var(--blue)] hover:bg-[var(--blue2)]"
                              title="Lampiran BMD"
                            >
                              <ClipboardList className="h-3 w-3" aria-hidden />
                              <span className="sr-only">Lampiran BMD</span>
                            </Link>
                            <Link
                              href={`/pakta/${pakta.id}/print`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
                              title="Cetak"
                            >
                              <Printer className="h-3 w-3" aria-hidden />
                              <span className="sr-only">Cetak</span>
                            </Link>
                            <form action={handleDelete}>
                              <input type="hidden" name="id" value={pakta.id} />
                              <button
                                type="submit"
                                className="inline-flex h-6 w-6 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/20"
                                title="Hapus"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden />
                                <span className="sr-only">Hapus</span>
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
