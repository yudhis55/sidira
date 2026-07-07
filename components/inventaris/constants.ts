import type { ItemCategory, ItemCondition } from "@/types/database";

// ══════════════════════════════════════════════════════════════════════
//  Category config — mirrors GAS KAT_CONFIG
// ══════════════════════════════════════════════════════════════════════
export interface CategoryConfig {
  value: ItemCategory;
  label: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { value: "alkes", label: "Alat Kesehatan" },
  { value: "meubelair", label: "Meubelair" },
  { value: "elektronik", label: "Elektronik" },
  { value: "lainnya", label: "Lainnya" },
];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  alkes: "Alat Kesehatan",
  meubelair: "Meubelair",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
};

// ══════════════════════════════════════════════════════════════════════
//  Condition display — TEXT + ICON labels, NO colored backgrounds
//  (per DESIGN.md achromatic rule)
// ══════════════════════════════════════════════════════════════════════
export interface ConditionOption {
  value: ItemCondition;
  label: string;
  icon: string;
}

export const CONDITIONS: ConditionOption[] = [
  { value: "baik", label: "Baik", icon: "✅" },
  { value: "rr", label: "Rusak Ringan", icon: "⚠️" },
  { value: "rb", label: "Rusak Berat", icon: "🔴" },
  { value: "ta", label: "Tidak Ada", icon: "—" },
];

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  baik: "Baik",
  rr: "Rusak Ringan",
  rb: "Rusak Berat",
  ta: "Tidak Ada",
};

// ══════════════════════════════════════════════════════════════════════
//  Priority config — TEXT + ICON labels, NO colored backgrounds
// ══════════════════════════════════════════════════════════════════════
export type Priority = "wajib" | "penting" | "pendukung";

export interface PriorityOption {
  value: Priority;
  label: string;
  icon: string;
}

export const PRIORITIES: PriorityOption[] = [
  { value: "wajib", label: "Wajib", icon: "⭐" },
  { value: "penting", label: "Penting", icon: "🔹" },
  { value: "pendukung", label: "Pendukung", icon: "·" },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  wajib: "⭐ Wajib",
  penting: "🔹 Penting",
  pendukung: "· Pendukung",
};
