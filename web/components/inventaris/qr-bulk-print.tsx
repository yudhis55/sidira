"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "@phosphor-icons/react";
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
    <div className="min-h-screen bg-background">
      <style>{`@page { size: A4; margin: 10mm; }`}</style>

      {/* Toolbar layar — disembunyikan saat print */}
      <div className="qr-bulk-toolbar sticky top-0 z-10 border-b border-border bg-surface print:hidden">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <Link
            href="/inventaris"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <ArrowLeft size={15} aria-hidden className="text-text-3" />
            Kembali
          </Link>
          <h1 className="ml-1 text-[15px] font-semibold text-foreground">
            Cetak QR Ruangan
            <span className="ml-1.5 font-mono text-[13px] tabular-nums text-text-3">
              ({rooms.length})
            </span>
          </h1>
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <Printer size={15} aria-hidden />
            Cetak Semua
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 print:max-w-none print:p-0">
        <p className="mb-4 text-center text-[13px] text-text-3 print:hidden">
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
