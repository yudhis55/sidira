import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/gas/card";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  emoji: string;
  value: number | string;
  label: string;
  variant?: "default" | "teal" | "amber" | "red" | "blue" | "violet" | "orange" | "rose" | "slate";
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, emoji, value, label, variant = "default", ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] shrink-0">
          {emoji}
        </div>
        <div className="flex flex-col gap-0.5">
          <div
            className={cn(
              "font-mono text-[22px] font-extrabold leading-none",
              {
                "text-ink": variant === "default",
                "text-teal": variant === "teal",
                "text-amber": variant === "amber",
                "text-red": variant === "red",
                "text-blue": variant === "blue",
                "text-violet": variant === "violet",
                "text-orange": variant === "orange",
                "text-rose": variant === "rose",
                "text-slate": variant === "slate",
              }
            )}
          >
            {value}
          </div>
          <div className="text-[10.5px] text-ink3 font-semibold uppercase tracking-[0.3px] leading-none">
            {label}
          </div>
        </div>
      </Card>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };
