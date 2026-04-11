import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-900 mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "w-full px-4 py-2 text-base",
            "bg-white border-b-2",
            "border-slate-200 focus:border-emerald-500",
            "rounded-lg",
            "transition-all duration-150",
            "font-manrope",
            "placeholder:text-slate-400",
            "focus:outline-none",
            "focus:ring-2 focus:ring-emerald-500/20",
            "focus:shadow-sm",
            // Error state
            error && "border-red-500 focus:border-red-600 focus:ring-red-500/20",
            // Disabled state
            "disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed",
            className
          )}
          ref={ref}
          aria-label={label || props["aria-label"]}
          aria-describedby={error || helperText ? `${inputId}-description` : undefined}
          {...props}
        />
        {(error || helperText) && (
          <p
            id={`${inputId}-description`}
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-600" : "text-slate-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
