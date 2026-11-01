import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "modal-cancel" | "modal-ok"
  size?: "default" | "sm" | "lg" | "icon"
}

const sizeClasses: Record<string, string> = {
  sm: "text-[11px] px-[10px] py-[4px]",
  lg: "text-[15px] px-[22px] py-[12px]",
  icon: "h-9 w-9 p-0",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-sm border border-transparent font-semibold text-[13px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary px-[18px] py-[10px] text-primary-foreground hover:bg-primary/90":
              variant === "primary",
            "border-border bg-transparent text-foreground hover:bg-surface-muted":
              variant === "ghost",
            "border-border bg-surface px-5 py-[9px] font-semibold text-text-2 hover:bg-surface-muted hover:text-foreground":
              variant === "modal-cancel",
            "bg-primary px-[22px] py-[9px] font-semibold text-primary-foreground hover:bg-primary/90":
              variant === "modal-ok",
          },
          size ? sizeClasses[size] : null,
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
