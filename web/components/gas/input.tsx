import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    // Generate a unique ID if none provided, useful for linking label to input
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-ink2 uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 border border-line rounded-md text-sm text-ink bg-white focus:border-teal focus:outline-none transition-colors",
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
Input.displayName = "Input";

export { Input };
