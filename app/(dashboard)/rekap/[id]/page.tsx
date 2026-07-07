import {
  getPemegangById,
  getAsetByPemegang,
  deletePemegang,
  getPaktaStatusMap,
} from "@/lib/auth/rekap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AsetManager } from "@/components/rekap/aset-manager";
import { PemegangFormDialog } from "@/components/rekap/pemegang-form-dialog";
import { ArrowLeft, Pencil, Trash2, ScrollText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deletePemegang(id);
  revalidatePath("/rekap");
  redirect("/rekap");
}

export default async function RekapDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pemegang = await getPemegangById(id);

  if (!pemegang) {
    notFound();
  }

  const [asetList, paktaStatusMap] = await Promise.all([
    getAsetByPemegang(pemegang.id),
    getPaktaStatusMap(),
  ]);

  const status = paktaStatusMap[pemegang.id] || {
    hasPakta: false,
    paktaId: null,
  };

  const totalItem = asetList.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/rekap">
            <Button variant="outline" size="icon" aria-label="Kembali">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight">
              {pemegang.nama}
            </h1>
            <p className="text-xs text-muted-foreground">
              Rekap Pemegang Inventaris · {totalItem} aset dipegang
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PemegangFormDialog
            pemegang={pemegang}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            }
          />
          {status.hasPakta && status.paktaId ? (
            <Link href={`/pakta/${status.paktaId}`}>
              <Button variant="outline" size="sm">
                <ScrollText className="h-4 w-4 mr-1" />
                Buka Pakta
                <ExternalLink className="ml-1 h-3 w-3 text-muted-foreground" />
              </Button>
            </Link>
          ) : null}
          <form action={handleDelete}>
            <input type="hidden" name="id" value={pemegang.id} />
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
            <CardTitle className="font-mono text-sm">
              Identitas Pemegang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Nama</p>
              <p className="font-mono font-semibold">{pemegang.nama || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">NIP</p>
              <p>{pemegang.nip || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">
                Jabatan
              </p>
              <p>{pemegang.jabatan || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">
                Status
              </p>
              <span
                className={`inline-flex h-5 items-center px-2 font-mono text-[10px] font-medium ring-1 ${
                  pemegang.status === "PPPK"
                    ? "bg-secondary text-secondary-foreground ring-border"
                    : "bg-primary text-primary-foreground ring-primary"
                }`}
              >
                {pemegang.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-sm">Status Pakta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {status.hasPakta ? (
              <>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Pakta Integritas
                  </p>
                  <p className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] font-medium text-foreground ring-1 ring-border">
                    <span aria-hidden>✅</span> Ada
                  </p>
                </div>
                {status.paktaId && (
                  <div>
                    <Link
                      href={`/pakta/${status.paktaId}`}
                      className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                    >
                      <ScrollText className="h-3 w-3" />
                      Buka lampiran pakta
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Pakta Integritas
                  </p>
                  <p className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] font-medium text-muted-foreground ring-1 ring-border">
                    <span aria-hidden>⚠</span> Belum
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Gunakan tombol &quot;Pakta&quot; pada baris pemegang di
                  halaman daftar untuk membuat pakta dari data ini.
                </p>
              </>
            )}
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">
                Total Aset
              </p>
              <span className="inline-flex h-5 items-center px-2 font-mono text-[10px] font-semibold ring-1 ring-border">
                {totalItem} aset
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manajemen aset (CRUD per jenis) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">
            Inventaris yang Dipegang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AsetManager
            pemegangId={pemegang.id}
            asetList={asetList}
            readOnly={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
