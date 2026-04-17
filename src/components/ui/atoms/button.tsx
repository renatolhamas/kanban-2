import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-text-inverse shadow-ambient hover:bg-primary-hover active:scale-95",
        secondary:
          "bg-surface-container-high text-text-primary hover:bg-surface-container-highest active:scale-95",
        ghost:
          "bg-transparent text-text-secondary hover:text-primary hover:bg-surface-container-low",
        destructive:
          "bg-error text-text-inverse hover:opacity-90 active:scale-95",
      },
      size: {
        sm: "px-md py-sm text-sm h-9",
        md: "px-lg py-md text-base h-10",
        lg: "px-xl py-lg text-lg h-12",
      },
      loading: {
        true: "relative text-transparent pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      disabled,
      asChild = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    // asChild path: render children directly via Slot (no extra wrappers)
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, loading: false }), className)}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    // Default path: full-featured button with loading/icon support
    return (
      <button
        className={cn(buttonVariants({ variant, size, loading }), className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
