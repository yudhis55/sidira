import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "..", "components", "inventaris");

function write(name, content) {
  fs.writeFileSync(path.join(DIR, name), content, "utf8");
  console.log("wrote", name, content.length);
}

// ─── room-form.tsx ───────────────────────────────────────────
write(
  "room-form.tsx",
  `"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, updateRoom } from "@/lib/auth/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import type { Room } from "@/types/database";

interface RoomFormProps {
  room?: Pick<Room, "id" | "name" | "description" | "icon">;
}

interface IconOption {
  id: string;
  emoji: string;
  label: string;
}

/** Icon id → emoji (stored id stays stable for existing rooms). */
const ICON_OPTIONS: IconOption[] = [
  { id: "building2", emoji: "🏢", label: "Gedung" },
  { id: "home", emoji: "🏠", label: "Rumah" },
  { id: "hospital", emoji: "🏥", label: "RS" },
  { id: "store", emoji: "🏪", label: "Toko" },
  { id: "school", emoji: "🏫", label: "Sekolah" },
  { id: "warehouse", emoji: "🏭", label: "Gudang" },
  { id: "factory", emoji: "🏗️", label: "Pabrik" },
  { id: "building", emoji: "🏛️", label: "Kantor" },
  { id: "sofa", emoji: "🛋️", label: "Sofa" },
  { id: "armchair", emoji: "🪑", label: "Kursi" },
  { id: "briefcase", emoji: "💼", label: "Tas" },
  { id: "package", emoji: "📦", label: "Paket" },
];

export function RoomForm({ room }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState(room?.icon || "hospital");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("icon", selectedIcon);

    const result = room
      ? await updateRoom(room.id, formData)
      : await createRoom(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/inventaris");
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Nama Ruangan *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={room?.name}
          placeholder="Contoh: Ruang Periksa 1"
          required
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={room?.description}
          placeholder="Deskripsi ruangan (opsional)"
          disabled={loading}
        />
      </div>
      <div className="grid gap-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-6 gap-2">
          {ICON_OPTIONS.map((iconOption) => (
            <button
              key={iconOption.id}
              type="button"
              onClick={() => setSelectedIcon(iconOption.id)}
              className={\`h-12 w-12 rounded-none border-2 transition-all flex items-center justify-center text-2xl \${
                selectedIcon === iconOption.id
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50"
              }\`}
              disabled={loading}
              title={iconOption.label}
            >
              {iconOption.emoji}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="rounded-none bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Link href="/inventaris">
          <Button variant="outline" type="button" disabled={loading}>
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "⏳ Menyimpan..." : room ? "💾 Update" : "💾 Simpan"}
        </Button>
      </div>
    </form>
  );
}
`
);

// ─── csv-export.tsx ──────────────────────────────────────────
write(
  "csv-export.tsx",
  `"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportInventarisCSV } from "@/lib/auth/inventaris-export";
import { exportUsulanCSV } from "@/lib/auth/usulan";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export all inventory items across rooms (GAS exportCSV). */
export function InventarisCsvExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await exportInventarisCSV();
      downloadCsv(csv, "Inventaris_Puskesmas_Baruharjo.csv");
    } catch (error) {
      console.error("Gagal export CSV inventaris:", error);
      alert("Gagal mengekspor CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? "⏳ Mengekspor..." : "⬇️ Export CSV"}
    </Button>
  );
}

/** Export recap of all usulan across rooms (GAS exportAllUsulanCSV). */
export function UsulanRekapCsvExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await exportUsulanCSV();
      downloadCsv(csv, "Rekap_Usulan_Puskesmas_Baruharjo.csv");
    } catch (error) {
      console.error("Gagal export CSV usulan:", error);
      alert("Gagal mengekspor CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? "⏳ Mengekspor..." : "⬇️ Export Rekap Usulan"}
    </Button>
  );
}
`
);

