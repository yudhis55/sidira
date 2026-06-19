"use client";

import { useState } from "react";
import { login } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, XCircle, Hospital } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-none">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none border border-border bg-muted">
            <Hospital className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">SIDIRA</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sistem Digital Inventaris Ruangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Masukkan username"
                required
                disabled={loading}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password"
                required
                disabled={loading}
                className="rounded-none"
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-none border border-destructive/20 bg-destructive/5 p-3 text-sm">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full rounded-none" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="font-medium">Puskesmas Baruharjo, Trenggalek</p>
            <p className="mt-1">v4.0 — Next.js + Supabase</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
