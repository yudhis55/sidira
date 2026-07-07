"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPakta, updatePakta, type PaktaInput } from "@/lib/auth/pakta";
import type {
  Pakta,
  PaktaAsetKendaraan,
  PaktaAsetLaptop,
  PaktaAsetAlat,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PaktaFormProps {
  pakta?: Pakta;
}

const JENIS_KENDARAAN = ["motor", "mobil"];

const HARI_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function defaultKendaraan(): PaktaAsetKendaraan {
  return { jenis: "", merk: "", tahun: "", nopol: "", harga: "", ket: "" };
}
function defaultLaptop(): PaktaAsetLaptop {
  return { merk: "", type: "", tahun: "", seri: "", harga: "", ket: "" };
}
function defaultAlat(): PaktaAsetAlat {
  return { merk: "", type: "", tahun: "", seri: "", harga: "", ket: "" };
}

export function PaktaForm({ pakta }: PaktaFormProps) {
  const router = useRouter();
  const isEdit = !!pakta;
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    hari: pakta?.hari || HARI_OPTIONS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
    tgl: pakta?.tgl || new Date().toISOString().split("T")[0],
    nama: pakta?.nama || "",
    nip: pakta?.nip || "",
    jabatan: pakta?.jabatan || "",
    alamat: pakta?.alamat || "",
  });

  const [kendaraan, setKendaraan] = useState<PaktaAsetKendaraan[]>(
    pakta?.aset_kendaraan && pakta.aset_kendaraan.length > 0
      ? pakta.aset_kendaraan
      : [defaultKendaraan()],
  );
  const [laptop, setLaptop] = useState<PaktaAsetLaptop[]>(
    pakta?.aset_laptop && pakta.aset_laptop.length > 0
      ? pakta.aset_laptop
      : [defaultLaptop()],
  );
  const [alat, setAlat] = useState<PaktaAsetAlat[]>(
    pakta?.aset_alat && pakta.aset_alat.length > 0
      ? pakta.aset_alat
      : [defaultAlat()],
  );

  // ── Handlers: Kendaraan ──
  const addKendaraan = () => setKendaraan([...kendaraan, defaultKendaraan()]);
  const removeKendaraan = (i: number) =>
    setKendaraan(kendaraan.filter((_, idx) => idx !== i));
  const updateKendaraan = (i: number, field: keyof PaktaAsetKendaraan, value: string) => {
    const next = [...kendaraan];
    next[i] = { ...next[i], [field]: value };
    setKendaraan(next);
  };

  // ── Handlers: Laptop ──
  const addLaptop = () => setLaptop([...laptop, defaultLaptop()]);
  const removeLaptop = (i: number) => setLaptop(laptop.filter((_, idx) => idx !== i));
  const updateLaptop = (i: number, field: keyof PaktaAsetLaptop, value: string) => {
    const next = [...laptop];
    next[i] = { ...next[i], [field]: value };
    setLaptop(next);
  };

  // ── Handlers: Alat ──
  const addAlat = () => setAlat([...alat, defaultAlat()]);
  const removeAlat = (i: number) => setAlat(alat.filter((_, idx) => idx !== i));
  const updateAlat = (i: number, field: keyof PaktaAsetAlat, value: string) => {
    const next = [...alat];
    next[i] = { ...next[i], [field]: value };
    setAlat(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Bersihkan baris kosong (tanpa merk/jenis/nama)
      const cleanKendaraan = kendaraan.filter((r) => r.merk?.trim() || r.jenis?.trim());
      const cleanLaptop = laptop.filter((r) => r.merk?.trim() || r.type?.trim());
      const cleanAlat = alat.filter((r) => r.merk?.trim() || r.type?.trim());

      const payload: PaktaInput = {
        hari: header.hari,
        tgl: header.tgl,
        nama: header.nama,
        nip: header.nip,
        jabatan: header.jabatan,
        alamat: header.alamat,
        aset_kendaraan: cleanKendaraan,
        aset_laptop: cleanLaptop,
        aset_alat: cleanAlat,
      };

      if (isEdit && pakta) {
        await updatePakta(pakta.id, payload);
      } else {
        await createPakta(payload);
      }
      router.refresh();
    } catch (error) {
      console.error("Gagal menyimpan Pakta:", error);
      alert("Gagal menyimpan Pakta: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Header / Identitas Pemegang ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-mono text-sm">Identitas Pemegang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="font-mono text-xs">Nama *</Label>
              <Input
                id="nama"
                value={header.nama}
                onChange={(e) => setHeader({ ...header, nama: e.target.value })}
                placeholder="Nama lengkap"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nip" className="font-mono text-xs">NIP</Label>
              <Input
                id="nip"
                value={header.nip}
                onChange={(e) => setHeader({ ...header, nip: e.target.value })}
                placeholder="NIP (opsional)"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="jabatan" className="font-mono text-xs">Jabatan</Label>
              <Input
                id="jabatan"
                value={header.jabatan}
                onChange={(e) => setHeader({ ...header, jabatan: e.target.value })}
                placeholder="Jabatan"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Hari</Label>
                <Select
                  value={header.hari}
                  onValueChange={(v) => setHeader({ ...header, hari: v })}
                  disabled={loading}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {HARI_OPTIONS.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tgl" className="font-mono text-xs">Tanggal</Label>
                <Input
                  id="tgl"
                  type="date"
                  value={header.tgl}
                  onChange={(e) => setHeader({ ...header, tgl: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alamat" className="font-mono text-xs">Alamat</Label>
            <Textarea
              id="alamat"
              value={header.alamat}
              onChange={(e) => setHeader({ ...header, alamat: e.target.value })}
              placeholder="Alamat pemegang (opsional)"
              rows={2}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Lampiran Aset: Kendaraan Dinas ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-mono text-sm">🚗 Kendaraan Dinas</CardTitle>
          <Button type="button" onClick={addKendaraan} size="sm" variant="outline" disabled={loading}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Baris
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="h-9 px-2 text-center font-mono font-medium w-10">No</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Jenis</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                  <th className="h-9 px-2 text-left font-mono font-medium w-20">Tahun</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">No. Polisi</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Harga Perolehan</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Keterangan</th>
                  <th className="h-9 px-2 text-center font-mono font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {kendaraan.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-2 py-1.5 text-center font-mono align-top">{i + 1}</td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Select
                        value={r.jenis || ""}
                        onValueChange={(v) => updateKendaraan(i, "jenis", v)}
                        disabled={loading}
                      >
                        <SelectTrigger className="h-7 w-full text-xs">
                          <SelectValue placeholder="motor/mobil" />
                        </SelectTrigger>
                        <SelectContent>
                          {JENIS_KENDARAAN.map((j) => (
                            <SelectItem key={j} value={j}>{j}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.merk || ""}
                        onChange={(e) => updateKendaraan(i, "merk", e.target.value)}
                        placeholder="Merk"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.tahun?.toString() || ""}
                        onChange={(e) => updateKendaraan(i, "tahun", e.target.value)}
                        placeholder="Tahun"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.nopol || ""}
                        onChange={(e) => updateKendaraan(i, "nopol", e.target.value)}
                        placeholder="AG 1234 XX"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.harga || ""}
                        onChange={(e) => updateKendaraan(i, "harga", e.target.value)}
                        placeholder="Rp"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.ket || ""}
                        onChange={(e) => updateKendaraan(i, "ket", e.target.value)}
                        placeholder="—"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <button
                        type="button"
                        onClick={() => removeKendaraan(i)}
                        disabled={loading}
                        className="inline-flex h-6 w-6 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/20"
                        title="Hapus baris"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        <span className="sr-only">Hapus baris kendaraan</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Lampiran Aset: Laptop / PC ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-mono text-sm">💻 Laptop / Personal Komputer</CardTitle>
          <Button type="button" onClick={addLaptop} size="sm" variant="outline" disabled={loading}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Baris
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="h-9 px-2 text-center font-mono font-medium w-10">No</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Type</th>
                  <th className="h-9 px-2 text-left font-mono font-medium w-20">Tahun</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">No. Seri</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Harga Perolehan</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Keterangan</th>
                  <th className="h-9 px-2 text-center font-mono font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {laptop.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-2 py-1.5 text-center font-mono align-top">{i + 1}</td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.merk || ""}
                        onChange={(e) => updateLaptop(i, "merk", e.target.value)}
                        placeholder="Merk"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.type || ""}
                        onChange={(e) => updateLaptop(i, "type", e.target.value)}
                        placeholder="Type/Model"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.tahun?.toString() || ""}
                        onChange={(e) => updateLaptop(i, "tahun", e.target.value)}
                        placeholder="Tahun"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.seri || ""}
                        onChange={(e) => updateLaptop(i, "seri", e.target.value)}
                        placeholder="No. Seri"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.harga || ""}
                        onChange={(e) => updateLaptop(i, "harga", e.target.value)}
                        placeholder="Rp"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.ket || ""}
                        onChange={(e) => updateLaptop(i, "ket", e.target.value)}
                        placeholder="—"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <button
                        type="button"
                        onClick={() => removeLaptop(i)}
                        disabled={loading}
                        className="inline-flex h-6 w-6 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/20"
                        title="Hapus baris"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        <span className="sr-only">Hapus baris laptop</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Lampiran Aset: Alat Penunjang ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="font-mono text-sm">
            📱 Alat Penunjang (Tablet, Handphone, Handy Talky, External Hardisk)
          </CardTitle>
          <Button type="button" onClick={addAlat} size="sm" variant="outline" disabled={loading}>
            <Plus className="h-4 w-4 mr-1" />
            Tambah Baris
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="h-9 px-2 text-center font-mono font-medium w-10">No</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Merk</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Type</th>
                  <th className="h-9 px-2 text-left font-mono font-medium w-20">Tahun</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">No. Seri</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Harga Perolehan</th>
                  <th className="h-9 px-2 text-left font-mono font-medium">Keterangan</th>
                  <th className="h-9 px-2 text-center font-mono font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {alat.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-2 py-1.5 text-center font-mono align-top">{i + 1}</td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.merk || ""}
                        onChange={(e) => updateAlat(i, "merk", e.target.value)}
                        placeholder="Merk"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.type || ""}
                        onChange={(e) => updateAlat(i, "type", e.target.value)}
                        placeholder="Type/Jenis"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.tahun?.toString() || ""}
                        onChange={(e) => updateAlat(i, "tahun", e.target.value)}
                        placeholder="Tahun"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.seri || ""}
                        onChange={(e) => updateAlat(i, "seri", e.target.value)}
                        placeholder="No. Seri"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.harga || ""}
                        onChange={(e) => updateAlat(i, "harga", e.target.value)}
                        placeholder="Rp"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <Input
                        value={r.ket || ""}
                        onChange={(e) => updateAlat(i, "ket", e.target.value)}
                        placeholder="—"
                        disabled={loading}
                        className="h-7"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <button
                        type="button"
                        onClick={() => removeAlat(i)}
                        disabled={loading}
                        className="inline-flex h-6 w-6 items-center justify-center bg-destructive/10 text-destructive ring-1 ring-destructive/20 hover:bg-destructive/20"
                        title="Hapus baris"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        <span className="sr-only">Hapus baris alat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Aksi ── */}
      <div className="flex gap-2">
        <Link href={isEdit && pakta ? `/pakta/${pakta.id}` : "/pakta"}>
          <Button variant="outline" type="button" disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-1" />
          {loading ? "Menyimpan..." : isEdit ? "Update Pakta" : "Simpan Pakta"}
        </Button>
      </div>
    </form>
  );
}
