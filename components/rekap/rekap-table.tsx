"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  PemegangInventaris,
  AsetPemegang,
  AsetPemegangJenis,
} from "@/types/database";
import { buatPaktaDariPemegang } from "@/lib/auth/rekap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  ScrollText,
  ExternalLink,
  Pencil,
} from "lucide-react";

interface RekapRowProps {
  pemegang: PemegangInventaris;
  asetList: AsetPemegang[];
  hasPakta: boolean;
  paktaId: string | null;
  index: number;
}

const JENIS_LABEL: Record<AsetPemegangJenis, { icon: string; label: string }> =
  {
    kendaraan: { icon: "🚗", label: "Kendaraan" },
    laptop: { icon: "💻", label: "Laptop / PC" },
    alat: { icon: "🔧", label: "Alat" },
    rumah: { icon: "🏠", label: "Rumah" },
  };

const JENIS_ORDER: AsetPemegangJenis[] = [
  "kendaraan",
  "laptop",
  "alat",
  "rumah",
];

function countByJenis(asetList: AsetPemegang[]): Record<AsetPemegangJenis, number> {
  const c: Record<AsetPemegangJenis, number> = {
    kendaraan: 0,
    laptop: 0,
    alat: 0,
    rumah: 0,
  };
  for (const a of asetList) c[a.jenis]++;
  return c;
}

function AsetBadge({
  jenis,
  count,
}: {
  jenis: AsetPemegangJenis;
  count: number;
}) {
  if (count === 0) return null;
  const { icon, label } = JENIS_LABEL[jenis];
  return (
    <span
      className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] font-medium ring-1 ring-border"
      title={`${label}: ${count}`}
    >
      <span aria-hidden>{icon}</span>
      {count}
    </span>
  );
}