// ─── Transform remaining files in-place ──────────────────────
function stripLucideImport(src) {
  // Remove multiline lucide import
  src = src.replace(
    /import\s*\{[^}]*\}\s*from\s*["']lucide-react["'];\s*\n?/g,
    ""
  );
  // Remove single-line lucide import
  src = src.replace(
    /import\s+[^;]*from\s*["']lucide-react["'];\s*\n?/g,
    ""
  );
  // Remove LucideIcon type import
  src = src.replace(
    /import\s+type\s+\{[^}]*LucideIcon[^}]*\}\s*from\s*["']lucide-react["'];\s*\n?/g,
    ""
  );
  return src;
}

function replaceIconTags(src) {
  // Self-closing Lucide components → emoji spans / text
  const map = [
    // Loader2 with animate-spin → ⏳
    [/<Loader2\s+className="[^"]*"\s*\/>/g, "⏳"],
    // Check
    [/<Check\s+className="[^"]*"\s*\/>/g, "✅"],
    // X
    [/<X\s+className="[^"]*"\s*\/>/g, "✕"],
    // Pencil
    [/<Pencil\s+className="[^"]*"\s*\/>/g, "✏️"],
    // ArrowUpRight
    [/<ArrowUpRight\s+className="[^"]*"\s*\/>/g, "↗️"],
    // Trash2
    [/<Trash2\s+className="[^"]*"\s*\/>/g, "🗑️"],
    // User
    [/<User\s+className="[^"]*"\s*\/>/g, "👤"],
    // Plus
    [/<Plus\s+className="[^"]*"\s*\/>/g, "➕"],
    // Calendar
    [/<Calendar\s+className="[^"]*"\s*\/>/g, "📅"],
    // Download
    [/<Download\s+className="[^"]*"\s*\/>/g, "⬇️"],
  ];
  for (const [re, rep] of map) {
    src = src.replace(re, rep);
  }

  // ChevronDown multiline (className on next lines)
  src = src.replace(
    /<ChevronDown\s+className=\{[^}]+\}[^/]*\/>/gs,
    "▼"
  );
  // Also simple ChevronDown
  src = src.replace(/<ChevronDown\s+className="[^"]*"\s*\/>/g, "▼");

  // Patterns like: {pending ? ( ✅ ) : ( emoji )} already handled if tags replaced
  // Clean up fragments like: {pending ? ( \n ⏳ \n ) : ( \n ✅ \n )}
  // Normalize whitespace around emoji-only children
  src = src.replace(
    /\{\s*pending\s*\?\s*\(\s*⏳\s*\)\s*:\s*\(\s*✅\s*\)\s*\}/g,
    '{pending ? "⏳" : "✅"}'
  );
  src = src.replace(
    /\{\s*pending\s*\?\s*\(\s*⏳\s*\)\s*:\s*\(\s*🗑️\s*\)\s*\}/g,
    '{pending ? "⏳" : "🗑️"}'
  );

  // Button content: emoji alone before text — leave as-is (emoji + text sibling is fine)

  return src;
}

// room-header
{
  let src = fs.readFileSync(path.join(DIR, "room-header.tsx"), "utf8");
  src = stripLucideImport(src);
  src = replaceIconTags(src);

  // Polish specific button labels with emoji prefix if bare text remains
  // "Semua Kondisi Baik" after Check → already has ✅ sibling
  // Inline edit icon buttons may be emoji-only now — OK

  // Fix User line that may have left empty structure
  // Ensure no leftover lucide identifiers
  write("room-header.tsx", src);
}

