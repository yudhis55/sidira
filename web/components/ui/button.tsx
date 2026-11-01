import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-transparent text-[13px] font-semibold transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 aria-expanded:bg-primary/90",
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 aria-expanded:bg-primary/90",
        secondary:
          "border-border bg-surface text-foreground hover:bg-surface-muted aria-expanded:bg-surface-muted",
        outline:
          "border-border bg-transparent text-foreground hover:bg-surface-muted aria-expanded:bg-surface-muted",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-surface-muted aria-expanded:bg-surface-muted",
        destructive:
          "border-danger/50 bg-surface text-danger hover:bg-danger-soft focus-visible:ring-danger/35",
        link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-10 gap-2 px-5 text-sm",
        xs: "h-7 gap-1 px-2.5 text-[11px]",
        icon: "size-9 rounded-sm p-0",
        "icon-xs": "size-7 rounded-sm p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-sm p-0",
        "icon-lg": "size-10 rounded-sm p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
