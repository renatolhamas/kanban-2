import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "positive" | "neutral" | "warning" | "error";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "neutral",
      size = "md",
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Variant styles: tonal backgrounds with high-contrast text
    const variantClasses = {
      positive: cn(
        // Emerald (Positive)
        "bg-emerald-100 text-emerald-900"
      ),
      neutral: cn(
        // Steel/Navy (Neutral)
        "bg-slate-100 text-slate-900"
      ),
      warning: cn(
        // Amber (Warning)
        "bg-amber-100 text-amber-900"
      ),
      error: cn(
        // Red (Error)
        "bg-red-100 text-red-900"
      ),
    };

    // Size classes
    const sizeClasses = {
      sm: "px-2 py-1 text-xs font-medium",
      md: "px-2.5 py-1 text-sm font-medium",
      lg: "px-3 py-1.5 text-base font-medium",
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center gap-1",
          // Full roundedness (9999px)
          "rounded-full",
          // Size
          sizeClasses[size],
          // Variant
          variantClasses[variant],
          // Transitions
          "transition-colors duration-150",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
