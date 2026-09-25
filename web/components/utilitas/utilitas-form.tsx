"use client";

import { useState } from "react";
import { createUtilMeta, updateUtilMeta } from "@/lib/auth/utilitas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { UtilMeta } from "@/lib/auth/utilitas";

interface UtilitasFormProps {
  utilitas?: UtilMeta;
  /**
   * Mode telanjang untuk dipakai di dalam modal: tanpa Card pembungkus
   * dan tombol Batal memanggil onCancel (bukan pindah ke /utilitas).
   */
  bare?: boolean;
  onCancel?: () => void;
}

// Preset emojis for utilitas identity (ambulance, genset, water/IPAL, tools, etc.)
const PRESET_EMOJIS = ["🚑", "⚡", "💧", "🔧", "🔥", "🧯", "🚰", "🏥"];

export function UtilitasForm({ utilitas, bare, onCancel }: UtilitasFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icon, setIcon] = useState(utilitas?.icon || "🔧");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("icon", icon);

    const result = utilitas
      ? await updateUtilMeta(utilitas.util_id, formData)
      : await createUtilMeta(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, the server action redirects; no client navigation needed.
  }

  const body = (
    <>
      {!bare && (
        <div className="border-b border-line pb-3">
          <p className="font-mono text-sm font-bold text-ink">
            Informasi Utilitas
          </p>
        </div>
      )}
      <div className="grid gap-4">
          {!utilitas && (
            <div className="grid gap-2">
              <Label htmlFor="util_id" className="font-mono">
                ID Utilitas *
              </Label>
              <Input
                id="util_id"
                name="util_id"
                placeholder="Contoh: ambulance, genset, ipal"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                ID unik untuk identifikasi utilitas (huruf kecil, tanpa spasi)
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="label" className="font-mono">
              Nama/Label *
            </Label>
            <Input
              id="label"
              name="label"
              defaultValue={utilitas?.label}
              placeholder="Contoh: Ambulance, Genset, IPAL"
              required
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-mono">Icon *</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={
                    "flex h-10 w-10 items-center justify-center rounded-none border-2 text-xl transition-all " +
                    (icon === emoji
                      ? "border-foreground bg-muted"
                      : "border-border hover:border-foreground/50")
                  }
                  disabled={loading}
                  aria-label={`Pilih icon ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="h-10 w-20 text-center text-xl"
                disabled={loading}
                aria-label="Icon custom"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="warna" className="font-mono">
                Warna (Hex)
              </Label>
              <Input
                id="warna"
                name="warna"
                defaultValue={utilitas?.warna || "#0e7c6b"}
                placeholder="#0e7c6b"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bg" className="font-mono">
                Background (Hex/Gradient)
              </Label>
              <Input
                id="bg"
                name="bg"
                defaultValue={utilitas?.bg || "#d4f0eb"}
                placeholder="#d4f0eb"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="order_no" className="font-mono">
              Urutan
            </Label>
            <Input
              id="order_no"
              name="order_no"
              type="number"
              defaultValue={utilitas?.order_no || 0}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-none bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
      </div>
    </>
  );

  return (
    <form action={handleSubmit} className="space-y-5">
      {bare ? (
        body
      ) : (
        <Card className="space-y-5">
          <CardContent className="space-y-4 pt-5">{body}</CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {!bare &&
          (onCancel ? (
            <Button
              variant="outline"
              type="button"
              disabled={loading}
              onClick={onCancel}
            >
              Batal
            </Button>
          ) : (
            <Link href="/utilitas">
              <Button variant="outline" type="button" disabled={loading}>
                Batal
              </Button>
            </Link>
          ))}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>⏳ Menyimpan...</>
          ) : utilitas ? (
            "💾 Update"
          ) : (
            "💾 Simpan"
          )}
        </Button>
      </div>
    </form>
  );
}
