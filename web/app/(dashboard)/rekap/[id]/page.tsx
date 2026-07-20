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
  const status = { hasPakta: false, paktaId: null as string | null };
  const totalItem = asetList.length;
  const isPppk = pemegang.status.toUpperCase() === "PPPK";

  return (
    <div className="space-y-4">
      {/* Header — GAS-style like list .ri-hdr */}
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-line bg-white p-5"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/rekap">
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 shrink-0"
              aria-label="Kembali"
            >
              {"\u2B05\uFE0F"}
            </Button>
          </Link>
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[22px] shrink-0"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
            aria-hidden
          >
            {"\uD83D\uDC64"}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-ink truncate">
              {pemegang.nama}
            </h1>
            <p className="text-xs text-ink3 mt-0.5">
              Rekap Pemegang Inventaris · {totalItem} aset dipegang
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PemegangFormDialog
            pemegang={pemegang}
            trigger={
              <Button variant="ghost" type="button" className="text-[12px]">
                <span className="mr-1" aria-hidden>
                  {"\u270F\uFE0F"}
                </span>
                Edit
              </Button>
            }
          />
          {status.hasPakta && status.paktaId ? (
            <Link href={`/pakta/${status.paktaId}`}>
              <Button variant="ghost" type="button" className="text-[12px]">
                <span className="mr-1" aria-hidden>
                  {"\uD83D\uDCCB"}
                </span>
                Buka Pakta
              </Button>
            </Link>
          ) : (
            <Link href="/pakta/new">
              <Button
                type="button"
                className="text-[12px]"
                style={{
                  background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
                  color: "#fff",
                  border: "none",
                }}
              >
                <span className="mr-1" aria-hidden>
                  {"\uD83D\uDCDC"}
                </span>
                Buat Pakta
              </Button>
            </Link>
          )}
          <Button variant="ghost" type="button" className="text-[12px] text-ink3">
            <span className="mr-1" aria-hidden>
              {"\uD83D\uDDD1\uFE0F"}
            </span>
            Hapus
          </Button>
        </div>
      </div>

      {/* Info pemegang */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <div className="pb-3 border-b border-line mb-3">
            <p className="text-sm font-extrabold text-ink">Identitas Pemegang</p>
          </div>
          <dl className="space-y-2.5 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink3 font-semibold">Nama</dt>
              <dd className="font-bold text-ink text-right">{pemegang.nama}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink3 font-semibold">NIP</dt>
              <dd className="font-mono text-[12px] text-ink text-right">
                {pemegang.nip || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink3 font-semibold">Jabatan</dt>
              <dd className="text-ink text-right">
                {pemegang.jabatan || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 items-center">
              <dt className="text-ink3 font-semibold">Status</dt>
              <dd>
                <span
                  className="inline-block py-0.5 px-2 rounded-lg text-[10.5px] font-bold"
                  style={
                    isPppk
                      ? { background: "#dbeafe", color: "#1e40af" }
                      : { background: "#d1fae5", color: "#065f46" }
                  }
                >
                  {pemegang.status}
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="pb-3 border-b border-line mb-3">
            <p className="text-sm font-extrabold text-ink">Ringkasan Aset</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                ["kendaraan", "\uD83D\uDE97", "Kendaraan"],
                ["laptop", "\uD83D\uDCBB", "Laptop / PC"],
                ["alat", "\uD83D\uDD27", "Alat"],
                ["rumah", "\uD83C\uDFE0", "Rumah"],
              ] as const
            ).map(([jenis, icon, label]) => {
              const n = asetList.filter((a) => a.jenis === jenis).length;
              return (
                <div
                  key={jenis}
                  className="text-center px-3 py-2.5 rounded-lg bg-line2"
                >
                  <div className="text-lg font-extrabold font-mono text-teal">
                    {n}
                  </div>
                  <div className="text-[10px] text-ink3 font-semibold mt-0.5">
                    {icon} {label}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-[12px]">
            <span className="text-ink3 font-semibold">Status Pakta</span>
            {status.hasPakta ? (
              <span
                className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold"
                style={{ background: "#d1fae5", color: "#065f46" }}
              >
                {"\u2705"} Ada
              </span>
            ) : (
              <span
                className="inline-block py-0.5 px-2 rounded-[10px] text-[10.5px] font-bold"
                style={{ background: "#fee2e2", color: "#b91c1c" }}
              >
                {"\u26a0"} Belum
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Aset tables — gas-styled, mock-only */}
      <div>
        <h2 className="text-sm font-extrabold text-ink mb-3">
          {"\uD83D\uDCE6"} Inventaris yang Dipegang
        </h2>
        <AsetManager pemegangId={pemegang.id} asetList={asetList} />
      </div>
    </div>
  );
}
