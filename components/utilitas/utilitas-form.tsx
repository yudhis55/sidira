"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, Ambulance, Zap, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UtilMeta } from "@/lib/auth/utilitas";

interface UtilitasFormProps {
  utilitas?: UtilMeta;
}

interface IconOption {
  id: string;
  icon: LucideIcon;
  label: string;
}

const UTIL_ICON_OPTIONS: IconOption[] = [
  { id: "ambulance", icon: Ambulance, label: "Ambulance" },
  { id: "genset", icon: Zap, label: "Genset" },
  { id: "ipal", icon: Droplets, label: "IPAL" },
];

export function UtilitasForm({ utilitas }: UtilitasFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(utilitas?.icon || "ambulance");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    formData.set("icon", selectedIcon);

    try {
      const response = await fetch(
        utilitas ? `/api/utilitas/${utilitas.util_id}` : "/api/utilitas",
        {
          method: utilitas ? "PUT" : "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push("/utilitas");
      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan data");
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Utilitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!utilitas && (
            <div className="space-y-2">
              <Label htmlFor="util_id">ID Utilitas *</Label>
              <Input
                id="util_id"
                name="util_id"
                placeholder="Contoh: ambulance, genset, ipal"
                required
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                ID unik untuk identifikasi utilitas (huruf kecil, tanpa spasi)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="label">Nama/Label *</Label>
            <Input
              id="label"
              name="label"
              defaultValue={utilitas?.label}
              placeholder="Contoh: Ambulance, Genset, IPAL"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon *</Label>
            <div className="grid grid-cols-3 gap-2">
              {UTIL_ICON_OPTIONS.map((iconOption) => {
                const IconComponent = iconOption.icon;
                return (
                  <button
                    key={iconOption.id}
                    type="button"
                    onClick={() => setSelectedIcon(iconOption.id)}
                    className={`h-16 rounded-none border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedIcon === iconOption.id
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                    disabled={loading}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-xs">{iconOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warna">Warna (Hex)</Label>
              <Input
                id="warna"
                name="warna"
                defaultValue={utilitas?.warna || "#0e7c6b"}
                placeholder="#0e7c6b"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg">Background (Hex)</Label>
              <Input
                id="bg"
                name="bg"
                defaultValue={utilitas?.bg || "#d4f0eb"}
                placeholder="#d4f0eb"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_no">Urutan</Label>
            <Input
              id="order_no"
              name="order_no"
              type="number"
              defaultValue={utilitas?.order_no || 0}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-none">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : utilitas ? "Update" : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