// item-form
{
  let src = fs.readFileSync(path.join(DIR, "item-form.tsx"), "utf8");
  src = stripLucideImport(src);
  src = replaceIconTags(src);
  // loading button: ⏳ Menyimpan
  src = src.replace(
    /\{\s*loading\s*\?\s*\(\s*<>\s*⏳\s*Menyimpan\.\.\.\s*<\/>\s*\)\s*:\s*\(/g,
    '{loading ? ("⏳ Menyimpan...") : ('
  );
  // simpler pattern for loading ternary with fragment
  src = src.replace(
    /loading\s*\?\s*\(\s*<>\s*⏳\s*Menyimpan\.\.\.\s*<\/>\s*\)/g,
    'loading ? "⏳ Menyimpan..."'
  );
  write("item-form.tsx", src);
}

// move-item-dialog
{
  let src = fs.readFileSync(path.join(DIR, "move-item-dialog.tsx"), "utf8");
  src = stripLucideImport(src);
  src = replaceIconTags(src);
  src = src.replace(
    /pending\s*\?\s*\(\s*<>\s*⏳\s*Memindahkan\.\.\.\s*<\/>\s*\)\s*:\s*\(\s*<>\s*↗️\s*Pindahkan\s*<\/>\s*\)/g,
    'pending ? "⏳ Memindahkan..." : "↗️ Pindahkan"'
  );
  write("move-item-dialog.tsx", src);
}

// move-all-dialog
{
  let src = fs.readFileSync(path.join(DIR, "move-all-dialog.tsx"), "utf8");
  src = stripLucideImport(src);
  src = replaceIconTags(src);
  src = src.replace(
    /pending\s*\?\s*\(\s*<>\s*⏳\s*Memindahkan\.\.\.\s*<\/>\s*\)\s*:\s*\(\s*<>\s*↗️\s*Pindahkan\s*\(\{selectedIds\.length\}\)\s*<\/>\s*\)/g,
    'pending ? "⏳ Memindahkan..." : `↗️ Pindahkan (${selectedIds.length})`'
  );
  write("move-all-dialog.tsx", src);
}

// item-table (largest)
{
  let src = fs.readFileSync(path.join(DIR, "item-table.tsx"), "utf8");
  src = stripLucideImport(src);
  src = replaceIconTags(src);

  // ChevronDown with cn() multiline — more permissive
  src = src.replace(
    /<ChevronDown[\s\S]*?\/>/g,
    '<span className="ml-auto text-xs text-muted-foreground" aria-hidden>{collapsed ? "▶" : "▼"}</span>'
  );

  // loading fragments in buttons
  src = src.replace(
    /pending\s*\?\s*\(\s*<>\s*⏳\s*Menghapus\.\.\.\s*<\/>\s*\)\s*:\s*\(\s*<>\s*🗑️\s*Hapus\s*<\/>\s*\)/g,
    'pending ? "⏳ Menghapus..." : "🗑️ Hapus"'
  );
  src = src.replace(
    /pending\s*\?\s*\(\s*<>\s*⏳\s*Menyimpan\.\.\.\s*<\/>\s*\)\s*:\s*\(\s*<>\s*➕\s*Tambah\s*<\/>\s*\)/g,
    'pending ? "⏳ Menyimpan..." : "➕ Tambah"'
  );
  // also "Simpan" variants
  src = src.replace(
    /pending\s*\?\s*\(\s*<>\s*⏳\s*Menyimpan\.\.\.\s*<\/>\s*\)/g,
    'pending ? "⏳ Menyimpan..."'
  );
  src = src.replace(
    /loading\s*\?\s*\(\s*<>\s*⏳\s*Menyimpan\.\.\.\s*<\/>\s*\)/g,
    'loading ? "⏳ Menyimpan..."'
  );

  write("item-table.tsx", src);
}

// Final scan
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".tsx"));
let hits = 0;
for (const f of files) {
  const c = fs.readFileSync(path.join(DIR, f), "utf8");
  if (c.includes("lucide-react") || /<(Loader2|Check|Pencil|Trash2|ArrowUpRight|User|Plus|Calendar|Download|ChevronDown|X)\b/.test(c)) {
    console.log("REMAINING in", f);
    const lines = c.split("\n");
    lines.forEach((l, i) => {
      if (
        l.includes("lucide") ||
        /<(Loader2|Check|Pencil|Trash2|ArrowUpRight|User|Plus|Calendar|Download|ChevronDown)\b/.test(l) ||
        (l.includes("<X ") && l.includes("className"))
      ) {
        console.log(" ", i + 1, l.trim());
        hits++;
      }
    });
  }
}
console.log("hits=", hits);
