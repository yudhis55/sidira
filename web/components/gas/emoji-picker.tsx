"use client";

/**
 * Pemilih ikon emoji — port GAS `EMOJIS` / `buildEmojiGrid` / `.emoji-preview`
 * (index.html ~1059 untuk gaya, ~19444 untuk daftarnya).
 */
import { cn } from "@/lib/utils";

/** Daftar ikon GAS, urutan dipertahankan (index.html ~19444). */
export const GAS_EMOJIS = [
  "🏥", "🩺", "💊", "🧪", "🦷", "💉", "🤰", "🚑",
  "🛏️", "🪑", "💬", "📋", "🗂️", "👨‍⚕️", "🚿", "⚗️",
  "🧬", "🔬", "🩻", "💆", "🏃", "🧘", "👁️", "👂",
  "🫁", "🫀", "🧠", "🦴", "🩹", "🧴", "🧹", "🏗️",
  "⚡", "🚪", "🪟", "🏠", "🔑", "📦", "🖥️", "🖨️",
] as const;

interface EmojiGridProps {
  value: string;
  onChange: (emoji: string) => void;
}

/** GAS `.emoji-grid` — 8 kolom, tinggi maksimal 130px, bisa di-scroll. */
export function EmojiGrid({ value, onChange }: EmojiGridProps) {
  return (
    <div className="grid max-h-[130px] grid-cols-8 gap-1.5 overflow-y-auto rounded-lg border-[1.5px] border-line bg-line2 p-2.5">
      {GAS_EMOJIS.map((em) => {
        const selected = em === value;
        return (
          <button
            key={em}
            type="button"
            title={em}
            aria-label={`Pilih ikon ${em}`}
            aria-pressed={selected}
            onClick={() => onChange(em)}
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-md border-[1.5px] text-lg transition-all duration-150 hover:scale-110 hover:border-teal2 hover:bg-teal4",
              selected
                ? "border-teal bg-teal3 shadow-[0_0_0_2px_var(--teal2)]"
                : "border-line bg-white"
            )}
          >
            {em}
          </button>
        );
      })}
    </div>
  );
}

/** GAS `.emoji-preview` — pratinjau ikon + nama yang sedang diketik. */
export function EmojiPreview({
  icon,
  name,
  placeholder,
}: {
  icon: string;
  name: string;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border-[1.5px] border-teal3 bg-teal4 px-3 py-2 text-[13px] font-semibold text-teal">
      <span className="text-[22px] leading-none">{icon}</span>
      <span className={cn("truncate", !name && "font-normal opacity-60")}>
        {name || placeholder}
      </span>
    </div>
  );
}

/** GAS `.m-field` — label kapital kecil di atas kontrol. */
export function ModalField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.4px] text-ink2">
        {label}
        {required && <span className="text-red"> *</span>}
      </span>
      {children}
    </label>
  );
}

/** GAS `.m-field input` / `.m-field textarea`. */
export const MODAL_INPUT_CLASS =
  "rounded-lg border-[1.5px] border-line bg-white px-3 py-[9px] text-[13px] text-ink outline-none transition-colors focus:border-teal2 focus:shadow-[0_0_0_3px_rgba(20,169,143,0.1)]";
