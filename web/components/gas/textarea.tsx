import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-semibold text-ink2 uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 border border-line rounded-md text-sm text-ink bg-white focus:border-teal focus:outline-none transition-colors",
            "min-h-[80px] resize-y", // Ensure it's not too small and allow vertical resize
            error && "border-red focus:border-red",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-ink3">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-red">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
