import * as React from "react";
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-line rounded-lg p-4",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
