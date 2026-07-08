import { SbbkForm } from "@/components/sbbk/sbbk-form";
import { Button } from "@/components/gas/button";
import Link from "next/link";

const initialSbbk = {
  id: "new",
  no: "___/SBBK/PKB/" + new Date().getFullYear(),
  tgl: new Date().toISOString().split("T")[0],
  kepada: "",
  jenis: "",
  anggaran: "",
  ket_umum: "",
  items: [],
  created_at: "",
  updated_at: "",
};

export default function NewSbbkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sbbk">
          <Button variant="ghost" aria-label="Kembali">
            <span className="mr-1">⬅️</span> Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight">Buat SBBK Baru</h1>
          <p className="text-xs text-ink3">Surat Bukti Barang Keluar</p>
        </div>
      </div>

      <SbbkForm sbbk={initialSbbk} />
    </div>
  );
}
