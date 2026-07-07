import * as React from "react"
import { cn } from "@/lib/utils"

export interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: "alkes" | "meubelair" | "elektronik" | "lainnya"
}

const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[20px] px-[10px] py-[2px] text-[11px] font-bold uppercase tracking-[0.8px]",
          {
            "bg-teal3 text-teal": variant === "alkes",
            "bg-amber2 text-amber": variant === "meubelair",
            "bg-blue2 text-blue": variant === "elektronik",
            "bg-violet2 text-violet": variant === "lainnya",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Pill.displayName = "Pill"

export { Pill }
