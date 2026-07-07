"use client";

import { useState } from "react";
import { createUtilMeta, updateUtilMeta } from "@/lib/auth/utilitas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { UtilMeta } from "@/lib/auth/utilitas";

interface UtilitasFormProps {
  utilitas?: UtilMeta;
}

// Preset emojis for utilitas identity (ambulance, genset, water/IPAL, tools, etc.)
const PRESET_EMOJIS = ["🚑", "⚡", "💧", "🔧", "🔥", "🧯", "🚰", "🏥"];

export function UtilitasForm({ utilitas }: UtilitasFormProps) {
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

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="font-mono">Informasi Utilitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href="/utilitas">
          <Button variant="outline" type="button" disabled={loading}>
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            utilitas ? "Update" : "Simpan"
          )}
        </Button>
      </div>
    </form>
  );
}
