import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "disabled";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", disabled, ...props },
    ref
  ) => {
    const isDisabled = disabled || variant === "disabled";

    const variantStyles = {
      primary: cn(
        "bg-emerald-500 text-white font-semibold",
        "hover:bg-emerald-700",
        "active:scale-95",
        "disabled:bg-gray-400 disabled:cursor-not-allowed",
        "transition-colors duration-150"
      ),
      secondary: cn(
        "bg-slate-700 text-white font-semibold",
        "hover:bg-slate-800",
        "active:scale-95",
        "disabled:bg-gray-400 disabled:cursor-not-allowed",
        "transition-colors duration-150"
      ),
      ghost: cn(
        "bg-transparent text-slate-700",
        "hover:bg-slate-100",
        "underline hover:no-underline",
        "disabled:text-gray-400 disabled:cursor-not-allowed",
        "transition-all duration-150"
      ),
      disabled: cn(
        "bg-gray-300 text-gray-600 cursor-not-allowed",
        "opacity-50"
      ),
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-4 py-2 text-base rounded-lg",
      lg: "px-6 py-3 text-lg rounded-lg",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
          "disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
