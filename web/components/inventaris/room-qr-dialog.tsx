"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/lib/use-is-client";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RoomQrDialogProps {
  roomId: string;
  roomName: string;
}

const QR_DISPLAY_SIZE = 220;
const QR_PRINT_SIZE = 400;
const PNG_SCALE = 4;

export function RoomQrDialog({ roomId, roomName }: RoomQrDialogProps) {
  const [open, setOpen] = useState(false);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  // Nilai QR hanya ada setelah hidrasi (origin window tidak tersedia saat
  // SSR): pakai useIsClient agar markup server & klien identik (kosong).
  const isClient = useIsClient();
  const qrValue = isClient
    ? `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/r/${roomId}`
    : "";

  async function handleCopy(): Promise<void> {
    if (!qrValue) {
      toast.error("Tautan belum siap, tunggu sebentar");
      return;
    }
    try {
      await navigator.clipboard.writeText(qrValue);
      toast.success("Tautan ruangan disalin");
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  }

  function handleDownloadPng(): void {
    try {
      const svgEl = qrWrapRef.current?.querySelector("svg");
      if (!svgEl) {
        toast.error("Gagal mengunduh QR: gambar belum siap");
        return;
      }
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = QR_DISPLAY_SIZE * PNG_SCALE;
          canvas.height = QR_DISPLAY_SIZE * PNG_SCALE;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            toast.error("Gagal mengunduh QR: kanvas tidak tersedia");
            URL.revokeObjectURL(svgUrl);
            return;
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(svgUrl);
          const pngUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `qr-${roomId}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          toast.success("QR berhasil diunduh");
        } catch {
          toast.error("Gagal mengunduh QR");
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        toast.error("Gagal mengunduh QR");
      };
      img.src = svgUrl;
    } catch {
      toast.error("Gagal mengunduh QR");
    }
  }

  function handlePrint(): void {
    window.print();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            <QrCode size={15} aria-hidden className="text-text-3" />
            QR Ruangan
          </button>
        </DialogTrigger>
        <DialogContent className="gap-5 rounded-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">
              QR Ruangan
            </DialogTitle>
            <DialogDescription className="text-[13px] text-text-3">
              Pindai kode untuk membuka halaman inventaris ruangan ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-[13px] font-semibold text-foreground">
              {roomName}
            </p>
            <div
              ref={qrWrapRef}
              className="rounded-md border border-border bg-white p-4"
            >
              {qrValue ? (
                <QRCodeSVG
                  value={qrValue}
                  size={QR_DISPLAY_SIZE}
                  level="Q"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              ) : (
                <div
                  aria-hidden
                  style={{ width: QR_DISPLAY_SIZE, height: QR_DISPLAY_SIZE }}
                  className="animate-pulse rounded-sm bg-surface-muted"
                />
              )}
            </div>
            <div className="w-full rounded-sm border border-border bg-surface-muted px-3 py-2">
              <p className="break-all font-mono text-[11px] text-text-2">
                {qrValue || "Menyiapkan tautan…"}
              </p>
            </div>
            <div className="flex w-full flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopy}
              >
                Salin Tautan
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownloadPng}
              >
                Unduh PNG
              </Button>
              <Button type="button" size="sm" onClick={handlePrint}>
                Cetak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Area cetak di-portal langsung ke body agar saat print TIDAK ada
          sisa layout halaman (sidebar/konten dashboard) yang membuat halaman
          kosong kedua: seluruh anak body kecuali root ini disembunyikan. */}
      {isClient &&
        createPortal(
          <>
            <style>{`@page { margin: 12mm; } @media print { body > *:not([data-qr-print]) { display: none !important; } [data-qr-print] { display: block !important; } }`}</style>
            <div data-qr-print id="room-qr-print" className="hidden print:block">
              <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-4 rounded-lg border border-neutral-900 bg-white p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">
                  UPTD Puskesmas Baruharjo — SIDIRA
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {"\u25A6"} {roomName}
                </p>
                {qrValue ? (
                  <QRCodeSVG
                    value={qrValue}
                    size={QR_PRINT_SIZE}
                    level="Q"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                ) : null}
                <p className="text-xs text-neutral-700 break-all">{qrValue}</p>
                <p className="text-sm text-neutral-900">
                  Pindai untuk melihat inventaris ruangan ini
                </p>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
