import { getSbbkById } from "@/lib/auth/sbbk";
import { PrintTrigger } from "@/components/sbbk/print-trigger";
import { SbbkPrintDoc } from "@/components/sbbk/sbbk-print-doc";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SbbkPrintPage({ params }: PageProps) {
  const { id } = await params;
  const sbbk = await getSbbkById(id).catch(() => null);

  if (!sbbk) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar — hidden when printing (no dashboard chrome) */}
      <div className="mx-auto max-w-[210mm] px-4 pt-4 no-print print:hidden">
        <PrintTrigger />
        <div className="mb-4 text-center">
          <Link
            href={`/sbbk/${sbbk.id}`}
            className="text-sm text-neutral-500 underline hover:text-neutral-800"
          >
            ← Kembali ke detail SBBK
          </Link>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 12mm; }
              body { background: #fff !important; }
              .no-print, .print\\:hidden { display: none !important; }
              .sbbk-doc { box-shadow: none !important; }
            }
          `,
        }}
      />

      <SbbkPrintDoc sbbk={sbbk} />
    </div>
  );
}
