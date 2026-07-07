import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: "baik" | "rr" | "rb" | "ta"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[4px] px-[8px] py-[2px] text-[11px] font-bold",
          {
            "bg-teal4 text-teal": variant === "baik",
            "bg-amber2 text-amber": variant === "rr",
            "bg-red2 text-red": variant === "rb",
            "bg-slate2 text-slate": variant === "ta",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
