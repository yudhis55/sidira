import {
  getMockPemegang,
  getMockAsetByPemegang,
} from "@/lib/mock-data";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { AsetManager } from "@/components/rekap/aset-manager";
import { PemegangFormDialog } from "@/components/rekap/pemegang-form-dialog";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RekapDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pemegangList = getMockPemegang();
  const pemegang = pemegangList.find((p) => p.id === id);

  if (!pemegang) {
    notFound();
  }

  const asetList = getMockAsetByPemegang(pemegang.id);

  // Mock pakta status
  const status = { hasPakta: false, paktaId: null };

  const totalItem = asetList.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/rekap">
            <Button variant="ghost" aria-label="Kembali">
              <span className="h-4 w-4">←</span>
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
              <Button variant="ghost">
                <span className="h-4 w-4 mr-1">✏️</span>
                Edit
              </Button>
            }
          />
          {status.hasPakta && status.paktaId ? (
            <Link href={`/pakta/${status.paktaId}`}>
              <Button variant="ghost">
                <span className="h-4 w-4 mr-1">📋</span>
                Buka Pakta
                <span className="ml-1 h-3 w-3 text-muted-foreground">↗</span>
              </Button>
            </Link>
          ) : null}
          <Button variant="ghost" type="button">
            <span className="h-4 w-4 mr-1">🗑️</span>
            Hapus
          </Button>
        </div>
      </div>

      {/* Info pemegang */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="pb-3">
            <h3 className="font-mono text-sm font-semibold">
              Identitas Pemegang
            </h3>
          </div>
          <div className="space-y-3 text-xs">
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
          </div>
        </Card>

        <Card>
          <div className="pb-3">
            <h3 className="font-mono text-sm font-semibold">Status Pakta</h3>
          </div>
          <div className="space-y-3 text-xs">
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
                      <span className="h-3 w-3">📋</span>
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
          </div>
        </Card>
      </div>

      {/* Manajemen aset */}
      <Card>
        <div className="pb-3">
          <h3 className="font-mono text-sm font-semibold">
            Inventaris yang Dipegang
          </h3>
        </div>
        <div>
          <AsetManager
            pemegangId={pemegang.id}
            asetList={asetList}
            readOnly={false}
          />
        </div>
      </Card>
    </div>
  );
}
