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
          "inline-flex items-center justify-center rounded-md font-semibold text-[13px] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-teal text-white px-[18px] py-[10px] hover:opacity-92": variant === "primary",
            "bg-transparent border border-line text-ink hover:bg-line2": variant === "ghost",
            // GAS .btn-modal-cancel — putih bergaris, bukan abu solid.
            "rounded-lg border-[1.5px] border-line bg-white text-ink2 px-5 py-[9px] font-bold hover:border-ink3":
              variant === "modal-cancel",
            // GAS .btn-modal-ok — gradasi teal + bayangan, terangkat saat hover.
            "rounded-lg border-none bg-gradient-to-br from-teal2 to-teal text-white px-[22px] py-[9px] font-bold shadow-[0_4px_12px_rgba(14,124,107,0.3)] transition-all duration-[180ms] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(14,124,107,0.4)]":
              variant === "modal-ok",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
