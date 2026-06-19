"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Save } from "lucide-react";
import { updateUtilState, deleteUtilState } from "@/lib/auth/utilitas";
import type { UtilState } from "@/lib/auth/utilitas";

interface ChecklistProps {
  utilId: string;
  items: Array<{ nama: string; ket?: string }>;
  states: UtilState[];
}

export function Checklist({ utilId, items, states }: ChecklistProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split("T")[0];

  const getStateForItem = (itemIndex: number, date: string) => {
    return states.find(
      (s) =>
        s.kind === "check" &&
        s.item_index === String(itemIndex) &&
        s.state_key === date
    );
  };

  const getNoteForDate = (date: string) => {
    return states.find((s) => s.kind === "note" && s.state_key === date);
  };

  const handleCheck = async (itemIndex: number, date: string, value: string) => {
    const stateKey = `${itemIndex}-${date}`;
    setLoading(stateKey);

    const result = await updateUtilState(utilId, "check", date, value, String(itemIndex));

    setLoading(null);
  };

  const handleSaveNote = async (date: string, value: string) => {
    setLoading(`note-${date}`);

    const result = await updateUtilState(utilId, "note", date, value);

    setLoading(null);

    if (result.success) {
      setNotes((prev) => ({ ...prev, [date]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Checklist Harian - {today}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada item. Tambahkan item terlebih dahulu di tab "Daftar Item".
            </p>
          ) : (
            items.map((item, index) => {
              const state = getStateForItem(index, today);
              const stateKey = `${index}-${today}`;
              const isLoading = loading === stateKey;

              return (
                <div key={index} className="border rounded-none p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{item.nama}</h4>
                      {item.ket && (
                        <p className="text-sm text-muted-foreground">{item.ket}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={state?.value === "1" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCheck(index, today, "1")}
                        disabled={isLoading}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Selesai
                      </Button>
                      <Button
                        variant={state?.value === "0" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleCheck(index, today, "0")}
                        disabled={isLoading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Tidak
                      </Button>
                    </div>
                  </div>
                  {state && (
                    <Badge variant={state.value === "1" ? "default" : "destructive"}>
                      {state.value === "1" ? "✓ Selesai" : "✗ Tidak Selesai"}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catatan Harian - {today}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Tambah Catatan</Label>
            <Textarea
              id="note"
              value={notes[today] || ""}
              onChange={(e) => setNotes({ ...notes, [today]: e.target.value })}
              placeholder="Tulis catatan untuk hari ini..."
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => handleSaveNote(today, notes[today] || "")}
              disabled={loading === `note-${today}` || !notes[today]}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading === `note-${today}` ? "Menyimpan..." : "Simpan Catatan"}
            </Button>
          </div>

          {getNoteForDate(today) && (
            <div className="border rounded-none p-4 bg-muted">
              <p className="text-sm font-semibold mb-2">Catatan Tersimpan:</p>
              <p className="text-sm">{getNoteForDate(today)?.value}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
