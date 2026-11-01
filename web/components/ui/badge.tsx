import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/35 aria-invalid:border-danger [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        neutral:
          "bg-surface-muted text-text-2 [a]:hover:bg-surface-muted/80",
        default:
          "bg-surface-muted text-text-2 [a]:hover:bg-surface-muted/80",
        brand:
          "bg-primary-soft text-primary-soft-foreground [a]:hover:bg-primary-soft/80",
        success:
          "bg-success-soft text-success [a]:hover:bg-success-soft/80",
        warning:
          "bg-warning-soft text-warning [a]:hover:bg-warning-soft/80",
        danger:
          "bg-danger-soft text-danger [a]:hover:bg-danger-soft/80",
        destructive:
          "bg-danger-soft text-danger [a]:hover:bg-danger-soft/80",
        info:
          "bg-info-soft text-info [a]:hover:bg-info-soft/80",
        secondary:
          "bg-surface-muted text-text-2 [a]:hover:bg-surface-muted/80",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-surface-muted",
        ghost:
          "bg-transparent text-text-2 hover:bg-surface-muted",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({
  className,
  variant = "neutral",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
