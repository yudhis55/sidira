"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useIsClient } from "@/lib/use-is-client";

interface QrBulkRoom {
  id: string;
  name: string;
  icon: string | null;
}

const QR_SCREEN_SIZE = 180;
const QR_PRINT_SIZE = 340;

export function QrBulkPrint({ rooms }: { rooms: QrBulkRoom[] }) {
  const isClient = useIsClient();
  const baseUrl = isClient
    ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    : "";

  return (
    <div className="min-h-screen bg-neutral-100">
      <style>{`@page { size: A4; margin: 10mm; }`}</style>

      {/* Toolbar layar — disembunyikan saat print */}
      <div className="qr-bulk-toolbar sticky top-0 z-10 border-b border-neutral-200 bg-white print:hidden">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <Link
            href="/inventaris"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            ← Kembali
          </Link>
          <h1 className="ml-1 text-sm font-bold text-neutral-900">
            Cetak QR Ruangan ({rooms.length})
          </h1>
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-auto rounded-md bg-teal-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            🖨️ Cetak Semua
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 print:max-w-none print:p-0">
        <p className="mb-4 text-center text-sm text-neutral-500 print:hidden">
          Satu kartu per halaman saat dicetak. Tempelkan di pintu tiap ruangan.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:block print:space-y-0">
          {rooms.map((room) => {
            const qrValue = baseUrl ? `${baseUrl}/r/${room.id}` : "";
            return (
              <div
                key={room.id}
                className="qr-bulk-card flex flex-col items-center gap-3 rounded-lg border border-neutral-900 bg-white p-6 text-center print:mx-auto print:mt-[8vh] print:max-w-[520px] print:break-inside-avoid print:break-after-page print:last:break-after-auto"
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                  UPTD Puskesmas Baruharjo — SIDIRA
                </p>
                <p className="text-xl font-bold text-neutral-900">
                  <span aria-hidden className="mr-1.5">{room.icon || "🏥"}</span>
                  {room.name}
                </p>
                {qrValue ? (
                  <>
                    <QRCodeSVG
                      value={qrValue}
                      size={QR_SCREEN_SIZE}
                      level="Q"
                      bgColor="#ffffff"
                      fgColor="#000000"
                      className="print:hidden"
                    />
                    <div className="hidden print:block">
                      <QRCodeSVG
                        value={qrValue}
                        size={QR_PRINT_SIZE}
                        level="Q"
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  </>
                ) : (
                  <div
                    aria-hidden
                    style={{ width: QR_SCREEN_SIZE, height: QR_SCREEN_SIZE }}
                    className="animate-pulse rounded bg-neutral-100"
                  />
                )}
                <p className="font-mono text-[11px] text-neutral-500 break-all">
                  {qrValue || "Menyiapkan tautan…"}
                </p>
                <p className="text-sm text-neutral-700">
                  Pindai untuk melihat inventaris ruangan ini
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
