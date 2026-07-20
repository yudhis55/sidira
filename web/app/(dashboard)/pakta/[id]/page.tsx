import * as React from "react";
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink3">
        {label}
      </p>
      <div className="mt-0.5 text-xs text-ink">{children}</div>
    </div>
  );
}

function AsetTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-ink3">{empty}</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "12.5px" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                className="font-bold uppercase whitespace-nowrap text-left"
                style={{
                  padding: "10px 12px",
                  background: "#eff6ff",
                  fontSize: "10.5px",
                  color: "#1e40af",
                  letterSpacing: "0.4px",
                  borderBottom: "2px solid #bfdbfe",
                  width: i === 0 ? 48 : undefined,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "10px 12px",
                    verticalAlign: "middle",
                    color: ci === 0 || ci === 1 ? "var(--ink)" : "var(--ink2)",
                    fontWeight: ci === 1 ? 600 : 400,
                    fontFamily: ci === 0 ? "var(--font-mono), monospace" : undefined,
                  }}
                >
                  {cell || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

  const nKend = kendaraan.filter((r) => r && (r.merk || r.jenis)).length;
  const nLapt = laptop.filter((r) => r && (r.merk || r.type)).length;
  const nAlat = alat.filter((r) => r && (r.merk || r.type)).length;

  return (
    <div className="space-y-5">
      {/* Header — GAS blue theme + SBBK action pattern */}
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-5 py-4 bg-white border border-line"
        style={{
          borderRadius: "var(--r, 10px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/pakta">
            <Button variant="ghost" size="icon" aria-label="Kembali">
              {"\u2190"}
            </Button>
          </Link>
          <div
            className="flex items-center justify-center shrink-0 text-[22px]"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
            }}
            aria-hidden
          >
            {"\u{1F4DC}"}
          </div>
          <div className="min-w-0">
            <h1 className="font-mono text-lg font-bold tracking-tight text-ink truncate">
              {pakta.nama}
            </h1>
            <p className="text-xs text-ink3">
              Pakta Integritas BMD · {asetCount} aset
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/pakta/${pakta.id}/edit`}>
            <Button variant="ghost" className="text-xs px-3 py-1.5">
              {"\u270F\uFE0F"} Edit
            </Button>
          </Link>
          <Link
            href={`/pakta/${pakta.id}/print?lampiran=1`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              className="text-xs px-3 py-1.5"
              style={{ borderColor: "#bfdbfe", color: "#1e40af" }}
            >
              {"\u{1F4CB}"} Lampiran
            </Button>
          </Link>
          <Link
            href={`/pakta/${pakta.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" className="text-xs px-3 py-1.5">
              {"\u{1F5A8}\uFE0F"} Cetak
            </Button>
          </Link>
          <span title="Mode demo — hapus tidak aktif">
            <Button
              variant="ghost"
              className="text-xs px-3 py-1.5 text-red border-red/30 opacity-50 cursor-not-allowed"
              type="button"
              disabled
            >
              {"\u{1F5D1}\uFE0F"} Hapus
            </Button>
          </span>
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-ink3">Aset:</span>
        <span
          className="inline-flex h-7 items-center rounded-full border-[1.5px] px-3 text-[11px] font-bold"
          style={{
            borderColor: nKend > 0 ? "#2563eb" : "var(--line)",
            background: nKend > 0 ? "#dbeafe" : "var(--white)",
            color: nKend > 0 ? "#1e40af" : "var(--ink3)",
          }}
        >
          {"\u{1F697}"} Kendaraan {nKend}
        </span>
        <span
          className="inline-flex h-7 items-center rounded-full border-[1.5px] px-3 text-[11px] font-bold"
          style={{
            borderColor: nLapt > 0 ? "#2563eb" : "var(--line)",
            background: nLapt > 0 ? "#dbeafe" : "var(--white)",
            color: nLapt > 0 ? "#1e40af" : "var(--ink3)",
          }}
        >
          {"\u{1F4BB}"} Laptop/PC {nLapt}
        </span>
        <span
          className="inline-flex h-7 items-center rounded-full border-[1.5px] px-3 text-[11px] font-bold"
          style={{
            borderColor: nAlat > 0 ? "#2563eb" : "var(--line)",
            background: nAlat > 0 ? "#dbeafe" : "var(--white)",
            color: nAlat > 0 ? "#1e40af" : "var(--ink3)",
          }}
        >
          {"\u{1F4F1}"} Alat {nAlat}
        </span>
        <span
          className="inline-flex h-7 items-center rounded-full px-3 text-[11px] font-bold"
          style={{ background: "#dbeafe", color: "#1e40af" }}
        >
          Total {asetCount} aset
        </span>
      </div>

      {/* Info pemegang */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-mono text-sm font-bold text-ink mb-3">
            {"\u{1F464}"} Identitas Pemegang
          </p>
          <div className="space-y-3">
            <Field label="Nama">
              <span className="font-mono font-semibold">{pakta.nama || "-"}</span>
            </Field>
            <Field label="NIP">{pakta.nip || "-"}</Field>
            <Field label="Jabatan">{pakta.jabatan || "-"}</Field>
            <Field label="Alamat">
              <span className="text-ink2">{pakta.alamat || "-"}</span>
            </Field>
          </div>
        </Card>

        <Card>
          <p className="font-mono text-sm font-bold text-ink mb-3">
            {"\u{1F4C5}"} Tanggal Pakta
          </p>
          <div className="space-y-3">
            <Field label="Hari">{pakta.hari || "-"}</Field>
            <Field label="Tanggal">{fmtDate(pakta.tgl)}</Field>
            <Field label="Total Aset">
              <span
                className="inline-block font-bold"
                style={{
                  padding: "2px 9px",
                  borderRadius: 10,
                  fontSize: 11,
                  background: "#dbeafe",
                  color: "#1e40af",
                }}
              >
                {asetCount} aset
              </span>
            </Field>
          </div>
        </Card>
      </div>

      {/* Lampiran Aset: Kendaraan */}
      <Card className="p-0 overflow-hidden">
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: "var(--line)", background: "#f8fafc" }}
        >
          <span className="text-base" aria-hidden>
            {"\u{1F697}"}
          </span>
          <p className="font-mono text-sm font-bold text-ink">
            Kendaraan Dinas
          </p>
          <span
            className="ml-auto inline-block font-bold"
            style={{
              padding: "2px 8px",
              borderRadius: 8,
              fontSize: 10,
              background: "#dbeafe",
              color: "#1e40af",
            }}
          >
            {nKend}
          </span>
        </div>
        <AsetTable
          headers={[
            "No",
            "Jenis",
            "Merk",
            "Tahun",
            "No. Polisi",
            "Harga Perolehan",
            "Keterangan",
          ]}
          rows={kendaraan.map((r, i) => [
            String(i + 1),
            r.jenis || "",
            r.merk || "",
            r.tahun?.toString() || "",
            r.nopol || "",
            r.harga || "",
            r.ket || "",
          ])}
          empty="Tidak ada data aset kendaraan"
        />
      </Card>

      {/* Lampiran Aset: Laptop */}
      <Card className="p-0 overflow-hidden">
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: "var(--line)", background: "#f8fafc" }}
        >
          <span className="text-base" aria-hidden>
            {"\u{1F4BB}"}
          </span>
          <p className="font-mono text-sm font-bold text-ink">
            Laptop / Personal Komputer
          </p>
          <span
            className="ml-auto inline-block font-bold"
            style={{
              padding: "2px 8px",
              borderRadius: 8,
              fontSize: 10,
              background: "#dbeafe",
              color: "#1e40af",
            }}
          >
            {nLapt}
          </span>
        </div>
        <AsetTable
          headers={[
            "No",
            "Merk",
            "Type",
            "Tahun",
            "No. Seri",
            "Harga Perolehan",
            "Keterangan",
          ]}
          rows={laptop.map((r, i) => [
            String(i + 1),
            r.merk || "",
            r.type || "",
            r.tahun?.toString() || "",
            r.seri || "",
            r.harga || "",
            r.ket || "",
          ])}
          empty="Tidak ada data aset laptop/PC"
        />
      </Card>

      {/* Lampiran Aset: Alat Penunjang */}
      <Card className="p-0 overflow-hidden">
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: "var(--line)", background: "#f8fafc" }}
        >
          <span className="text-base" aria-hidden>
            {"\u{1F4F1}"}
          </span>
          <p className="font-mono text-sm font-bold text-ink">
            Alat Penunjang (Tablet, Handphone, Handy Talky, External Hardisk)
          </p>
          <span
            className="ml-auto inline-block font-bold"
            style={{
              padding: "2px 8px",
              borderRadius: 8,
              fontSize: 10,
              background: "#dbeafe",
              color: "#1e40af",
            }}
          >
            {nAlat}
          </span>
        </div>
        <AsetTable
          headers={[
            "No",
            "Merk",
            "Type",
            "Tahun",
            "No. Seri",
            "Harga Perolehan",
            "Keterangan",
          ]}
          rows={alat.map((r, i) => [
            String(i + 1),
            r.merk || "",
            r.type || "",
            r.tahun?.toString() || "",
            r.seri || "",
            r.harga || "",
            r.ket || "",
          ])}
          empty="Tidak ada data aset alat penunjang"
        />
      </Card>
    </div>
  );
}
