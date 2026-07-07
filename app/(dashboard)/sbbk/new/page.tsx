import { generateSbbkNumber } from "@/lib/auth/sbbk";
import { SbbkForm } from "@/components/sbbk/sbbk-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewSbbkPage() {
  const sbbkNumber = await generateSbbkNumber();

  const initialSbbk = {
    no: sbbkNumber,
    tgl: new Date().toISOString().split("T")[0],
    kepada: "",
    jenis: "",
    anggaran: "",
    ket_umum: "",
    items: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sbbk">
          <Button variant="outline" size="icon" aria-label="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Buat SBBK Baru</h1>
          <p className="text-xs text-muted-foreground">Surat Bukti Barang Keluar</p>
        </div>
      </div>

      <SbbkForm sbbk={initialSbbk} />
    </div>
  );
}