/** Sub-tabel aset per jenis, ditampilkan saat baris di-expand. */
function AsetSubTable({
  jenis,
  items,
}: {
  jenis: AsetPemegangJenis;
  items: AsetPemegang[];
}) {
  const { icon, label } = JENIS_LABEL[jenis];
  return (
    <div className="ring-1 ring-border">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-2 py-1.5">
        <span aria-hidden>{icon}</span>
        <span className="font-mono text-xs font-semibold">
          {label} ({items.length})
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">
          Tidak ada data
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              {jenis === "kendaraan" && (
                <>
                  <TableHead className="h-8 w-8 font-mono text-[10px]">No</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Jenis</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Merk</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Tahun</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">No. Polisi</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Harga</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Ket</TableHead>
                </>
              )}
              {jenis === "laptop" && (
                <>
                  <TableHead className="h-8 w-8 font-mono text-[10px]">No</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Merk</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Type</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Tahun</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Harga</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Ket</TableHead>
                </>
              )}
              {jenis === "alat" && (
                <>
                  <TableHead className="h-8 w-8 font-mono text-[10px]">No</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Merk</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Type</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Tahun</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Harga</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Ket</TableHead>
                </>
              )}
              {jenis === "rumah" && (
                <>
                  <TableHead className="h-8 w-8 font-mono text-[10px]">No</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Ket</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Merk</TableHead>
                  <TableHead className="h-8 font-mono text-[10px]">Tahun</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a, i) => (
              <TableRow key={a.id} className="border-b border-border last:border-0">
                {jenis === "kendaraan" && (
                  <>
                    <TableCell className="px-2 py-1.5 font-mono text-[11px]">{i + 1}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.ket || a.merk || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.nopol || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.harga || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] text-muted-foreground">{a.ket || "-"}</TableCell>
                  </>
                )}
                {jenis === "laptop" && (
                  <>
                    <TableCell className="px-2 py-1.5 font-mono text-[11px]">{i + 1}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.type || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.harga || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] text-muted-foreground">{a.ket || "-"}</TableCell>
                  </>
                )}
                {jenis === "alat" && (
                  <>
                    <TableCell className="px-2 py-1.5 font-mono text-[11px]">{i + 1}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.type || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.harga || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] text-muted-foreground">{a.ket || "-"}</TableCell>
                  </>
                )}
                {jenis === "rumah" && (
                  <>
                    <TableCell className="px-2 py-1.5 font-mono text-[11px]">{i + 1}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.ket || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px] font-medium">{a.merk || "-"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-[11px]">{a.tahun || "-"}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export function RekapRow({
  pemegang,
  asetList,
  hasPakta,
  paktaId,
  index,
}: RekapRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const counts = countByJenis(asetList);
  const totalItem = asetList.length;

  const handleBuatPakta = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    setErr(null);
    try {
      const id = await buatPaktaDariPemegang(pemegang.id);
      // Navigasi ke pakta yang baru dibuat
      window.location.href = `/pakta/${id}`;
    } catch (error) {
      setErr(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/40"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className="px-2 py-2 align-top w-8">
          <span className="inline-flex h-5 items-center justify-center px-1.5 font-mono text-[10px] ring-1 ring-border">
            {String(index + 1).padStart(3, "0")}
          </span>
        </TableCell>
        <TableCell className="px-2 py-2 align-top">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground" aria-hidden>
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
            <div>
              <div className="font-medium">{pemegang.nama}</div>
              <div className="text-[10px] text-muted-foreground">
                NIP. {pemegang.nip || "—"}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-2 py-2 align-top text-[11px] font-medium">
          {pemegang.jabatan || "—"}
        </TableCell>
        <TableCell className="px-2 py-2 align-top">
          <span
            className={`inline-flex h-5 items-center px-2 font-mono text-[10px] font-medium ring-1 ${
              pemegang.status === "PPPK"
                ? "bg-secondary text-secondary-foreground ring-border"
                : "bg-primary text-primary-foreground ring-primary"
            }`}
          >
            {pemegang.status}
          </span>
        </TableCell>
        <TableCell className="px-2 py-2 align-top">
          <div className="flex flex-wrap items-center gap-1">
            {totalItem === 0 ? (
              <span className="text-[11px] text-muted-foreground">—</span>
            ) : (
              <>
                <AsetBadge jenis="laptop" count={counts.laptop} />
                <AsetBadge jenis="kendaraan" count={counts.kendaraan} />
                <AsetBadge jenis="alat" count={counts.alat} />
                <AsetBadge jenis="rumah" count={counts.rumah} />
              </>
            )}
          </div>
        </TableCell>
        <TableCell className="px-2 py-2 align-top">
          {hasPakta ? (
            <span className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] font-medium text-foreground ring-1 ring-border">
              <span aria-hidden>✅</span> Ada
            </span>
          ) : (
            <span className="inline-flex h-5 items-center gap-1 px-2 font-mono text-[10px] font-medium text-muted-foreground ring-1 ring-border">
              <span aria-hidden>⚠</span> Belum
            </span>
          )}
        </TableCell>
        <TableCell className="px-2 py-2 align-top">
          <div
            className="flex items-center justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setExpanded((v) => !v)}
              title="Lihat detail aset"
            >
              <ChevronDown className="h-3 w-3" />
              Detail
            </Button>
            {hasPakta && paktaId ? (
              <Link
                href={`/pakta/${paktaId}`}
                className="inline-flex h-6 items-center gap-1 border border-border bg-background px-2 text-xs hover:bg-muted"
                title="Buka Pakta"
              >
                <ScrollText className="h-3 w-3" />
                Pakta
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
              </Link>
            ) : (
              <form onSubmit={handleBuatPakta}>
                <Button
                  type="submit"
                  variant="outline"
                  size="xs"
                  disabled={busy}
                  title="Buat Pakta dari data pemegang"
                >
                  <ScrollText className="h-3 w-3" />
                  {busy ? "…" : "Pakta"}
                </Button>
              </form>
            )}
            <Link
              href={`/rekap/${pemegang.id}`}
              className="inline-flex h-6 w-6 items-center justify-center ring-1 ring-border hover:bg-muted"
              title="Kelola"
            >
              <Pencil className="h-3 w-3" aria-hidden />
              <span className="sr-only">Kelola</span>
            </Link>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="bg-muted/20 p-3">
            {err && (
              <p className="mb-2 bg-destructive/10 px-2 py-1 text-[11px] text-destructive ring-1 ring-destructive/20">
                {err}
              </p>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {JENIS_ORDER.map((jenis) => (
                <AsetSubTable
                  key={jenis}
                  jenis={jenis}
                  items={asetList.filter((a) => a.jenis === jenis)}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Total {totalItem} aset ·{" "}
                <Link
                  href={`/rekap/${pemegang.id}`}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Kelola aset →
                </Link>
              </p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

interface RekapTableProps {
  rows: Array<{
    pemegang: PemegangInventaris;
    asetList: AsetPemegang[];
    hasPakta: boolean;
    paktaId: string | null;
  }>;
}

export function RekapTable({ rows }: RekapTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border bg-muted/50">
          <TableHead className="h-9 w-8 px-2 text-left font-mono text-[10px] font-medium">
            No
          </TableHead>
          <TableHead className="h-9 px-2 text-left font-mono text-[10px] font-medium">
            Nama / NIP
          </TableHead>
          <TableHead className="h-9 px-2 text-left font-mono text-[10px] font-medium">
            Jabatan
          </TableHead>
          <TableHead className="h-9 px-2 text-left font-mono text-[10px] font-medium">
            Status
          </TableHead>
          <TableHead className="h-9 px-2 text-left font-mono text-[10px] font-medium">
            Inventaris Dipegang
          </TableHead>
          <TableHead className="h-9 px-2 text-left font-mono text-[10px] font-medium">
            Pakta
          </TableHead>
          <TableHead className="h-9 px-2 text-center font-mono text-[10px] font-medium">
            Aksi
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <RekapRow
            key={r.pemegang.id}
            pemegang={r.pemegang}
            asetList={r.asetList}
            hasPakta={r.hasPakta}
            paktaId={r.paktaId}
            index={i}
          />
        ))}
      </TableBody>
    </Table>
  );
}
