import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "executive-insight";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      header,
      footer,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base: Pure white on cool background (tonal layering)
          "bg-surface-lowest rounded-lg",
          // No borders (No-Line Rule)
          "border-0",
          // Subtle elevation shadow
          "shadow-ambient",
          // Position relative for accent bar
          "relative",
          className
        )}
        {...props}
      >
        {/* Executive Insight variant: Emerald left accent bar */}
        {variant === "executive-insight" && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
        )}

        {/* Header section */}
        {header && (
          <div className="px-6 py-4 border-b border-surface-high">
            {header}
          </div>
        )}

        {/* Body with 1.5rem (6 - Tailwind scale) vertical spacing */}
        <div className="px-6 py-6 flex flex-col gap-6">
          {children}
        </div>

        {/* Footer section with tonal shift to surface-low */}
        {footer && (
          <div className="px-6 py-4 bg-surface-low border-t border-surface-high">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
